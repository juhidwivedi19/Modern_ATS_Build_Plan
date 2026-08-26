const prisma = require("../config/db.config.js");

const googleCalendarService = require("./googleCalendar.service");
const emailService = require("./email.service.js");

const {
    createInterviewScheduledNotification
} = require("./notification.service.js");
const {
    scheduleInterviewReminders,
    cancelInterviewReminders,
    rescheduleInterviewReminders,
} = require("../jobs/interviewReminder.job.js");

async function scheduleInterview({
  applicationId,
  type,
  scheduledAt,
  duration,
  meetingLink,
  createdById,
}) {
  const validInterviewTypes = [
    "SCREENING",
    "TECHNICAL",
    "HR",
    "MANAGERIAL",
  ];

  // Check whether application exists
  const application = await prisma.application.findUnique({
    where: {
      id: applicationId,
    },
    include: {
      candidate:true,
      job:true,
    },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  // Check whether creator exists
  const creator = await prisma.user.findUnique({
    where: {
      id: createdById,
    },
  });

  if (!creator) {
    throw new Error("User not found");
  }

  // Validate interview type
  if (!type) {
    throw new Error("Interview type is required");
  }

  if (!validInterviewTypes.includes(type)) {
    throw new Error("Invalid interview type");
  }

  // Validate scheduled date/time
  if (!scheduledAt) {
    throw new Error("Interview date and time are required");
  }

  const interviewDate = new Date(scheduledAt);

  if (isNaN(interviewDate.getTime())) {
    throw new Error("Invalid interview date and time");
  }

  // Prevent scheduling in the past
  if (interviewDate <= new Date()) {
    throw new Error("Interview cannot be scheduled in the past");
  }

  // Validate duration
  if (
    !Number.isInteger(duration) ||
    duration <= 0 ||
    duration > 480
  ) {
    throw new Error(
      "Interview duration must be between 1 and 480 minutes"
    );
  }

  // Validate meeting link
  if (meetingLink !== undefined && meetingLink !== null) {
    try {
      new URL(meetingLink);
    } catch (error) {
      throw new Error("Invalid meeting link");
    }
  }



  // Create interview
  const interview = await prisma.interview.create({
    data: {
      applicationId,
      type,
      scheduledAt: interviewDate,
      duration,
      meetingLink,
      createdById,
    },
  });


    // Candidate email
    const attendeeEmails = [
        application.candidate.email,
    ];

    // Create Google Calendar event
    const calendarEvent =
        await googleCalendarService.createCalendarEvent({
            userId: createdById,
            summary: `${type} Interview`,
            description: `Interview scheduled through ATS`,
            scheduledAt: interviewDate,
            duration,
            meetingLink,
            attendeeEmails,
        });

    // Save Google Calendar event ID
  const finalMeetingLink =
    calendarEvent.meetLink || meetingLink || null;

const updatedInterview = await prisma.interview.update({
    where: {
        id: interview.id,
    },
    data: {
        googleEventId: calendarEvent.id,
        meetingLink: finalMeetingLink,
    },
});


// Create activity log
const { createActivityLog } =
    require("./activityLog.service.js");

await createActivityLog({
    applicationId: applicationId,
    performedById: createdById,
    action: "INTERVIEW_SCHEDULED"
});

// Create in-app interview notification
try {
    await createInterviewScheduledNotification(
        applicationId,
        updatedInterview.id,
        createdById
    );
} catch (error) {
    console.error(
        "Failed to create interview notification:",
        error.message
    );
}  

      try {
    await emailService.sendInterviewScheduledEmail(
        application.candidate.email,
        application.candidate.name,
        application.job.title,
        type,
        interviewDate.toLocaleString(),
        duration,
        finalMeetingLink
    );
} catch (error) {
    console.error(
        "Failed to send interview scheduled email:",
        error.message
    );
}


// Schedule reminder jobs
try {
    await scheduleInterviewReminders({
        interviewId: updatedInterview.id,
        scheduledAt: updatedInterview.scheduledAt,
    });
} catch (error) {
    console.error(
        "Failed to schedule interview reminders:",
        error.message
    );
}

  return updatedInterview;
}

//==================
//Assign interviewer
//==================
const assignInterviewer = async ({
  interviewId,
  userId,
}) => {
  const interview = await prisma.interview.findUnique({
    where: {
      id: interviewId,
    },
    include:{
        application:{
            include:{
                job:true,
            },
        },
    },
  });

  if (!interview) {
    throw new Error("Interview not found");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }


//Check user Organization Membership
  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: interview.application.job.organizationId,
      },
    },
  });

  if (!membership) {
    throw new Error("User is not a member of this organization");
  }

  if (
    membership.role !== "INTERVIEWER" &&
    membership.role !== "ADMIN" &&
    membership.role !== "OWNER"
  ) {
    throw new Error("User is not authorized to be an interviewer");
  }


  const existingAssignment =
    await prisma.interviewInterviewer.findUnique({
      where: {
        interviewId_userId: {
          interviewId,
          userId,
        },
      },
    });

  if (existingAssignment) {
    throw new Error("Interviewer is already assigned");
  }

  const assignment =
    await prisma.interviewInterviewer.create({
      data: {
        interviewId,
        userId,
      },
    });

    if (interview.googleEventId) {
    await googleCalendarService.addCalendarAttendee({
        userId: interview.createdById,
        googleEventId: interview.googleEventId,
        attendeeEmail: user.email,
    });
}

  return assignment;
};


//========================
//Remove an interviewer
//==========================
async function removeInterviewer({
    interviewId,
    userId,
}) {

    const assignment = await prisma.interviewInterviewer.findUnique({
        where: {
            interviewId_userId: {
                interviewId,
                userId,
            },
        },
        include: {
            user: true,
            interview: true,
        },
    });

    if (!assignment) {
        throw new Error(
            "Interviewer is not assigned to this interview"
        );
    }

    const interview = assignment.interview;
    const interviewerEmail = assignment.user.email;

    // Remove interviewer from Google Calendar
    if (interview.googleEventId) {
        await googleCalendarService.removeCalendarAttendee({
            userId: interview.createdById,
            googleEventId: interview.googleEventId,
            attendeeEmail: interviewerEmail,
        });
    }

    // Remove interviewer from database
    await prisma.interviewInterviewer.delete({
        where: {
            interviewId_userId: {
                interviewId,
                userId,
            },
        },
    });

    return {
        message: "Interviewer removed successfully",
    };
}


//=======================================
//GET SINGLE INTERVIEW
//=======================================
async function getInterviewById(interviewId) {
  const interview = await prisma.interview.findUnique({
    where: {
      id: interviewId,
    },
    include: {
      application: {
        include: {
          candidate: true,
          job: true,
        },
      },
      createdBy: true,
      interviewers: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!interview) {
    throw new Error("Interview not found");
  }

  return interview;
}


//===========================
//Get All Interview
//===========================
async function getAllInterviews() {
  const interviews = await prisma.interview.findMany({
    orderBy: {
      scheduledAt: "asc",
    },
    include: {
      application: {
        include: {
          candidate: true,
          job: true,
        },
      },
      createdBy: true,
      interviewers: {
        include: {
          user: true,
        },
      },
    },
  });

  return interviews;
}

//===================================
//Update / Reschedule interview
//===================================
async function updateInterview(interviewId, data) {

    // 1. Find existing interview
    const interview = await prisma.interview.findUnique({
        where: {
            id: interviewId,
        },
        include: {
            application: {
                include: {
                    candidate: true,
                    job: true,
                },
            },
        },
    });

    if (!interview) {
        throw new Error("Interview not found");
    }

    // 2. Don't update cancelled/completed interviews
    if (interview.status === "CANCELLED") {
        throw new Error("Cancelled interview cannot be updated");
    }

    if (interview.status === "COMPLETED") {
        throw new Error("Completed interview cannot be updated");
    }

    // 3. Validate scheduledAt if provided
    let scheduledDate;

    if (data.scheduledAt) {
        scheduledDate = new Date(data.scheduledAt);

        if (isNaN(scheduledDate.getTime())) {
            throw new Error("Invalid interview date and time");
        }

        if (scheduledDate <= new Date()) {
            throw new Error(
                "Interview cannot be scheduled in the past"
            );
        }
    }

    // 4. Update interview in database
    const updatedInterview = await prisma.interview.update({
        where: {
            id: interviewId,
        },
        data: {
            ...(data.type && {
                type: data.type,
            }),

            ...(data.scheduledAt && {
                scheduledAt: scheduledDate,
            }),

            ...(data.duration !== undefined && {
                duration: data.duration,
            }),

            ...(data.meetingLink !== undefined && {
                meetingLink: data.meetingLink,
            }),
        },
    });

    

    // 5. Update Google Calendar event
    if (interview.googleEventId) {

        await googleCalendarService.updateCalendarEvent({
            userId: interview.createdById,

            googleEventId: interview.googleEventId,

            summary: `${data.type || interview.type} Interview`,

            description: "Interview scheduled through ATS",

            scheduledAt:
                scheduledDate || interview.scheduledAt,

            duration:
                data.duration || interview.duration,

            meetingLink:
                data.meetingLink !== undefined
                    ? data.meetingLink
                    : interview.meetingLink,
        });
    }

    // 6. Reschedule BullMQ reminders
    if (data.scheduledAt) {

        try {

            await rescheduleInterviewReminders({
                interviewId: interview.id,
                scheduledAt: scheduledDate,
            });

        } catch (error) {

            console.error(
                "Failed to reschedule interview reminders:",
                error.message
            );
        }
    }

    // 7. Send rescheduled email
    if (data.scheduledAt) {

        try {

            await emailService.sendInterviewRescheduledEmail(
                interview.application.candidate.email,
                interview.application.candidate.name,
                interview.application.job.title,
                data.type || interview.type,
                scheduledDate.toLocaleString(),
                data.duration || interview.duration,
                data.meetingLink !== undefined
                    ? data.meetingLink
                    : interview.meetingLink
            );

        } catch (error) {

            console.error(
                "Failed to send interview rescheduled email:",
                error.message
            );
        }
    }

    return updatedInterview;
}
//============================
//Cancel Interview
//==========================
async function cancelInterview(interviewId) {

    const interview = await prisma.interview.findUnique({
        where: {
            id: interviewId,
        },
        include: {
            application: {
                include: {
                    candidate: true,
                    job: true,
                },
            },
        },
    });

    if (!interview) {
        throw new Error("Interview not found");
    }

    if (interview.status === "CANCELLED") {
        throw new Error("Interview is already cancelled");
    }

    if (interview.status === "COMPLETED") {
        throw new Error(
            "Completed interview cannot be cancelled"
        );
    }

    // 1. Delete Google Calendar event
    if (interview.googleEventId) {

        await googleCalendarService.deleteCalendarEvent({
            userId: interview.createdById,
            googleEventId: interview.googleEventId,
        });

    }

    // 2. Update interview status
    const cancelledInterview =
        await prisma.interview.update({
            where: {
                id: interviewId,
            },
            data: {
                status: "CANCELLED",
            },
        });

    // 3. Remove pending BullMQ reminder jobs
    try {

        await cancelInterviewReminders(
            interview.id
        );

    } catch (error) {

        console.error(
            "Failed to cancel interview reminders:",
            error.message
        );

    }

    // 4. Send cancellation email
    try {

        await emailService.sendInterviewCancelledEmail(
            interview.application.candidate.email,
            interview.application.candidate.name,
            interview.application.job.title,
            interview.type
        );

    } catch (error) {

        console.error(
            "Failed to send interview cancellation email:",
            error.message
        );

    }

    return cancelledInterview;
}

module.exports = {
    scheduleInterview,
    assignInterviewer,
    removeInterviewer,
    getInterviewById,
    getAllInterviews,
    updateInterview,
    cancelInterview,
   
    
};
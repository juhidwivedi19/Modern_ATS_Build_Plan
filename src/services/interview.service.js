const prisma = require("../config/db.config.js");

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

  return interview;
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

  return assignment;
};


//========================
//Remove an interviewer
//==========================
const removeInterviewer = async ({
  interviewId,
  userId,
}) => {
  const assignment = await prisma.interviewInterviewer.findUnique({
    where: {
      interviewId_userId: {
        interviewId,
        userId,
      },
    },
  });

  if (!assignment) {
    throw new Error("Interviewer is not assigned to this interview");
  }

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
};



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
async function updateInterview({
  interviewId,
  type,
  scheduledAt,
  duration,
  meetingLink,
}) {
  const interview = await prisma.interview.findUnique({
    where: {
      id: interviewId,
    },
  });

  if (!interview) {
    throw new Error("Interview not found");
  }

  if (interview.status === "CANCELLED") {
    throw new Error("Cancelled interview cannot be updated");
  }

  if (interview.status === "COMPLETED") {
    throw new Error("Completed interview cannot be updated");
  }

  const data = {};

  if (type !== undefined) {
    const validInterviewTypes = [
      "SCREENING",
      "TECHNICAL",
      "HR",
      "MANAGERIAL",
    ];

    if (!validInterviewTypes.includes(type)) {
      throw new Error("Invalid interview type");
    }

    data.type = type;
  }

  if (scheduledAt !== undefined) {
    const interviewDate = new Date(scheduledAt);

    if (isNaN(interviewDate.getTime())) {
      throw new Error("Invalid interview date and time");
    }

    if (interviewDate <= new Date()) {
      throw new Error("Interview cannot be scheduled in the past");
    }

    data.scheduledAt = interviewDate;
  }

  if (duration !== undefined) {
    if (
      !Number.isInteger(duration) ||
      duration <= 0 ||
      duration > 480
    ) {
      throw new Error(
        "Interview duration must be between 1 and 480 minutes"
      );
    }

    data.duration = duration;
  }

  if (meetingLink !== undefined) {
    data.meetingLink = meetingLink;
  }

  if (Object.keys(data).length === 0) {
    throw new Error("No fields provided for update");
  }

  const updatedInterview = await prisma.interview.update({
    where: {
      id: interviewId,
    },
    data,
  });

  return updatedInterview;
}


//============================
//Cancel Interview
//==========================
async function cancelInterview(interviewId){
   const interview = await prisma.interview.findUnique({
    where:{
      id:interviewId,
    },
   });


  if (!interview) {
    throw new Error("Interview not found");
  }

  if (interview.status === "CANCELLED") {
    throw new Error("Interview is already cancelled");
  }

  if (interview.status === "COMPLETED") {
    throw new Error("Completed interview cannot be cancelled");
  }

  const cancelledInterview = await prisma.interview.update({
    where: {
      id: interviewId,
    },
    data: {
      status: "CANCELLED",
    },
  });

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
    cancelInterview
};
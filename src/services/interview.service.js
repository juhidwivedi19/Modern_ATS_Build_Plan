const prisma = require("../config/db.config.js")

const scheduleInterview = async ({
    //function receives
    applicationId,
    type,
    scheduledAt,
    duration,
    meetingLink,
    createdById,
}) => {

 const validInterviewTypes = [
  "SCREENING",
  "TECHNICAL",
  "HR",
  "MANAGERIAL",
];

     //Check application with this id exist or not
    const application = await prisma.application.findUnique({
        where:{
            id: applicationId,
        },
    });

    if(!application){
        throw new Error("Application  not found");
    }

    //Verify that user creating the interview actually exist
      const creator = await prisma.user.findUnique({
        where:{
            id: createdById,
        },
      });

      if(!creator){
        throw new Error("User not found");
      }


//Validate INTERVIEW details
        if (!type) {
              throw new Error("Interview type is required");
          }

      if (!validInterviewTypes.includes(type)) {
           throw new Error("Invalid interview type");
          }

      if(!scheduledAt){
        throw new Error("Interview Date and Time are required");
      }

      if (!Number.isInteger(duration) || duration <= 0 || duration > 480) {
           throw new Error("Interview duration must be between 1 and 480 minutes");
          }

      const interviewDate = new Date(scheduledAt);

      if(isNaN(interviewDate.getTime())){
        throw new Error("Invalid interview Date and Time");
      }

     // Prevent scheduling in the past
      if (interviewDate <= new Date()) {
        throw new Error("Interview cannot be scheduled in the past");
        }

    //=================
    //Then create record in your interview table
    const interview = await prisma.interview.create({
          data:{
            applicationId,
            type,
            scheduledAt,
            duration,
            meetingLink,
            createdById
          },
    });

    return interview;
};
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
module.exports = {
    scheduleInterview,
    assignInterviewer,
    removeInterviewer,
    getInterviewById
};
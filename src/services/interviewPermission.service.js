const prisma = require("../config/db.config.js");

async function canAccessInterviewEvaluation({
  interviewId,
  userId,
}) {
  const interview = await prisma.interview.findUnique({
    where: {
      id: interviewId,
    },
    include: {
      interviewers: {
        where: {
          userId,
        },
      },
      application: {
        include: {
          job: {
            include: {
              organization: {
                include: {
                  members: {
                    where: {
                      userId,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!interview) {
    throw new Error("Interview not found");
  }

  // Assigned interviewer
  if (interview.interviewers.length > 0) {
    return true;
  }

  const member =
    interview.application.job.organization.members[0];

  if (!member) {
    return false;
  }

  const allowedRoles = [
    "OWNER",
    "ADMIN",
    "RECRUITER",
  ];

  return allowedRoles.includes(member.role);
}

module.exports = {
  canAccessInterviewEvaluation,
};
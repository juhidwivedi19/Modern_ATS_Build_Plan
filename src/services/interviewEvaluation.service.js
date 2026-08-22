const prisma = require("../config/db.config.js");

async function createInterviewEvaluation({
  interviewId,
  userId,
  technicalSkills,
  problemSolving,
  communication,
  overall,
  recommendation,
  feedback,
}) {
  // 1. Find the interview
  const interview = await prisma.interview.findUnique({
    where: {
      id: interviewId,
    },
  });

  if (!interview) {
    throw new Error("Interview not found");
  }

  // 2. Interview must be completed
  if (interview.status !== "COMPLETED") {
    throw new Error("Feedback can only be submitted after the interview is completed");
  }

  // 3. Check whether the user is assigned as an interviewer
  const interviewerAssignment =
    await prisma.interviewInterviewer.findUnique({
      where: {
        interviewId_userId: {
          interviewId,
          userId,
        },
      },
    });

  if (!interviewerAssignment) {
    throw new Error(
      "You are not assigned as an interviewer for this interview"
    );
  }

  // 4. Validate ratings
  const ratings = {
    technicalSkills,
    problemSolving,
    communication,
    overall,
  };

  for (const [key, value] of Object.entries(ratings)) {
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      throw new Error(`${key} rating must be between 1 and 5`);
    }
  }

  const validRecommendations = [
  "STRONG_HIRE",
  "HIRE",
  "MAYBE",
  "NO_HIRE",
];

if (!validRecommendations.includes(recommendation)) {
  throw new Error("Invalid recommendation");
}

  // 5. Check whether evaluation already exists
  const existingEvaluation =
    await prisma.interviewEvaluation.findUnique({
      where: {
        interviewerId: interviewerAssignment.id,
      },
    });

  if (existingEvaluation) {
    throw new Error("You have already submitted an evaluation for this interview");
  }

  // 6. Create evaluation
  const evaluation = await prisma.interviewEvaluation.create({
    data: {
      interviewerId: interviewerAssignment.id,
      technicalSkills,
      problemSolving,
      communication,
      overall,
      recommendation,
      feedback,
    },
  });

  return evaluation;
}

//=================
//get InterviewEvaluation
//====================
async function getInterviewEvaluation({
  interviewId,
  userId,
}) {
  const interviewerAssignment =
    await prisma.interviewInterviewer.findUnique({
      where: {
        interviewId_userId: {
          interviewId,
          userId,
        },
      },
      include: {
        evaluation: true,
      },
    });

  if (!interviewerAssignment) {
    throw new Error(
      "You are not assigned as an interviewer for this interview"
    );
  }

  if (!interviewerAssignment.evaluation) {
    throw new Error("Evaluation not found");
  }

  return interviewerAssignment.evaluation;
}

//=================
//updateInterviewEvaluation
//=================
async function updateInterviewEvaluation({
  interviewId,
  userId,
  technicalSkills,
  problemSolving,
  communication,
  overall,
  recommendation,
  feedback,
}) {
  const interviewerAssignment =
    await prisma.interviewInterviewer.findUnique({
      where: {
        interviewId_userId: {
          interviewId,
          userId,
        },
      },
      include: {
        evaluation: true,
      },
    });

  if (!interviewerAssignment) {
    throw new Error(
      "You are not assigned as an interviewer for this interview"
    );
  }

  if (!interviewerAssignment.evaluation) {
    throw new Error("Evaluation not found");
  }

  const ratings = {
    technicalSkills,
    problemSolving,
    communication,
    overall,
  };

  for (const [key, value] of Object.entries(ratings)) {
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      throw new Error(`${key} rating must be between 1 and 5`);
    }
  }

  const validRecommendations = [
    "STRONG_HIRE",
    "HIRE",
    "MAYBE",
    "NO_HIRE",
  ];

  if (!validRecommendations.includes(recommendation)) {
    throw new Error("Invalid recommendation");
  }

  const updatedEvaluation =
    await prisma.interviewEvaluation.update({
      where: {
        id: interviewerAssignment.evaluation.id,
      },
      data: {
        technicalSkills,
        problemSolving,
        communication,
        overall,
        recommendation,
        feedback,
      },
    });

  return updatedEvaluation;
}
module.exports = {
  createInterviewEvaluation,
  getInterviewEvaluation,
  updateInterviewEvaluation
};
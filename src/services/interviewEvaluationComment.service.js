const prisma = require("../config/db.config.js");

//===========================
//interviewEvaluationComment.service.js
//==========================
async function createInterviewEvaluationComment({
  interviewId,
  userId,
  content,
}) {
  // 1. Validate comment
  if (!content || !content.trim()) {
    throw new Error("Comment cannot be empty");
  }

  // 2. Check whether user is assigned to this interview
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

  // 3. Evaluation must exist
  if (!interviewerAssignment.evaluation) {
    throw new Error(
      "You must submit an evaluation before commenting"
    );
  }

  // 4. Create comment
  const comment =
    await prisma.interviewEvaluationComment.create({
      data: {
        evaluationId: interviewerAssignment.evaluation.id,
        authorId: userId,
        content: content.trim(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

  return comment;
}


//=======================
//getInterviewEvaluationComments
//=======================
async function getInterviewEvaluationComments({
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

  const comments =
    await prisma.interviewEvaluationComment.findMany({
      where: {
        evaluationId: interviewerAssignment.evaluation.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

  return comments;
}

//=========================
//updateInterviewEvaluationComment
//=============================
async function updateInterviewEvaluationComment({
  interviewId,
  userId,
  commentId,
  content,
}) {
  if (!content || !content.trim()) {
    throw new Error("Comment cannot be empty");
  }

  const comment =
    await prisma.interviewEvaluationComment.findUnique({
      where: {
        id: commentId,
      },
      include: {
        evaluation: {
          include: {
            interviewer: true,
          },
        },
      },
    });

  if (!comment) {
    throw new Error("Comment not found");
  }

  // Only comment author can update
  if (comment.authorId !== userId) {
    throw new Error(
      "You are not allowed to update this comment"
    );
  }

  // Make sure comment belongs to this interview
  if (
    comment.evaluation.interviewer.interviewId !==
    interviewId
  ) {
    throw new Error(
      "Comment does not belong to this interview"
    );
  }

  const updatedComment =
    await prisma.interviewEvaluationComment.update({
      where: {
        id: commentId,
      },
      data: {
        content: content.trim(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

  return updatedComment;
}


//========================
//getInterviewEvaluationComments
//======================

async function deleteInterviewEvaluationComment({
  interviewId,
  userId,
  commentId,
}) {
  const comment =
    await prisma.interviewEvaluationComment.findUnique({
      where: {
        id: commentId,
      },
      include: {
        evaluation: {
          include: {
            interviewer: true,
          },
        },
      },
    });

  if (!comment) {
    throw new Error("Comment not found");
  }

  // Only comment author can delete
  if (comment.authorId !== userId) {
    throw new Error(
      "You are not allowed to delete this comment"
    );
  }

  // Make sure comment belongs to this interview
  if (
    comment.evaluation.interviewer.interviewId !==
    interviewId
  ) {
    throw new Error(
      "Comment does not belong to this interview"
    );
  }

  await prisma.interviewEvaluationComment.delete({
    where: {
      id: commentId,
    },
  });

  return {
    commentId,
  };
}


module.exports = {
  createInterviewEvaluationComment,
  getInterviewEvaluationComments,
  updateInterviewEvaluationComment,
  deleteInterviewEvaluationComment,
};


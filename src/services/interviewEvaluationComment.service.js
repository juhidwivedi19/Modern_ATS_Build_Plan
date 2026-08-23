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

  // 2. Check interviewer assignment
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
    });

  // 5. Detect @mentions
  const mentionedNames = [
    ...content.matchAll(/@([a-zA-Z0-9._-]+)/g),
  ].map((match) => match[1]);

  // Remove duplicate names
  const uniqueMentionedNames = [
    ...new Set(mentionedNames),
  ];

  if (uniqueMentionedNames.length > 0) {
    // 6. Find mentioned users
    const mentionedUsers = await prisma.user.findMany({
      where: {
        name: {
          in: uniqueMentionedNames,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Don't allow users to mention themselves
    const mentionedUserIds = [
      ...new Set(
        mentionedUsers
          .map((user) => user.id)
          .filter(
            (mentionedUserId) =>
              mentionedUserId !== userId
          )
      ),
    ];

    if (mentionedUserIds.length > 0) {
      // 7. Create mention records
      await prisma.interviewEvaluationCommentMention.createMany({
        data: mentionedUserIds.map((mentionedUserId) => ({
          commentId: comment.id,
          userId: mentionedUserId,
        })),
        skipDuplicates: true,
      });

      // 8. Create notifications
      await prisma.notification.createMany({
        data: mentionedUserIds.map((mentionedUserId) => ({
          userId: mentionedUserId,
          type: "INTERVIEW_EVALUATION_MENTION",
          message:
            "You were mentioned in an interview evaluation comment.",
        })),
      });
    }
  }

  // 9. Return comment with author and mentions
  const createdComment =
    await prisma.interviewEvaluationComment.findUnique({
      where: {
        id: comment.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        mentions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

  return createdComment;
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


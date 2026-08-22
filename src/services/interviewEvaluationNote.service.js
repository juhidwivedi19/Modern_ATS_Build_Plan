const prisma = require("../config/db.config.js");

//=============
//create interviewEvaluationnote
async function createInterviewEvaluationNote({
  interviewId,
  userId,
  note,
}) {
  // 1. Find the interviewer assignment
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

  // 2. Check interviewer assignment
  if (!interviewerAssignment) {
    throw new Error(
      "You are not assigned as an interviewer for this interview"
    );
  }

  // 3. Evaluation must exist
  if (!interviewerAssignment.evaluation) {
    throw new Error(
      "You must submit an evaluation before adding a private note"
    );
  }

  // 4. Validate note
  if (!note || !note.trim()) {
    throw new Error("Note cannot be empty");
  }

  // 5. Create private note
  const privateNote = await prisma.interviewEvaluationNote.create({
    data: {
      evaluationId: interviewerAssignment.evaluation.id,
      authorId: userId,
      note: note.trim(),
    },
  });

  return privateNote;
}

//=================
//getinterview EvaluationNote
//=====================
async function getInterviewEvaluationNotes({
  interviewId,
  userId,
}) {
  // 1. Check interviewer assignment
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

  // 2. Evaluation must exist
  if (!interviewerAssignment.evaluation) {
    throw new Error("Evaluation not found");
  }

  // 3. Get only this user's notes
  const notes = await prisma.interviewEvaluationNote.findMany({
    where: {
      evaluationId: interviewerAssignment.evaluation.id,
      authorId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return notes;
}

//=================
//updateInterviewEvaluationNote
//==================
async function updateInterviewEvaluationNote({
  interviewId,
  userId,
  noteId,
  note,
}) {
  // 1. Validate note
  if (!note || !note.trim()) {
    throw new Error("Note cannot be empty");
  }

  // 2. Find the note
  const existingNote =
    await prisma.interviewEvaluationNote.findUnique({
      where: {
        id: noteId,
      },
      include: {
        evaluation: {
          include: {
            interviewer: true,
          },
        },
      },
    });

  if (!existingNote) {
    throw new Error("Private note not found");
  }

  // 3. Check that this note belongs to the logged-in user
  if (existingNote.authorId !== userId) {
    throw new Error(
      "You are not allowed to update this private note"
    );
  }

  // 4. Check that the note belongs to this interview
  if (
    existingNote.evaluation.interviewer.interviewId !==
    interviewId
  ) {
    throw new Error("Private note does not belong to this interview");
  }

  // 5. Update note
  const updatedNote =
    await prisma.interviewEvaluationNote.update({
      where: {
        id: noteId,
      },
      data: {
        note: note.trim(),
      },
    });

  return updatedNote;
}


//============================
//deleteInterviewEvaluationNote
//==========================
async function deleteInterviewEvaluationNote({
  interviewId,
  userId,
  noteId,
}) {
  // 1. Find the note
  const existingNote =
    await prisma.interviewEvaluationNote.findUnique({
      where: {
        id: noteId,
      },
      include: {
        evaluation: {
          include: {
            interviewer: true,
          },
        },
      },
    });

  if (!existingNote) {
    throw new Error("Private note not found");
  }

  // 2. Check note ownership
  if (existingNote.authorId !== userId) {
    throw new Error(
      "You are not allowed to delete this private note"
    );
  }

  // 3. Check interview ownership
  if (
    existingNote.evaluation.interviewer.interviewId !==
    interviewId
  ) {
    throw new Error("Private note does not belong to this interview");
  }

  // 4. Delete note
  await prisma.interviewEvaluationNote.delete({
    where: {
      id: noteId,
    },
  });

  return {
    noteId,
  };
}


module.exports = {
  createInterviewEvaluationNote,
  getInterviewEvaluationNotes,
  updateInterviewEvaluationNote,
  deleteInterviewEvaluationNote
};
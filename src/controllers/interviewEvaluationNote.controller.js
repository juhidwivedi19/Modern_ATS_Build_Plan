const {
  createInterviewEvaluationNoteController,
  getInterviewEvaluationNotesController,
  updateInterviewEvaluationNoteController,
    deleteInterviewEvaluationNoteController,
} = require("../services/interviewEvaluationNote.service.js");

//==========================
//Create interviewEvaluation Controller
//============================
async function createInterviewEvaluationNoteController(req, res) {
  try {
    const { interviewId } = req.params;

    const userId = req.user.id;

    const { note } = req.body;

    const privateNote = await createInterviewEvaluationNote({
      interviewId: Number(interviewId),
      userId,
      note,
    });

    return res.status(201).json({
      success: true,
      message: "Private note created successfully",
      data: privateNote,
    });
  } catch (error) {
    console.error("Create private note error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

//========================
//getInterviewEvaluationNote Controller
//========================
async function getInterviewEvaluationNotesController(req, res) {
  try {
    const { interviewId } = req.params;

    const userId = req.user.id;

    const notes = await getInterviewEvaluationNotes({
      interviewId: Number(interviewId),
      userId,
    });

    return res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    console.error("Get private notes error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

//=====================
//updateInterviewController
//=====================
async function updateInterviewEvaluationNoteController(req, res) {
  try {
    const { interviewId, noteId } = req.params;

    const userId = req.user.id;

    const { note } = req.body;

    const updatedNote = await updateInterviewEvaluationNote({
      interviewId: Number(interviewId),
      userId,
      noteId,
      note,
    });

    return res.status(200).json({
      success: true,
      message: "Private note updated successfully",
      data: updatedNote,
    });
  } catch (error) {
    console.error("Update private note error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}


//==============================
//deleteinterviewEvaluuationNoteController
//=============================
async function deleteInterviewEvaluationNoteController(req, res) {
  try {
    const { interviewId, noteId } = req.params;

    const userId = req.user.id;

    const result = await deleteInterviewEvaluationNote({
      interviewId: Number(interviewId),
      userId,
      noteId,
    });

    return res.status(200).json({
      success: true,
      message: "Private note deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Delete private note error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}


module.exports = {
  createInterviewEvaluationNoteController,
  getInterviewEvaluationNotesController,
  updateInterviewEvaluationNoteController,
  deleteInterviewEvaluationNoteController
};
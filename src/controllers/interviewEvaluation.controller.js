const {
  createInterviewEvaluation, getInterviewEvaluations,  updateInterviewEvaluation, deleteInterviewEvaluation,
} = require("../services/interviewEvaluation.service.js");

async function createInterviewEvaluationController(req, res) {
  try {
    const { interviewId } = req.params;

    const userId = req.user.id;

    const {
      technicalSkills,
      problemSolving,
      communication,
      overall,
      recommendation,
      feedback,
    } = req.body;

    const evaluation = await createInterviewEvaluation({
      interviewId: Number(interviewId),
      userId,
      technicalSkills,
      problemSolving,
      communication,
      overall,
      recommendation,
      feedback,
    });

    return res.status(201).json({
      success: true,
      message: "Interview evaluation submitted successfully",
      data: evaluation,
    });
  } catch (error) {
    console.error("Create interview evaluation error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

//======================
//GET INTERVIEW EVALUATION
//=================
async function getInterviewEvaluationsController(req, res) {
  try {
    const { interviewId } = req.params;

    const userId = req.user.id;

    const evaluations = await getInterviewEvaluations({
      interviewId: Number(interviewId),
      userId,
    });

    return res.status(200).json({
      success: true,
      data: evaluations,
    });
  } catch (error) {
    console.error("Get interview evaluations error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}


//====================
//update interviewevaluation
//===================
async function updateInterviewEvaluationController(req, res) {
  try {
    const { interviewId } = req.params;

    const userId = req.user.id;

    const {
      technicalSkills,
      problemSolving,
      communication,
      overall,
      recommendation,
      feedback,
    } = req.body;

    const evaluation = await updateInterviewEvaluation({
      interviewId: Number(interviewId),
      userId,
      technicalSkills,
      problemSolving,
      communication,
      overall,
      recommendation,
      feedback,
    });

    return res.status(200).json({
      success: true,
      message: "Interview evaluation updated successfully",
      data: evaluation,
    });
  } catch (error) {
    console.error("Update interview evaluation error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}


// ======================
// DELETE INTERVIEW EVALUATION
// ======================

async function deleteInterviewEvaluationController(req, res) {
  try {
    const { interviewId } = req.params;

    const userId = req.user.id;

    const result = await deleteInterviewEvaluation({
      interviewId: Number(interviewId),
      userId,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error(
      "Delete interview evaluation error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
module.exports = {
  createInterviewEvaluationController,
  getInterviewEvaluationsController,
  updateInterviewEvaluationController,
  deleteInterviewEvaluationController
};  
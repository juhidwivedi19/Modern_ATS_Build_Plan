const {
  createInterviewEvaluationComment,
  getInterviewEvaluationComments,
  updateInterviewEvaluationComment,
  deleteInterviewEvaluationComment,
} = require("../services/interviewEvaluationComment.service.js");


//======================
//createInterviewEvaluationCommentController
//======================
async function createInterviewEvaluationCommentController(req, res) {
  try {
    const { interviewId } = req.params;
    const { content } = req.body;

    const userId = req.user.id;

    const comment = await createInterviewEvaluationComment({
      interviewId: Number(interviewId),
      userId,
      content,
    });

    return res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: comment,
    });
  } catch (error) {
    console.error("Create evaluation comment error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

//=======================
//getInterviewEvaluationCommentController
//======================
async function getInterviewEvaluationCommentsController(req, res) {
  try {
    const { interviewId } = req.params;

    const userId = req.user.id;

    const comments = await getInterviewEvaluationComments({
      interviewId: Number(interviewId),
      userId,
    });

    return res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error("Get evaluation comments error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

//===================
//updateInterviewEvaluationCommentController
//====================
async function updateInterviewEvaluationCommentController(req, res) {
  try {
    const { interviewId, commentId } = req.params;

    const { content } = req.body;

    const userId = req.user.id;

    const comment = await updateInterviewEvaluationComment({
      interviewId: Number(interviewId),
      userId,
      commentId,
      content,
    });

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: comment,
    });
  } catch (error) {
    console.error("Update evaluation comment error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}


//===========================
//deleteInterviewEvaluationCommentController
//==========================
async function deleteInterviewEvaluationCommentController(req, res) {
  try {
    const { interviewId, commentId } = req.params;

    const userId = req.user.id;

    const result = await deleteInterviewEvaluationComment({
      interviewId: Number(interviewId),
      userId,
      commentId,
    });

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Delete evaluation comment error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}


module.exports = {
  createInterviewEvaluationCommentController,
  getInterviewEvaluationCommentsController,
  updateInterviewEvaluationCommentController,
  deleteInterviewEvaluationCommentController,
};
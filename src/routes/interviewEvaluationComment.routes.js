const express = require("express");

const router = express.Router();

const {
  createInterviewEvaluationCommentController,
  getInterviewEvaluationCommentsController,
  updateInterviewEvaluationCommentController,
  deleteInterviewEvaluationCommentController,
} = require("../controllers/interviewEvaluationComment.controller.js");

const {
  authMiddleware,
} = require("../middlewares/auth.middleware.js");


router.post(
  "/:interviewId/evaluation/comments",
  authMiddleware,
  createInterviewEvaluationCommentController
);


router.get(
  "/:interviewId/evaluation/comments",
  authMiddleware,
  getInterviewEvaluationCommentsController
);


router.patch(
  "/:interviewId/evaluation/comments/:commentId",
  authMiddleware,
  updateInterviewEvaluationCommentController
);


router.delete(
  "/:interviewId/evaluation/comments/:commentId",
  authMiddleware,
  deleteInterviewEvaluationCommentController
);


module.exports = router;
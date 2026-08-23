const express = require("express");

const router = express.Router();


const {
  createInterviewEvaluationController,getInterviewEvaluationsController,updateInterviewEvaluationController,deleteInterviewEvaluationController
} = require("../controllers/interviewEvaluation.controller.js");

const { authMiddleware } = require("../middlewares/auth.middleware.js");

router.post(
  "/:interviewId/evaluation",
  authMiddleware,
  createInterviewEvaluationController
);

router.get(
  "/:interviewId/evaluation",
  authMiddleware,
  getInterviewEvaluationsController
);

router.patch(
  "/:interviewId/evaluation",
  authMiddleware,
  updateInterviewEvaluationController
);

router.delete(
  "/:interviewId/evaluation",
  authMiddleware,
  deleteInterviewEvaluationController
);

module.exports = router;
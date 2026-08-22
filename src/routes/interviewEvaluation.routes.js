const express = require("express");

const router = express.Router();


const {
  createInterviewEvaluationController,getInterviewEvaluationController,updateInterviewEvaluationController,
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
  getInterviewEvaluationController
);

router.patch(
  "/:interviewId/evaluation",
  authMiddleware,
  updateInterviewEvaluationController
);

module.exports = router;
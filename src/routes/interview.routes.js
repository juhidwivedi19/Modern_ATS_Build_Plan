const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const router = express.Router();

const { scheduleInterviewController,assignInterviewerController, removeInterviewerController, getInterviewByIdController} = require("../controllers/interview.controller");

router.post("/", authMiddleware, scheduleInterviewController);


router.post(
  "/:interviewId/interviewers",
  authMiddleware,
  assignInterviewerController
);

router.delete(
  "/:interviewId/interviewer/:userId",
  authMiddleware,
  removeInterviewerController
);


router.get(
  "/:interviewId",
  authMiddleware,
  getInterviewByIdController
);


module.exports = router;
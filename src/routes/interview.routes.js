const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const router = express.Router();

const { scheduleInterviewController,assignInterviewerController, removeInterviewerController, getInterviewByIdController,getAllInterviewsController
  ,updateInterviewController,cancelInterviewController
} = require("../controllers/interview.controller");

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


router.get(
  "/",
  authMiddleware,
  getAllInterviewsController
);

router.patch(
  "/:interviewId",
  authMiddleware,
  updateInterviewController
)


router.patch(
  "/:interviewId/cancel",
  authMiddleware,
  cancelInterviewController
);

module.exports = router;
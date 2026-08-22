const express = require("express");

const router = express.Router();

const {
  createInterviewEvaluationNoteController,getInterviewEvaluationNotesController, updateInterviewEvaluationNoteController,  deleteInterviewEvaluationNoteController,
} = require("../controllers/interviewEvaluationNote.controller.js");

const { authMiddleware } = require("../middlewares/auth.middleware.js");

router.post(
  "/:interviewId/evaluation/notes",
  authMiddleware,
  createInterviewEvaluationNoteController
);

router.get(
  "/:interviewId/evaluation/notes",
  authMiddleware,
  getInterviewEvaluationNotesController
);

router.patch(
  "/:interviewId/evaluation/notes/:noteId",
  authMiddleware,
  updateInterviewEvaluationNoteController
);


router.delete(
  "/:interviewId/evaluation/notes/:noteId",
  authMiddleware,
  deleteInterviewEvaluationNoteController
);

module.exports = router;  
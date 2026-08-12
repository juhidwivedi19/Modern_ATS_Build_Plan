const express = require("express");

const  {uploadMiddleware} = require("../middlewares/upload.middleware");
const {authMiddleware} = require("../middlewares/auth.middleware");

   const {
    uploadResume,
    getCandidateResume,
    deleteResume,
    getResumeDownloadUrl
} = require("../controllers/resume.controller.js");

const router = express.Router();

//upload resume  :Your upload route should have authentication before the upload controller:
router.post(
    "/upload",
    authMiddleware,
    uploadMiddleware,
    uploadResume
);

// Get candidate's resumes
router.get(
    "/resumes",
    authMiddleware,
    getCandidateResume
);

//delete resume
router.delete(
    "/resumes/:resumeId",
    authMiddleware,
    deleteResume
);

router.get(
    "/resumes/:resumeId/download",
    authMiddleware,
    getResumeDownloadUrl
);


module.exports = router;
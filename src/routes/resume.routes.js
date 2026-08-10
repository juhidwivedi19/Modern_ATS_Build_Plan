const express = require("express");

const {
    uploadMiddleware
} = require("../middlewares/upload.middleware");

const {
    uploadResume
} = require("../controllers/resume.controller");

const router = express.Router();

router.post(
    "/upload",
    uploadMiddleware,
    uploadResume
);

module.exports = router;
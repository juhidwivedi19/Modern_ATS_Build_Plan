const express = require("express");

const apiKeyMiddleware = require("../middlewares/apiKey.middleware.js");

const externalJobController = require("../controllers/externalJob.controller.js");

const externalCandidateController = require("../controllers/externalCandidate.controller.js");
const externalReportController =
    require("../controllers/externalReport.controller.js");

const router = express.Router();


// All external APIs require API key authentication
router.use(apiKeyMiddleware);


// ==========================================
// 1. External Create Job API
// ==========================================

router.post(
    "/jobs",
    externalJobController.createExternalJobController
);


// ==========================================
// 2. External Submit Candidate API
// ==========================================

router.post(
    "/candidates",
    externalCandidateController.submitExternalCandidateController
);


// ==========================================
// 3. External Read Reports API
// ==========================================

router.get(
    "/reports",
    externalReportController.getExternalReportsController
);

module.exports = router;

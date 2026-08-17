const express= require("express")
const {createApplicationController, getCandidateApplicationsController,getApplicationController,getJobApplicationsController,moveApplicationController,getApplicationActivityController} = require("../controllers/application.controller.js")
const {authMiddleware} = require("../middlewares/auth.middleware.js")

const router = express.Router();

router.post(
    "/jobs/:jobId/apply",
    authMiddleware,
    createApplicationController
);

// Get logged-in candidates applications
router.get(
    "/candidates/applications",
    authMiddleware,
    getCandidateApplicationsController
);

// Get a single application
router.get(
    "/applications/:applicationId",
    authMiddleware,
    getApplicationController
);


// Recruiter gets applications for a job
router.get(
    "/organization/jobs/:jobId/applications",
    authMiddleware,
    getJobApplicationsController
);

router.patch(
    "/applications/:applicationId/status",
    moveApplicationController
);

router.get(
    "/applications/:applicationId/activity",
    getApplicationActivityController
);

module.exports=router;
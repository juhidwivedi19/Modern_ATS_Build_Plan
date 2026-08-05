const express=require("express");
const jobController = require("../controllers/job.controller.js");
const router = express.Router();


router.post(
    "/:organizationId/jobs",
    authMiddleware.authMiddleware,
    organizationAuthorizationMiddleware.organizationAuthorizationMiddleware,
    roleAuthorizationMiddleware.roleAuthorizationMiddleware([
        "OWNER",
        "ADMIN",
        "RECRUITER"
    ]),
    jobController.createJobController
);

router.get(
    "/:organizationId/jobs",
    authMiddleware.authMiddleware,
    organizationAuthorizationMiddleware.organizationAuthorizationMiddleware,
    jobController.getJobsController
);

router.get(
    "/:organizationId/job",
    authMiddleware.authMiddleware,
    organizationAuthorizationMiddleware.organizationAuthorizationMiddleware,
    jobController.getJobController
);

router.put(
    "/:organizationId/jobs/:jobId",
    authMiddleware.authMiddleware,
    organizationAuthorizationMiddleware.organizationAuthorizationMiddleware,
    roleAuthorizationMiddleware.roleAuthorizationMiddleware([
        "OWNER",
        "ADMIN",
        "RECRUITER"
    ]),
    jobController.updateJobController
);

router.patch(
    "/:organizationId/jobs/:jobId/publish",
    authMiddleware.authMiddleware,
    organizationAuthorizationMiddleware.organizationAuthorizationMiddleware,
    roleAuthorizationMiddleware.roleAuthorizationMiddleware([
        "OWNER",
        "ADMIN",
        "RECRUITER"
    ]),
    jobController.publishJobController
);

module.exports=router;
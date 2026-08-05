const express=require("express");
const jobController = require("../controllers/job.controller.js");
const authMiddleware = require("../middlewares/auth.middleware");
const organizationAuthorizationMiddleware = require("../middlewares/organizationAuthorization.middleware");
const roleAuthorizationMiddleware = require("../middlewares/roleAuthorization.middleware"); 


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

router.patch(
    "/:organizationId/jobs/:jobId/archive",
    authMiddleware.authMiddleware,
    organizationAuthorizationMiddleware.organizationAuthorizationMiddleware,
    roleAuthorizationMiddleware.roleAuthorizationMiddleware([
        "OWNER",
        "ADMIN",
        "RECRUITER"
    ]),
    jobController.archiveJobController
);

module.exports=router;
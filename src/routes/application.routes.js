const express= require("express")
const applicationController = require("../controllers/application.controller.js")

const router = express.Router();

router.post(
    "/jobs/:jobId/apply",
    applicationController.createApplicationController

);

router.post(
    "/jobs/:jobId/apply",
    uploadMiddleware,
    applicationController.createApplicationController
);

module.exports=router;
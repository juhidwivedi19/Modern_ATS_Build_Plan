const express = require("express");
const organizationController = require("../controllers/organization.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware.authMiddleware,
    organizationController.createOrganizationController
);

module.exports = router;
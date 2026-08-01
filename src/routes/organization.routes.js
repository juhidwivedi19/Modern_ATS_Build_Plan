const express = require("express");
const organizationController = require("../controllers/organization.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const organizationAuthorizationMiddleware = require("../middlewares/organizationAuthorization.middleware");
const roleAuthorizationMiddleware = require("../middlewares/roleAuthorization.middleware");  //add these middleware first then router.post

const router = express.Router();

//Create organization
router.post(
    "/",
    authMiddleware.authMiddleware,
    organizationController.createOrganizationController
);

//Get my organization
router.get(
    "/",
    authMiddleware.authMiddleware,
    organizationController.getMyOrganizationController
);

//Get organization details

router.get(
    "/:organizationId",
    authMiddleware.authMiddleware,
    organizationAuthorizationMiddleware.organizationAuthorizationMiddleware,
    organizationController.getOrganizationDetailsController
);

router.post(
    "/:organizationId/invite",
    authMiddleware.authMiddleware,
    organizationAuthorizationMiddleware.organizationAuthorizationMiddleware,
    roleAuthorizationMiddleware.roleAuthorizationMiddleware([
        "OWNER",
        "ADMIN"
    ]),
);

module.exports = router;
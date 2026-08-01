const express = require("express");
const organizationController = require("../controllers/organization.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const organizationAuthorizationMiddleware = require("../middlewares/organizationAuthorization.middleware");
const roleAuthorizationMiddleware = require("../middlewares/roleAuthorization.middleware"); 

const router = express.Router();

router.post(
    "/",
    authMiddleware.authMiddleware,
    organizationController.createOrganizationController
);

router.get(
    "/",
    authMiddleware.authMiddleware,
    organizationController.getMyOrganizationController
);



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
    organizationController.inviteMemberController
);


router.get(
    "/accept-invitation",
    authMiddleware.authMiddleware,
    organizationController.acceptInvitationController
);


module.exports = router;

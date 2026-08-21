const express = require("express");

const {
    connectGoogleCalendarController,googleCalendarCallbackController,
    getCalendarStatusController,disconnectGoogleCalendarController
} = require("../controllers/googleCalendar.Controller.js");

const { authMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get(
    "/connect",
    authMiddleware,
    connectGoogleCalendarController
);

router.get(
    "/oauth/callback",
    authMiddleware,
    googleCalendarCallbackController
);

router.get(
    "/status",
    authMiddleware,
    getCalendarStatusController
);

router.delete(
    "/disconnect",
    authMiddleware,
    disconnectGoogleCalendarController
);

module.exports = router;
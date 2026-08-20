const express = require("express");

const {
    connectGoogleCalendarController,GoogleCalendarCallbackController,
    googleCalendarCallbackController
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
    googleCalendarCallbackController
);

module.exports = router;
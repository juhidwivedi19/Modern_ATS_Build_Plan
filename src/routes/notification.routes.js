const express = require("express");

const {
    getMyNotificationsController,
    getUnreadNotificationCountController,
    markNotificationAsReadController,
    markAllNotificationsAsReadController
} = require("../controllers/notification.controller.js");

const {authMiddleware} = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    getMyNotificationsController
);

router.get(
    "/unread-count",
    authMiddleware,
    getUnreadNotificationCountController
);

router.patch(
    "/read-all",
    authMiddleware,
    markAllNotificationsAsReadController
);

router.patch(
    "/:notificationId/read",
    authMiddleware,
    markNotificationAsReadController
);

module.exports = router;
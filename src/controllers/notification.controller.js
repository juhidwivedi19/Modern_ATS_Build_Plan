const prisma = require("../config/db.config.js");


async function getMyNotificationsController(req, res) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Authentication required",
                status: "failed"
            });
        }

        const notifications =
            await prisma.notification.findMany({
                where: {
                    userId: req.user.id
                },
                include: {
                    application: {
                        select: {
                            id: true,
                            status: true,
                            job: {
                                select: {
                                    id: true,
                                    title: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                }
            });

        return res.status(200).json({
            message: "Notifications fetched successfully",
            status: "success",
            data: notifications
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            status: "failed"
        });
    }
}


async function getUnreadNotificationCountController(req, res) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Authentication required",
                status: "failed"
            });
        }

        const count = await prisma.notification.count({
            where: {
                userId: req.user.id,
                isRead: false
            }
        });

        return res.status(200).json({
            message: "Unread notification count fetched successfully",
            status: "success",
            data: {
                count
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            status: "failed"
        });
    }
}

async function markNotificationAsReadController(req, res) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Authentication required",
                status: "failed"
            });
        }

        const notificationId =
            Number(req.params.notificationId);

        if (
            !Number.isInteger(notificationId) ||
            notificationId <= 0
        ) {
            return res.status(400).json({
                message: "Valid notification ID is required",
                status: "failed"
            });
        }

        const notification =
            await prisma.notification.findFirst({
                where: {
                    id: notificationId,
                    userId: req.user.id
                }
            });

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found",
                status: "failed"
            });
        }

        const updatedNotification =
            await prisma.notification.update({
                where: {
                    id: notificationId
                },
                data: {
                    isRead: true
                }
            });

        return res.status(200).json({
            message: "Notification marked as read",
            status: "success",
            data: updatedNotification
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            status: "failed"
        });
    }
}


async function markAllNotificationsAsReadController(req, res) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Authentication required",
                status: "failed"
            });
        }

        await prisma.notification.updateMany({
            where: {
                userId: req.user.id,
                isRead: false
            },
            data: {
                isRead: true
            }
        });

        return res.status(200).json({
            message: "All notifications marked as read",
            status: "success"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            status: "failed"
        });
    }
}


module.exports = {
    getMyNotificationsController,
     getUnreadNotificationCountController,
    markNotificationAsReadController,
    markAllNotificationsAsReadController
    
};

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, []);

    async function fetchNotifications() {
        try {
            const response = await api.get("/notifications");

            setNotifications(response.data.data || []);
        } catch (error) {
            console.error(
                "Failed to fetch notifications:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to fetch notifications"
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleMarkAsRead(notificationId) {
        try {
            const response = await api.patch(
                `/notifications/${notificationId}/read`
            );

            setNotifications((previous) =>
                previous.map((notification) =>
                    notification.id === notificationId
                        ? response.data.data
                        : notification
                )
            );
        } catch (error) {
            console.error(
                "Failed to mark notification as read:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to mark notification as read"
            );
        }
    }

    async function handleMarkAllAsRead() {
        try {
            await api.patch("/notifications/read-all");

            setNotifications((previous) =>
                previous.map((notification) => ({
                    ...notification,
                    isRead: true
                }))
            );

            alert("All notifications marked as read");
        } catch (error) {
            console.error(
                "Failed to mark all notifications as read:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to mark all notifications as read"
            );
        }
    }

    function handleNotificationClick(notification) {
        if (!notification.isRead) {
            handleMarkAsRead(notification.id);
        }

        if (notification.applicationId) {
            navigate(
                `/applications/${notification.applicationId}`
            );
        }
    }

    function formatNotificationType(type) {
        if (!type) return "Notification";

        return type
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );
    }

    if (loading) {
        return (
            <div className="page">
                <div className="notifications-loading">
                    <div className="notifications-loading-icon">
                        ✓
                    </div>

                    <h2>Loading notifications</h2>

                    <p>
                        Fetching your latest activity...
                    </p>
                </div>
            </div>
        );
    }

    const unreadCount = notifications.filter(
        (notification) => !notification.isRead
    ).length;

    return (
        <div className="page">

            <div className="page-header notifications-header">

                <div>
                    <p className="page-eyebrow">
                        ACTIVITY CENTER
                    </p>

                    <h1>Notifications</h1>

                    <p className="notifications-subtitle">
                        Stay updated on applications, interviews,
                        and hiring activity.
                    </p>
                </div>

                <div className="notifications-header-actions">

                    <div className="notifications-count">
                        <strong>{unreadCount}</strong>
                        <span>Unread</span>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            className="btn btn-primary"
                            onClick={handleMarkAllAsRead}
                        >
                            Mark All as Read
                        </button>
                    )}

                </div>

            </div>

            {notifications.length === 0 ? (
                <div className="notifications-empty">

                    <div className="notifications-empty-icon">
                        ✓
                    </div>

                    <h2>You're all caught up</h2>

                    <p>
                        There are no notifications to display right
                        now.
                    </p>

                </div>
            ) : (
                <div className="notifications-card">

                    <div className="notifications-card-header">

                        <div>
                            <h2>Recent Activity</h2>

                            <p>
                                {notifications.length}{" "}
                                {notifications.length === 1
                                    ? "notification"
                                    : "notifications"}
                            </p>
                        </div>

                        {unreadCount > 0 && (
                            <span className="notifications-unread-badge">
                                {unreadCount} unread
                            </span>
                        )}

                    </div>

                    <div className="notifications-list">

                        {notifications.map((notification) => (

                            <div
                                key={notification.id}
                                className={`notification-item ${
                                    notification.isRead
                                        ? "notification-read"
                                        : "notification-unread"
                                }`}
                                onClick={() =>
                                    handleNotificationClick(
                                        notification
                                    )
                                }
                            >

                                <div className="notification-icon">
                                    {notification.isRead
                                        ? "✓"
                                        : "●"}
                                </div>

                                <div className="notification-content">

                                    <div className="notification-top">

                                        <div>
                                            <span className="notification-type">
                                                {formatNotificationType(
                                                    notification.type
                                                )}
                                            </span>

                                            {!notification.isRead && (
                                                <span className="notification-new">
                                                    New
                                                </span>
                                            )}
                                        </div>

                                        <span className="notification-date">
                                            {new Date(
                                                notification.createdAt
                                            ).toLocaleString()}
                                        </span>

                                    </div>

                                    <p className="notification-message">
                                        {notification.message}
                                    </p>

                                    {notification.application?.job && (
                                        <div className="notification-job">

                                            <span>
                                                Position
                                            </span>

                                            <strong>
                                                {
                                                    notification
                                                        .application
                                                        .job.title
                                                }
                                            </strong>

                                        </div>
                                    )}

                                    <div className="notification-actions">

                                        {!notification.isRead && (
                                            <button
                                                className="btn btn-small"
                                                onClick={(e) => {
                                                    e.stopPropagation();

                                                    handleMarkAsRead(
                                                        notification.id
                                                    );
                                                }}
                                            >
                                                Mark as Read
                                            </button>
                                        )}

                                        {notification.applicationId && (
                                            <span className="notification-view">
                                                View Application →
                                            </span>
                                        )}

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>
            )}

        </div>
    );
}

export default Notifications;

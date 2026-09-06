
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
            console.error("Failed to fetch notifications:", error);

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

    if (loading) {
        return <div>Loading notifications...</div>;
    }

    const unreadCount = notifications.filter(
        (notification) => !notification.isRead
    ).length;

    return (
        <div>
            <h1>Notifications</h1>

            <p>
                Unread Notifications: {unreadCount}
            </p>

            {unreadCount > 0 && (
                <button onClick={handleMarkAllAsRead}>
                    Mark All as Read
                </button>
            )}

            {notifications.length === 0 ? (
                <p>No notifications.</p>
            ) : (
                <div>
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            onClick={() =>
                                handleNotificationClick(notification)
                            }
                            style={{
                                cursor: "pointer",
                                fontWeight: notification.isRead
                                    ? "normal"
                                    : "bold"
                            }}
                        >
                            <p>
                                {notification.message}
                            </p>

                            <p>
                                Type: {notification.type}
                            </p>

                            {notification.application?.job && (
                                <p>
                                    Job:{" "}
                                    {
                                        notification.application.job
                                            .title
                                    }
                                </p>
                            )}

                            <p>
                                {new Date(
                                    notification.createdAt
                                ).toLocaleString()}
                            </p>

                            {!notification.isRead && (
                                <button
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

                            <hr />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Notifications;

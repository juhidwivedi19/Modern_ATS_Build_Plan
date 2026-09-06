
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

function ApplicationActivity() {
    const { applicationId } = useParams();
    const navigate = useNavigate();

    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchActivity() {
            try {
                const response = await api.get(
                    `/applications/${applicationId}/activity`
                );

                setActivities(response.data.data || []);
            } catch (error) {
                console.error(
                    "Failed to fetch application activity:",
                    error
                );

                alert(
                    error.response?.data?.message ||
                    "Failed to fetch application activity"
                );
            } finally {
                setLoading(false);
            }
        }

        fetchActivity();
    }, [applicationId]);

    function getActivityTitle(activity) {
        return (
            activity.action ||
            activity.type ||
            "Application Activity"
        );
    }

    function getActivityIcon(activity) {
        const value = (
            activity.action ||
            activity.type ||
            ""
        ).toUpperCase();

        if (value.includes("INTERVIEW")) return "📅";
        if (value.includes("STATUS")) return "↔";
        if (value.includes("OFFER")) return "🎯";
        if (value.includes("HIRED")) return "✓";
        if (value.includes("FEEDBACK")) return "💬";
        if (value.includes("REJECT")) return "×";

        return "•";
    }

    if (loading) {
        return (
            <div className="page">
                <div className="activity-loading">
                    Loading activity...
                </div>
            </div>
        );
    }

    return (
        <div className="page">

            <div className="activity-header">

                <div>
                    <button
                        className="btn activity-back"
                        onClick={() =>
                            navigate(
                                `/applications/${applicationId}`
                            )
                        }
                    >
                        ← Back to Application
                    </button>

                    <h1>Application Activity</h1>

                    <p>
                        Complete history of activity for this
                        application.
                    </p>
                </div>

                <div className="activity-count">
                    <strong>{activities.length}</strong>
                    <span>Events</span>
                </div>

            </div>

            {activities.length === 0 ? (
                <div className="activity-empty">

                    <div className="activity-empty-icon">
                        ◷
                    </div>

                    <h2>No activity yet</h2>

                    <p>
                        Activity related to this application will
                        appear here.
                    </p>

                </div>
            ) : (
                <section className="activity-card">

                    <div className="activity-card-header">
                        <div>
                            <h2>Activity Timeline</h2>
                            <p>
                                Latest application events and
                                updates.
                            </p>
                        </div>
                    </div>

                    <div className="activity-timeline">

                        {activities.map((activity, index) => (
                            <div
                                className="activity-item"
                                key={activity.id}
                            >

                                <div className="activity-marker">

                                    <div className="activity-icon">
                                        {getActivityIcon(activity)}
                                    </div>

                                    {index !==
                                        activities.length - 1 && (
                                        <div className="activity-line" />
                                    )}

                                </div>

                                <div className="activity-content">

                                    <div className="activity-content-top">

                                        <div>
                                            <h3>
                                                {getActivityTitle(
                                                    activity
                                                )}
                                            </h3>

                                            {activity.description && (
                                                <p>
                                                    {
                                                        activity.description
                                                    }
                                                </p>
                                            )}

                                            {activity.message && (
                                                <p>
                                                    {activity.message}
                                                </p>
                                            )}
                                        </div>

                                        {activity.createdAt && (
                                            <span className="activity-date">
                                                {new Date(
                                                    activity.createdAt
                                                ).toLocaleString()}
                                            </span>
                                        )}

                                    </div>

                                </div>

                            </div>
                        ))}

                    </div>

                </section>
            )}

        </div>
    );
}

export default ApplicationActivity;
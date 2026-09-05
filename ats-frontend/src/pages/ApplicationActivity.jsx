
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

                setActivities(response.data.data);
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

    if (loading) {
        return <div>Loading activity...</div>;
    }

    return (
        <div>
            <button
                onClick={() =>
                    navigate(
                        `/applications/${applicationId}`
                    )
                }
            >
                Back to Application
            </button>

            <h1>Application Activity</h1>

            {activities.length === 0 ? (
                <p>No activity found.</p>
            ) : (
                <div>
                    {activities.map((activity) => (
                        <div key={activity.id}>
                            <h3>
                                {activity.action ||
                                    activity.type ||
                                    "Activity"}
                            </h3>

                            {activity.description && (
                                <p>{activity.description}</p>
                            )}

                            {activity.message && (
                                <p>{activity.message}</p>
                            )}

                            <p>
                                {activity.createdAt
                                    ? new Date(
                                          activity.createdAt
                                      ).toLocaleString()
                                    : ""}
                            </p>

                            <hr />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ApplicationActivity;

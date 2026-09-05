
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Applications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        async function fetchApplications() {
            try {
                const response = await api.get(
                    "/candidates/applications"
                );

                setApplications(response.data.data);

            } catch (error) {
                console.error(
                    "Failed to fetch applications:",
                    error
                );
            } finally {
                setLoading(false);
            }
        }

        fetchApplications();
    }, []);

    if (loading) {
        return <div>Loading applications...</div>;
    }

    return (
        <div>
            <h1>My Applications</h1>

            {applications.length === 0 ? (
                <p>You have not applied to any jobs yet.</p>
            ) : (
                <div>
                    {applications.map((application) => (
                        <div key={application.id}>
                            <h2>
                                {application.job.title}
                            </h2>

                            <p>
                                Organization:{" "}
                                {application.job.organization.name}
                            </p>

                            <p>
                                Status:{" "}
                                {application.status}
                            </p>

                            <p>
                                Applied At:{" "}
                                {new Date(
                                    application.appliedAt
                                ).toLocaleDateString()}
                            </p>

                            <button
                                onClick={() =>
                                    navigate(
                                        `/applications/${application.id}`
                                    )
                                }
                            >
                                View Application
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Applications;
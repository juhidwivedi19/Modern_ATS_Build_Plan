import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

function JobApplications() {
    const { organizationId, jobId } = useParams();
    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchApplications() {
            try {
                const response = await api.get(
                    `/organization/jobs/${jobId}/applications`
                );

                setApplications(response.data.data);
            } catch (error) {
                console.error(
                    "Failed to fetch applications:",
                    error
                );

                alert(
                    error.response?.data?.message ||
                    "Failed to fetch applications"
                );
            } finally {
                setLoading(false);
            }
        }

        fetchApplications();
    }, [jobId]);

    async function handleStatusChange(applicationId, status) {
        try {
            const response = await api.patch(
                `/applications/${applicationId}/status`,
                { status }
            );

            setApplications((previousApplications) =>
                previousApplications.map((application) =>
                    application.id === applicationId
                        ? {
                              ...application,
                              ...response.data.data
                          }
                        : application
                )
            );

            alert("Application status updated successfully");
        } catch (error) {
            console.error(
                "Failed to update application status:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to update application status"
            );
        }
    }

    if (loading) {
        return <div>Loading applications...</div>;
    }

    return (
        <div>
            <button
                onClick={() =>
                    navigate(
                        `/organizations/${organizationId}/jobs/${jobId}`
                    )
                }
            >
                Back to Job
            </button>

            <h1>Job Applications</h1>

            {applications.length === 0 ? (
                <p>No applications received yet.</p>
            ) : (
                <div>
                    {applications.map((application) => (
                        <div key={application.id}>
                            <h2>
                                {application.candidate?.name}
                            </h2>

                            <p>
                                Email:{" "}
                                {application.candidate?.email}
                            </p>

                            <p>
                                Phone:{" "}
                                {application.candidate?.phone}
                            </p>

                            <p>
                                Current Status:{" "}
                                {application.status}
                            </p>

                            <p>
                                Resume:{" "}
                                {application.resume?.fileName}
                            </p>

                            <label>
                                Move Application:
                            </label>

                            <select
                                value={application.status}
                                onChange={(e) =>
                                    handleStatusChange(
                                        application.id,
                                        e.target.value
                                    )
                                }
                            >
                                <option value="APPLIED">
                                    APPLIED
                                </option>

                                <option value="SCREENING">
                                    SCREENING
                                </option>

                                <option value="TECHNICAL_INTERVIEW">
                                    TECHNICAL_INTERVIEW
                                </option>

                                <option value="HR_INTERVIEW">
                                    HR_INTERVIEW
                                </option>

                                <option value="OFFER">
                                    OFFER
                                </option>

                                <option value="HIRED">
                                    HIRED
                                </option>

                                <option value="REJECTED">
                                    REJECTED
                                </option>

                                <option value="WITHDRAWN">
                                    WITHDRAWN
                                </option>
                            </select>

                            <br />

                            <button
                                onClick={() =>
                                    navigate(
                                        `/applications/${application.id}`
                                    )
                                }
                            >
                                View Application
                            </button>

                            <button
                                onClick={() =>
                                    navigate(
                                        `/applications/${application.id}/activity`
                                    )
                                }
                            >
                                View Activity
                            </button>

                            <hr />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default JobApplications;
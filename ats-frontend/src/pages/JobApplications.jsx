
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

                setApplications(response.data.data || []);
            } catch (error) {
                console.error("Failed to fetch applications:", error);
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

    function getStatusClass(status) {
        const statusClasses = {
            APPLIED: "status-applied",
            SCREENING: "status-screening",
            TECHNICAL_INTERVIEW: "status-interview",
            HR_INTERVIEW: "status-interview",
            OFFER: "status-offer",
            HIRED: "status-hired",
            REJECTED: "status-rejected",
            WITHDRAWN: "status-withdrawn"
        };

        return statusClasses[status] || "";
    }

    if (loading) {
        return (
            <div className="page">
                <div className="applications-loading">
                    Loading applications...
                </div>
            </div>
        );
    }

    return (
        <div className="page">

            <div className="applications-header">
                <div>
                    <button
                        className="btn applications-back"
                        onClick={() =>
                            navigate(
                                `/organizations/${organizationId}/jobs/${jobId}`
                            )
                        }
                    >
                        ← Back to Job
                    </button>

                    <h1>Job Applications</h1>

                    <p>
                        Review and manage candidates who applied for this
                        position.
                    </p>
                </div>

                <div className="applications-count">
                    <strong>{applications.length}</strong>
                    <span>Applications</span>
                </div>
            </div>

            {applications.length === 0 ? (
                <div className="applications-empty">
                    <div className="applications-empty-icon">
                        👥
                    </div>

                    <h2>No applications yet</h2>

                    <p>
                        Applications for this job will appear here once
                        candidates start applying.
                    </p>

                    <button
                        className="btn"
                        onClick={() =>
                            navigate(
                                `/organizations/${organizationId}/jobs/${jobId}`
                            )
                        }
                    >
                        Back to Job
                    </button>
                </div>
            ) : (
                <div className="applications-table-card">

                    <div className="applications-table-header">
                        <div>
                            <h2>Applicants</h2>
                            <p>
                                Manage candidate progress through the
                                hiring pipeline.
                            </p>
                        </div>
                    </div>

                    <div className="applications-table-wrapper">
                        <table className="applications-table">
                            <thead>
                                <tr>
                                    <th>Candidate</th>
                                    <th>Status</th>
                                    <th>Resume</th>
                                    <th>Applied</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {applications.map((application) => (
                                    <tr key={application.id}>

                                        <td>
                                            <div className="candidate-cell">
                                                <div className="candidate-avatar">
                                                    {(
                                                        application
                                                            .candidate
                                                            ?.name ||
                                                        "C"
                                                    )
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div>
                                                    <strong>
                                                        {application
                                                            .candidate
                                                            ?.name ||
                                                            "Unknown Candidate"}
                                                    </strong>

                                                    <span>
                                                        {application
                                                            .candidate
                                                            ?.email ||
                                                            "No email"}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <span
                                                className={`application-status ${getStatusClass(
                                                    application.status
                                                )}`}
                                            >
                                                {application.status}
                                            </span>
                                        </td>

                                        <td>
                                            {application.resume?.fileName ? (
                                                <span className="resume-name">
                                                    {application.resume.fileName}
                                                </span>
                                            ) : (
                                                <span className="muted-text">
                                                    No resume
                                                </span>
                                            )}
                                        </td>

                                        <td>
                                            <span className="applied-date">
                                                {application.appliedAt
                                                    ? new Date(
                                                          application.appliedAt
                                                      ).toLocaleDateString()
                                                    : "-"}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="application-actions">

                                                <select
                                                    value={
                                                        application.status
                                                    }
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
                                                        TECHNICAL INTERVIEW
                                                    </option>

                                                    <option value="HR_INTERVIEW">
                                                        HR INTERVIEW
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

                                                <button
                                                    className="btn btn-small"
                                                    onClick={() =>
                                                        navigate(
                                                            `/applications/${application.id}`
                                                        )
                                                    }
                                                >
                                                    View
                                                </button>

                                                <button
                                                    className="btn btn-small"
                                                    onClick={() =>
                                                        navigate(
                                                            `/applications/${application.id}/activity`
                                                        )
                                                    }
                                                >
                                                    Activity
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default JobApplications;

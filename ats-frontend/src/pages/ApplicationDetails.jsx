
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

function ApplicationDetails() {
    const { applicationId } = useParams();
    const navigate = useNavigate();

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchApplication() {
            try {
                const response = await api.get(
                    `/applications/${applicationId}`
                );

                setApplication(response.data.data);
            } catch (error) {
                console.error(
                    "Failed to fetch application:",
                    error
                );

                alert(
                    error.response?.data?.message ||
                    "Failed to fetch application"
                );
            } finally {
                setLoading(false);
            }
        }

        fetchApplication();
    }, [applicationId]);

    function getStatusClass(status) {
        const classes = {
            APPLIED: "status-applied",
            SCREENING: "status-screening",
            TECHNICAL_INTERVIEW: "status-interview",
            HR_INTERVIEW: "status-interview",
            OFFER: "status-offer",
            HIRED: "status-hired",
            REJECTED: "status-rejected",
            WITHDRAWN: "status-withdrawn"
        };

        return classes[status] || "";
    }

    if (loading) {
        return (
            <div className="page">
                <div className="application-detail-loading">
                    Loading application...
                </div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="page">
                <div className="application-detail-empty">
                    <h2>Application not found</h2>
                    <p>
                        This application could not be found or you
                        don't have access to it.
                    </p>

                    <button
                        className="btn btn-primary"
                        onClick={() =>
                            navigate("/applications")
                        }
                    >
                        Back to Applications
                    </button>
                </div>
            </div>
        );
    }

    const candidate = application.candidate;
    const job = application.job;
    const organization = job?.organization;

    return (
        <div className="page">

            <div className="application-detail-topbar">
                <button
                    className="btn"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>

                <button
                    className="btn"
                    onClick={() =>
                        navigate(
                            `/applications/${applicationId}/activity`
                        )
                    }
                >
                    View Activity
                </button>
            </div>

            <section className="application-profile-header">

                <div className="application-profile-identity">

                    <div className="application-profile-avatar">
                        {(
                            candidate?.name ||
                            "C"
                        )
                            .charAt(0)
                            .toUpperCase()}
                    </div>

                    <div>
                        <h1>
                            {candidate?.name ||
                                "Unknown Candidate"}
                        </h1>

                        <p>
                            {candidate?.email ||
                                "No email available"}
                        </p>

                        {candidate?.phone && (
                            <p>{candidate.phone}</p>
                        )}
                    </div>

                </div>

                <div className="application-profile-status">
                    <span
                        className={`application-status ${getStatusClass(
                            application.status
                        )}`}
                    >
                        {application.status}
                    </span>
                </div>

            </section>

            <div className="application-detail-layout">

                <main className="application-detail-main">

                    <section className="application-detail-card">

                        <div className="application-detail-section-header">
                            <div>
                                <h2>Application</h2>
                                <p>
                                    Position and application
                                    information.
                                </p>
                            </div>
                        </div>

                        <div className="application-info-grid">

                            <div className="application-info-item">
                                <span>Position</span>
                                <strong>
                                    {job?.title ||
                                        "Unknown Position"}
                                </strong>
                            </div>

                            <div className="application-info-item">
                                <span>Organization</span>
                                <strong>
                                    {organization?.name ||
                                        "Unknown Organization"}
                                </strong>
                            </div>

                            <div className="application-info-item">
                                <span>Application Source</span>
                                <strong>
                                    {application.source ||
                                        "DIRECT"}
                                </strong>
                            </div>

                            <div className="application-info-item">
                                <span>Applied On</span>
                                <strong>
                                    {application.appliedAt
                                        ? new Date(
                                              application.appliedAt
                                          ).toLocaleDateString()
                                        : "-"}
                                </strong>
                            </div>

                        </div>

                    </section>

                    <section className="application-detail-card">

                        <div className="application-detail-section-header">
                            <div>
                                <h2>Cover Letter</h2>
                                <p>
                                    Candidate's submitted cover
                                    letter.
                                </p>
                            </div>
                        </div>

                        <div className="application-cover-letter">
                            {application.coverLetter ? (
                                <p>
                                    {application.coverLetter}
                                </p>
                            ) : (
                                <p className="muted-text">
                                    No cover letter was provided.
                                </p>
                            )}
                        </div>

                    </section>

                    <section className="application-detail-card">

                        <div className="application-detail-section-header">
                            <div>
                                <h2>Resume</h2>
                                <p>
                                    Resume submitted with this
                                    application.
                                </p>
                            </div>
                        </div>

                        {application.resume ? (
                            <div className="application-resume">

                                <div className="resume-file-icon">
                                    📄
                                </div>

                                <div className="resume-file-info">
                                    <strong>
                                        {application.resume.fileName ||
                                            "Resume"}
                                    </strong>

                                    <span>
                                        Submitted with application
                                    </span>
                                </div>

                            </div>
                        ) : (
                            <p className="muted-text">
                                No resume information available.
                            </p>
                        )}

                    </section>

                </main>

                <aside className="application-detail-sidebar">

                    <section className="application-detail-card">

                        <h3>Application Status</h3>

                        <div className="current-status">
                            <span
                                className={`application-status ${getStatusClass(
                                    application.status
                                )}`}
                            >
                                {application.status}
                            </span>
                        </div>

                        <p className="status-help">
                            Candidate progress can be managed from
                            the job applications page.
                        </p>

                    </section>

                    <section className="application-detail-card">

                        <h3>Quick Actions</h3>

                        <div className="application-quick-actions">

                            <button
                                className="btn btn-primary"
                                onClick={() =>
                                    navigate(
                                        `/applications/${applicationId}/interview/schedule`
                                    )
                                }
                            >
                                Schedule Interview
                            </button>

                            <button
                                className="btn"
                                onClick={() =>
                                    navigate(
                                        `/applications/${applicationId}/activity`
                                    )
                                }
                            >
                                Application Activity
                            </button>

                        </div>

                    </section>

                </aside>

            </div>

        </div>
    );
}

export default ApplicationDetails;

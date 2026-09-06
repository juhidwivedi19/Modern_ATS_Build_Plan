
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

function JobDetails() {
    const { organizationId, jobId } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchJob() {
            try {
                const response = await api.get(
                    `/organization/${organizationId}/jobs/${jobId}`
                );

                const fetchedJob = response.data.job;

                setJob(fetchedJob);
                setTitle(fetchedJob.title);
                setDescription(fetchedJob.description || "");
            } catch (error) {
                console.error("Failed to fetch job:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchJob();
    }, [organizationId, jobId]);

    async function handleUpdateJob(e) {
        e.preventDefault();

        try {
            setSaving(true);

            const response = await api.put(
                `/organization/${organizationId}/jobs/${jobId}`,
                {
                    title,
                    description
                }
            );

            setJob(response.data.job);
            setEditing(false);

            alert("Job updated successfully");
        } catch (error) {
            console.error("Failed to update job:", error);
            alert(
                error.response?.data?.message ||
                "Failed to update job"
            );
        } finally {
            setSaving(false);
        }
    }

    async function handlePublishJob() {
        try {
            const response = await api.patch(
                `/organization/${organizationId}/jobs/${jobId}/publish`
            );

            setJob(response.data.job);

            alert("Job published successfully");
        } catch (error) {
            console.error("Failed to publish job:", error);
            alert(
                error.response?.data?.message ||
                "Failed to publish job"
            );
        }
    }

    async function handleArchiveJob() {
        try {
            const response = await api.patch(
                `/organization/${organizationId}/jobs/${jobId}/archive`
            );

            setJob(response.data.job);

            alert("Job archived successfully");
        } catch (error) {
            console.error("Failed to archive job:", error);
            alert(
                error.response?.data?.message ||
                "Failed to archive job"
            );
        }
    }

    function cancelEditing() {
        setEditing(false);
        setTitle(job.title);
        setDescription(job.description || "");
    }

    if (loading) {
        return (
            <div className="page">
                <div className="job-detail-loading">
                    Loading job...
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="page">
                <div className="job-detail-empty">
                    <h2>Job not found</h2>
                    <p>
                        The job you're looking for could not be found.
                    </p>

                    <button
                        className="btn btn-primary"
                        onClick={() =>
                            navigate(
                                `/organizations/${organizationId}/jobs`
                            )
                        }
                    >
                        Back to Jobs
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page">

            <div className="job-detail-topbar">
                <button
                    className="btn job-back-btn"
                    onClick={() =>
                        navigate(
                            `/organizations/${organizationId}/jobs`
                        )
                    }
                >
                    ← Back to Jobs
                </button>

                <div className="job-detail-actions">
                    {!editing && (
                        <>
                            <button
                                className="btn"
                                onClick={() => setEditing(true)}
                            >
                                Edit Job
                            </button>

                            {job.status !== "PUBLISHED" && (
                                <button
                                    className="btn btn-primary"
                                    onClick={handlePublishJob}
                                >
                                    Publish Job
                                </button>
                            )}

                            {job.status !== "ARCHIVED" && (
                                <button
                                    className="btn btn-danger"
                                    onClick={handleArchiveJob}
                                >
                                    Archive
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            <section className="job-detail-hero">
                <div className="job-detail-hero-main">
                    <div className="job-detail-icon">
                        💼
                    </div>

                    <div>
                        <div className="job-detail-title-row">
                            <h1>{job.title}</h1>

                            <span className="job-detail-status">
                                {job.status}
                            </span>
                        </div>

                        <p className="job-detail-subtitle">
                            Job ID: #{job.id}
                        </p>
                    </div>
                </div>
            </section>

            {editing ? (
                <section className="job-detail-edit-card">
                    <div className="job-detail-section-header">
                        <div>
                            <h2>Edit Job</h2>
                            <p>
                                Update the job title and description.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateJob}>
                        <div className="form-group">
                            <label>Job Title</label>

                            <input
                                type="text"
                                value={title}
                                onChange={(e) =>
                                    setTitle(e.target.value)
                                }
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Job Description</label>

                            <textarea
                                rows="10"
                                value={description}
                                onChange={(e) =>
                                    setDescription(e.target.value)
                                }
                                placeholder="Describe the role, responsibilities and requirements..."
                            />
                        </div>

                        <div className="job-edit-actions">
                            <button
                                type="button"
                                className="btn"
                                onClick={cancelEditing}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </section>
            ) : (
                <div className="job-detail-layout">

                    <section className="job-detail-content">

                        <div className="job-detail-card">
                            <div className="job-detail-section-header">
                                <div>
                                    <h2>Job Description</h2>
                                    <p>
                                        Information about this position.
                                    </p>
                                </div>
                            </div>

                            <div className="job-description">
                                {job.description ? (
                                    <p>{job.description}</p>
                                ) : (
                                    <p className="muted-text">
                                        No job description has been added yet.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="job-detail-card">
                            <div className="job-detail-section-header">
                                <div>
                                    <h2>Applications</h2>
                                    <p>
                                        Review candidates who applied
                                        for this position.
                                    </p>
                                </div>

                                <button
                                    className="btn btn-primary"
                                    onClick={() =>
                                        navigate(
                                            `/organizations/${organizationId}/jobs/${jobId}/applications`
                                        )
                                    }
                                >
                                    View Applications
                                </button>
                            </div>
                        </div>

                    </section>

                    <aside className="job-detail-sidebar">

                        <div className="job-detail-card">
                            <h3>Job Overview</h3>

                            <div className="job-overview-item">
                                <span>Status</span>
                                <strong>{job.status}</strong>
                            </div>

                            <div className="job-overview-item">
                                <span>Job ID</span>
                                <strong>#{job.id}</strong>
                            </div>
                        </div>

                        {job.status === "PUBLISHED" && (
                            <div className="job-apply-card">
                                <div className="job-apply-icon">
                                    ✓
                                </div>

                                <h3>Job is live</h3>

                                <p>
                                    This position is currently accepting
                                    applications.
                                </p>

                                <button
                                    className="btn btn-primary job-apply-btn"
                                    onClick={() =>
                                        navigate(
                                            `/jobs/${job.id}/apply`
                                        )
                                    }
                                >
                                    Apply to This Job
                                </button>
                            </div>
                        )}

                    </aside>

                </div>
            )}
        </div>
    );
}

export default JobDetails;

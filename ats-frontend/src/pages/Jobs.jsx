import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

function Jobs() {
    const { organizationId } = useParams();
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [showForm, setShowForm] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        async function fetchJobs() {
            try {
                const response = await api.get(
                    `/organization/${organizationId}/jobs`
                );

                setJobs(response.data.jobs);
            } catch (error) {
                console.error("Failed to fetch jobs:", error);
            }
        }

        fetchJobs();
    }, [organizationId]);

    async function handleCreateJob(e) {
        e.preventDefault();

        if (!title.trim() || !description.trim()) return;

        try {
            const response = await api.post(
                `/organization/${organizationId}/jobs`,
                {
                    title: title,
                    description: description
                }
            );

            setJobs([...jobs, response.data.job]);

            setTitle("");
            setDescription("");
            setShowForm(false);

        } catch (error) {
            console.error("Failed to create job:", error);

            alert(
                error.response?.data?.message ||
                "Failed to create job"
            );
        }
    }

   
return (
    <div className="page">

        <div className="page-header">
            <div>
                <h1>Jobs</h1>
                <p>Manage your organization's open positions.</p>
            </div>

            <button
                className="btn-primary"
                onClick={() => setShowForm(true)}
            >
                + Create Job
            </button>
        </div>

        <div className="jobs-toolbar">
            <div className="jobs-filters">
                <input
                    className="jobs-search"
                    type="text"
                    placeholder="Search jobs..."
                />

                <select className="jobs-filter">
                    <option value="">All Statuses</option>
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                </select>
            </div>
        </div>

        {showForm && (
            <div className="section-card job-form">
                <h2>Create Job</h2>

                {/* Keep your existing create-job form fields here */}

                <button
                    className="btn"
                    type="button"
                    onClick={() => setShowForm(false)}
                >
                    Cancel
                </button>
            </div>
        )}

        <div className="jobs-list">
            {jobs.length === 0 ? (
                <div className="job-empty">
                    <h2>No jobs yet</h2>
                    <p>
                        Create your first job opening to start recruiting.
                    </p>

                    <button
                        className="btn-primary"
                        onClick={() => setShowForm(true)}
                    >
                        Create Job
                    </button>
                </div>
            ) : (
                jobs.map((job) => (
                    <div className="job-card" key={job.id}>

                        <div className="job-main">
                            <h2 className="job-title">
                                {job.title}
                            </h2>

                            <div className="job-meta">
                                {job.location && (
                                    <span>
                                        📍 {job.location}
                                    </span>
                                )}

                                {job.employmentType && (
                                    <span>
                                        💼 {job.employmentType}
                                    </span>
                                )}

                                <span className="job-status">
                                    {job.status}
                                </span>

                                <span className="job-count">
                                    Applications:{" "}
                                    {job._count?.applications || 0}
                                </span>
                            </div>
                        </div>

                        <div className="job-actions">
                            <button
                                className="btn"
                                onClick={() =>
                                    navigate(
                                        `/organizations/${organizationId}/jobs/${job.id}`
                                    )
                                }
                            >
                                View
                            </button>

                            <button
                                className="btn-primary"
                                onClick={() =>
                                    navigate(
                                        `/organizations/${organizationId}/jobs/${job.id}/applications`
                                    )
                                }
                            >
                                Applications
                            </button>
                        </div>

                    </div>
                ))
            )}
        </div>

    </div>
);

}

export default Jobs;
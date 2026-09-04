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
            }
        }

        fetchJob();
    }, [organizationId, jobId]);

    async function handleUpdateJob(e) {
        e.preventDefault();

        try {
            const response = await api.put(
                `/organization/${organizationId}/jobs/${jobId}`,
                {
                    title: title,
                    description: description
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

    if (!job) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <button
                onClick={() =>
                    navigate(
                        `/organizations/${organizationId}/jobs`
                    )
                }
            >
                Back to Jobs
            </button>

            <h1>Job Details</h1>

            {editing ? (
                <form onSubmit={handleUpdateJob}>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) =>
                            setTitle(e.target.value)
                        }
                    />

                    <textarea
                        value={description}
                        onChange={(e) =>
                            setDescription(e.target.value)
                        }
                    />

                    <button type="submit">
                        Save Changes
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setEditing(false);
                            setTitle(job.title);
                            setDescription(
                                job.description || ""
                            );
                        }}
                    >
                        Cancel
                    </button>
                </form>
            ) : (
                <>
                    <h2>{job.title}</h2>

                    <p>{job.description}</p>

                    <p>
                        Status: {job.status}
                    </p>

                    <button
                        onClick={() => setEditing(true)}
                    >
                        Edit Job
                    </button>

                    {job.status !== "PUBLISHED" && (
                        <button onClick={handlePublishJob}>
                            Publish Job
                        </button>
                    )}

                    {job.status !== "ARCHIVED" && (
                        <button onClick={handleArchiveJob}>
                            Archive Job
                        </button>
                    )}

                    {job.status === "PUBLISHED" && (
                      <button
                    onClick={() => navigate(`/jobs/${job.id}/apply`)}
                              >
                  Apply to Job
                   </button>
                      )}
                </>
            )}
        </div>
    );
}

export default JobDetails;
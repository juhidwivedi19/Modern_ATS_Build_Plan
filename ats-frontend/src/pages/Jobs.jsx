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
        <div>
            <h1>Jobs</h1>

            <button onClick={() => setShowForm(true)}>
                Create Job
            </button>

            {showForm && (
                <form onSubmit={handleCreateJob}>
                    <input
                        type="text"
                        placeholder="Job title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <textarea
                        placeholder="Job description"
                        value={description}
                        onChange={(e) =>
                            setDescription(e.target.value)
                        }
                    />

                    <button type="submit">
                        Create
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setShowForm(false);
                            setTitle("");
                            setDescription("");
                        }}
                    >
                        Cancel
                    </button>
                </form>
            )}

            <div>
                <h2>Job Listings</h2>

                {jobs.map((job) => (
                    <div key={job.id}>
                        <h3>{job.title}</h3>

                        <p>{job.description}</p>

                        <p>Status: {job.status}</p>

                        <button
                            onClick={() =>
                                navigate(
                                    `/organizations/${organizationId}/jobs/${job.id}`
                                )
                            }
                        >
                            View Job
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Jobs;
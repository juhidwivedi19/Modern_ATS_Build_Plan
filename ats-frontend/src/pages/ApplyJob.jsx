
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

function ApplyJob() {
    const { jobId } = useParams();
    const navigate = useNavigate();

    const [resumes, setResumes] = useState([]);
    const [resumeId, setResumeId] = useState("");
    const [coverLetter, setCoverLetter] = useState("");
    const [source, setSource] = useState("DIRECT");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchResumes() {
            try {
                const response = await api.get("/resumes");

                setResumes(response.data.data);
            } catch (error) {
                console.error(
                    "Failed to fetch resumes:",
                    error
                );

                alert(
                    error.response?.data?.message ||
                    "Failed to fetch resumes"
                );
            } finally {
                setLoading(false);
            }
        }

        fetchResumes();
    }, []);

    async function handleApply(e) {
        e.preventDefault();

        if (!resumeId) {
            alert("Please select a resume");
            return;
        }

        try {
            const response = await api.post(
                `/jobs/${jobId}/apply`,
                {
                    resumeId: Number(resumeId),
                    coverLetter: coverLetter,
                    source: source
                }
            );

            console.log(
                "Application submitted:",
                response.data.data
            );

            alert("Application submitted successfully");

            navigate("/applications");

        } catch (error) {
            console.error(
                "Failed to submit application:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to submit application"
            );
        }
    }

    if (loading) {
        return <div>Loading resumes...</div>;
    }

    return (
        <div>
            <h1>Apply to Job</h1>

            <p>Job ID: {jobId}</p>

            {resumes.length === 0 ? (
                <div>
                    <p>
                        You don't have any resumes yet.
                    </p>

                    <button
                        onClick={() => navigate("/resumes")}
                    >
                        Upload Resume
                    </button>
                </div>
            ) : (
                <form onSubmit={handleApply}>
                    <div>
                        <label>
                            Select Resume
                        </label>

                        <select
                            value={resumeId}
                            onChange={(e) =>
                                setResumeId(
                                    e.target.value
                                )
                            }
                        >
                            <option value="">
                                Select a resume
                            </option>

                            {resumes.map((resume) => (
                                <option
                                    key={resume.id}
                                    value={resume.id}
                                >
                                    {resume.fileName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>
                            Cover Letter
                        </label>

                        <textarea
                            placeholder="Write your cover letter"
                            value={coverLetter}
                            onChange={(e) =>
                                setCoverLetter(
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    <div>
                        <label>
                            Application Source
                        </label>

                        <select
                            value={source}
                            onChange={(e) =>
                                setSource(e.target.value)
                            }
                        >
                            <option value="DIRECT">
                                DIRECT
                            </option>

                            <option value="LINKEDIN">
                                LINKEDIN
                            </option>

                            <option value="REFERRAL">
                                REFERRAL
                            </option>

                            <option value="JOB_BOARD">
                                JOB_BOARD
                            </option>

                            <option value="COMPANY_WEBSITE">
                                COMPANY_WEBSITE
                            </option>

                            <option value="OTHER">
                                OTHER
                            </option>
                        </select>
                    </div>

                    <button type="submit">
                        Submit Application
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>
                </form>
            )}
        </div>
    );
}

export default ApplyJob;

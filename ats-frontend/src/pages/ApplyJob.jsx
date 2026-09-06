
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
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function fetchResumes() {
            try {
                const response = await api.get("/resumes");

                setResumes(response.data.data || []);
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
            setSubmitting(true);

            const response = await api.post(
                `/jobs/${jobId}/apply`,
                {
                    resumeId: Number(resumeId),
                    coverLetter,
                    source
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
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="page">
                <div className="apply-loading">
                    <div className="apply-loading-icon">
                        ...
                    </div>
                    <h2>Preparing application</h2>
                    <p>Loading your available resumes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page">

            <div className="apply-topbar">
                <button
                    className="btn"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>
            </div>

            <div className="apply-header">

                <div className="apply-header-icon">
                    ↗
                </div>

                <div>
                    <p className="page-eyebrow">
                        JOB APPLICATION
                    </p>

                    <h1>Apply to Job</h1>

                    <p>
                        Submit your resume and application
                        details for this position.
                    </p>
                </div>

                <div className="apply-job-id">
                    <span>Job ID</span>
                    <strong>#{jobId}</strong>
                </div>

            </div>

            {resumes.length === 0 ? (
                <section className="apply-empty-card">

                    <div className="apply-empty-icon">
                        📄
                    </div>

                    <h2>Resume required</h2>

                    <p>
                        You need to upload at least one resume
                        before you can submit an application.
                    </p>

                    <button
                        className="btn btn-primary"
                        onClick={() => navigate("/resumes")}
                    >
                        Upload Resume
                    </button>

                </section>
            ) : (
                <div className="apply-layout">

                    <main className="apply-main">

                        <section className="apply-card">

                            <div className="apply-card-header">
                                <div>
                                    <h2>Application Details</h2>
                                    <p>
                                        Complete the information
                                        below before submitting.
                                    </p>
                                </div>
                            </div>

                            <form
                                className="apply-form"
                                onSubmit={handleApply}
                            >

                                <div className="form-group">
                                    <label>
                                        Select Resume *
                                    </label>

                                    <select
                                        value={resumeId}
                                        onChange={(e) =>
                                            setResumeId(
                                                e.target.value
                                            )
                                        }
                                        required
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

                                    <span className="apply-field-help">
                                        Choose the resume you want
                                        to submit with this application.
                                    </span>
                                </div>

                                <div className="form-group">
                                    <label>
                                        Cover Letter
                                    </label>

                                    <textarea
                                        className="apply-cover-letter"
                                        placeholder="Tell the employer why you're a good fit for this role..."
                                        value={coverLetter}
                                        onChange={(e) =>
                                            setCoverLetter(
                                                e.target.value
                                            )
                                    }
                                    />

                                    <span className="apply-field-help">
                                        A strong cover letter can help
                                        provide additional context about
                                        your application.
                                    </span>
                                </div>

                                <div className="form-group">
                                    <label>
                                        Application Source
                                    </label>

                                    <select
                                        value={source}
                                        onChange={(e) =>
                                            setSource(
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="DIRECT">
                                            Direct
                                        </option>

                                        <option value="LINKEDIN">
                                            LinkedIn
                                        </option>

                                        <option value="REFERRAL">
                                            Referral
                                        </option>

                                        <option value="JOB_BOARD">
                                            Job Board
                                        </option>

                                        <option value="COMPANY_WEBSITE">
                                            Company Website
                                        </option>

                                        <option value="OTHER">
                                            Other
                                        </option>
                                    </select>
                                </div>

                                <div className="apply-actions">

                                    <button
                                        type="button"
                                        className="btn"
                                        onClick={() =>
                                            navigate(-1)
                                        }
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={submitting}
                                    >
                                        {submitting
                                            ? "Submitting..."
                                            : "Submit Application"}
                                    </button>

                                </div>

                            </form>

                        </section>

                    </main>

                    <aside className="apply-sidebar">

                        <div className="apply-sidebar-card">

                            <div className="apply-sidebar-icon">
                                ✓
                            </div>

                            <h3>Before you submit</h3>

                            <div className="apply-check-item">
                                <span>✓</span>
                                <p>
                                    Select the most relevant resume
                                    for this position.
                                </p>
                            </div>

                            <div className="apply-check-item">
                                <span>✓</span>
                                <p>
                                    Review your cover letter before
                                    submitting.
                                </p>
                            </div>

                            <div className="apply-check-item">
                                <span>✓</span>
                                <p>
                                    Make sure your application details
                                    are accurate.
                                </p>
                            </div>

                        </div>

                        <div className="apply-sidebar-card apply-secure-card">

                            <strong>
                                Application #{jobId}
                            </strong>

                            <p>
                                Your application will be submitted
                                securely to the hiring system.
                            </p>

                        </div>

                    </aside>

                </div>
            )}

        </div>
    );
}

export default ApplyJob;

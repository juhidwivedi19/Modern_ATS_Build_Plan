
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

function ApplyJob() {
    const { jobId } = useParams();
    const navigate = useNavigate();

    const [resumeId, setResumeId] = useState("");
    const [coverLetter, setCoverLetter] = useState("");
    const [source, setSource] = useState("DIRECT");

    async function handleApply(e) {
        e.preventDefault();

        if (!resumeId.trim()) {
            alert("Resume ID is required");
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

            console.log("Application submitted:", response.data.data);

            alert("Application submitted successfully");

            navigate("/applications");
        } catch (error) {
            console.error("Failed to apply:", error);

            alert(
                error.response?.data?.message ||
                "Failed to submit application"
            );
        }
    }

    return (
        <div>
            <h1>Apply to Job</h1>

            <p>Job ID: {jobId}</p>

            <form onSubmit={handleApply}>
                <div>
                    <label>Resume ID</label>
                    <input
                        type="number"
                        placeholder="Enter Resume ID"
                        value={resumeId}
                        onChange={(e) => setResumeId(e.target.value)}
                    />
                </div>

                <div>
                    <label>Cover Letter</label>
                    <textarea
                        placeholder="Write your cover letter"
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                    />
                </div>

                <div>
                    <label>Application Source</label>

                    <select
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                    >
                        <option value="DIRECT">DIRECT</option>
                        <option value="LINKEDIN">LINKEDIN</option>
                        <option value="REFERRAL">REFERRAL</option>
                        <option value="JOB_BOARD">JOB_BOARD</option>
                        <option value="COMPANY_WEBSITE">
                            COMPANY_WEBSITE
                        </option>
                        <option value="OTHER">OTHER</option>
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
        </div>
    );
}

export default ApplyJob;

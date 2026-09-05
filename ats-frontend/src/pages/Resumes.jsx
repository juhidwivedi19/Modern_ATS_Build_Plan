
import { useEffect, useState } from "react";
import api from "../api/axios";

function Resumes() {
    const [resumes, setResumes] = useState([]);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchResumes();
    }, []);

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
        }
    }

    async function handleUpload(e) {
        e.preventDefault();

        if (!file) {
            alert("Please select a resume");
            return;
        }

        const formData = new FormData();

        formData.append("resume", file);

        try {
            setUploading(true);

            const response = await api.post(
                "/upload",
                formData
            );

            console.log(
                "Uploaded resume:",
                response.data.data
            );

            alert("Resume uploaded successfully");

            setFile(null);

            // Refresh resume list
            await fetchResumes();

        } catch (error) {
            console.error(
                "Failed to upload resume:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to upload resume"
            );
        } finally {
            setUploading(false);
        }
    }

    async function handleDownload(resumeId) {
        try {
            const response = await api.get(
                `/resumes/${resumeId}/download`
            );

            const downloadUrl =
                response.data.data.downloadUrl;

            window.open(downloadUrl, "_blank");

        } catch (error) {
            console.error(
                "Failed to download resume:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to download resume"
            );
        }
    }

    async function handleCheckStatus(resumeId) {
        try {
            const response = await api.get(
                `/resumes/${resumeId}/status`
            );

            const status =
                response.data.data.processingStatus;

            alert(`Resume status: ${status}`);

            // Refresh list so displayed status is updated
            await fetchResumes();

        } catch (error) {
            console.error(
                "Failed to check resume status:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to check resume status"
            );
        }
    }

    async function handleDelete(resumeId) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this resume?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(
                `/resumes/${resumeId}`
            );

            setResumes(
                resumes.filter(
                    (resume) => resume.id !== resumeId
                )
            );

            alert("Resume deleted successfully");

        } catch (error) {
            console.error(
                "Failed to delete resume:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to delete resume"
            );
        }
    }

    return (
        <div>
            <h1>My Resumes</h1>

            <form onSubmit={handleUpload}>
                <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) =>
                        setFile(e.target.files[0])
                    }
                />

                <button
                    type="submit"
                    disabled={uploading}
                >
                    {uploading
                        ? "Uploading..."
                        : "Upload Resume"}
                </button>
            </form>

            <h2>Uploaded Resumes</h2>

            {resumes.length === 0 ? (
                <p>No resumes uploaded yet.</p>
            ) : (
                <div>
                    {resumes.map((resume) => (
                        <div key={resume.id}>
                            <h3>{resume.fileName}</h3>

                            <p>
                                Status:{" "}
                                {resume.processingStatus}
                            </p>

                            <p>
                                Uploaded:{" "}
                                {new Date(
                                    resume.uploadedAt
                                ).toLocaleDateString()}
                            </p>

                            <button
                                onClick={() =>
                                    handleDownload(
                                        resume.id
                                    )
                                }
                            >
                                Download
                            </button>

                            <button
                                onClick={() =>
                                    handleCheckStatus(
                                        resume.id
                                    )
                                }
                            >
                                Check Status
                            </button>

                            <button
                                onClick={() =>
                                    handleDelete(
                                        resume.id
                                    )
                                }
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Resumes;

import { useEffect, useState } from "react";
import api from "../api/axios";

function Resumes() {
    const [resumes, setResumes] = useState([]);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResumes();
    }, []);

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

            const fileInput =
                document.getElementById("resume-upload");

            if (fileInput) {
                fileInput.value = "";
            }

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

            setResumes((previous) =>
                previous.filter(
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

    function getStatusClass(status) {
        if (!status) {
            return "resume-status";
        }

        return `resume-status resume-status-${status
            .toLowerCase()
            .replace(/_/g, "-")}`;
    }

    return (
        <div className="page">

            <div className="resumes-header">

                <div>
                    <p className="page-eyebrow">
                        DOCUMENT MANAGEMENT
                    </p>

                    <h1>My Resumes</h1>

                    <p>
                        Upload, manage and track your resume
                        processing status.
                    </p>
                </div>

                <div className="resume-count">
                    <strong>{resumes.length}</strong>
                    <span>
                        {resumes.length === 1
                            ? "Resume"
                            : "Resumes"}
                    </span>
                </div>

            </div>

            <section className="resume-upload-card">

                <div className="resume-upload-info">

                    <div className="resume-upload-icon">
                        ↑
                    </div>

                    <div>
                        <h2>Upload a Resume</h2>

                        <p>
                            Add a PDF or Word document to your
                            resume library.
                        </p>
                    </div>

                </div>

                <form
                    className="resume-upload-form"
                    onSubmit={handleUpload}
                >

                    <label
                        className={`resume-file-picker ${
                            file ? "resume-file-selected" : ""
                        }`}
                        htmlFor="resume-upload"
                    >
                        <span className="resume-file-picker-icon">
                            📄
                        </span>

                        <span className="resume-file-picker-text">
                            <strong>
                                {file
                                    ? file.name
                                    : "Choose a resume file"}
                            </strong>

                            <small>
                                {file
                                    ? `${(
                                          file.size /
                                          1024 /
                                          1024
                                      ).toFixed(2)} MB`
                                    : "PDF, DOC or DOCX"}
                            </small>
                        </span>

                        <span className="resume-file-picker-button">
                            Browse
                        </span>
                    </label>

                    <input
                        id="resume-upload"
                        className="resume-hidden-input"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) =>
                            setFile(
                                e.target.files?.[0] || null
                            )
                        }
                    />

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={uploading || !file}
                    >
                        {uploading
                            ? "Uploading..."
                            : "Upload Resume"}
                    </button>

                </form>

            </section>

            <section className="resume-list-card">

                <div className="resume-list-header">

                    <div>
                        <h2>Uploaded Resumes</h2>

                        <p>
                            Manage your stored resume documents.
                        </p>
                    </div>

                </div>

                {loading ? (
                    <div className="resume-empty-state">
                        <div className="resume-empty-icon">
                            ...
                        </div>

                        <h3>Loading resumes</h3>

                        <p>
                            Fetching your resume library.
                        </p>
                    </div>
                ) : resumes.length === 0 ? (
                    <div className="resume-empty-state">

                        <div className="resume-empty-icon">
                            📄
                        </div>

                        <h3>No resumes uploaded yet</h3>

                        <p>
                            Upload your first resume above to
                            start building your document library.
                        </p>

                    </div>
                ) : (
                    <div className="resume-table-wrapper">

                        <table className="resume-table">

                            <thead>
                                <tr>
                                    <th>Resume</th>
                                    <th>Status</th>
                                    <th>Uploaded</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {resumes.map((resume) => (
                                    <tr key={resume.id}>

                                        <td>
                                            <div className="resume-name-cell">

                                                <div className="resume-row-icon">
                                                    📄
                                                </div>

                                                <div>
                                                    <strong>
                                                        {resume.fileName ||
                                                            "Untitled Resume"}
                                                    </strong>

                                                    <span>
                                                        Resume #{resume.id}
                                                    </span>
                                                </div>

                                            </div>
                                        </td>

                                        <td>
                                            <span
                                                className={getStatusClass(
                                                    resume.processingStatus
                                                )}
                                            >
                                                <span className="resume-status-dot" />

                                                {resume.processingStatus ||
                                                    "UNKNOWN"}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="resume-uploaded-date">
                                                {resume.uploadedAt
                                                    ? new Date(
                                                          resume.uploadedAt
                                                      ).toLocaleDateString()
                                                    : "—"}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="resume-actions">

                                                <button
                                                    className="btn btn-small"
                                                    onClick={() =>
                                                        handleDownload(
                                                            resume.id
                                                        )
                                                    }
                                                >
                                                    Download
                                                </button>

                                                <button
                                                    className="btn btn-small"
                                                    onClick={() =>
                                                        handleCheckStatus(
                                                            resume.id
                                                        )
                                                    }
                                                >
                                                    Status
                                                </button>

                                                <button
                                                    className="btn btn-small btn-danger-outline"
                                                    onClick={() =>
                                                        handleDelete(
                                                            resume.id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </section>

        </div>
    );
}

export default Resumes;
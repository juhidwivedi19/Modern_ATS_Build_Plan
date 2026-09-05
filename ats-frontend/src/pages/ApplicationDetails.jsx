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

    if (loading) {
        return <div>Loading application...</div>;
    }

    if (!application) {
        return <div>Application not found.</div>;
    }

    return (
        <div>
            <button onClick={() => navigate("/applications")}>
                Back to Applications
            </button>

            <h1>Application Details</h1>

            <h2>{application.job?.title}</h2>

            <p>
                Organization:{" "}
                {application.job?.organization?.name}
            </p>

            <p>
                Status: {application.status}
            </p>

            <p>
                Source: {application.source}
            </p>

            <p>
                Applied At:{" "}
                {new Date(
                    application.appliedAt
                ).toLocaleString()}
            </p>

            <h3>Cover Letter</h3>

            {application.coverLetter ? (
                <p>{application.coverLetter}</p>
            ) : (
                <p>No cover letter provided.</p>
            )}

            <h3>Resume</h3>

            {application.resume ? (
                <p>{application.resume.fileName}</p>
            ) : (
                <p>No resume information available.</p>
            )}
        </div>
    );
}

<button
    onClick={() =>
        navigate(
            `/applications/${applicationId}/interview/schedule`
        )
    }
>
    Schedule Interview
</button>

export default ApplicationDetails;
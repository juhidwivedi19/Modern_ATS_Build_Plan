
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Interviews() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        async function fetchInterviews() {
            try {
                const response = await api.get("/interviews");

                setInterviews(
                    response.data.data ||
                    response.data.interviews ||
                    []
                );
            } catch (error) {
                console.error("Failed to fetch interviews:", error);

                alert(
                    error.response?.data?.message ||
                    "Failed to fetch interviews"
                );
            } finally {
                setLoading(false);
            }
        }

        fetchInterviews();
    }, []);

    async function handleCancel(interviewId) {
        if (!window.confirm("Cancel this interview?")) {
            return;
        }

        try {
            const response = await api.patch(
                `/interviews/${interviewId}/cancel`
            );

            setInterviews((previous) =>
                previous.map((interview) =>
                    interview.id === interviewId
                        ? response.data.data
                        : interview
                )
            );

            alert("Interview cancelled");
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to cancel interview"
            );
        }
    }

    async function handleRemoveInterviewer(
        interviewId,
        userId
    ) {
        try {
            await api.delete(
                `/interviews/${interviewId}/interviewer/${userId}`
            );

            setInterviews((previous) =>
                previous.map((interview) =>
                    interview.id === interviewId
                        ? {
                              ...interview,
                              interviewers:
                                  interview.interviewers.filter(
                                      (assignment) =>
                                          assignment.userId !== userId
                                  )
                          }
                        : interview
                )
            );

            alert("Interviewer removed");
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to remove interviewer"
            );
        }
    }

    function getStatusClass(status) {
        return `interview-status interview-status-${status
            ?.toLowerCase()
            .replace(/_/g, "-")}`;
    }

    function formatInterviewType(type) {
        return type
            ?.replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );
    }

    if (loading) {
        return (
            <div className="page">
                <div className="interviews-loading">
                    <div className="interviews-loading-icon">
                        ◷
                    </div>
                    <h2>Loading interviews</h2>
                    <p>
                        Fetching your scheduled interviews...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="page">

            <div className="page-header interviews-page-header">
                <div>
                    <p className="page-eyebrow">
                        INTERVIEW MANAGEMENT
                    </p>

                    <h1>Interviews</h1>

                    <p className="interviews-subtitle">
                        Manage scheduled interviews, interviewers,
                        and candidate evaluations.
                    </p>
                </div>

                <div className="interviews-summary">
                    <strong>{interviews.length}</strong>
                    <span>
                        {interviews.length === 1
                            ? "Interview"
                            : "Interviews"}
                    </span>
                </div>
            </div>

            {interviews.length === 0 ? (
                <div className="interviews-empty">

                    <div className="interviews-empty-icon">
                        ◷
                    </div>

                    <h2>No interviews scheduled</h2>

                    <p>
                        Interviews you schedule for candidates will
                        appear here.
                    </p>

                </div>
            ) : (
                <div className="interviews-list">

                    {interviews.map((interview) => {

                        const candidateName =
                            interview.application?.candidate?.name ||
                            "Unknown candidate";

                        const candidateEmail =
                            interview.application?.candidate?.email ||
                            "";

                        const jobTitle =
                            interview.application?.job?.title ||
                            "Unknown position";

                        return (
                            <article
                                className="interview-card"
                                key={interview.id}
                            >

                                <div className="interview-card-header">

                                    <div className="interview-card-title">

                                        <div className="interview-type-icon">
                                            ◷
                                        </div>

                                        <div>
                                            <div className="interview-title-row">
                                                <h2>
                                                    {formatInterviewType(
                                                        interview.type
                                                    )}
                                                </h2>

                                                <span
                                                    className={getStatusClass(
                                                        interview.status
                                                    )}
                                                >
                                                    {interview.status}
                                                </span>
                                            </div>

                                            <p>
                                                Interview #{interview.id}
                                            </p>
                                        </div>

                                    </div>

                                    <div className="interview-date">
                                        <span>Date & time</span>
                                        <strong>
                                            {new Date(
                                                interview.scheduledAt
                                            ).toLocaleString()}
                                        </strong>
                                    </div>

                                </div>

                                <div className="interview-card-body">

                                    <div className="interview-main-details">

                                        <div className="interview-candidate">

                                            <div className="interview-candidate-avatar">
                                                {candidateName
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div>
                                                <span className="interview-detail-label">
                                                    Candidate
                                                </span>

                                                <strong>
                                                    {candidateName}
                                                </strong>

                                                {candidateEmail && (
                                                    <small>
                                                        {candidateEmail}
                                                    </small>
                                                )}
                                            </div>

                                        </div>

                                        <div className="interview-detail">

                                            <span className="interview-detail-label">
                                                Position
                                            </span>

                                            <strong>
                                                {jobTitle}
                                            </strong>

                                        </div>

                                        <div className="interview-detail">

                                            <span className="interview-detail-label">
                                                Duration
                                            </span>

                                            <strong>
                                                {interview.duration} min
                                            </strong>

                                        </div>

                                    </div>

                                    <div className="interview-divider" />

                                    <div className="interview-section">

                                        <div className="interview-section-heading">
                                            <div>
                                                <h3>Interviewers</h3>
                                                <p>
                                                    People assigned to this
                                                    interview.
                                                </p>
                                            </div>

                                            <span className="interviewer-count">
                                                {interview.interviewers?.length ||
                                                    0}
                                            </span>
                                        </div>

                                        {!interview.interviewers ||
                                        interview.interviewers.length === 0 ? (
                                            <div className="no-interviewers">
                                                No interviewers assigned.
                                            </div>
                                        ) : (
                                            <div className="interviewers-list">

                                                {interview.interviewers.map(
                                                    (assignment) => {

                                                        const name =
                                                            assignment.user
                                                                ?.name ||
                                                            assignment.user
                                                                ?.email ||
                                                            "Unknown user";

                                                        return (
                                                            <div
                                                                className="interviewer-row"
                                                                key={
                                                                    assignment.id
                                                                }
                                                            >

                                                                <div className="interviewer-identity">

                                                                    <div className="interviewer-avatar">
                                                                        {name
                                                                            .charAt(
                                                                                0
                                                                            )
                                                                            .toUpperCase()}
                                                                    </div>

                                                                    <div>
                                                                        <strong>
                                                                            {name}
                                                                        </strong>

                                                                        {assignment
                                                                            .user
                                                                            ?.email &&
                                                                            assignment
                                                                                .user
                                                                                ?.name && (
                                                                                <span>
                                                                                    {
                                                                                        assignment
                                                                                            .user
                                                                                            .email
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                    </div>

                                                                </div>

                                                                <button
                                                                    className="btn btn-small interviewer-remove"
                                                                    onClick={() =>
                                                                        handleRemoveInterviewer(
                                                                            interview.id,
                                                                            assignment.userId
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        interview.status ===
                                                                        "CANCELLED"
                                                                    }
                                                                >
                                                                    Remove
                                                                </button>

                                                            </div>
                                                        );
                                                    }
                                                )}

                                            </div>
                                        )}

                                    </div>

                                    {interview.meetingLink && (
                                        <div className="interview-meeting">

                                            <div>
                                                <span>
                                                    Meeting link
                                                </span>

                                                <strong>
                                                    Online interview
                                                </strong>
                                            </div>

                                            <a
                                                href={
                                                    interview.meetingLink
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                                className="btn btn-primary"
                                            >
                                                Join Meeting →
                                            </a>

                                        </div>
                                    )}

                                </div>

                                <div className="interview-card-footer">

                                    <button
                                        className="btn"
                                        onClick={() =>
                                            navigate(
                                                `/interviews/${interview.id}/evaluation`
                                            )
                                        }
                                    >
                                        View Evaluation
                                    </button>

                                    {interview.status !== "CANCELLED" &&
                                    interview.status !== "COMPLETED" && (
                                        <button
                                            className="btn btn-danger"
                                            onClick={() =>
                                                handleCancel(
                                                    interview.id
                                                )
                                            }
                                        >
                                            Cancel Interview
                                        </button>
                                    )}

                                </div>

                            </article>
                        );
                    })}

                </div>
            )}

        </div>
    );
}

export default Interviews;

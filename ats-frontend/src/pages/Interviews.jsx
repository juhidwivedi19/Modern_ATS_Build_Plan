
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

    if (loading) {
        return <div>Loading interviews...</div>;
    }

    return (
        <div>
            <h1>Interviews</h1>

            {interviews.length === 0 ? (
                <p>No interviews scheduled.</p>
            ) : (
                interviews.map((interview) => (
                    <div key={interview.id}>
                        <h2>{interview.type} Interview</h2>

                        <p>
                            Candidate:{" "}
                            {interview.application?.candidate?.name}
                        </p>

                        <p>
                            Job:{" "}
                            {interview.application?.job?.title}
                        </p>

                        <p>
                            Date:{" "}
                            {new Date(
                                interview.scheduledAt
                            ).toLocaleString()}
                        </p>

                        <p>
                            Duration: {interview.duration} minutes
                        </p>

                        <p>
                            Status: {interview.status}
                        </p>

                        {interview.meetingLink && (
                            <p>
                                Meeting:{" "}
                                <a
                                    href={interview.meetingLink}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Join Meeting
                                </a>
                            </p>
                        )}

                        <h3>Interviewers</h3>

                        {!interview.interviewers ||
                        interview.interviewers.length === 0 ? (
                            <p>No interviewers assigned.</p>
                        ) : (
                            interview.interviewers.map(
                                (assignment) => (
                                    <div key={assignment.id}>
                                        <span>
                                            {assignment.user?.name ||
                                                assignment.user?.email}
                                        </span>

                                        <button
                                            onClick={() =>
                                                handleRemoveInterviewer(
                                                    interview.id,
                                                    assignment.userId
                                                )
                                            }
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )
                            )
                        )}

                        <br />

                        <button
                            onClick={() =>
                                navigate(
                                    `/interviews/${interview.id}/evaluation`
                                )
                            }
                        >
                            Evaluation
                        </button>

                        {interview.status !== "CANCELLED" &&
                            interview.status !== "COMPLETED" && (
                                <button
                                    onClick={() =>
                                        handleCancel(interview.id)
                                    }
                                >
                                    Cancel Interview
                                </button>
                            )}

                        <hr />
                    </div>
                ))
            )}
        </div>
    );
}

export default Interviews;


import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

function InterviewEvaluation() {
    const { interviewId } = useParams();
    const navigate = useNavigate();

    const [evaluation, setEvaluation] = useState(null);
    const [technicalSkills, setTechnicalSkills] = useState(1);
    const [problemSolving, setProblemSolving] = useState(1);
    const [communication, setCommunication] = useState(1);
    const [overall, setOverall] = useState(1);
    const [recommendation, setRecommendation] = useState("HIRE");
    const [feedback, setFeedback] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function fetchEvaluation() {
            try {
                const response = await api.get(
                    `/interviews/${interviewId}/evaluation`
                );

                const evaluations = response.data.data || [];

                if (evaluations.length > 0) {
                    const existing = evaluations[0];

                    setEvaluation(existing);
                    setTechnicalSkills(existing.technicalSkills);
                    setProblemSolving(existing.problemSolving);
                    setCommunication(existing.communication);
                    setOverall(existing.overall);
                    setRecommendation(existing.recommendation);
                    setFeedback(existing.feedback || "");
                }
            } catch (error) {
                console.error("Failed to fetch evaluation:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchEvaluation();
    }, [interviewId]);

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setSubmitting(true);

            const data = {
                technicalSkills: Number(technicalSkills),
                problemSolving: Number(problemSolving),
                communication: Number(communication),
                overall: Number(overall),
                recommendation,
                feedback
            };

            let response;

            if (evaluation) {
                response = await api.patch(
                    `/interviews/${interviewId}/evaluation`,
                    data
                );

                setEvaluation(response.data.data);
                alert("Evaluation updated successfully");
            } else {
                response = await api.post(
                    `/interviews/${interviewId}/evaluation`,
                    data
                );

                setEvaluation(response.data.data);
                alert("Evaluation submitted successfully");
            }
        } catch (error) {
            console.error("Failed to save evaluation:", error);
            alert(
                error.response?.data?.message ||
                "Failed to save evaluation"
            );
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete() {
        if (!window.confirm("Are you sure you want to delete this evaluation?")) {
            return;
        }

        try {
            await api.delete(
                `/interviews/${interviewId}/evaluation`
            );

            setEvaluation(null);
            setTechnicalSkills(1);
            setProblemSolving(1);
            setCommunication(1);
            setOverall(1);
            setRecommendation("HIRE");
            setFeedback("");

            alert("Evaluation deleted successfully");
        } catch (error) {
            console.error("Failed to delete evaluation:", error);
            alert(
                error.response?.data?.message ||
                "Failed to delete evaluation"
            );
        }
    }

    if (loading) {
        return <div>Loading evaluation...</div>;
    }

    return (
        <div>
            <button onClick={() => navigate("/interviews")}>
                Back to Interviews
            </button>

            <h1>Interview Evaluation</h1>

            <p>Interview ID: {interviewId}</p>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Technical Skills</label>
                    <select
                        value={technicalSkills}
                        onChange={(e) =>
                            setTechnicalSkills(Number(e.target.value))
                        }
                    >
                        <option value={1}>1 - Poor</option>
                        <option value={2}>2</option>
                        <option value={3}>3 - Average</option>
                        <option value={4}>4</option>
                        <option value={5}>5 - Excellent</option>
                    </select>
                </div>

                <div>
                    <label>Problem Solving</label>
                    <select
                        value={problemSolving}
                        onChange={(e) =>
                            setProblemSolving(Number(e.target.value))
                        }
                    >
                        <option value={1}>1 - Poor</option>
                        <option value={2}>2</option>
                        <option value={3}>3 - Average</option>
                        <option value={4}>4</option>
                        <option value={5}>5 - Excellent</option>
                    </select>
                </div>

                <div>
                    <label>Communication</label>
                    <select
                        value={communication}
                        onChange={(e) =>
                            setCommunication(Number(e.target.value))
                        }
                    >
                        <option value={1}>1 - Poor</option>
                        <option value={2}>2</option>
                        <option value={3}>3 - Average</option>
                        <option value={4}>4</option>
                        <option value={5}>5 - Excellent</option>
                    </select>
                </div>

                <div>
                    <label>Overall Rating</label>
                    <select
                        value={overall}
                        onChange={(e) =>
                            setOverall(Number(e.target.value))
                        }
                    >
                        <option value={1}>1 - Poor</option>
                        <option value={2}>2</option>
                        <option value={3}>3 - Average</option>
                        <option value={4}>4</option>
                        <option value={5}>5 - Excellent</option>
                    </select>
                </div>

                <div>
                    <label>Recommendation</label>
                    <select
                        value={recommendation}
                        onChange={(e) =>
                            setRecommendation(e.target.value)
                        }
                    >
                        <option value="STRONG_HIRE">STRONG HIRE</option>
                        <option value="HIRE">HIRE</option>
                        <option value="MAYBE">MAYBE</option>
                        <option value="NO_HIRE">NO HIRE</option>
                    </select>
                </div>

                <div>
                    <label>Feedback</label>

                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Write interview feedback..."
                        rows="6"
                    />
                </div>

                <button type="submit" disabled={submitting}>
                    {submitting
                        ? "Saving..."
                        : evaluation
                            ? "Update Evaluation"
                            : "Submit Evaluation"}
                </button>
            </form>

            {evaluation && (
                <button onClick={handleDelete}>
                    Delete Evaluation
                </button>
            )}
        </div>
    );
}

export default InterviewEvaluation;

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
                console.error(
                    "Failed to fetch evaluation:",
                    error
                );
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
            console.error(
                "Failed to save evaluation:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to save evaluation"
            );
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete() {
        if (
            !window.confirm(
                "Are you sure you want to delete this evaluation?"
            )
        ) {
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
            console.error(
                "Failed to delete evaluation:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to delete evaluation"
            );
        }
    }

    function getRatingLabel(value) {
        const labels = {
            1: "Poor",
            2: "Below Average",
            3: "Average",
            4: "Good",
            5: "Excellent"
        };

        return labels[value];
    }

    function getRecommendationLabel(value) {
        const labels = {
            STRONG_HIRE: "Strong Hire",
            HIRE: "Hire",
            MAYBE: "Maybe",
            NO_HIRE: "No Hire"
        };

        return labels[value] || value;
    }

    if (loading) {
        return (
            <div className="page">
                <div className="evaluation-loading">
                    <div className="evaluation-loading-icon">
                        ★
                    </div>

                    <h2>Loading evaluation</h2>

                    <p>
                        Fetching interview evaluation details...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="page">

            <div className="evaluation-topbar">
                <button
                    className="btn"
                    onClick={() => navigate("/interviews")}
                >
                    ← Back to Interviews
                </button>
            </div>

            <div className="evaluation-header">

                <div className="evaluation-header-main">

                    <div className="evaluation-header-icon">
                        ★
                    </div>

                    <div>
                        <p className="page-eyebrow">
                            INTERVIEW MANAGEMENT
                        </p>

                        <h1>Interview Evaluation</h1>

                        <p>
                            Review the candidate's performance and
                            record your hiring recommendation.
                        </p>
                    </div>

                </div>

                <div className="evaluation-id">
                    <span>Interview</span>
                    <strong>#{interviewId}</strong>
                </div>

            </div>

            <div className="evaluation-layout">

                <main>

                    <section className="evaluation-card">

                        <div className="evaluation-card-header">
                            <div>
                                <h2>Candidate Assessment</h2>

                                <p>
                                    Rate the candidate across the
                                    key interview criteria.
                                </p>
                            </div>

                            <span className="evaluation-state">
                                {evaluation
                                    ? "Existing Evaluation"
                                    : "New Evaluation"}
                            </span>
                        </div>

                        <form
                            className="evaluation-form"
                            onSubmit={handleSubmit}
                        >

                            <div className="evaluation-ratings">

                                <div className="evaluation-rating">
                                    <div className="evaluation-rating-header">
                                        <div>
                                            <label>
                                                Technical Skills
                                            </label>

                                            <span>
                                                Ability to apply
                                                technical knowledge.
                                            </span>
                                        </div>

                                        <strong>
                                            {technicalSkills}/5
                                        </strong>
                                    </div>

                                    <select
                                        value={technicalSkills}
                                        onChange={(e) =>
                                            setTechnicalSkills(
                                                Number(e.target.value)
                                            )
                                        }
                                    >
                                        <option value={1}>
                                            1 — Poor
                                        </option>
                                        <option value={2}>
                                            2 — Below Average
                                        </option>
                                        <option value={3}>
                                            3 — Average
                                        </option>
                                        <option value={4}>
                                            4 — Good
                                        </option>
                                        <option value={5}>
                                            5 — Excellent
                                        </option>
                                    </select>

                                    <small>
                                        {getRatingLabel(
                                            technicalSkills
                                        )}
                                    </small>
                                </div>

                                <div className="evaluation-rating">
                                    <div className="evaluation-rating-header">
                                        <div>
                                            <label>
                                                Problem Solving
                                            </label>

                                            <span>
                                                Approach to challenges
                                                and problem solving.
                                            </span>
                                        </div>

                                        <strong>
                                            {problemSolving}/5
                                        </strong>
                                    </div>

                                    <select
                                        value={problemSolving}
                                        onChange={(e) =>
                                            setProblemSolving(
                                                Number(e.target.value)
                                            )
                                        }
                                    >
                                        <option value={1}>
                                            1 — Poor
                                        </option>
                                        <option value={2}>
                                            2 — Below Average
                                        </option>
                                        <option value={3}>
                                            3 — Average
                                        </option>
                                        <option value={4}>
                                            4 — Good
                                        </option>
                                        <option value={5}>
                                            5 — Excellent
                                        </option>
                                    </select>

                                    <small>
                                        {getRatingLabel(
                                            problemSolving
                                        )}
                                    </small>
                                </div>

                                <div className="evaluation-rating">
                                    <div className="evaluation-rating-header">
                                        <div>
                                            <label>
                                                Communication
                                            </label>

                                            <span>
                                                Clarity and effectiveness
                                                of communication.
                                            </span>
                                        </div>

                                        <strong>
                                            {communication}/5
                                        </strong>
                                    </div>

                                    <select
                                        value={communication}
                                        onChange={(e) =>
                                            setCommunication(
                                                Number(e.target.value)
                                            )
                                        }
                                    >
                                        <option value={1}>
                                            1 — Poor
                                        </option>
                                        <option value={2}>
                                            2 — Below Average
                                        </option>
                                        <option value={3}>
                                            3 — Average
                                        </option>
                                        <option value={4}>
                                            4 — Good
                                        </option>
                                        <option value={5}>
                                            5 — Excellent
                                        </option>
                                    </select>

                                    <small>
                                        {getRatingLabel(
                                            communication
                                        )}
                                    </small>
                                </div>

                                <div className="evaluation-rating evaluation-rating-overall">
                                    <div className="evaluation-rating-header">
                                        <div>
                                            <label>
                                                Overall Rating
                                            </label>

                                            <span>
                                                Your overall assessment
                                                of the candidate.
                                            </span>
                                        </div>

                                        <strong>
                                            {overall}/5
                                        </strong>
                                    </div>

                                    <select
                                        value={overall}
                                        onChange={(e) =>
                                            setOverall(
                                                Number(e.target.value)
                                            )
                                        }
                                    >
                                        <option value={1}>
                                            1 — Poor
                                        </option>
                                        <option value={2}>
                                            2 — Below Average
                                        </option>
                                        <option value={3}>
                                            3 — Average
                                        </option>
                                        <option value={4}>
                                            4 — Good
                                        </option>
                                        <option value={5}>
                                            5 — Excellent
                                        </option>
                                    </select>

                                    <small>
                                        {getRatingLabel(overall)}
                                    </small>
                                </div>

                            </div>

                            <div className="evaluation-form-divider" />

                            <div className="form-group">
                                <label>
                                    Hiring Recommendation
                                </label>

                                <select
                                    value={recommendation}
                                    onChange={(e) =>
                                        setRecommendation(
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="STRONG_HIRE">
                                        Strong Hire
                                    </option>

                                    <option value="HIRE">
                                        Hire
                                    </option>

                                    <option value="MAYBE">
                                        Maybe
                                    </option>

                                    <option value="NO_HIRE">
                                        No Hire
                                    </option>
                                </select>
                            </div>

                            <div className="evaluation-recommendation-preview">
                                <span>Recommendation</span>

                                <strong>
                                    {getRecommendationLabel(
                                        recommendation
                                    )}
                                </strong>
                            </div>

                            <div className="form-group">
                                <label>
                                    Interview Feedback
                                </label>

                                <textarea
                                    value={feedback}
                                    onChange={(e) =>
                                        setFeedback(e.target.value)
                                    }
                                    placeholder="Write detailed interview feedback, strengths, concerns, and observations..."
                                    rows="7"
                                />

                                <span className="evaluation-field-help">
                                    Capture useful context that can help
                                    the hiring team make a decision.
                                </span>
                            </div>

                            <div className="evaluation-actions">

                                {evaluation && (
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={handleDelete}
                                        disabled={submitting}
                                    >
                                        Delete Evaluation
                                    </button>
                                )}

                                <div className="evaluation-actions-right">

                                    <button
                                        type="button"
                                        className="btn"
                                        onClick={() =>
                                            navigate("/interviews")
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
                                            ? "Saving..."
                                            : evaluation
                                                ? "Update Evaluation"
                                                : "Submit Evaluation"}
                                    </button>

                                </div>

                            </div>

                        </form>

                    </section>

                </main>

                <aside className="evaluation-sidebar">

                    <div className="evaluation-summary-card">

                        <div className="evaluation-summary-icon">
                            ★
                        </div>

                        <h3>Assessment Summary</h3>

                        <div className="evaluation-summary-row">
                            <span>Technical Skills</span>
                            <strong>
                                {technicalSkills}/5
                            </strong>
                        </div>

                        <div className="evaluation-summary-row">
                            <span>Problem Solving</span>
                            <strong>
                                {problemSolving}/5
                            </strong>
                        </div>

                        <div className="evaluation-summary-row">
                            <span>Communication</span>
                            <strong>
                                {communication}/5
                            </strong>
                        </div>

                        <div className="evaluation-summary-row">
                            <span>Overall</span>
                            <strong>
                                {overall}/5
                            </strong>
                        </div>

                        <div className="evaluation-summary-recommendation">
                            <span>Recommendation</span>

                            <strong>
                                {getRecommendationLabel(
                                    recommendation
                                )}
                            </strong>
                        </div>

                    </div>

                    <div className="evaluation-info-card">

                        <h3>Evaluation Guide</h3>

                        <div className="evaluation-guide-item">
                            <strong>1–2</strong>
                            <span>
                                Needs improvement
                            </span>
                        </div>

                        <div className="evaluation-guide-item">
                            <strong>3</strong>
                            <span>
                                Meets expectations
                            </span>
                        </div>

                        <div className="evaluation-guide-item">
                            <strong>4–5</strong>
                            <span>
                                Strong performance
                            </span>
                        </div>

                    </div>

                </aside>

            </div>

        </div>
    );
}

export default InterviewEvaluation;

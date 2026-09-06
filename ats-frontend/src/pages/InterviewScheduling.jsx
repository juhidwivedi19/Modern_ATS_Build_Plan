
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

function InterviewScheduling() {
    const { applicationId } = useParams();
    const navigate = useNavigate();

    const [type, setType] = useState("SCREENING");
    const [scheduledAt, setScheduledAt] = useState("");
    const [duration, setDuration] = useState(30);
    const [meetingLink, setMeetingLink] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSchedule(e) {
        e.preventDefault();

        if (!scheduledAt) {
            alert("Please select interview date and time");
            return;
        }

        try {
            setLoading(true);

            await api.post("/interviews", {
                applicationId: Number(applicationId),
                type,
                scheduledAt,
                duration: Number(duration),
                meetingLink: meetingLink || undefined
            });

            alert("Interview scheduled successfully");

            navigate(`/applications/${applicationId}`);
        } catch (error) {
            console.error(
                "Failed to schedule interview:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to schedule interview"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="page">

            <div className="interview-schedule-topbar">
                <button
                    className="btn"
                    onClick={() =>
                        navigate(
                            `/applications/${applicationId}`
                        )
                    }
                >
                    ← Back to Application
                </button>
            </div>

            <div className="interview-schedule-header">

                <div className="interview-schedule-icon">
                    ◷
                </div>

                <div>
                    <p className="page-eyebrow">
                        INTERVIEW MANAGEMENT
                    </p>

                    <h1>Schedule Interview</h1>

                    <p>
                        Set up an interview for this candidate
                        and add the meeting details.
                    </p>
                </div>

                <div className="interview-application-id">
                    <span>Application</span>
                    <strong>#{applicationId}</strong>
                </div>

            </div>

            <div className="interview-schedule-layout">

                <main>

                    <section className="interview-schedule-card">

                        <div className="interview-schedule-card-header">
                            <div>
                                <h2>Interview Details</h2>
                                <p>
                                    Configure the interview schedule
                                    and meeting information.
                                </p>
                            </div>
                        </div>

                        <form
                            className="interview-schedule-form"
                            onSubmit={handleSchedule}
                        >

                            <div className="form-group">
                                <label>Interview Type *</label>

                                <select
                                    value={type}
                                    onChange={(e) =>
                                        setType(e.target.value)
                                    }
                                >
                                    <option value="SCREENING">
                                        Screening
                                    </option>

                                    <option value="TECHNICAL">
                                        Technical
                                    </option>

                                    <option value="HR">
                                        HR
                                    </option>

                                    <option value="MANAGERIAL">
                                        Managerial
                                    </option>
                                </select>

                                <span className="interview-field-help">
                                    Select the stage or type of
                                    interview being scheduled.
                                </span>
                            </div>

                            <div className="interview-form-grid">

                                <div className="form-group">
                                    <label>Date and Time *</label>

                                    <input
                                        type="datetime-local"
                                        value={scheduledAt}
                                        onChange={(e) =>
                                            setScheduledAt(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                    <span className="interview-field-help">
                                        Choose a future date and time.
                                    </span>
                                </div>

                                <div className="form-group">
                                    <label>
                                        Duration (minutes) *
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        max="480"
                                        value={duration}
                                        onChange={(e) =>
                                            setDuration(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                    <span className="interview-field-help">
                                        Maximum duration is 480 minutes.
                                    </span>
                                </div>

                            </div>

                            <div className="form-group">
                                <label>Meeting Link</label>

                                <input
                                    type="url"
                                    placeholder="https://meet.google.com/..."
                                    value={meetingLink}
                                    onChange={(e) =>
                                        setMeetingLink(
                                            e.target.value
                                        )
                                    }
                                />

                                <span className="interview-field-help">
                                    Optional. Add a Google Meet or
                                    other valid meeting URL.
                                </span>
                            </div>

                            <div className="interview-schedule-actions">

                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() =>
                                        navigate(
                                            `/applications/${applicationId}`
                                        )
                                    }
                                    disabled={loading}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Scheduling..."
                                        : "Schedule Interview"}
                                </button>

                            </div>

                        </form>

                    </section>

                </main>

                <aside className="interview-schedule-sidebar">

                    <div className="interview-info-card">

                        <div className="interview-info-icon">
                            ✓
                        </div>

                        <h3>Scheduling Checklist</h3>

                        <div className="interview-check">
                            <span>✓</span>
                            <p>
                                Select the appropriate interview
                                type.
                            </p>
                        </div>

                        <div className="interview-check">
                            <span>✓</span>
                            <p>
                                Choose a future date and time.
                            </p>
                        </div>

                        <div className="interview-check">
                            <span>✓</span>
                            <p>
                                Set the expected interview duration.
                            </p>
                        </div>

                        <div className="interview-check">
                            <span>✓</span>
                            <p>
                                Add a meeting link if the interview
                                is remote.
                            </p>
                        </div>

                    </div>

                    <div className="interview-info-card">

                        <h3>Application</h3>

                        <div className="interview-application-detail">
                            <span>Application ID</span>
                            <strong>
                                #{applicationId}
                            </strong>
                        </div>

                        <p className="interview-sidebar-note">
                            After scheduling, the interview will
                            appear in the Interviews section.
                        </p>

                    </div>

                </aside>

            </div>

        </div>
    );
}

export default InterviewScheduling;

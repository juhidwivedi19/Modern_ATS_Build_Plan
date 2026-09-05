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
        <div>
            <button
                onClick={() =>
                    navigate(
                        `/applications/${applicationId}`
                    )
                }
            >
                Back to Application
            </button>

            <h1>Schedule Interview</h1>

            <form onSubmit={handleSchedule}>
                <div>
                    <label>Interview Type</label>

                    <select
                        value={type}
                        onChange={(e) =>
                            setType(e.target.value)
                        }
                    >
                        <option value="SCREENING">
                            SCREENING
                        </option>

                        <option value="TECHNICAL">
                            TECHNICAL
                        </option>

                        <option value="HR">
                            HR
                        </option>

                        <option value="MANAGERIAL">
                            MANAGERIAL
                        </option>
                    </select>
                </div>

                <div>
                    <label>Date and Time</label>

                    <input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) =>
                            setScheduledAt(e.target.value)
                        }
                    />
                </div>

                <div>
                    <label>Duration (minutes)</label>

                    <input
                        type="number"
                        min="1"
                        max="480"
                        value={duration}
                        onChange={(e) =>
                            setDuration(e.target.value)
                        }
                    />
                </div>

                <div>
                    <label>Meeting Link</label>

                    <input
                        type="url"
                        placeholder="https://meet.google.com/..."
                        value={meetingLink}
                        onChange={(e) =>
                            setMeetingLink(e.target.value)
                        }
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Scheduling..."
                        : "Schedule Interview"}
                </button>
            </form>
        </div>
    );
}

export default InterviewScheduling;
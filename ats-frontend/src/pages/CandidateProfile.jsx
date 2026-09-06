
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

function CandidateProfile() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [candidateId, setCandidateId] = useState(
        searchParams.get("id") || ""
    );

    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [education, setEducation] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [portfolio, setPortfolio] = useState("");

    const [loading, setLoading] = useState(false);

    async function handleUpdateCandidate(e) {
        e.preventDefault();

        if (!candidateId.trim()) {
            alert("Candidate ID is required");
            return;
        }

        try {
            setLoading(true);

            const response = await api.put(
                `/candidates/${candidateId}`,
                {
                    name,
                    location,
                    education,
                    linkedin,
                    portfolio
                }
            );

            console.log(
                "Updated candidate:",
                response.data.candidate
            );

            alert("Candidate profile updated successfully");

        } catch (error) {
            console.error(
                "Failed to update candidate:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to update candidate"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="page">

            <div className="candidate-profile-topbar">
                <button
                    className="btn"
                    onClick={() => navigate("/candidates/search")}
                >
                    ← Candidate Search
                </button>
            </div>

            <div className="candidate-profile-header">

                <div className="candidate-profile-identity">

                    <div className="candidate-profile-avatar">
                        {(name || "C").charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <p className="page-eyebrow">
                            TALENT PROFILE
                        </p>

                        <h1>
                            {name || "Candidate Profile"}
                        </h1>

                        <p>
                            Update candidate information and
                            professional details.
                        </p>
                    </div>

                </div>

                {candidateId && (
                    <span className="candidate-profile-id">
                        ID #{candidateId}
                    </span>
                )}

            </div>

            <div className="candidate-profile-layout">

                <main className="candidate-profile-main">

                    <section className="candidate-profile-card">

                        <div className="candidate-profile-section-header">
                            <div>
                                <h2>Basic Information</h2>
                                <p>
                                    Core information about the candidate.
                                </p>
                            </div>
                        </div>

                        <form
                            className="candidate-profile-form"
                            onSubmit={handleUpdateCandidate}
                        >

                            {!searchParams.get("id") && (
                                <div className="form-group">
                                    <label>Candidate ID *</label>

                                    <input
                                        type="number"
                                        placeholder="Enter candidate ID"
                                        value={candidateId}
                                        onChange={(e) =>
                                            setCandidateId(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />
                                </div>
                            )}

                            <div className="candidate-profile-form-grid">

                                <div className="form-group">
                                    <label>Full Name</label>

                                    <input
                                        type="text"
                                        placeholder="e.g. John Doe"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Location</label>

                                    <input
                                        type="text"
                                        placeholder="e.g. Bengaluru, India"
                                        value={location}
                                        onChange={(e) =>
                                            setLocation(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="form-group candidate-profile-full">
                                    <label>Education</label>

                                    <input
                                        type="text"
                                        placeholder="e.g. B.Tech Computer Science"
                                        value={education}
                                        onChange={(e) =>
                                            setEducation(e.target.value)
                                        }
                                    />
                                </div>

                            </div>

                            <div className="candidate-profile-divider" />

                            <div className="candidate-profile-section-header">
                                <div>
                                    <h2>Professional Links</h2>
                                    <p>
                                        Add the candidate's professional
                                        online presence.
                                    </p>
                                </div>
                            </div>

                            <div className="candidate-profile-form-grid">

                                <div className="form-group">
                                    <label>LinkedIn</label>

                                    <input
                                        type="url"
                                        placeholder="https://linkedin.com/in/..."
                                        value={linkedin}
                                        onChange={(e) =>
                                            setLinkedin(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Portfolio</label>

                                    <input
                                        type="url"
                                        placeholder="https://portfolio.com"
                                        value={portfolio}
                                        onChange={(e) =>
                                            setPortfolio(e.target.value)
                                        }
                                    />
                                </div>

                            </div>

                            <div className="candidate-profile-actions">

                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() =>
                                        navigate("/candidates/search")
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
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>

                            </div>

                        </form>

                    </section>

                </main>

                <aside className="candidate-profile-sidebar">

                    <div className="candidate-profile-side-card">

                        <div className="candidate-side-icon">
                            ✓
                        </div>

                        <h3>Profile Management</h3>

                        <p>
                            Keep candidate information accurate so
                            recruiters can quickly evaluate and contact
                            talent.
                        </p>

                        <div className="candidate-side-item">
                            <span>Candidate ID</span>
                            <strong>
                                {candidateId || "Not provided"}
                            </strong>
                        </div>

                        <div className="candidate-side-item">
                            <span>Profile Name</span>
                            <strong>
                                {name || "Not provided"}
                            </strong>
                        </div>

                    </div>

                    <div className="candidate-profile-side-card">

                        <h3>Recruiter Tip</h3>

                        <p>
                            Keep education, location and professional
                            links up to date to make candidate search
                            and evaluation easier.
                        </p>

                    </div>

                </aside>

            </div>

        </div>
    );
}

export default CandidateProfile;

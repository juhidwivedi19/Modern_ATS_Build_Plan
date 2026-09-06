
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Candidates() {
    const navigate = useNavigate();

    const [showForm, setShowForm] = useState(false);
    const [creating, setCreating] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    const [education, setEducation] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [portfolio, setPortfolio] = useState("");

    async function handleCreateCandidate(e) {
        e.preventDefault();

        if (!name.trim() || !email.trim() || !phone.trim()) {
            alert("Name, email and phone are required");
            return;
        }

        try {
            setCreating(true);

            const response = await api.post(
                "/candidates",
                {
                    name,
                    email,
                    phone,
                    location,
                    education,
                    linkedin,
                    portfolio
                }
            );

            console.log(
                "Candidate created:",
                response.data.candidate
            );

            alert("Candidate profile created successfully");

            setName("");
            setEmail("");
            setPhone("");
            setLocation("");
            setEducation("");
            setLinkedin("");
            setPortfolio("");

            setShowForm(false);
        } catch (error) {
            console.error(
                "Failed to create candidate:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to create candidate"
            );
        } finally {
            setCreating(false);
        }
    }

    function closeForm() {
        if (creating) return;

        setShowForm(false);
    }

    return (
        <div className="page">

            <div className="candidates-header">
                <div>
                    <p className="page-eyebrow">
                        TALENT MANAGEMENT
                    </p>

                    <h1>Candidates</h1>

                    <p className="candidates-subtitle">
                        Manage candidate profiles and build your
                        talent pool.
                    </p>
                </div>

                <div className="candidates-header-actions">
                    <button
                        className="btn"
                        onClick={() =>
                            navigate("/candidates/search")
                        }
                    >
                        Search Candidates
                    </button>

                    <button
                        className="btn btn-primary"
                        onClick={() => setShowForm(true)}
                    >
                        + Add Candidate
                    </button>
                </div>
            </div>

            <div className="candidate-stats">

                <div className="candidate-stat-card">
                    <div className="candidate-stat-icon">
                        👥
                    </div>

                    <div>
                        <span>Total Candidates</span>
                        <strong>—</strong>
                    </div>
                </div>

                <div className="candidate-stat-card">
                    <div className="candidate-stat-icon">
                        🔎
                    </div>

                    <div>
                        <span>Talent Search</span>
                        <strong>Search</strong>
                    </div>
                </div>

                <div className="candidate-stat-card">
                    <div className="candidate-stat-icon">
                        📄
                    </div>

                    <div>
                        <span>Profiles</span>
                        <strong>Manage</strong>
                    </div>
                </div>

            </div>

            <section className="candidate-directory-card">

                <div className="candidate-directory-header">
                    <div>
                        <h2>Candidate Directory</h2>

                        <p>
                            Candidate profiles will appear here as
                            they are added to your talent pool.
                        </p>
                    </div>

                    <button
                        className="btn"
                        onClick={() =>
                            navigate("/candidates/search")
                        }
                    >
                        Browse Talent
                    </button>
                </div>

                <div className="candidate-directory-empty">

                    <div className="candidate-empty-icon">
                        👤
                    </div>

                    <h3>Start building your talent pool</h3>

                    <p>
                        Add a candidate profile or search for
                        candidates using skills, location,
                        education and experience.
                    </p>

                    <div className="candidate-empty-actions">
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowForm(true)}
                        >
                            Add Candidate
                        </button>

                        <button
                            className="btn"
                            onClick={() =>
                                navigate("/candidates/search")
                            }
                        >
                            Search Candidates
                        </button>
                    </div>

                </div>

            </section>

            {showForm && (
                <div className="candidate-modal-overlay">

                    <div className="candidate-modal">

                        <div className="candidate-modal-header">
                            <div>
                                <h2>Add Candidate</h2>

                                <p>
                                    Create a candidate profile for
                                    your talent pool.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="candidate-modal-close"
                                onClick={closeForm}
                            >
                                ×
                            </button>
                        </div>

                        <form
                            className="candidate-form"
                            onSubmit={handleCreateCandidate}
                        >

                            <div className="candidate-form-section">
                                <h3>Basic Information</h3>

                                <div className="candidate-form-grid">

                                    <div className="form-group">
                                        <label>Full Name *</label>

                                        <input
                                            type="text"
                                            placeholder="e.g. John Doe"
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Email *</label>

                                        <input
                                            type="email"
                                            placeholder="john@example.com"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Phone *</label>

                                        <input
                                            type="text"
                                            placeholder="+91 9876543210"
                                            value={phone}
                                            onChange={(e) =>
                                                setPhone(e.target.value)
                                            }
                                            required
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

                                </div>
                            </div>

                            <div className="candidate-form-section">
                                <h3>Professional Information</h3>

                                <div className="form-group">
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

                                <div className="candidate-form-grid">

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
                                            placeholder="https://yourportfolio.com"
                                            value={portfolio}
                                            onChange={(e) =>
                                                setPortfolio(e.target.value)
                                            }
                                        />
                                    </div>

                                </div>
                            </div>

                            <div className="candidate-form-footer">

                                <button
                                    type="button"
                                    className="btn"
                                    onClick={closeForm}
                                    disabled={creating}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={creating}
                                >
                                    {creating
                                        ? "Creating..."
                                        : "Create Candidate"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Candidates;

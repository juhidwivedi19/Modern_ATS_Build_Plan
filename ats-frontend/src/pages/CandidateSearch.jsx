
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function CandidateSearch() {
    const navigate = useNavigate();

    const [skills, setSkills] = useState("");
    const [location, setLocation] = useState("");
    const [education, setEducation] = useState("");
    const [experience, setExperience] = useState("");
    const [company, setCompany] = useState("");

    const [candidates, setCandidates] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    async function handleSearch(e) {
        e.preventDefault();

        try {
            setLoading(true);

            const response = await api.get(
                "/candidates/search",
                {
                    params: {
                        skills,
                        location,
                        education,
                        experience,
                        company,
                        page: 1,
                        limit: 10
                    }
                }
            );

            setCandidates(response.data.data || []);
            setPagination(response.data.pagination || null);
            setSearched(true);
        } catch (error) {
            console.error(
                "Failed to search candidates:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to search candidates"
            );
        } finally {
            setLoading(false);
        }
    }

    function handleClear() {
        setSkills("");
        setLocation("");
        setEducation("");
        setExperience("");
        setCompany("");
        setCandidates([]);
        setPagination(null);
        setSearched(false);
    }

    return (
        <div className="page">

            <div className="candidate-search-header">

                <div>
                    <button
                        className="btn candidate-search-back"
                        onClick={() =>
                            navigate("/candidates")
                        }
                    >
                        ← Candidates
                    </button>

                    <p className="page-eyebrow">
                        TALENT SOURCING
                    </p>

                    <h1>Search Candidates</h1>

                    <p>
                        Find the right candidates using skills,
                        experience, education and location.
                    </p>
                </div>

            </div>

            <section className="candidate-search-card">

                <div className="candidate-search-card-header">
                    <div>
                        <h2>Candidate Search</h2>
                        <p>
                            Use one or more filters to find matching
                            candidates.
                        </p>
                    </div>
                </div>

                <form
                    className="candidate-search-form"
                    onSubmit={handleSearch}
                >

                    <div className="candidate-search-grid">

                        <div className="form-group">
                            <label>Skills</label>

                            <input
                                type="text"
                                placeholder="e.g. React, Node.js"
                                value={skills}
                                onChange={(e) =>
                                    setSkills(e.target.value)
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label>Location</label>

                            <input
                                type="text"
                                placeholder="e.g. Bengaluru"
                                value={location}
                                onChange={(e) =>
                                    setLocation(e.target.value)
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label>Education</label>

                            <input
                                type="text"
                                placeholder="e.g. B.Tech"
                                value={education}
                                onChange={(e) =>
                                    setEducation(e.target.value)
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label>Experience</label>

                            <input
                                type="text"
                                placeholder="e.g. 2 years"
                                value={experience}
                                onChange={(e) =>
                                    setExperience(e.target.value)
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label>Previous Company</label>

                            <input
                                type="text"
                                placeholder="e.g. Microsoft"
                                value={company}
                                onChange={(e) =>
                                    setCompany(e.target.value)
                                }
                            />
                        </div>

                    </div>

                    <div className="candidate-search-actions">

                        <button
                            type="button"
                            className="btn"
                            onClick={handleClear}
                        >
                            Clear Filters
                        </button>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading
                                ? "Searching..."
                                : "Search Candidates"}
                        </button>

                    </div>

                </form>

            </section>

            <section className="candidate-results-card">

                <div className="candidate-results-header">

                    <div>
                        <h2>Search Results</h2>

                        <p>
                            {searched
                                ? `${candidates.length} candidates found`
                                : "Run a search to view candidates"}
                        </p>
                    </div>

                    {pagination && (
                        <span className="candidate-results-page">
                            Page {pagination.page} of{" "}
                            {pagination.totalPages}
                        </span>
                    )}

                </div>

                {!searched ? (
                    <div className="candidate-search-empty">

                        <div className="candidate-search-empty-icon">
                            🔎
                        </div>

                        <h3>Find your next candidate</h3>

                        <p>
                            Search your talent pool using the filters
                            above.
                        </p>

                    </div>
                ) : candidates.length === 0 ? (
                    <div className="candidate-search-empty">

                        <div className="candidate-search-empty-icon">
                            0
                        </div>

                        <h3>No candidates found</h3>

                        <p>
                            Try changing your filters or searching
                            with fewer criteria.
                        </p>

                    </div>
                ) : (
                    <div className="candidate-results-list">

                        {candidates.map((candidate) => (
                            <div
                                className="candidate-result-row"
                                key={candidate.id}
                            >

                                <div className="candidate-result-identity">

                                    <div className="candidate-result-avatar">
                                        {(candidate.name || "C")
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <div>
                                        <h3>
                                            {candidate.name ||
                                                "Unknown Candidate"}
                                        </h3>

                                        <p>
                                            {candidate.email ||
                                                "No email available"}
                                        </p>
                                    </div>

                                </div>

                                <div className="candidate-result-details">

                                    <div className="candidate-result-detail">
                                        <span>Location</span>
                                        <strong>
                                            {candidate.location ||
                                                "Not specified"}
                                        </strong>
                                    </div>

                                    <div className="candidate-result-detail">
                                        <span>Education</span>
                                        <strong>
                                            {candidate.education ||
                                                "Not specified"}
                                        </strong>
                                    </div>

                                </div>

                                <button
                                    className="btn btn-small"
                                    onClick={() =>
                                        navigate(
                                            `/candidates/profile?id=${candidate.id}`
                                        )
                                    }
                                >
                                    View Profile
                                </button>

                            </div>
                        ))}

                    </div>
                )}

            </section>

        </div>
    );
}

export default CandidateSearch;

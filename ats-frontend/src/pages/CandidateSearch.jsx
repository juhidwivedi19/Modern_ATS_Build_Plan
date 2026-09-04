import { useState } from "react";
import api from "../api/axios";

function CandidateSearch() {
    const [skills, setSkills] = useState("");
    const [location, setLocation] = useState("");
    const [education, setEducation] = useState("");
    const [experience, setExperience] = useState("");
    const [company, setCompany] = useState("");

    const [candidates, setCandidates] = useState([]);
    const [pagination, setPagination] = useState(null);

    async function handleSearch(e) {
        e.preventDefault();

        try {
            const response = await api.get("/search", {
                params: {
                    skills: skills,
                    location: location,
                    education: education,
                    experience: experience,
                    company: company,
                    page: 1,
                    limit: 10
                }
            });

            setCandidates(response.data.data);
            setPagination(response.data.pagination);

        } catch (error) {
            console.error(
                "Failed to search candidates:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to search candidates"
            );
        }
    }

    return (
        <div>
            <h1>Search Candidates</h1>

            <form onSubmit={handleSearch}>

                <input
                    type="text"
                    placeholder="Skills"
                    value={skills}
                    onChange={(e) =>
                        setSkills(e.target.value)
                    }
                />

                <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) =>
                        setLocation(e.target.value)
                    }
                />

                <input
                    type="text"
                    placeholder="Education"
                    value={education}
                    onChange={(e) =>
                        setEducation(e.target.value)
                    }
                />

                <input
                    type="text"
                    placeholder="Experience"
                    value={experience}
                    onChange={(e) =>
                        setExperience(e.target.value)
                    }
                />

                <input
                    type="text"
                    placeholder="Company"
                    value={company}
                    onChange={(e) =>
                        setCompany(e.target.value)
                    }
                />

                <button type="submit">
                    Search
                </button>
            </form>

            <div>
                <h2>Results</h2>

                {candidates.map((candidate) => (
                    <div key={candidate.id}>
                        <h3>{candidate.name}</h3>

                        <p>
                            Email: {candidate.email}
                        </p>

                        <p>
                            Location: {candidate.location}
                        </p>

                        <p>
                            Education: {candidate.education}
                        </p>
                    </div>
                ))}

                {candidates.length === 0 && (
                    <p>No candidates found.</p>
                )}

                {pagination && (
                    <p>
                        Page {pagination.page} of{" "}
                        {pagination.totalPages}
                    </p>
                )}
            </div>
        </div>
    );
}

export default CandidateSearch;
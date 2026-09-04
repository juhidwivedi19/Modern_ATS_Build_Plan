import { useState } from "react";
import api from "../api/axios";

function CandidateProfile() {
    const [candidateId, setCandidateId] = useState("");

    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [education, setEducation] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [portfolio, setPortfolio] = useState("");

    async function handleUpdateCandidate(e) {
        e.preventDefault();

        if (!candidateId.trim()) {
            alert("Candidate ID is required");
            return;
        }

        try {
            const response = await api.put(
                `/candidates/${candidateId}`,
                {
                    name: name,
                    location: location,
                    education: education,
                    linkedin: linkedin,
                    portfolio: portfolio
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
        }
    }

    return (
        <div>
            <h1>Update Candidate Profile</h1>

            <form onSubmit={handleUpdateCandidate}>

                <input
                    type="number"
                    placeholder="Candidate ID"
                    value={candidateId}
                    onChange={(e) =>
                        setCandidateId(e.target.value)
                    }
                />

                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) =>
                        setName(e.target.value)
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
                    type="url"
                    placeholder="LinkedIn URL"
                    value={linkedin}
                    onChange={(e) =>
                        setLinkedin(e.target.value)
                    }
                />

                <input
                    type="url"
                    placeholder="Portfolio URL"
                    value={portfolio}
                    onChange={(e) =>
                        setPortfolio(e.target.value)
                    }
                />

                <button type="submit">
                    Update Profile
                </button>

            </form>
        </div>
    );
}

export default CandidateProfile;
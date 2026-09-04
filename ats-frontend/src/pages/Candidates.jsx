import { useState } from "react";
import api from "../api/axios";

function Candidates() {
    const [showForm, setShowForm] = useState(false);

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
            const response = await api.post(
                "/candidates",
                {
                    name: name,
                    email: email,
                    phone: phone,
                    location: location,
                    education: education,
                    linkedin: linkedin,
                    portfolio: portfolio
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
        }
    }

    return (
        <div>
            <h1>Candidates</h1>

            <button onClick={() => setShowForm(true)}>
                Create Candidate Profile
            </button>

            {showForm && (
                <form onSubmit={handleCreateCandidate}>

                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                    />

                    <input
                        type="text"
                        placeholder="Phone"
                        value={phone}
                        onChange={(e) =>
                            setPhone(e.target.value)
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
                        Create Candidate
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setShowForm(false);
                        }}
                    >
                        Cancel
                    </button>

                </form>
            )}
        </div>
    );
}

export default Candidates;
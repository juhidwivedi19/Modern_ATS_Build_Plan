import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Organization() {
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [organizations, setOrganizations] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        async function fetchOrganizations() {
            try {
                const response = await api.get("/organization");

                setOrganizations(response.data.organizations);
            } catch (error) {
                console.error("Failed to fetch organizations:", error);
            }
        }

        fetchOrganizations();
    }, []);

    async function handleCreateOrganization(e) {
        e.preventDefault();

        if (!name.trim()) {
            return;
        }

        try {
            const response = await api.post("/organization", {
                name: name
            });

            const newOrganization = response.data.organization;

            setOrganizations([...organizations, newOrganization]);

            setName("");
            setShowForm(false);

        } catch (error) {
            console.error("Failed to create organization:", error);
        }
    }

    return (
        <div>
            <h1>Organizations</h1>

            <button onClick={() => setShowForm(true)}>
                Create Organization
            </button>

            {showForm && (
                <form onSubmit={handleCreateOrganization}>
                    <input
                        type="text"
                        placeholder="Organization name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <button type="submit">
                        Create
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowForm(false)}
                    >
                        Cancel
                    </button>
                </form>
            )}

            <div>
                <h2>My Organizations</h2>

                {organizations.map((organization) => (
                    <div key={organization.id}>
                        <h3>{organization.name}</h3>

                        <p>
                            Role: {organization.role}
                        </p>

                        <button
                            onClick={() =>
                                navigate(`/organizations/${organization.id}`)
                            }
                        >
                            Open
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Organization;
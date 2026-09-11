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

              setOrganizations(
    Array.isArray(response.data)
        ? response.data
        : response.data.organizations || []
);
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
    <div className="page">
        <div className="page-header">
            <div>
                <h1>Organizations</h1>
                <p>Manage your organizations and teams.</p>
            </div>

            <button
                className="btn-primary"
                onClick={() => setShowForm(true)}
            >
                + Create Organization
            </button>
        </div>

        {showForm && (
            <div className="section-card">
                <h2>Create Organization</h2>

                <form onSubmit={handleCreateOrganization}>
                    <div className="form-group">
                        <label>Organization Name</label>

                        <input
                            type="text"
                            placeholder="Enter organization name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                    >
                        Create
                    </button>

                    <button
                        type="button"
                        className="btn"
                        onClick={() => setShowForm(false)}
                    >
                        Cancel
                    </button>
                </form>
            </div>
        )}

        <div className="section-card">
            <h2>My Organizations</h2>

            {organizations.length === 0 ? (
                <p>No organizations found.</p>
            ) : (
                <div className="organization-list">
                    {organizations.map((organization) => (
                        <div
                            className="organization-card"
                            key={organization.id}
                        >
                            <h2>{organization.name}</h2>

                            <p>
                                Role:{" "}
                                <span className="role-badge">
                                    {organization.role}
                                </span>
                            </p>

                            <button
                                className="btn-primary"
                                onClick={() =>
                                    navigate(
                                        `/organizations/${organization.id}`
                                    )
                                }
                            >
                                Open Organization
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
);
}
export default Organization;
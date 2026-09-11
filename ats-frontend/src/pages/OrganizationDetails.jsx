import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

function OrganizationDetails() {
    const { organizationId } = useParams();
    const navigate = useNavigate();

    const [organization, setOrganization] = useState(null);

    useEffect(() => {
        async function fetchOrganization() {
            try {
                const response = await api.get(
                    `/organization/${organizationId}`
                );

                setOrganization(
                    response.data.organization || response.data
                );
            } catch (error) {
                console.error("Failed to fetch organization:", error);
            }
        }

        fetchOrganization();
    }, [organizationId]);

    if (!organization) {
        return (
            <div className="page">
                <p>Loading organization...</p>
            </div>
        );
    }

    return (
        <div className="page">

            <div className="organization-hero">
                <div className="organization-identity">

                    <div className="organization-avatar">
                        {organization.name?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <h1>{organization.name}</h1>
                        <p>Organization workspace</p>
                    </div>

                </div>

                <div className="organization-actions">

                    <button
                        className="btn"
                        onClick={() =>
                            navigate(
                                `/organizations/${organization.id}/members`
                            )
                        }
                    >
                        Members
                    </button>

                    <button
                        className="btn"
                        onClick={() =>
                            navigate(
                                `/organizations/${organization.id}/departments`
                            )
                        }
                    >
                        Departments
                    </button>

                    <button
                        className="btn-primary"
                        onClick={() =>
                            navigate(
                                `/organizations/${organization.id}/jobs`
                            )
                        }
                    >
                        Jobs
                    </button>

                </div>
            </div>

            <div className="organization-tabs">

                <Link
                    className="organization-tab active"
                    to={`/organizations/${organization.id}`}
                >
                    Overview
                </Link>

                <Link
                    className="organization-tab"
                    to={`/organizations/${organization.id}/members`}
                >
                    Members
                </Link>

                <Link
                    className="organization-tab"
                    to={`/organizations/${organization.id}/departments`}
                >
                    Departments
                </Link>

                <Link
                    className="organization-tab"
                    to={`/organizations/${organization.id}/jobs`}
                >
                    Jobs
                </Link>

            </div>

            <div className="organization-overview">

                <div className="organization-panel">

                    <h2>Organization Overview</h2>

                    <div className="organization-stat">
                        <span className="organization-stat-label">
                            Organization
                        </span>

                        <span className="organization-stat-value">
                            {organization.name}
                        </span>
                    </div>

                    <div className="organization-stat">
                        <span className="organization-stat-label">
                            Your Role
                        </span>

                        <span className="role-badge">
                            {organization.role || "Member"}
                        </span>
                    </div>

                </div>

                <div className="organization-panel">

                    <h2>Quick Actions</h2>

                    <button
                        className="btn-primary"
                        onClick={() =>
                            navigate(
                                `/organizations/${organization.id}/jobs`
                            )
                        }
                    >
                        Manage Jobs
                    </button>

                    <button
                        className="btn"
                        onClick={() =>
                            navigate(
                                `/organizations/${organization.id}/members`
                            )
                        }
                    >
                        Manage Members
                    </button>

                </div>

            </div>

        </div>
    );
}

export default OrganizationDetails;
import { useParams, Link } from "react-router-dom";

function OrganizationDetails() {
    const { organizationId } = useParams();

    return (
        <div>
            <h1>Organization Details</h1>

            <p>Organization ID: {organizationId}</p>

            <div>
                <h2>Overview</h2>

                <div>
                    <h3>Members</h3>
                    <p>Manage organization members</p>
                    <Link to={`/organizations/${organizationId}/members`}>
                        Manage Members
                    </Link>
                </div>

                <div>
                    <h3>Departments</h3>
                    <p>Manage departments</p>
                    <Link to={`/organizations/${organizationId}/departments`}>
                        Manage Departments
                    </Link>
                </div>

                <div>
                    <h3>Jobs</h3>
                    <p>Manage job postings</p>
                    <Link to={`/organizations/${organizationId}/jobs`}>
                        Manage Jobs
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default OrganizationDetails;
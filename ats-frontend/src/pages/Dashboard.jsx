
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
    const { user } = useAuth();

    return (
        <div className="page">
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p className="dashboard-welcome">
                        Welcome back, {user?.name || "User"} 👋
                    </p>
                </div>
            </div>

            <div className="card-grid">
                <Link to="/organizations" className="dashboard-card">
                    <div className="dashboard-icon">🏢</div>
                    <h2>Organizations</h2>
                    <p>
                        Manage your organizations, members and departments.
                    </p>
                </Link>

                <Link to="/resumes" className="dashboard-card">
                    <div className="dashboard-icon">📄</div>
                    <h2>Resumes</h2>
                    <p>
                        Upload and manage your resumes.
                    </p>
                </Link>

                <Link to="/applications" className="dashboard-card">
                    <div className="dashboard-icon">📋</div>
                    <h2>Applications</h2>
                    <p>
                        Track your job applications and their status.
                    </p>
                </Link>

                <Link to="/interviews" className="dashboard-card">
                    <div className="dashboard-icon">📅</div>
                    <h2>Interviews</h2>
                    <p>
                        View and manage scheduled interviews.
                    </p>
                </Link>

                <Link to="/notifications" className="dashboard-card">
                    <div className="dashboard-icon">🔔</div>
                    <h2>Notifications</h2>
                    <p>
                        Stay updated with hiring activities.
                    </p>
                </Link>

                <Link to="/analytics" className="dashboard-card">
                    <div className="dashboard-icon">📊</div>
                    <h2>Analytics</h2>
                    <p>
                        View hiring analytics and reports.
                    </p>
                </Link>
            </div>
        </div>
    );
}

export default Dashboard;

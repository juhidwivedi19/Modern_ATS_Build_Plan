
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

function Navbar() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await api.post("/auth/logout");
            setUser(null);
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-logo">
                Modern ATS
            </Link>

            <div className="navbar-links">
                <Link to="/">Home</Link>

                {!user && (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}

                {user && (
                    <>
                        <Link to="/dashboard">Dashboard</Link>
                        <Link to="/resumes">Resumes</Link>
                        <Link to="/interviews">Interviews</Link>
                        <Link to="/notifications">Notifications</Link>
                        <Link to="/analytics">Analytics</Link>

                        <button
                            className="navbar-logout"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;

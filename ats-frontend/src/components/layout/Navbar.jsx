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
        <nav>
            <h2>Modern ATS</h2>

            <div>
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

                        <button onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
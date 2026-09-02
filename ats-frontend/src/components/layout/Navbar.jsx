import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav>
            <h2>Modern ATS</h2>

            <div>
                <Link to="/">Home</Link>
                <Link to="/login">Login</Link>
            </div>
        </nav>
    );
}

export default Navbar;
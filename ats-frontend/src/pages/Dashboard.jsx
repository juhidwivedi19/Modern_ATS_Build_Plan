import { useAuth } from "../context/AuthContext";

function Dashboard() {
    const { user } = useAuth();

    return (
        <div>
            <h1>Dashboard</h1>

            <h2>Welcome, {user?.name}</h2>

            <p>Email: {user?.email}</p>

            <div>
                <h3>Quick Overview</h3>

                <div>
                    <p>Total Jobs</p>
                    <h2>0</h2>
                </div>

                <div>
                    <p>Total Candidates</p>
                    <h2>0</h2>
                </div>

                <div>
                    <p>Total Applications</p>
                    <h2>0</h2>
                </div>

                <div>
                    <p>Upcoming Interviews</p>
                    <h2>0</h2>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
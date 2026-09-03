import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

function Members() {
    const { organizationId } = useParams();

    const [members, setMembers] = useState([]);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [email, setEmail] = useState("");
    const [selectedRole, setSelectedRole] = useState("RECRUITER");

    useEffect(() => {
        async function fetchMembers() {
            try {
                const response = await api.get(
                    `/organization/${organizationId}/members`
                );

                setMembers(response.data.members);
            } catch (error) {
                console.error("Failed to fetch members:", error);
            }
        }

        fetchMembers();
    }, [organizationId]);

    async function handleInviteMember(e) {
        e.preventDefault();

        if (!email.trim()) return;

        try {
            await api.post(
                `/organization/${organizationId}/invite`,
                {
                    email: email
                }
            );

            setEmail("");
            setShowInviteForm(false);

            alert("Invitation sent successfully");

        } catch (error) {
            console.error("Failed to invite member:", error);

            alert(
                error.response?.data?.message ||
                "Failed to send invitation"
            );
        }
    }



    async function handleChangeRole(memberId) {
    try {
        await api.put(
            `/organization/${organizationId}/members/${memberId}/role`,
            {
                role: selectedRole
            }
        );

        setMembers(
            members.map((member) =>
                member.id === memberId
                    ? { ...member, role: selectedRole }
                    : member
            )
        );

        alert("Member role updated successfully");

    } catch (error) {
        console.error("Failed to change member role:", error);

        alert(
            error.response?.data?.message ||
            "Failed to change member role"
        );
    }
}

    return (
        <div>
            <h1>Organization Members</h1>

            <p>Organization ID: {organizationId}</p>

            <button onClick={() => setShowInviteForm(true)}>
                Invite Member
            </button>

            {showInviteForm && (
                <form onSubmit={handleInviteMember}>
                    <input
                        type="email"
                        placeholder="Member email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <button type="submit">
                        Send Invitation
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowInviteForm(false)}
                    >
                        Cancel
                    </button>
                </form>
            )}

            <div>
                <h2>Members</h2>

                {members.map((member) => (
                    <div key={member.id}>
                        <h3>{member.user.name}</h3>

                        <p>Email: {member.user.email}</p>

                        <p>Role: {member.role}</p>

                        <select
    value={selectedRole}
    onChange={(e) => setSelectedRole(e.target.value)}
>
    <option value="OWNER">OWNER</option>
    <option value="ADMIN">ADMIN</option>
    <option value="RECRUITER">RECRUITER</option>
    <option value="INTERVIEWER">INTERVIEWER</option>
</select>

                        <button>
                            Remove
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Members;
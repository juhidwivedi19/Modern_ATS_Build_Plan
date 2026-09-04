import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

function Departments() {
    const { organizationId } = useParams();

    const [departments, setDepartments] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");

    useEffect(() => {
        async function fetchDepartments() {
            try {
                const response = await api.get(
                    `/organization/${organizationId}/departments`
                );

                setDepartments(response.data.departments);
            } catch (error) {
                console.error(
                    "Failed to fetch departments:",
                    error
                );
            }
        }

        fetchDepartments();
    }, [organizationId]);

    async function handleCreateDepartment(e) {
        e.preventDefault();

        if (!name.trim()) return;

        try {
            const response = await api.post(
                `/organization/${organizationId}/departments`,
                {
                    name: name
                }
            );

            setDepartments([
                ...departments,
                response.data.department
            ]);

            setName("");
            setShowForm(false);

        } catch (error) {
            console.error(
                "Failed to create department:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to create department"
            );
        }
    }

    async function handleUpdateDepartment(departmentId) {
        if (!editName.trim()) return;

        try {
            const response = await api.put(
                `/organization/${organizationId}/departments/${departmentId}`,
                {
                    name: editName
                }
            );

            setDepartments(
                departments.map((department) =>
                    department.id === departmentId
                        ? response.data.department
                        : department
                )
            );

            setEditingId(null);
            setEditName("");

        } catch (error) {
            console.error(
                "Failed to update department:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to update department"
            );
        }
    }

    async function handleDeleteDepartment(departmentId) {
        try {
            await api.delete(
                `/organization/${organizationId}/departments/${departmentId}`
            );

            setDepartments(
                departments.filter(
                    (department) =>
                        department.id !== departmentId
                )
            );

            alert("Department deleted successfully");

        } catch (error) {
            console.error(
                "Failed to delete department:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to delete department"
            );
        }
    }

    return (
        <div>
            <h1>Departments</h1>

            <button onClick={() => setShowForm(true)}>
                Create Department
            </button>

            {showForm && (
                <form onSubmit={handleCreateDepartment}>
                    <input
                        type="text"
                        placeholder="Department name"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                    />

                    <button type="submit">
                        Create
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setShowForm(false);
                            setName("");
                        }}
                    >
                        Cancel
                    </button>
                </form>
            )}

            <div>
                <h2>Departments</h2>

                {departments.map((department) => (
                    <div key={department.id}>

                        {editingId === department.id ? (
                            <>
                                <input
                                    value={editName}
                                    onChange={(e) =>
                                        setEditName(e.target.value)
                                    }
                                />

                                <button
                                    onClick={() =>
                                        handleUpdateDepartment(
                                            department.id
                                        )
                                    }
                                >
                                    Save
                                </button>

                                <button
                                    onClick={() => {
                                        setEditingId(null);
                                        setEditName("");
                                    }}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <h3>{department.name}</h3>

                                <button
                                    onClick={() => {
                                        setEditingId(department.id);
                                        setEditName(
                                            department.name
                                        );
                                    }}
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() =>
                                        handleDeleteDepartment(
                                            department.id
                                        )
                                    }
                                >
                                    Delete
                                </button>
                            </>
                        )}

                    </div>
                ))}
            </div>
        </div>
    );
}

export default Departments;
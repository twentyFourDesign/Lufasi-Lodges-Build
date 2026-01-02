import { useState, useEffect } from "react";
import { BASE_URL } from "@/config";
import useAuthStore from "@/store/useAuthStore";
import AdminLayout from "@/components/admin/AdminLayout";

// Add Admin Modal
function AddAdminModal({ isOpen, onClose, onSuccess, userRole }) {
    const { token } = useAuthStore();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        role: "staff",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${BASE_URL}/auth/admin/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create user");
            }

            onSuccess();
            onClose();
            setFormData({ fullName: "", email: "", password: "", phone: "", role: "staff" });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Available roles based on current user's role
    const availableRoles = userRole === "admin"
        ? ["admin", "staff", "user"]
        : ["user"];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-[#333333]">Add Admin/Staff</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                        >
                            {availableRoles.map((role) => (
                                <option key={role} value={role}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Add User"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const { token, user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/auth/admin/users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch users");
            }

            const data = await response.json();
            setUsers(data.users || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm("Are you sure you want to remove this user?")) return;

        try {
            const response = await fetch(`${BASE_URL}/auth/admin/users/${userId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to delete user");
            }

            fetchUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-[#333333]">Settings</h1>
                    <button className="px-4 py-2 bg-[#333333] text-white rounded-lg flex items-center gap-2 hover:bg-[#444444]">
                        Additional Settings
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>

                {/* Admins Card */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                    <div className="p-4 md:p-5 flex justify-between items-center border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-[#333333]">Admins</h2>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 bg-[#333333] text-white rounded-lg flex items-center gap-2 hover:bg-[#444444] text-sm"
                        >
                            Add Admin
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008080]"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-red-500">{error}</div>
                    ) : (
                        <div className="overflow-x-auto p-4">
                            <table className="w-full text-sm">
                                {/* Dark Header - Table Design System */}
                                <thead>
                                    <tr className="bg-[#333333] text-white">
                                        <th className="py-3 px-4 text-left font-medium rounded-l-lg">Name</th>
                                        <th className="py-3 px-4 text-left font-medium">Role</th>
                                        <th className="py-3 px-4 text-left font-medium">Status</th>
                                        <th className="py-3 px-4 text-left font-medium"></th>
                                        <th className="py-3 px-4 text-left font-medium rounded-r-lg"></th>
                                    </tr>
                                </thead>
                                {/* Alternating Cyan Rows */}
                                <tbody>
                                    {users.map((u, index) => (
                                        <tr
                                            key={u.id}
                                            className={index % 2 === 1 ? "bg-[#00FFFF]/20" : ""}
                                        >
                                            <td className="py-3 px-4 text-[#333333]">{u.fullName}</td>
                                            <td className="py-3 px-4 text-gray-600 capitalize">{u.role}</td>
                                            <td className="py-3 px-4">
                                                <span className="text-green-600 font-medium">Active</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <button className="text-[#008080] hover:underline">Edit</button>
                                            </td>
                                            <td className="py-3 px-4">
                                                <button
                                                    onClick={() => handleDelete(u.id)}
                                                    className="text-red-500 hover:underline"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <AddAdminModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={fetchUsers}
                userRole={user?.role}
            />
        </AdminLayout>
    );
}

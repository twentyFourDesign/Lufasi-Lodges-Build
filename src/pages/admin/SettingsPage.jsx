import { useState, useEffect } from "react";
import { BASE_URL } from "@/config";
import useAuthStore from "@/store/useAuthStore";
import AdminLayout from "@/components/admin/AdminLayout";

export default function SettingsPage() {
    const { token, user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [saving, setSaving] = useState(false);
    const [newUser, setNewUser] = useState({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        role: "staff",
    });

    // School Holiday state
    const [holidays, setHolidays] = useState([]);
    const [showAddHolidayModal, setShowAddHolidayModal] = useState(false);
    const [showEditHolidayModal, setShowEditHolidayModal] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState(null);
    const [newHoliday, setNewHoliday] = useState({
        name: "",
        startDate: "",
        endDate: "",
    });

    // Default pod image upload state
    const [defaultPodImage, setDefaultPodImage] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [currentDefaultImage, setCurrentDefaultImage] = useState(`${BASE_URL}/uploads/pods/default-pod.png`);

    // Admin login background image upload state
    const [loginBgImage, setLoginBgImage] = useState(null);
    const [uploadingLoginBg, setUploadingLoginBg] = useState(false);
    const [currentLoginBg, setCurrentLoginBg] = useState(`${BASE_URL}/uploads/branding/admin-login-bg.png?t=${Date.now()}`);
    const [loginBgMissing, setLoginBgMissing] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchHolidays();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/auth/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setUsers(data.users || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async () => {
        setSaving(true);
        try {
            const response = await fetch(`${BASE_URL}/auth/admin/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newUser),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to create user");
            }
            await fetchUsers();
            setShowAddModal(false);
            setNewUser({ fullName: "", email: "", password: "", phone: "", role: "staff" });
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleEditUser = async () => {
        setSaving(true);
        try {
            const response = await fetch(`${BASE_URL}/auth/admin/users/${editingUser.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editingUser),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to update user");
            }
            await fetchUsers();
            setShowEditModal(false);
            setEditingUser(null);
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            const response = await fetch(`${BASE_URL}/auth/admin/users/${userId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to delete user");
            await fetchUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    const openEditModal = (user) => {
        setEditingUser({ ...user, password: "" });
        setShowEditModal(true);
    };

    // School Holiday Methods
    const fetchHolidays = async () => {
        try {
            const response = await fetch(`${BASE_URL}/config/holidays`);
            const data = await response.json();
            setHolidays(data || []);
        } catch (err) {
            console.error("Error fetching holidays:", err);
        }
    };

    const handleAddHoliday = async () => {
        setSaving(true);
        try {
            const response = await fetch(`${BASE_URL}/config/holidays`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newHoliday),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to create holiday");
            }
            await fetchHolidays();
            setShowAddHolidayModal(false);
            setNewHoliday({ name: "", startDate: "", endDate: "" });
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleEditHoliday = async () => {
        setSaving(true);
        try {
            const response = await fetch(`${BASE_URL}/config/holidays/${editingHoliday.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editingHoliday),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to update holiday");
            }
            await fetchHolidays();
            setShowEditHolidayModal(false);
            setEditingHoliday(null);
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteHoliday = async (holidayId) => {
        if (!confirm("Are you sure you want to delete this date range?")) return;
        try {
            const response = await fetch(`${BASE_URL}/config/holidays/${holidayId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to delete holiday");
            await fetchHolidays();
        } catch (err) {
            alert(err.message);
        }
    };

    const openEditHolidayModal = (holiday) => {
        setEditingHoliday(holiday);
        setShowEditHolidayModal(true);
    };

    // Handle admin login background upload
    const handleLoginBgUpload = async () => {
        if (!loginBgImage) {
            alert("Please select an image first");
            return;
        }

        setUploadingLoginBg(true);
        try {
            const formData = new FormData();
            formData.append("image", loginBgImage);

            const response = await fetch(`${BASE_URL}/uploads/admin-login-bg`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to upload image");
            }

            const data = await response.json();
            const url = data.imageUrl?.startsWith("http")
                ? data.imageUrl
                : `${BASE_URL}/uploads/branding/admin-login-bg.png`;
            setCurrentLoginBg(`${url}?t=${Date.now()}`);
            setLoginBgMissing(false);
            setLoginBgImage(null);
            alert("Admin login background updated successfully!");
        } catch (err) {
            alert("Upload failed: " + err.message);
        } finally {
            setUploadingLoginBg(false);
        }
    };

    // Handle default pod image upload
    const handleDefaultImageUpload = async () => {
        if (!defaultPodImage) {
            alert("Please select an image first");
            return;
        }

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append("image", defaultPodImage);

            const response = await fetch(`${BASE_URL}/uploads/default-pod`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to upload image");
            }

            const data = await response.json();
            setCurrentDefaultImage(`${data.imageUrl}?t=${Date.now()}`);
            setDefaultPodImage(null);
            alert("Default pod image updated successfully!");
        } catch (err) {
            alert("Upload failed: " + err.message);
        } finally {
            setUploadingImage(false);
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case "admin":
                return "bg-purple-100 text-purple-700";
            case "staff":
                return "bg-blue-100 text-blue-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008080]"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-[#333333]">Settings</h1>
                </div>

                {/* Default Pod Image Section */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-[#333333] mb-4">Default Pod Image</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        This image is used as the default for pods without images and in email templates.
                    </p>
                    <div className="flex items-start gap-6 flex-wrap">
                        {/* Current Image */}
                        <div className="flex-shrink-0">
                            <p className="text-xs font-medium text-gray-500 mb-2">Current Image</p>
                            <div className="w-48 h-32 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                                <img
                                    src={currentDefaultImage}
                                    alt="Current default pod"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = "/default-pod.png"; }}
                                />
                            </div>
                        </div>

                        {/* New Image Preview */}
                        <div className="flex-shrink-0">
                            <p className="text-xs font-medium text-gray-500 mb-2">New Image Preview</p>
                            <div className="w-48 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center">
                                {defaultPodImage ? (
                                    <img
                                        src={URL.createObjectURL(defaultPodImage)}
                                        alt="New image preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-center text-gray-400">
                                        <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-xs">No image selected</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upload Controls */}
                        <div className="flex-1 min-w-[200px]">
                            <p className="text-xs font-medium text-gray-500 mb-2">Upload New Image</p>
                            <div className="flex flex-col gap-3">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setDefaultPodImage(e.target.files?.[0] || null)}
                                    className="hidden"
                                    id="default-pod-input"
                                />
                                <label
                                    htmlFor="default-pod-input"
                                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    Choose Image
                                </label>
                                {defaultPodImage && (
                                    <p className="text-sm text-gray-600 truncate">{defaultPodImage.name}</p>
                                )}
                                <button
                                    onClick={handleDefaultImageUpload}
                                    disabled={!defaultPodImage || uploadingImage}
                                    className="px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploadingImage ? "Uploading..." : "Upload & Replace"}
                                </button>
                                {defaultPodImage && (
                                    <button
                                        onClick={() => setDefaultPodImage(null)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Admin Login Background Section */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-[#333333] mb-4">Admin Login Background</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        This image is used as the background on the admin login page.
                    </p>
                    <div className="flex items-start gap-6 flex-wrap">
                        {/* Current Image */}
                        <div className="flex-shrink-0">
                            <p className="text-xs font-medium text-gray-500 mb-2">Current Background</p>
                            <div className="w-48 h-32 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                                {loginBgMissing ? (
                                    <div className="w-full h-full flex items-center justify-center text-center text-gray-400 text-xs px-2">
                                        Using default fallback image
                                    </div>
                                ) : (
                                    <img
                                        src={currentLoginBg}
                                        alt="Current admin login background"
                                        className="w-full h-full object-cover"
                                        onError={() => setLoginBgMissing(true)}
                                    />
                                )}
                            </div>
                        </div>

                        {/* New Image Preview */}
                        <div className="flex-shrink-0">
                            <p className="text-xs font-medium text-gray-500 mb-2">New Image Preview</p>
                            <div className="w-48 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center">
                                {loginBgImage ? (
                                    <img
                                        src={URL.createObjectURL(loginBgImage)}
                                        alt="New background preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-center text-gray-400">
                                        <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-xs">No image selected</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upload Controls */}
                        <div className="flex-1 min-w-[200px]">
                            <p className="text-xs font-medium text-gray-500 mb-2">Upload New Background</p>
                            <div className="flex flex-col gap-3">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setLoginBgImage(e.target.files?.[0] || null)}
                                    className="hidden"
                                    id="admin-login-bg-input"
                                />
                                <label
                                    htmlFor="admin-login-bg-input"
                                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    Choose Image
                                </label>
                                {loginBgImage && (
                                    <p className="text-sm text-gray-600 truncate">{loginBgImage.name}</p>
                                )}
                                <button
                                    onClick={handleLoginBgUpload}
                                    disabled={!loginBgImage || uploadingLoginBg}
                                    className="px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploadingLoginBg ? "Uploading..." : "Upload & Replace"}
                                </button>
                                {loginBgImage && (
                                    <button
                                        onClick={() => setLoginBgImage(null)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Management Section */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-[#333333]">User Management</h2>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 bg-[#008080] text-white rounded-lg flex items-center gap-2 hover:bg-[#006666]"
                        >
                            Add Admin +
                        </button>
                    </div>

                    {/* Users Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[#333333] text-white">
                                    <th className="text-left px-6 py-3 font-medium">Name</th>
                                    <th className="text-left px-6 py-3 font-medium">Email</th>
                                    <th className="text-left px-6 py-3 font-medium">Phone</th>
                                    <th className="text-left px-6 py-3 font-medium">Role</th>
                                    <th className="text-left px-6 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u, index) => (
                                    <tr
                                        key={u.id}
                                        className={index % 2 === 0 ? "bg-white" : "bg-[#00FFFF]/20"}
                                    >
                                        <td className="px-6 py-4">{u.fullName}</td>
                                        <td className="px-6 py-4">{u.email}</td>
                                        <td className="px-6 py-4">{u.phone || "-"}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(u.role)}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => openEditModal(u)}
                                                    className="text-[#008080] hover:underline"
                                                >
                                                    Edit
                                                </button>
                                                {u.id !== user?.id && (
                                                    <button
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        className="text-red-500 hover:underline"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Children-Allowed Dates Section */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold text-[#333333]">Children-Allowed Dates</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Date ranges when guests can book with children aged 0-12 without a full camp takeover (e.g. school holidays, family weekends).
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAddHolidayModal(true)}
                            className="px-4 py-2 bg-[#008080] text-white rounded-lg flex items-center gap-2 hover:bg-[#006666]"
                        >
                            Add Date Range +
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[#333333] text-white">
                                    <th className="text-left px-6 py-3 font-medium">Name</th>
                                    <th className="text-left px-6 py-3 font-medium">Start Date</th>
                                    <th className="text-left px-6 py-3 font-medium">End Date</th>
                                    <th className="text-left px-6 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {holidays.map((h, index) => (
                                    <tr
                                        key={h.id}
                                        className={index % 2 === 0 ? "bg-white" : "bg-[#00FFFF]/20"}
                                    >
                                        <td className="px-6 py-4">{h.name}</td>
                                        <td className="px-6 py-4">{h.startDate}</td>
                                        <td className="px-6 py-4">{h.endDate}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => openEditHolidayModal(h)}
                                                    className="text-[#008080] hover:underline"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteHoliday(h.id)}
                                                    className="text-red-500 hover:underline"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {holidays.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            No children-allowed date ranges configured
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals */}

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-[#333333]">Add New User</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    value={newUser.fullName}
                                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={newUser.phone}
                                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="staff">Staff</option>
                                    <option value="user">User</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddUser}
                                disabled={saving || !newUser.fullName || !newUser.email || !newUser.password}
                                className="px-6 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] disabled:opacity-50"
                            >
                                {saving ? "Adding..." : "Add User"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-[#333333]">Edit User</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    value={editingUser.fullName}
                                    onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    value={editingUser.email}
                                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep current)</label>
                                <input
                                    type="password"
                                    value={editingUser.password || ""}
                                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={editingUser.phone || ""}
                                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={editingUser.role}
                                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="staff">Staff</option>
                                    <option value="user">User</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditUser}
                                disabled={saving || !editingUser.fullName || !editingUser.email}
                                className="px-6 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Holiday Modal */}
            {showAddHolidayModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-[#333333]">Add Children-Allowed Date Range</h2>
                            <button onClick={() => setShowAddHolidayModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Summer Holiday, Easter Break"
                                    value={newHoliday.name}
                                    onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                                <input
                                    type="date"
                                    value={newHoliday.startDate}
                                    onChange={(e) => setNewHoliday({ ...newHoliday, startDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                                <input
                                    type="date"
                                    value={newHoliday.endDate}
                                    onChange={(e) => setNewHoliday({ ...newHoliday, endDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setShowAddHolidayModal(false)}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddHoliday}
                                disabled={saving || !newHoliday.name || !newHoliday.startDate || !newHoliday.endDate}
                                className="px-6 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Add Date Range"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Holiday Modal */}
            {showEditHolidayModal && editingHoliday && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-[#333333]">Edit Children-Allowed Date Range</h2>
                            <button onClick={() => setShowEditHolidayModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={editingHoliday.name}
                                    onChange={(e) => setEditingHoliday({ ...editingHoliday, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                                <input
                                    type="date"
                                    value={editingHoliday.startDate}
                                    onChange={(e) => setEditingHoliday({ ...editingHoliday, startDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                                <input
                                    type="date"
                                    value={editingHoliday.endDate}
                                    onChange={(e) => setEditingHoliday({ ...editingHoliday, endDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setShowEditHolidayModal(false)}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditHoliday}
                                disabled={saving || !editingHoliday.name || !editingHoliday.startDate || !editingHoliday.endDate}
                                className="px-6 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

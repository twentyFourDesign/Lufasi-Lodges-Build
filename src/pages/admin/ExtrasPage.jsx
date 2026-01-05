import { useState, useEffect } from "react";
import { BASE_URL } from "@/config";
import useAuthStore from "@/store/useAuthStore";
import AdminLayout from "@/components/admin/AdminLayout";

const ITEMS_PER_PAGE = 10;

export default function ExtrasPage() {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [extras, setExtras] = useState([]);
    const [filteredExtras, setFilteredExtras] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilter, setShowFilter] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingExtra, setEditingExtra] = useState(null);
    const [saving, setSaving] = useState(false);
    const [filters, setFilters] = useState({ search: "", status: "" });

    const [form, setForm] = useState({
        name: "",
        description: "",
        price: 0,
        category: "",
        isActive: true,
    });

    useEffect(() => {
        fetchExtras();
    }, []);

    useEffect(() => {
        let result = [...extras];
        if (filters.search) {
            const search = filters.search.toLowerCase();
            result = result.filter(
                (e) =>
                    e.name.toLowerCase().includes(search) ||
                    (e.description || "").toLowerCase().includes(search)
            );
        }
        if (filters.status === "active") {
            result = result.filter((e) => e.isActive !== false);
        } else if (filters.status === "inactive") {
            result = result.filter((e) => e.isActive === false);
        }
        setFilteredExtras(result);
        setCurrentPage(1);
    }, [extras, filters]);

    const fetchExtras = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/extras`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setExtras(data.extras || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(filteredExtras.length / ITEMS_PER_PAGE);
    const paginatedExtras = filteredExtras.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const handleAdd = () => {
        setEditingExtra(null);
        setForm({ name: "", description: "", price: 0, category: "", isActive: true });
        setShowAddModal(true);
    };

    const handleEdit = (extra) => {
        setEditingExtra(extra);
        setForm({
            name: extra.name,
            description: extra.description || "",
            price: parseFloat(extra.price) || 0,
            category: extra.category || "",
            isActive: extra.isActive !== false,
        });
        setShowAddModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const url = editingExtra
                ? `${BASE_URL}/extras/${editingExtra.id}`
                : `${BASE_URL}/extras`;
            const method = editingExtra ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            if (!response.ok) throw new Error("Failed to save extra");

            await fetchExtras();
            setShowAddModal(false);
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (extra) => {
        if (!confirm(`Are you sure you want to remove "${extra.name}"?`)) return;
        try {
            await fetch(`${BASE_URL}/extras/${extra.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            await fetchExtras();
        } catch (err) {
            alert(err.message);
        }
    };

    const toggleStatus = async (extra) => {
        try {
            await fetch(`${BASE_URL}/extras/${extra.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ isActive: !extra.isActive }),
            });
            await fetchExtras();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-[#333333]">Extras Management</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilter(!showFilter)}
                            className={`px-4 py-2 border rounded-lg flex items-center gap-2 text-[#333333] ${showFilter ? "bg-gray-100 border-gray-400" : "border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Filter
                        </button>
                    </div>
                </div>

                {/* Filter Panel */}
                {showFilter && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                            />
                        </div>
                        <div className="min-w-[150px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                            >
                                <option value="">All</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <button
                            onClick={() => setFilters({ search: "", status: "" })}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Clear
                        </button>
                    </div>
                )}

                {/* Extras Card */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                    <div className="p-4 md:p-5 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-[#333333]">Extras</h2>
                        <button
                            onClick={handleAdd}
                            className="px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666]"
                        >
                            Add Extra +
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008080]"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-red-500">{error}</div>
                    ) : filteredExtras.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No extras found</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto p-4">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-[#333333] text-white">
                                            <th className="py-3 px-4 text-left font-medium rounded-l-lg">Name</th>
                                            <th className="py-3 px-4 text-left font-medium">Description</th>
                                            <th className="py-3 px-4 text-left font-medium">Price</th>
                                            <th className="py-3 px-4 text-left font-medium">Status</th>
                                            <th className="py-3 px-4 text-left font-medium" colSpan={3}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedExtras.map((extra, index) => (
                                            <tr key={extra.id} className={index % 2 === 1 ? "bg-[#00FFFF]/20" : ""}>
                                                <td className="py-3 px-4 text-[#333333] font-medium">{extra.name}</td>
                                                <td className="py-3 px-4 text-gray-600">{extra.description || "-"}</td>
                                                <td className="py-3 px-4 text-[#333333]">{formatCurrency(extra.price)}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`font-medium ${extra.isActive !== false ? "text-green-600" : "text-red-600"}`}>
                                                        {extra.isActive !== false ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-2">
                                                    <button onClick={() => toggleStatus(extra)} className="text-[#008080] hover:underline">
                                                        {extra.isActive !== false ? "Deactivate" : "Activate"}
                                                    </button>
                                                </td>
                                                <td className="py-3 px-2">
                                                    <button onClick={() => handleEdit(extra)} className="text-[#008080] hover:underline">Edit</button>
                                                </td>
                                                <td className="py-3 px-2">
                                                    <button onClick={() => handleDelete(extra)} className="text-red-500 hover:underline">Remove</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages > 1 && (
                                <div className="p-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-[#333333]">
                                {editingExtra ? "Edit Extra" : "Add Extra"}
                            </h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
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
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                <input
                                    type="number"
                                    value={form.price}
                                    onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <input
                                    type="text"
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                    placeholder="e.g. Food, Activities, Services"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={form.isActive}
                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                    className="w-4 h-4 text-[#008080] focus:ring-[#008080] rounded"
                                />
                                <label className="text-sm text-gray-700">Active</label>
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
                                onClick={handleSave}
                                disabled={saving || !form.name}
                                className="px-6 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

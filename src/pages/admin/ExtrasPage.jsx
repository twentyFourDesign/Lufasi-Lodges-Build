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
    const [categoryMetaModal, setCategoryMetaModal] = useState(null);
    const [savingCategoryMeta, setSavingCategoryMeta] = useState(false);
    const [blockedDatesModal, setBlockedDatesModal] = useState(null);
    const [blockedDatesList, setBlockedDatesList] = useState([]);
    const [loadingBlockedDates, setLoadingBlockedDates] = useState(false);
    const [savingBlockedDate, setSavingBlockedDate] = useState(false);
    const [blockForm, setBlockForm] = useState({
        date: "",
        endDate: "",
        reason: "",
    });

    const [form, setForm] = useState({
        name: "",
        description: "",
        price: 0,
        category: "",
        isActive: true,
        requiresGuestDetails: false,
        requiresDateSelection: false,
        detailsPrompt: "",
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
        setForm({ name: "", description: "", price: 0, category: "", isActive: true, requiresGuestDetails: false, requiresDateSelection: false, detailsPrompt: "" });
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
            requiresGuestDetails: !!extra.requiresGuestDetails,
            requiresDateSelection: !!extra.requiresDateSelection,
            detailsPrompt: extra.detailsPrompt || "",
        });
        setShowAddModal(true);
    };

    // Per-extra image updates are now managed via categories instead.

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

    const handleCategoryImageChange = async (categoryName, event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            const encodedCategory = encodeURIComponent(categoryName);
            const response = await fetch(
                `${BASE_URL}/extras/category/${encodedCategory}/image`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                },
            );

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || "Failed to upload category image");
            }

            await fetchExtras();
        } catch (err) {
            alert(err.message);
        } finally {
            event.target.value = "";
        }
    };

    const handleCategoryImageRemove = async (categoryName) => {
        try {
            const encodedCategory = encodeURIComponent(categoryName);
            const response = await fetch(
                `${BASE_URL}/extras/category/${encodedCategory}/remove-image`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || "Failed to remove category image");
            }

            await fetchExtras();
        } catch (err) {
            alert(err.message);
        }
    };

    const categories = extras.reduce((acc, extra) => {
        const category = extra.category || "uncategorized";
        if (!acc[category]) {
            acc[category] = {
                name: category,
                imageUrl: extra.imageUrl || null,
                categoryTitle: extra.categoryTitle || null,
                categorySubtitle: extra.categorySubtitle || null,
                count: 1,
            };
        } else {
            acc[category].count += 1;
            if (!acc[category].imageUrl && extra.imageUrl) {
                acc[category].imageUrl = extra.imageUrl;
            }
            if (!acc[category].categoryTitle && extra.categoryTitle) {
                acc[category].categoryTitle = extra.categoryTitle;
            }
            if (!acc[category].categorySubtitle && extra.categorySubtitle) {
                acc[category].categorySubtitle = extra.categorySubtitle;
            }
        }
        return acc;
    }, {});

    const categoryList = Object.values(categories);

    const openCategoryMetaModal = (cat) => {
        setCategoryMetaModal({
            name: cat.name,
            categoryTitle: cat.categoryTitle || "",
            categorySubtitle: cat.categorySubtitle || "",
        });
    };

    const openBlockedDatesModal = (config) => {
        setBlockedDatesModal(config);
        setBlockForm({ date: "", endDate: "", reason: "" });
        fetchBlockedDatesForModal(config);
    };

    const fetchBlockedDatesForModal = async (config) => {
        if (!config) return;
        setLoadingBlockedDates(true);
        try {
            const params = new URLSearchParams();
            if (config.extraId) params.set("extraId", config.extraId);
            if (config.category) params.set("category", config.category);
            const response = await fetch(
                `${BASE_URL}/extras/blocked-dates/manage?${params.toString()}`,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to load blocked dates");
            setBlockedDatesList(data.blockedDates || []);
        } catch (err) {
            alert(err.message);
            setBlockedDatesList([]);
        } finally {
            setLoadingBlockedDates(false);
        }
    };

    const handleAddBlockedDate = async () => {
        if (!blockedDatesModal || !blockForm.date) {
            alert("Please select a date to block.");
            return;
        }
        setSavingBlockedDate(true);
        try {
            const body = {
                date: blockForm.date,
                reason: blockForm.reason || undefined,
            };
            if (blockForm.endDate) body.endDate = blockForm.endDate;
            if (blockedDatesModal.extraId) body.extraId = blockedDatesModal.extraId;
            if (blockedDatesModal.category) body.category = blockedDatesModal.category;

            const response = await fetch(`${BASE_URL}/extras/blocked-dates`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to block date");
            setBlockForm({ date: "", endDate: "", reason: "" });
            await fetchBlockedDatesForModal(blockedDatesModal);
        } catch (err) {
            alert(err.message);
        } finally {
            setSavingBlockedDate(false);
        }
    };

    const handleRemoveBlockedDate = async (id) => {
        if (!confirm("Remove this blocked date?")) return;
        try {
            const response = await fetch(`${BASE_URL}/extras/blocked-dates/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || "Failed to remove blocked date");
            }
            await fetchBlockedDatesForModal(blockedDatesModal);
        } catch (err) {
            alert(err.message);
        }
    };

    const saveCategoryMeta = async () => {
        if (!categoryMetaModal) return;
        setSavingCategoryMeta(true);
        try {
            const encoded = encodeURIComponent(categoryMetaModal.name);
            const response = await fetch(
                `${BASE_URL}/extras/category/${encoded}/meta`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        categoryTitle: categoryMetaModal.categoryTitle,
                        categorySubtitle: categoryMetaModal.categorySubtitle,
                    }),
                },
            );
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || "Failed to save category text");
            }
            await fetchExtras();
            setCategoryMetaModal(null);
        } catch (err) {
            alert(err.message);
        } finally {
            setSavingCategoryMeta(false);
        }
    };

    const resetCategoryMetaToDefaults = async () => {
        if (!categoryMetaModal) return;
        if (
            !confirm(
                "Clear custom heading and subheading for this category? The booking page will use the default title and “Premium … options” line again.",
            )
        ) {
            return;
        }
        setSavingCategoryMeta(true);
        try {
            const encoded = encodeURIComponent(categoryMetaModal.name);
            const response = await fetch(
                `${BASE_URL}/extras/category/${encoded}/meta`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        categoryTitle: "",
                        categorySubtitle: "",
                    }),
                },
            );
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || "Failed to reset category text");
            }
            await fetchExtras();
            setCategoryMetaModal(null);
        } catch (err) {
            alert(err.message);
        } finally {
            setSavingCategoryMeta(false);
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
                                            <th className="py-3 px-4 text-left font-medium">Image</th>
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
                                                <td className="py-3 px-4">
                                                    {extra.imageUrl ? (
                                                        <img
                                                            src={extra.imageUrl}
                                                            alt={extra.name}
                                                            className="w-12 h-12 object-cover rounded-md border border-gray-200"
                                                        />
                                                    ) : (
                                                        <span className="text-xs text-gray-400">No image</span>
                                                    )}
                                                </td>
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
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openBlockedDatesModal({
                                                                extraId: extra.id,
                                                                label: extra.name,
                                                            })
                                                        }
                                                        className="text-[#008080] hover:underline whitespace-nowrap"
                                                    >
                                                        Block dates
                                                    </button>
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

                {/* Categories Card */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                    <div className="p-4 md:p-5 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-[#333333]">Extra Categories</h2>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008080]"></div>
                        </div>
                    ) : categoryList.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No categories found</div>
                    ) : (
                        <div className="overflow-x-auto p-4">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-[#333333] text-white">
                                        <th className="py-3 px-4 text-left font-medium rounded-l-lg">Category</th>
                                        <th className="py-3 px-4 text-left font-medium">Heading / subheading</th>
                                        <th className="py-3 px-4 text-left font-medium">Image</th>
                                        <th className="py-3 px-4 text-left font-medium">Extras Count</th>
                                        <th className="py-3 px-4 text-left font-medium rounded-r-lg">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categoryList.map((cat) => (
                                        <tr key={cat.name}>
                                            <td className="py-3 px-4 text-[#333333] font-medium">
                                                {cat.name}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 max-w-xs">
                                                <div className="text-xs font-semibold text-[#333333]">
                                                    {cat.categoryTitle?.trim()
                                                        ? cat.categoryTitle
                                                        : `${cat.name.charAt(0).toUpperCase()}${cat.name.slice(1)} (default)`}
                                                </div>
                                                <div className="text-xs mt-1 line-clamp-2">
                                                    {cat.categorySubtitle?.trim()
                                                        ? cat.categorySubtitle
                                                        : `Premium ${cat.name} options for your stay (default)`}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                {cat.imageUrl ? (
                                                    <img
                                                        src={cat.imageUrl}
                                                        alt={cat.name}
                                                        className="w-12 h-12 object-cover rounded-md border border-gray-200"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-gray-400">No image</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-[#333333]">
                                                {cat.count}
                                            </td>
                                            <td className="py-3 px-4 space-x-3 flex flex-wrap gap-y-1">
                                                <button
                                                    type="button"
                                                    className="text-[#008080] hover:underline text-sm"
                                                    onClick={() =>
                                                        openBlockedDatesModal({
                                                            category: cat.name,
                                                            label: `${cat.name} (all extras)`,
                                                        })
                                                    }
                                                >
                                                    Block dates
                                                </button>
                                                <button
                                                    type="button"
                                                    className="text-[#008080] hover:underline text-sm"
                                                    onClick={() => openCategoryMetaModal(cat)}
                                                >
                                                    Edit text
                                                </button>
                                                <label className="text-[#008080] hover:underline cursor-pointer">
                                                    Update Image
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) =>
                                                            handleCategoryImageChange(cat.name, e)
                                                        }
                                                    />
                                                </label>
                                                <button
                                                    type="button"
                                                    className="text-red-500 hover:underline text-sm"
                                                    onClick={() => handleCategoryImageRemove(cat.name)}
                                                >
                                                    Remove Image
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

            {categoryMetaModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-[#333333]">
                                Category: {categoryMetaModal.name}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setCategoryMetaModal(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-xs text-gray-500">
                                This heading and subheading appear on the guest “Enhance Your Experience” step for this category. They are saved on all extras in the category.
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Heading (title)</label>
                                <input
                                    type="text"
                                    maxLength={200}
                                    value={categoryMetaModal.categoryTitle}
                                    onChange={(e) =>
                                        setCategoryMetaModal({
                                            ...categoryMetaModal,
                                            categoryTitle: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                    placeholder="e.g. Lakeside Sunset Picnic"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subheading (subtitle)</label>
                                <textarea
                                    rows={3}
                                    value={categoryMetaModal.categorySubtitle}
                                    onChange={(e) =>
                                        setCategoryMetaModal({
                                            ...categoryMetaModal,
                                            categorySubtitle: e.target.value,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] resize-none"
                                    placeholder="Short line under the heading on the booking page"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex flex-wrap justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setCategoryMetaModal(null)}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={resetCategoryMetaToDefaults}
                                disabled={savingCategoryMeta}
                                className="px-6 py-2 border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Use defaults
                            </button>
                            <button
                                type="button"
                                onClick={saveCategoryMeta}
                                disabled={savingCategoryMeta}
                                className="px-6 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] disabled:opacity-50"
                            >
                                {savingCategoryMeta ? "Saving…" : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                    placeholder="Short info shown when guests expand this extra (not a text box)."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Read-only info for guests. To collect a typed message (e.g. Flower Petals), use “Collect guest details” below.
                                </p>
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
                            <div className="flex items-start gap-2 pt-1 border-t border-gray-100">
                                <input
                                    type="checkbox"
                                    id="requiresGuestDetails"
                                    checked={form.requiresGuestDetails}
                                    onChange={(e) =>
                                        setForm({ ...form, requiresGuestDetails: e.target.checked })
                                    }
                                    className="w-4 h-4 mt-1 text-[#008080] focus:ring-[#008080] rounded"
                                />
                                <div>
                                    <label htmlFor="requiresGuestDetails" className="text-sm text-gray-700 font-medium">
                                        Show optional message box when selected
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Guests can type a note if they want (not required). Flower Petals always shows this box automatically.
                                    </p>
                                </div>
                            </div>
                            {form.requiresGuestDetails && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Details box prompt
                                    </label>
                                    <textarea
                                        value={form.detailsPrompt}
                                        onChange={(e) =>
                                            setForm({ ...form, detailsPrompt: e.target.value })
                                        }
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] resize-none"
                                        placeholder="e.g. Describe how you'd like the flower petals arranged..."
                                    />
                                </div>
                            )}
                            <div className="flex items-start gap-2 pt-1 border-t border-gray-100">
                                <input
                                    type="checkbox"
                                    id="requiresDateSelection"
                                    checked={form.requiresDateSelection}
                                    onChange={(e) =>
                                        setForm({ ...form, requiresDateSelection: e.target.checked })
                                    }
                                    className="w-4 h-4 mt-1 text-[#008080] focus:ring-[#008080] rounded"
                                />
                                <div>
                                    <label htmlFor="requiresDateSelection" className="text-sm text-gray-700 font-medium">
                                        Require date selection when selected
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Guests must pick which night(s) of their stay the extra applies to. Use for massages and similar services. Block unavailable dates via “Block dates”.
                                    </p>
                                </div>
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

            {blockedDatesModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-semibold text-[#333333]">
                                    Block unavailable dates
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {blockedDatesModal.label}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setBlockedDatesModal(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <p className="text-xs text-gray-500">
                                Block dates when this service is unavailable (e.g. masseuse off). Guests cannot select these nights when booking this extra.
                                {blockedDatesModal.category && (
                                    <> Applies to every extra in the <strong>{blockedDatesModal.category}</strong> category.</>
                                )}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start date *</label>
                                    <input
                                        type="date"
                                        value={blockForm.date}
                                        onChange={(e) => setBlockForm({ ...blockForm, date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End date (optional)</label>
                                    <input
                                        type="date"
                                        value={blockForm.endDate}
                                        onChange={(e) => setBlockForm({ ...blockForm, endDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                                <input
                                    type="text"
                                    value={blockForm.reason}
                                    onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                                    placeholder="e.g. Masseuse unavailable"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleAddBlockedDate}
                                disabled={savingBlockedDate || !blockForm.date}
                                className="w-full py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] disabled:opacity-50"
                            >
                                {savingBlockedDate ? "Saving..." : "Add blocked date(s)"}
                            </button>

                            <div className="border-t border-gray-100 pt-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Currently blocked</h3>
                                {loadingBlockedDates ? (
                                    <div className="text-sm text-gray-500 py-4 text-center">Loading...</div>
                                ) : blockedDatesList.length === 0 ? (
                                    <div className="text-sm text-gray-500 py-4 text-center">No blocked dates yet.</div>
                                ) : (
                                    <ul className="space-y-2 max-h-48 overflow-y-auto">
                                        {blockedDatesList.map((row) => (
                                            <li
                                                key={row.id}
                                                className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2"
                                            >
                                                <div>
                                                    <span className="font-medium text-gray-800">{row.date}</span>
                                                    {row.reason && (
                                                        <span className="text-gray-500 ml-2">— {row.reason}</span>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveBlockedDate(row.id)}
                                                    className="text-red-500 hover:underline text-xs"
                                                >
                                                    Remove
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

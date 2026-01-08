import { useState, useEffect } from "react";
import { BASE_URL } from "@/config";
import useAuthStore from "@/store/useAuthStore";
import AdminLayout from "@/components/admin/AdminLayout";

export default function MealsPage() {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [meals, setMeals] = useState([]);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        boardType: "",
        title: "",
        subtitle: "",
        items: "",
        price: 0,
        isActive: true,
    });

    useEffect(() => {
        fetchMeals();
    }, []);

    const fetchMeals = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/meal-plans`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setMeals(data.mealPlans || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const handleAdd = () => {
        setEditingMeal(null);
        setForm({
            boardType: "",
            title: "",
            subtitle: "",
            items: "",
            price: 0,
            isActive: true,
        });
        setShowAddModal(true);
    };

    const handleEdit = (meal) => {
        setEditingMeal(meal);
        setForm({
            boardType: meal.boardType || "",
            title: meal.title || "",
            subtitle: meal.subtitle || "",
            items: Array.isArray(meal.items) ? meal.items.join("\n") : "",
            price: parseFloat(meal.price) || 0,
            isActive: meal.isActive !== false,
        });
        setShowAddModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const url = editingMeal
                ? `${BASE_URL}/meal-plans/${editingMeal.id}`
                : `${BASE_URL}/meal-plans`;
            const method = editingMeal ? "PUT" : "POST";

            // Convert items string to array
            const itemsArray = form.items
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean);

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...form,
                    items: itemsArray,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to save meal plan");
            }

            await fetchMeals();
            setShowAddModal(false);
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (meal) => {
        if (!confirm(`Are you sure you want to delete "${meal.title}"?`)) return;
        try {
            await fetch(`${BASE_URL}/meal-plans/${meal.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            await fetchMeals();
        } catch (err) {
            alert(err.message);
        }
    };

    const toggleStatus = async (meal) => {
        try {
            await fetch(`${BASE_URL}/meal-plans/${meal.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ isActive: !meal.isActive }),
            });
            await fetchMeals();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-[#333333]">Meals Management</h1>
                    {/* Add Meal button removed */}
                </div>

                {/* Meals Card */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                    <div className="p-4 md:p-5 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-[#333333]">Meal Plans</h2>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008080]"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-red-500">{error}</div>
                    ) : meals.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No meal plans found</div>
                    ) : (
                        <div className="overflow-x-auto p-4">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-[#333333] text-white">
                                        <th className="py-3 px-4 text-left font-medium rounded-l-lg">Board Type</th>
                                        <th className="py-3 px-4 text-left font-medium">Title</th>
                                        <th className="py-3 px-4 text-left font-medium">Items</th>
                                        <th className="py-3 px-4 text-left font-medium">Price/Person/Night</th>
                                        <th className="py-3 px-4 text-left font-medium">Status</th>
                                        <th className="py-3 px-4 text-left font-medium rounded-r-lg" colSpan={2}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {meals.map((meal, index) => (
                                        <tr key={meal.id} className={index % 2 === 1 ? "bg-[#00FFFF]/20" : ""}>
                                            <td className="py-3 px-4 text-[#333333] font-medium capitalize">
                                                {meal.boardType?.replace(/([A-Z])/g, " $1").trim() || "-"}
                                            </td>
                                            <td className="py-3 px-4 text-[#333333]">{meal.title}</td>
                                            <td className="py-3 px-4 text-gray-600">
                                                {Array.isArray(meal.items) ? meal.items.slice(0, 2).join(", ") : "-"}
                                                {Array.isArray(meal.items) && meal.items.length > 2 && ` +${meal.items.length - 2} more`}
                                            </td>
                                            <td className="py-3 px-4 text-[#333333] font-medium">{formatCurrency(meal.price)}</td>
                                            <td className="py-3 px-4">
                                                <span className={`font-medium ${meal.isActive !== false ? "text-green-600" : "text-red-600"}`}>
                                                    {meal.isActive !== false ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2">
                                                <button onClick={() => toggleStatus(meal)} className="text-[#008080] hover:underline">
                                                    {meal.isActive !== false ? "Deactivate" : "Activate"}
                                                </button>
                                            </td>
                                            <td className="py-3 px-2">
                                                <button onClick={() => handleEdit(meal)} className="text-[#008080] hover:underline">Edit</button>
                                            </td>
                                            {/* Delete removed */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-lg">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-[#333333]">
                                {editingMeal ? "Edit Meal Plan" : "Add Meal Plan"}
                            </h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Board Type *</label>
                                <select
                                    value={form.boardType}
                                    onChange={(e) => setForm({ ...form, boardType: e.target.value })}
                                    disabled={!!editingMeal}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] disabled:bg-gray-100"
                                >
                                    <option value="">Select Board Type</option>
                                    <option value="fullBoard">Full Board</option>
                                    <option value="halfBoard">Half Board</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                    placeholder="e.g. Full Board Package"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                                <input
                                    type="text"
                                    value={form.subtitle}
                                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                    placeholder="Brief description"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Items (one per line)</label>
                                <textarea
                                    value={form.items}
                                    onChange={(e) => setForm({ ...form, items: e.target.value })}
                                    rows={5}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] resize-none"
                                    placeholder="Breakfast&#10;Lunch&#10;Dinner"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price per person/night</label>
                                <input
                                    type="number"
                                    value={form.price}
                                    onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
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
                                disabled={saving || !form.boardType || !form.title}
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

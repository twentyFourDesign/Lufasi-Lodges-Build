import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BASE_URL } from "@/config";
import useAuthStore from "@/store/useAuthStore";
import AdminLayout from "@/components/admin/AdminLayout";

export default function PricingPage() {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [meals, setMeals] = useState([]);
    const [error, setError] = useState(null);
    const [pricingConfig, setPricingConfig] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState(null);

    useEffect(() => {
        fetchMeals();
        fetchPricingConfig();
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

    const fetchPricingConfig = async () => {
        try {
            const response = await fetch(`${BASE_URL}/config/pricing`);
            if (!response.ok) {
                return;
            }
            const data = await response.json();
            setPricingConfig({
                base_price_per_pod: data.base_price_per_pod,
                extra_guest_fee: data.extra_guest_fee,
                max_guests_per_pod: data.max_guests_per_pod,
                min_guests_per_pod: data.min_guests_per_pod,
                total_pods_available: data.total_pods_available,
                twelve_guest_discount_percent: data.twelve_guest_discount_percent ?? 10,
                currency: data.currency,
            });
        } catch (err) {
        }
    };

    const handleConfigChange = (field, value) => {
        setPricingConfig((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSaveConfig = async () => {
        if (!pricingConfig) return;
        setSaving(true);
        setSaveMessage(null);
        try {
            const response = await fetch(`${BASE_URL}/config/pricing`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    base_price_per_pod: Number(pricingConfig.base_price_per_pod),
                    extra_guest_fee: Number(pricingConfig.extra_guest_fee),
                    max_guests_per_pod: Number(pricingConfig.max_guests_per_pod),
                    min_guests_per_pod: Number(pricingConfig.min_guests_per_pod),
                    total_pods_available: Number(pricingConfig.total_pods_available),
                    twelve_guest_discount_percent: Number(
                        pricingConfig.twelve_guest_discount_percent ?? 10,
                    ),
                    currency: pricingConfig.currency || "NGN",
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to save pricing configuration");
            }

            const data = await response.json();
            setPricingConfig({
                base_price_per_pod: data.base_price_per_pod,
                extra_guest_fee: data.extra_guest_fee,
                max_guests_per_pod: data.max_guests_per_pod,
                min_guests_per_pod: data.min_guests_per_pod,
                total_pods_available: data.total_pods_available,
                twelve_guest_discount_percent: data.twelve_guest_discount_percent ?? 10,
                currency: data.currency,
            });
            setSaveMessage({ type: "success", text: "Pricing configuration updated successfully." });
        } catch (err) {
            setSaveMessage({ type: "error", text: err.message || "Failed to update pricing configuration." });
        } finally {
            setSaving(false);
            setTimeout(() => setSaveMessage(null), 4000);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-[#333333]">Pricing & Configuration</h1>
                </div>

                {saveMessage && (
                    <div
                        className={`p-3 rounded-lg text-sm ${
                            saveMessage.type === "success"
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                        }`}
                    >
                        {saveMessage.text}
                    </div>
                )}

                <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                    <div className="p-4 md:p-5 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-[#333333]">Global Booking Configuration</h2>
                    </div>
                    <div className="p-4 md:p-5">
                        {pricingConfig ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Base Price Per Pod (Per Night)
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                        value={pricingConfig.base_price_per_pod}
                                        onChange={(e) =>
                                            handleConfigChange("base_price_per_pod", e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Extra Guest Fee (Per Night)
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                        value={pricingConfig.extra_guest_fee}
                                        onChange={(e) =>
                                            handleConfigChange("extra_guest_fee", e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Max Guests Per Pod
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                        value={pricingConfig.max_guests_per_pod}
                                        onChange={(e) =>
                                            handleConfigChange("max_guests_per_pod", e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Min Guests Per Booking
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                        value={pricingConfig.min_guests_per_pod}
                                        onChange={(e) =>
                                            handleConfigChange("min_guests_per_pod", e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Total Pods Available
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                        value={pricingConfig.total_pods_available}
                                        onChange={(e) =>
                                            handleConfigChange("total_pods_available", e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        12 Guests Discount (% of base pods cost)
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                        value={pricingConfig.twelve_guest_discount_percent}
                                        onChange={(e) =>
                                            handleConfigChange(
                                                "twelve_guest_discount_percent",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Currency
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                        value={pricingConfig.currency}
                                        onChange={(e) =>
                                            handleConfigChange("currency", e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">
                                Loading pricing configuration...
                            </div>
                        )}
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleSaveConfig}
                                disabled={saving || !pricingConfig}
                                className="px-4 py-2 bg-[#008080] text-white rounded-lg font-medium hover:bg-[#006666] disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving && (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                )}
                                Save Configuration
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        to="/admin/pods"
                        className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 hover:border-[#008080] transition-colors"
                    >
                        <h3 className="font-semibold text-[#333333]">Pod Pricing</h3>
                        <p className="text-sm text-gray-500 mt-1">Manage pod rates and settings</p>
                    </Link>
                    <Link
                        to="/admin/meals"
                        className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 hover:border-[#008080] transition-colors"
                    >
                        <h3 className="font-semibold text-[#333333]">Meal Plans</h3>
                        <p className="text-sm text-gray-500 mt-1">Configure meal plan pricing</p>
                    </Link>
                    <Link
                        to="/admin/extras"
                        className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 hover:border-[#008080] transition-colors"
                    >
                        <h3 className="font-semibold text-[#333333]">Extras</h3>
                        <p className="text-sm text-gray-500 mt-1">Manage add-on services</p>
                    </Link>
                </div>

                {/* Meal Plan Pricing */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                    <div className="p-4 md:p-5 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-[#333333]">Meal Plan Pricing</h2>
                        <Link
                            to="/admin/meals"
                            className="text-[#008080] text-sm hover:underline"
                        >
                            Manage Meals →
                        </Link>
                    </div>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008080]"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-red-500">{error}</div>
                    ) : meals.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No meal plans configured.{" "}
                            <Link to="/admin/meals" className="text-[#008080] hover:underline">
                                Add one
                            </Link>
                        </div>
                    ) : (
                        <div className="p-4">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-[#333333] text-white">
                                            <th className="py-3 px-4 text-left font-medium rounded-l-lg">Meal Plan</th>
                                            <th className="py-3 px-4 text-left font-medium">Description</th>
                                            <th className="py-3 px-4 text-left font-medium">Price/Person/Night</th>
                                            <th className="py-3 px-4 text-left font-medium rounded-r-lg">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {meals.map((meal, index) => (
                                            <tr key={meal.id} className={index % 2 === 1 ? "bg-[#00FFFF]/20" : ""}>
                                                <td className="py-3 px-4 text-[#333333] font-medium">{meal.title}</td>
                                                <td className="py-3 px-4 text-gray-600">{meal.subtitle || "-"}</td>
                                                <td className="py-3 px-4 text-[#333333] font-medium">{formatCurrency(meal.price)}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`font-medium ${meal.isActive ? "text-green-600" : "text-red-600"}`}>
                                                        {meal.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tax Configuration */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                    <div className="p-4 md:p-5 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-[#333333]">Tax Configuration</h2>
                    </div>
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-medium text-[#333333]">Consumption Tax</h3>
                                        <p className="text-sm text-gray-500">Applied to accommodation</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xl font-bold text-[#008080]">7.5%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-medium text-[#333333]">VAT</h3>
                                        <p className="text-sm text-gray-500">Value Added Tax</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xl font-bold text-[#008080]">5%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-4">
                            Total tax rate: <strong>12.5%</strong> (applied to sub-total)
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

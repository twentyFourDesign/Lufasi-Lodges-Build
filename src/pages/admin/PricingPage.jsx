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

    const [peakRates, setPeakRates] = useState([]);
    const [loadingPeakRates, setLoadingPeakRates] = useState(true);
    const [showPeakRateForm, setShowPeakRateForm] = useState(false);
    const [editingPeakRate, setEditingPeakRate] = useState(null);
    const [peakRateForm, setPeakRateForm] = useState({ name: '', startDate: '', endDate: '', percentageAdjustment: '', isActive: true });

    useEffect(() => {
        fetchMeals();
        fetchPricingConfig();
        fetchPeakRates();
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

    const fetchPeakRates = async () => {
        setLoadingPeakRates(true);
        try {
            const response = await fetch(`${BASE_URL}/config/peak-rates`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setPeakRates(data || []);
        } catch (err) {
            console.error('Failed to fetch peak rates', err);
        } finally {
            setLoadingPeakRates(false);
        }
    };

    const fetchPricingConfig = async () => {
        try {
            const response = await fetch(`${BASE_URL}/config/pricing`);
            if (!response.ok) {
                return;
            }
            const data = await response.json();
            setPricingConfig({
                base_price_per_pod_off_peak: data.base_price_per_pod_off_peak,
                base_price_per_pod_peak: data.base_price_per_pod_peak,
                extra_guest_fee_off_peak: data.extra_guest_fee_off_peak,
                extra_guest_fee_peak: data.extra_guest_fee_peak,
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
                    base_price_per_pod_off_peak: Number(
                        pricingConfig.base_price_per_pod_off_peak,
                    ),
                    base_price_per_pod_peak: Number(
                        pricingConfig.base_price_per_pod_peak,
                    ),
                    extra_guest_fee_off_peak: Number(
                        pricingConfig.extra_guest_fee_off_peak,
                    ),
                    extra_guest_fee_peak: Number(pricingConfig.extra_guest_fee_peak),
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
                base_price_per_pod_off_peak: data.base_price_per_pod_off_peak,
                base_price_per_pod_peak: data.base_price_per_pod_peak,
                extra_guest_fee_off_peak: data.extra_guest_fee_off_peak,
                extra_guest_fee_peak: data.extra_guest_fee_peak,
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

    const handleSavePeakRate = async (e) => {
        e.preventDefault();
        try {
            const isEditing = !!editingPeakRate;
            const url = isEditing 
                ? `${BASE_URL}/config/peak-rates/${editingPeakRate.id}` 
                : `${BASE_URL}/config/peak-rates`;
            
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(peakRateForm),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to save peak rate');
            }

            setSaveMessage({ type: "success", text: `Peak rate ${isEditing ? 'updated' : 'created'} successfully.` });
            setShowPeakRateForm(false);
            setEditingPeakRate(null);
            fetchPeakRates();
        } catch (err) {
            setSaveMessage({ type: "error", text: err.message });
        } finally {
            setTimeout(() => setSaveMessage(null), 4000);
        }
    };

    const handleDeletePeakRate = async (id) => {
        if (!window.confirm("Are you sure you want to delete this peak rate?")) return;
        try {
            const response = await fetch(`${BASE_URL}/config/peak-rates/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to delete");
            setSaveMessage({ type: "success", text: "Peak rate deleted successfully." });
            fetchPeakRates();
        } catch (err) {
            setSaveMessage({ type: "error", text: err.message });
        } finally {
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
                                <div className="md:col-span-2">
                                    <h3 className="text-sm font-semibold text-[#333333] mb-3">
                                        Nightly rates
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm border border-gray-200 rounded-lg">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="py-2 px-3 text-left font-medium text-gray-700" />
                                                    <th className="py-2 px-3 text-left font-medium text-gray-700">Off-peak (Sun-Thu)</th>
                                                    <th className="py-2 px-3 text-left font-medium text-gray-700">Peak (Fri-Sat)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-t border-gray-100">
                                                    <td className="py-2 px-3 text-gray-700">Base price per pod</td>
                                                    <td className="py-2 px-3">
                                                        <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]" value={pricingConfig.base_price_per_pod_off_peak ?? ""} onChange={(e) => handleConfigChange("base_price_per_pod_off_peak", e.target.value)} />
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]" value={pricingConfig.base_price_per_pod_peak ?? ""} onChange={(e) => handleConfigChange("base_price_per_pod_peak", e.target.value)} />
                                                    </td>
                                                </tr>
                                                <tr className="border-t border-gray-100">
                                                    <td className="py-2 px-3 text-gray-700">Extra guest fee</td>
                                                    <td className="py-2 px-3">
                                                        <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]" value={pricingConfig.extra_guest_fee_off_peak ?? ""} onChange={(e) => handleConfigChange("extra_guest_fee_off_peak", e.target.value)} />
                                                    </td>
                                                    <td className="py-2 px-3">
                                                        <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]" value={pricingConfig.extra_guest_fee_peak ?? ""} onChange={(e) => handleConfigChange("extra_guest_fee_peak", e.target.value)} />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
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

                {/* Seasonal dates */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                    <div className="p-4 md:p-5 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold text-[#333333]">Seasonal Dates</h2>
                            <p className="text-sm text-gray-500 mt-1">Date-range pricing adjustments (holidays, events)</p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingPeakRate(null);
                                setPeakRateForm({ name: '', startDate: '', endDate: '', percentageAdjustment: '', isActive: true });
                                setShowPeakRateForm(true);
                            }}
                            className="px-4 py-2 bg-[#008080] text-white rounded-lg text-sm font-medium hover:bg-[#006666] transition-colors"
                        >
                            + Add Rate
                        </button>
                    </div>

                    {showPeakRateForm && (
                        <div className="p-4 md:p-5 border-b border-gray-100 bg-gray-50">
                            <form onSubmit={handleSavePeakRate} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Christmas Peak, Summer Off-peak"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                            value={peakRateForm.name}
                                            onChange={(e) => setPeakRateForm({ ...peakRateForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Percentage Adjustment</label>
                                        <input
                                            type="number"
                                            required
                                            step="0.01"
                                            placeholder="e.g. 20 for +20%, -15 for -15%"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                            value={peakRateForm.percentageAdjustment}
                                            onChange={(e) => setPeakRateForm({ ...peakRateForm, percentageAdjustment: e.target.value })}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Positive = higher rates, Negative = Discount</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                            value={peakRateForm.startDate}
                                            onChange={(e) => setPeakRateForm({ ...peakRateForm, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                            value={peakRateForm.endDate}
                                            onChange={(e) => setPeakRateForm({ ...peakRateForm, endDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex items-center mt-6">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            checked={peakRateForm.isActive}
                                            onChange={(e) => setPeakRateForm({ ...peakRateForm, isActive: e.target.checked })}
                                            className="w-4 h-4 text-[#008080] rounded border-gray-300 focus:ring-[#008080]"
                                        />
                                        <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-gray-700">
                                            Active
                                        </label>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowPeakRateForm(false)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-[#008080] text-white rounded-lg text-sm font-medium hover:bg-[#006666]"
                                    >
                                        {editingPeakRate ? 'Update Rate' : 'Create Rate'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {loadingPeakRates ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008080]"></div>
                        </div>
                    ) : peakRates.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No seasonal date ranges configured.
                        </div>
                    ) : (
                        <div className="p-4">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-[#333333] text-white">
                                            <th className="py-3 px-4 text-left font-medium rounded-l-lg">Name</th>
                                            <th className="py-3 px-4 text-left font-medium">Dates</th>
                                            <th className="py-3 px-4 text-left font-medium">Adjustment</th>
                                            <th className="py-3 px-4 text-left font-medium">Status</th>
                                            <th className="py-3 px-4 text-right font-medium rounded-r-lg">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {peakRates.map((rate, index) => (
                                            <tr key={rate.id} className={index % 2 === 1 ? "bg-gray-50" : ""}>
                                                <td className="py-3 px-4 text-[#333333] font-medium">{rate.name}</td>
                                                <td className="py-3 px-4 text-gray-600">
                                                    {new Date(rate.startDate).toLocaleDateString()} - {new Date(rate.endDate).toLocaleDateString()}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${rate.percentageAdjustment > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                        {rate.percentageAdjustment > 0 ? '+' : ''}{rate.percentageAdjustment}%
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`font-medium ${rate.isActive ? "text-green-600" : "text-gray-400"}`}>
                                                        {rate.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <button
                                                        onClick={() => {
                                                            setEditingPeakRate(rate);
                                                            setPeakRateForm({
                                                                name: rate.name,
                                                                startDate: rate.startDate,
                                                                endDate: rate.endDate,
                                                                percentageAdjustment: rate.percentageAdjustment,
                                                                isActive: rate.isActive
                                                            });
                                                            setShowPeakRateForm(true);
                                                        }}
                                                        className="text-blue-600 hover:underline mr-3"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePeakRate(rate.id)}
                                                        className="text-red-600 hover:underline"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

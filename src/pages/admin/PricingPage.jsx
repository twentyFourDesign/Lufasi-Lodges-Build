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

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-[#333333]">Pricing & Configuration</h1>
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

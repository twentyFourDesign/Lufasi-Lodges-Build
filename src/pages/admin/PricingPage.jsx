import { useState, useEffect } from "react";
import { BASE_URL } from "@/config";
import useAuthStore from "@/store/useAuthStore";
import AdminLayout from "@/components/admin/AdminLayout";

export default function PricingPage() {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [pods, setPods] = useState([]);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPod, setEditingPod] = useState(null);

    useEffect(() => {
        fetchPods();
    }, []);

    const fetchPods = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/pods`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch pods");
            }

            const data = await response.json();
            setPods(data.pods || data || []);
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

    const handleEdit = (pod) => {
        setEditingPod(pod);
        setShowEditModal(true);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-[#333333]">Pricing & Configuration</h1>
                </div>

                {/* Pod Pricing Card */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                    <div className="p-4 md:p-5 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-[#333333]">Pod Pricing</h2>
                        <span className="text-sm text-gray-500">
                            {pods.length} pod{pods.length !== 1 ? "s" : ""}
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008080]"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-red-500">{error}</div>
                    ) : pods.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No pods found</div>
                    ) : (
                        <div className="overflow-x-auto p-4">
                            <table className="w-full text-sm">
                                {/* Dark Header - Table Design System */}
                                <thead>
                                    <tr className="bg-[#333333] text-white">
                                        <th className="py-3 px-4 text-left font-medium rounded-l-lg">Pod Name</th>
                                        <th className="py-3 px-4 text-left font-medium">Description</th>
                                        <th className="py-3 px-4 text-left font-medium">Price/Night</th>
                                        <th className="py-3 px-4 text-left font-medium">Max Guests</th>
                                        <th className="py-3 px-4 text-left font-medium">Status</th>
                                        <th className="py-3 px-4 text-left font-medium rounded-r-lg"></th>
                                    </tr>
                                </thead>
                                {/* Alternating Cyan Rows */}
                                <tbody>
                                    {pods.map((pod, index) => (
                                        <tr
                                            key={pod.id}
                                            className={index % 2 === 1 ? "bg-[#00FFFF]/20" : ""}
                                        >
                                            <td className="py-3 px-4 text-[#333333] font-medium">
                                                {pod.podName || pod.name}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                                                {pod.description || "-"}
                                            </td>
                                            <td className="py-3 px-4 text-[#333333] font-medium">
                                                {formatCurrency(pod.basePrice || pod.pricePerNight)}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">
                                                {pod.maxGuests || pod.capacity || "-"}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`font-medium ${pod.isActive !== false ? "text-green-600" : "text-red-600"}`}>
                                                    {pod.isActive !== false ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <button
                                                    onClick={() => handleEdit(pod)}
                                                    className="text-[#008080] hover:underline"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Meal Plan Pricing */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                    <div className="p-4 md:p-5 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-[#333333]">Meal Plan Pricing</h2>
                    </div>
                    <div className="p-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-[#333333] text-white">
                                        <th className="py-3 px-4 text-left font-medium rounded-l-lg">Meal Plan</th>
                                        <th className="py-3 px-4 text-left font-medium">Description</th>
                                        <th className="py-3 px-4 text-left font-medium">Price/Person/Night</th>
                                        <th className="py-3 px-4 text-left font-medium">Status</th>
                                        <th className="py-3 px-4 text-left font-medium rounded-r-lg"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="py-3 px-4 text-[#333333] font-medium">Breakfast Only</td>
                                        <td className="py-3 px-4 text-gray-600">Continental breakfast included</td>
                                        <td className="py-3 px-4 text-[#333333] font-medium">₦15,000</td>
                                        <td className="py-3 px-4">
                                            <span className="text-green-600 font-medium">Active</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <button className="text-[#008080] hover:underline">Edit</button>
                                        </td>
                                    </tr>
                                    <tr className="bg-[#00FFFF]/20">
                                        <td className="py-3 px-4 text-[#333333] font-medium">Half Board</td>
                                        <td className="py-3 px-4 text-gray-600">Breakfast + Dinner</td>
                                        <td className="py-3 px-4 text-[#333333] font-medium">₦25,000</td>
                                        <td className="py-3 px-4">
                                            <span className="text-green-600 font-medium">Active</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <button className="text-[#008080] hover:underline">Edit</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 text-[#333333] font-medium">Full Board</td>
                                        <td className="py-3 px-4 text-gray-600">All meals included</td>
                                        <td className="py-3 px-4 text-[#333333] font-medium">₦35,000</td>
                                        <td className="py-3 px-4">
                                            <span className="text-green-600 font-medium">Active</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <button className="text-[#008080] hover:underline">Edit</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
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

            {/* Edit Modal (placeholder) */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-[#333333]">
                                Edit Pod: {editingPod?.podName || editingPod?.name}
                            </h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-gray-500 mb-4">
                            Edit functionality coming soon. This will allow you to update pod pricing and settings.
                        </p>
                        <button
                            onClick={() => setShowEditModal(false)}
                            className="w-full py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666]"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

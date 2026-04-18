import { useState, useEffect } from "react";
import { BASE_URL } from "@/config";
import useAuthStore from "@/store/useAuthStore";
import AdminLayout from "@/components/admin/AdminLayout";

export default function VouchersPage() {
    const { token } = useAuthStore();
    const [activeTab, setActiveTab] = useState("discounts");
    const [loading, setLoading] = useState(true);
    const [discounts, setDiscounts] = useState([]);
    const [vouchers, setVouchers] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [saving, setSaving] = useState(false);

    const [discountForm, setDiscountForm] = useState({
        code: "",
        type: "percentage",
        value: 0,
        startDate: "",
        endDate: "",
        minimumNights: 1,
        maxUses: 0,
    });

    const [voucherForm, setVoucherForm] = useState({
        code: "",
        value: 0,
        validFrom: "",
        validTo: "",
        maxUses: 0,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [discountsRes, vouchersRes] = await Promise.all([
                fetch(`${BASE_URL}/discounts`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${BASE_URL}/vouchers`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);
            const discountsData = await discountsRes.json();
            const vouchersData = await vouchersRes.json();
            setDiscounts(discountsData.discounts || []);
            setVouchers(vouchersData.vouchers || []);
        } catch (err) {
            console.error(err);
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

    const formatDate = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const handleAddDiscount = () => {
        setEditingItem(null);
        setDiscountForm({
            code: "",
            type: "percentage",
            value: 0,
            startDate: "",
            endDate: "",
            minimumNights: 1,
            maxUses: 0,
        });
        setActiveTab("discounts");
        setShowAddModal(true);
    };

    const handleAddVoucher = () => {
        setEditingItem(null);
        setVoucherForm({
            code: "",
            value: 0,
            validFrom: "",
            validTo: "",
            maxUses: 0,
        });
        setActiveTab("vouchers");
        setShowAddModal(true);
    };

    const handleEditDiscount = (item) => {
        setEditingItem(item);
        setDiscountForm({
            code: item.code || "",
            type: item.type || "percentage",
            value: parseFloat(item.value) || 0,
            startDate: item.startDate || "",
            endDate: item.endDate || "",
            minimumNights: item.minimumNights || 1,
            maxUses: item.maxUses || 0,
        });
        setActiveTab("discounts");
        setShowAddModal(true);
    };

    const handleEditVoucher = (item) => {
        setEditingItem(item);
        setVoucherForm({
            code: item.code || "",
            value: parseFloat(item.value) || 0,
            validFrom: item.validFrom || "",
            validTo: item.validTo || "",
            maxUses: item.maxUses || 0,
        });
        setActiveTab("vouchers");
        setShowAddModal(true);
    };

    const handleSaveDiscount = async () => {
        setSaving(true);
        try {
            const url = editingItem
                ? `${BASE_URL}/discounts/${editingItem.id}`
                : `${BASE_URL}/discounts`;
            const method = editingItem ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(discountForm),
            });

            if (!response.ok) throw new Error("Failed to save discount");

            await fetchData();
            setShowAddModal(false);
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveVoucher = async () => {
        setSaving(true);
        try {
            const url = editingItem
                ? `${BASE_URL}/vouchers/${editingItem.id}`
                : `${BASE_URL}/vouchers`;
            const method = editingItem ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(voucherForm),
            });

            if (!response.ok) throw new Error("Failed to save voucher");

            await fetchData();
            setShowAddModal(false);
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteDiscount = async (id) => {
        if (!confirm("Are you sure you want to delete this discount?")) return;
        try {
            await fetch(`${BASE_URL}/discounts/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            await fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteVoucher = async (id) => {
        if (!confirm("Are you sure you want to delete this voucher?")) return;
        try {
            await fetch(`${BASE_URL}/vouchers/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            await fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-[#333333]">Vouchers & Discounts</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={handleAddDiscount}
                            className="px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666]"
                        >
                            Add Discount
                        </button>
                        <button
                            onClick={handleAddVoucher}
                            className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444]"
                        >
                            Add Voucher
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("discounts")}
                        className={`pb-3 px-1 font-medium ${activeTab === "discounts"
                                ? "text-[#008080] border-b-2 border-[#008080]"
                                : "text-gray-500"
                            }`}
                    >
                        Discounts ({discounts.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("vouchers")}
                        className={`pb-3 px-1 font-medium ${activeTab === "vouchers"
                                ? "text-[#008080] border-b-2 border-[#008080]"
                                : "text-gray-500"
                            }`}
                    >
                        Vouchers ({vouchers.length})
                    </button>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008080]"></div>
                        </div>
                    ) : activeTab === "discounts" ? (
                        <div className="overflow-x-auto p-4">
                            {discounts.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">No discounts found</div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-[#333333] text-white">
                                            <th className="py-3 px-4 text-left font-medium rounded-l-lg">Code</th>
                                            <th className="py-3 px-4 text-left font-medium">Type</th>
                                            <th className="py-3 px-4 text-left font-medium">Value</th>
                                            <th className="py-3 px-4 text-left font-medium">Min Nights</th>
                                            <th className="py-3 px-4 text-left font-medium">Valid From</th>
                                            <th className="py-3 px-4 text-left font-medium">Valid To</th>
                                            <th className="py-3 px-4 text-left font-medium">Uses</th>
                                            <th className="py-3 px-4 text-left font-medium rounded-r-lg">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {discounts.map((d, index) => (
                                            <tr key={d.id} className={index % 2 === 1 ? "bg-[#00FFFF]/20" : ""}>
                                                <td className="py-3 px-4 font-mono font-bold text-[#008080]">{d.code}</td>
                                                <td className="py-3 px-4 capitalize">{d.type}</td>
                                                <td className="py-3 px-4">
                                                    {d.type === "percentage" ? `${d.value}%` : formatCurrency(d.value)}
                                                </td>
                                                <td className="py-3 px-4">{d.minimumNights}</td>
                                                <td className="py-3 px-4">{formatDate(d.startDate)}</td>
                                                <td className="py-3 px-4">{formatDate(d.endDate)}</td>
                                                <td className="py-3 px-4">{d.usedCount}/{d.maxUses || "∞"}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEditDiscount(d)} className="text-[#008080] hover:underline">
                                                            Edit
                                                        </button>
                                                        <button onClick={() => handleDeleteDiscount(d.id)} className="text-red-500 hover:underline">
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto p-4">
                            {vouchers.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">No vouchers found</div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-[#333333] text-white">
                                            <th className="py-3 px-4 text-left font-medium rounded-l-lg">Code</th>
                                            <th className="py-3 px-4 text-left font-medium">Value</th>
                                            <th className="py-3 px-4 text-left font-medium">Valid From</th>
                                            <th className="py-3 px-4 text-left font-medium">Valid To</th>
                                            <th className="py-3 px-4 text-left font-medium">Uses</th>
                                            <th className="py-3 px-4 text-left font-medium rounded-r-lg">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vouchers.map((v, index) => (
                                            <tr key={v.id} className={index % 2 === 1 ? "bg-[#00FFFF]/20" : ""}>
                                                <td className="py-3 px-4 font-mono font-bold text-[#008080]">{v.code}</td>
                                                <td className="py-3 px-4">{formatCurrency(v.value)}</td>
                                                <td className="py-3 px-4">{formatDate(v.validFrom)}</td>
                                                <td className="py-3 px-4">{formatDate(v.validTo)}</td>
                                                <td className="py-3 px-4">{v.usedCount}/{v.maxUses || "∞"}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEditVoucher(v)} className="text-[#008080] hover:underline">
                                                            Edit
                                                        </button>
                                                        <button onClick={() => handleDeleteVoucher(v.id)} className="text-red-500 hover:underline">
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
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
                                {editingItem ? "Edit" : "Add"} {activeTab === "discounts" ? "Discount" : "Voucher"}
                            </h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {activeTab === "discounts" ? (
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                                    <input
                                        type="text"
                                        value={discountForm.code}
                                        onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] font-mono"
                                        placeholder="e.g. SUMMER20"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select
                                            value={discountForm.type}
                                            onChange={(e) => setDiscountForm({ ...discountForm, type: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed Amount (₦)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                                        <input
                                            type="number"
                                            value={discountForm.value}
                                            onChange={(e) => setDiscountForm({ ...discountForm, value: parseFloat(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={discountForm.startDate}
                                            onChange={(e) => setDiscountForm({ ...discountForm, startDate: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            value={discountForm.endDate}
                                            onChange={(e) => setDiscountForm({ ...discountForm, endDate: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Nights</label>
                                        <input
                                            type="number"
                                            value={discountForm.minimumNights}
                                            onChange={(e) => setDiscountForm({ ...discountForm, minimumNights: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses (0 = unlimited)</label>
                                        <input
                                            type="number"
                                            value={discountForm.maxUses}
                                            onChange={(e) => setDiscountForm({ ...discountForm, maxUses: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                                    <input
                                        type="text"
                                        value={voucherForm.code}
                                        onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value.toUpperCase() })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] font-mono"
                                        placeholder="e.g. GIFT50000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Value (₦)</label>
                                    <input
                                        type="number"
                                        value={voucherForm.value}
                                        onChange={(e) => setVoucherForm({ ...voucherForm, value: parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                                        <input
                                            type="date"
                                            value={voucherForm.validFrom}
                                            onChange={(e) => setVoucherForm({ ...voucherForm, validFrom: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Valid To</label>
                                        <input
                                            type="date"
                                            value={voucherForm.validTo}
                                            onChange={(e) => setVoucherForm({ ...voucherForm, validTo: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses (0 = unlimited)</label>
                                    <input
                                        type="number"
                                        value={voucherForm.maxUses}
                                        onChange={(e) => setVoucherForm({ ...voucherForm, maxUses: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={activeTab === "discounts" ? handleSaveDiscount : handleSaveVoucher}
                                disabled={saving || (activeTab === "discounts" ? !discountForm.code : !voucherForm.code)}
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

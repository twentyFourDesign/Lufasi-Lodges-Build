import { useState, useEffect } from "react";
import { BASE_URL } from "@/config";
import useAuthStore from "@/store/useAuthStore";
import AdminLayout from "@/components/admin/AdminLayout";

export default function PodsManagementPage() {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [pods, setPods] = useState([]);
    const [error, setError] = useState(null);
    const [editingPod, setEditingPod] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPod, setNewPod] = useState({
        podName: "",
        description: "",
        baseAdultPrice: 250000,
        maxAdults: 2,
        amenities: "",
    });
    const [selectedImages, setSelectedImages] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchPods();
    }, []);

    const fetchPods = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/pods`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setPods(data.pods || []);
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
        if (editingPod?.id === pod.id) {
            setEditingPod(null);
            setEditForm({});
        } else {
            setEditingPod(pod);
            setEditForm({
                podName: pod.podName,
                description: pod.description || "",
                baseAdultPrice: pod.baseAdultPrice,
                amenities: pod.amenities || "",
            });
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch(`${BASE_URL}/pods/${editingPod.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editForm),
            });

            if (!response.ok) throw new Error("Failed to update pod");

            await fetchPods();
            setEditingPod(null);
            setEditForm({});
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleAddPod = async () => {
        setSaving(true);
        try {
            // Create FormData with pod data and images together
            const formData = new FormData();
            formData.append("podName", newPod.podName);
            formData.append("description", newPod.description);
            formData.append("baseAdultPrice", newPod.baseAdultPrice);
            formData.append("maxAdults", newPod.maxAdults);
            formData.append("amenities", newPod.amenities);

            // Append all images
            for (const file of selectedImages) {
                formData.append("images", file);
            }

            const response = await fetch(`${BASE_URL}/pods`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Don't set Content-Type, browser will set it with boundary for FormData
                },
                body: formData,
            });

            if (!response.ok) throw new Error("Failed to create pod");

            await fetchPods();
            setShowAddModal(false);
            setNewPod({
                podName: "",
                description: "",
                baseAdultPrice: 250000,
                maxAdults: 2,
                amenities: "",
            });
            setSelectedImages([]);
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedImages((prev) => [...prev, ...files]);
    };

    const removeSelectedImage = (index) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    };

    const uploadImageForPod = async (podId, file) => {
        const formData = new FormData();
        formData.append("images", file);
        const response = await fetch(`${BASE_URL}/pods/${podId}/images`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        if (!response.ok) throw new Error("Failed to upload image");
        return response.json();
    };

    const deletePodImage = async (imageId) => {
        if (!confirm("Are you sure you want to delete this image?")) return;
        try {
            const response = await fetch(`${BASE_URL}/pods/images/${imageId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to delete image");
            await fetchPods();
        } catch (err) {
            alert(err.message);
        }
    };

    const toggleActive = async (pod) => {
        try {
            await fetch(`${BASE_URL}/pods/${pod.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ isActive: !pod.isActive }),
            });
            await fetchPods();
        } catch (err) {
            alert(err.message);
        }
    };

    const parseAmenities = (amenities) => {
        if (!amenities) return [];
        return amenities.split(",").map((a) => a.trim()).filter(Boolean);
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
                    <h1 className="text-2xl font-bold text-[#333333]">Pods</h1>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-[#008080] text-white rounded-lg flex items-center gap-2 hover:bg-[#006666]"
                    >
                        Add New Pod +
                    </button>
                </div>

                {/* Pods List */}
                <div className="space-y-4">
                    {pods.map((pod) => (
                        <div key={pod.id} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                            {/* Pod Images Gallery */}
                            {pod.images && pod.images.length > 0 && (
                                <div className="relative">
                                    <div className="flex overflow-x-auto gap-1 scrollbar-hide">
                                        {pod.images.map((img, i) => (
                                            <div key={i} className="flex-shrink-0 w-32 h-24 md:w-40 md:h-28">
                                                <img
                                                    src={img.imageUrl}
                                                    alt={`${pod.podName} - Image ${i + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                        {pod.images.length} image{pod.images.length !== 1 ? "s" : ""}
                                    </div>
                                </div>
                            )}

                            {/* Pod Card */}
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-[#333333]">{pod.podName}</h3>
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                            {pod.description || "Wake up to stunning lake views with your private plunge pool steps from your bed."}
                                        </p>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {parseAmenities(pod.amenities).map((tag, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1 bg-[#008080]/10 text-[#008080] text-xs rounded-full"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                            {parseAmenities(pod.amenities).length === 0 && (
                                                <>
                                                    <span className="px-3 py-1 bg-[#008080]/10 text-[#008080] text-xs rounded-full">Lake View</span>
                                                    <span className="px-3 py-1 bg-[#008080]/10 text-[#008080] text-xs rounded-full">Private Pool</span>
                                                    <span className="px-3 py-1 bg-[#008080]/10 text-[#008080] text-xs rounded-full">King Size Bed</span>
                                                </>
                                            )}
                                        </div>

                                        {/* Price */}
                                        <p className="mt-3 text-lg font-semibold text-[#333333]">
                                            {formatCurrency(pod.baseAdultPrice)}{" "}
                                            <span className="text-sm font-normal text-gray-500">per person/night</span>
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        <button
                                            onClick={() => handleEdit(pod)}
                                            className="flex items-center gap-1 text-[#008080] hover:underline"
                                        >
                                            Edit
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => toggleActive(pod)}
                                            className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                                        >
                                            {pod.isActive !== false ? "Active" : "Inactive"}
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${pod.isActive !== false ? "bg-green-500" : "bg-gray-300"}`}>
                                                {pod.isActive !== false && (
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Inline Edit Form */}
                            {editingPod?.id === pod.id && (
                                <div className="border-t border-gray-100 p-6 bg-gray-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Pod Name</label>
                                            <input
                                                type="text"
                                                value={editForm.podName}
                                                onChange={(e) => setEditForm({ ...editForm, podName: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                                            <input
                                                type="text"
                                                value={editForm.amenities}
                                                onChange={(e) => setEditForm({ ...editForm, amenities: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                                placeholder="Lake View, Private Pool, King Size Bed"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                            <textarea
                                                value={editForm.description}
                                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] resize-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Media Assets</label>
                                            <div className="flex gap-2 flex-wrap">
                                                {pod.images?.map((img, i) => (
                                                    <div key={img.id || i} className="relative w-16 h-16 bg-gray-200 rounded-lg overflow-hidden group">
                                                        <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => deletePodImage(img.id)}
                                                            className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                                <label className="w-16 h-16 bg-[#333333] rounded-lg flex items-center justify-center text-white hover:bg-[#444444] cursor-pointer">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                            if (e.target.files?.[0]) {
                                                                try {
                                                                    await uploadImageForPod(pod.id, e.target.files[0]);
                                                                    await fetchPods();
                                                                } catch (err) {
                                                                    alert(err.message);
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                            <input
                                                type="number"
                                                value={editForm.baseAdultPrice}
                                                onChange={(e) => setEditForm({ ...editForm, baseAdultPrice: parseInt(e.target.value) })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="px-6 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] disabled:opacity-50"
                                        >
                                            {saving ? "Saving..." : "Save Changes"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Pod Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-lg">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-[#333333]">Add New Pod</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pod Name *</label>
                                <input
                                    type="text"
                                    value={newPod.podName}
                                    onChange={(e) => setNewPod({ ...newPod, podName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                    placeholder="e.g. Lakeside Serenity"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={newPod.description}
                                    onChange={(e) => setNewPod({ ...newPod, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price per person/night</label>
                                <input
                                    type="number"
                                    value={newPod.baseAdultPrice}
                                    onChange={(e) => setNewPod({ ...newPod, baseAdultPrice: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    value={newPod.amenities}
                                    onChange={(e) => setNewPod({ ...newPod, amenities: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                    placeholder="Lake View, Private Pool, King Size Bed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageSelect}
                                        className="hidden"
                                        id="pod-images"
                                    />
                                    <label
                                        htmlFor="pod-images"
                                        className="flex flex-col items-center justify-center cursor-pointer"
                                    >
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="mt-2 text-sm text-gray-500">Click to upload images</span>
                                    </label>
                                    {selectedImages.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {selectedImages.map((file, i) => (
                                                <div key={i} className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden">
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSelectedImage(i)}
                                                        className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 flex items-center justify-center text-xs rounded-bl"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
                                onClick={handleAddPod}
                                disabled={saving || !newPod.podName}
                                className="px-6 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] disabled:opacity-50"
                            >
                                {uploading ? "Uploading..." : saving ? "Adding..." : "Add Pod"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

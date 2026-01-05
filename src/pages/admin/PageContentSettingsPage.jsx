import { useState, useEffect } from "react";
import { BASE_URL } from "@/config";
import useAuthStore from "@/store/useAuthStore";
import AdminLayout from "@/components/admin/AdminLayout";

// Default page content items
const defaultPageContent = [
    { id: "terms", name: "Terms & Conditions", content: "" },
    { id: "the-pod", name: "The Pod", content: "" },
    { id: "family-room", name: "Family Room", content: "" },
    { id: "ocean-deluxe", name: "Ocean Deluxe", content: "" },
    { id: "studio-room", name: "Studio Room", content: "" },
    { id: "garden-room", name: "Garden Room", content: "" },
    { id: "spa-wellness", name: "Spa & Wellness", content: "" },
    { id: "staff-lodging", name: "Staff Lodging", content: "" },
    { id: "cakes", name: "Cakes", content: "" },
    { id: "day-pass", name: "Day Pass Option", content: "" },
    { id: "personalized", name: "Personalized Experience", content: "" },
    { id: "riding", name: "Riding", content: "" },
    { id: "premium-drinks", name: "Premium Drinks", content: "" },
    { id: "holidays", name: "Holidays", content: "" },
];

export default function PageContentSettingsPage() {
    const { token } = useAuthStore();
    const [pageContent, setPageContent] = useState(defaultPageContent);
    const [editingItem, setEditingItem] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [saving, setSaving] = useState(false);

    // In a real implementation, you would fetch this from an API
    useEffect(() => {
        // Fetch page content from API
        // For now, using localStorage as a simple persistence
        const saved = localStorage.getItem("lufasi_page_content");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setPageContent(defaultPageContent.map(item => ({
                    ...item,
                    content: parsed[item.id] || item.content
                })));
            } catch (e) {
                console.error("Failed to parse saved content");
            }
        }
    }, []);

    const handleEdit = (item) => {
        setEditingItem(item);
        setEditContent(item.content);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Update local state
            const updated = pageContent.map(p =>
                p.id === editingItem.id ? { ...p, content: editContent } : p
            );
            setPageContent(updated);

            // Save to localStorage (replace with API call)
            const contentMap = {};
            updated.forEach(p => { contentMap[p.id] = p.content; });
            localStorage.setItem("lufasi_page_content", JSON.stringify(contentMap));

            setEditingItem(null);
            setEditContent("");
        } catch (err) {
            alert("Failed to save: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditingItem(null);
        setEditContent("");
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-[#333333]">Settings</h1>
                    <button className="px-4 py-2 bg-[#333333] text-white rounded-lg flex items-center gap-2 hover:bg-[#444444]">
                        Additional Settings
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>

                {/* Page Content List */}
                <div className="space-y-3">
                    {pageContent.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-lg border border-[#008080]/30 px-6 py-4 flex items-center justify-between hover:border-[#008080]/50 transition-colors"
                        >
                            <h3 className="text-lg font-semibold text-[#333333]">{item.name}</h3>
                            <button
                                onClick={() => handleEdit(item)}
                                className="flex items-center gap-2 text-gray-600 hover:text-[#008080]"
                            >
                                Edit
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Edit Modal */}
            {editingItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-[#333333]">
                                Edit: {editingItem.name}
                            </h2>
                            <button
                                onClick={handleCancel}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Content
                            </label>
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={10}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] resize-none"
                                placeholder={`Enter content for ${editingItem.name}...`}
                            />
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={handleCancel}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
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

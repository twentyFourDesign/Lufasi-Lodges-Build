import { useState, useEffect } from "react";
import { BASE_URL } from "@/config";
import useAuthStore from "@/store/useAuthStore";
import AdminLayout from "@/components/admin/AdminLayout";
import * as XLSX from 'xlsx';

export default function GuestDetailsPage() {
    const { token } = useAuthStore();
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchGuests();
    }, []);

    const fetchGuests = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/admin/guests`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setGuests(data.guests || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const exportData = guests.map(guest => ({
            "Full Name": guest.fullName,
            "Email": guest.email,
            "Phone": guest.phone,
            "Gender": guest.gender,
            "Date of Birth": guest.dateOfBirth ? new Date(guest.dateOfBirth).toLocaleDateString() : "",
            "ID Type": guest.identificationType,
            "ID Number": guest.identificationNumber
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Guests");
        XLSX.writeFile(wb, "Guest_Details_Lufasi.xlsx");
    };

    const filteredGuests = guests.filter(g =>
        g.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        g.email?.toLowerCase().includes(search.toLowerCase()) ||
        g.phone?.includes(search)
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-[#333333]">Guest Details</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export to Excel
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                    />
                </div>

                <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="py-3 px-4 text-left font-medium text-gray-500">Full Name</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-500">Email</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-500">Phone</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-500">ID Type</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-gray-500">Loading guests...</td>
                                    </tr>
                                ) : filteredGuests.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-gray-500">No guests found</td>
                                    </tr>
                                ) : (
                                    filteredGuests.map((guest) => (
                                        <tr key={guest.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                                {guest.fullName}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {guest.email}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {guest.phone}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {guest.identificationType || "-"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

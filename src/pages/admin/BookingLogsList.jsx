import { useState, useEffect } from "react";
import { BASE_URL } from "@/config";
import useAuthStore from "@/store/useAuthStore";
import AdminLayout from "@/components/admin/AdminLayout";

export default function BookingLogsList() {
    const { token } = useAuthStore();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("");

    useEffect(() => {
        fetchLogs();
    }, [filterStatus]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            let url = `${BASE_URL}/admin/logs`;
            if (filterStatus) url += `?status=${filterStatus}`;

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setLogs(data.logs || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-[#333333]">Booking Logs</h1>
                    <div className="flex gap-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                            <option value="abandoned">Abandoned</option>
                            <option value="confirmed">Confirmed</option>
                        </select>
                        <button
                            onClick={fetchLogs}
                            className="px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666]"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="py-3 px-4 text-left font-medium text-gray-500">Timestamp</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-500">Booking Ref</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-500">Guest Name</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-500">Status</th>
                                    <th className="py-3 px-4 text-left font-medium text-gray-500">Error Message</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-gray-500">Loading logs...</td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-gray-500">No logs found</td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                                                {formatDate(log.timestamp)}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-medium text-[#008080]">
                                                {log.bookingReference}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-900">
                                                {log.guestName}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                    ${log.status === 'confirmed' || log.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                        log.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                            log.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'}`}>
                                                    {log.status || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-red-600 break-words max-w-xs">
                                                {log.errorMessage || "-"}
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

import { useState, useEffect, useCallback } from "react";
import { BASE_URL } from "@/config";
import useAuthStore from "@/store/useAuthStore";
import AdminLayout from "@/components/admin/AdminLayout";

export default function ChannexSyncPage() {
    const { token } = useAuthStore();
    const [status, setStatus] = useState(null);
    const [preview, setPreview] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState("");
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const headers = { Authorization: `Bearer ${token}` };

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [statusRes, previewRes, logsRes] = await Promise.all([
                fetch(`${BASE_URL}/admin/channex/status`, { headers }),
                fetch(`${BASE_URL}/admin/channex/preview`, { headers }),
                fetch(`${BASE_URL}/admin/channex/logs?limit=30`, { headers }),
            ]);

            if (!statusRes.ok) throw new Error("Failed to load Channex status");
            setStatus(await statusRes.json());

            if (previewRes.ok) {
                const previewData = await previewRes.json();
                setPreview(previewData.preview || []);
            }

            if (logsRes.ok) {
                setLogs(await logsRes.json());
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const runAction = async (action, label) => {
        setActionLoading(label);
        setMessage(null);
        setError(null);
        try {
            const res = await fetch(`${BASE_URL}/admin/channex/${action}`, {
                method: "POST",
                headers: { ...headers, "Content-Type": "application/json" },
                body: action === "push-ari" ? JSON.stringify({}) : undefined,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `Action failed: ${label}`);
            setMessage(`${label} completed${data.skipped ? " (skipped — already queued)" : ""}`);
            await fetchAll();
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading("");
        }
    };

    const statusBadge = (s) => {
        const colors = {
            success: "bg-green-100 text-green-700",
            failed: "bg-red-100 text-red-700",
            pending: "bg-yellow-100 text-yellow-700",
            processing: "bg-blue-100 text-blue-700",
            skipped: "bg-gray-100 text-gray-600",
        };
        return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[s] || colors.pending}`}>
                {s}
            </span>
        );
    };

    if (loading && !status) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008080]" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#333333]">Channel Manager</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Channex ↔ Booking.com sync — availability, rates, and OTA reservations
                        </p>
                    </div>
                    <button
                        onClick={fetchAll}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                    >
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                {message && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                        {message}
                    </div>
                )}

                {/* Connection status */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-[#333333] mb-4">Connection Status</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Enabled</p>
                            <p className="font-medium">{status?.enabled ? "Yes" : "No"}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Configured</p>
                            <p className="font-medium">{status?.configured ? "Yes" : "No — set env vars"}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">API Base</p>
                            <p className="font-medium truncate">{status?.baseUrl || "—"}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Property ID</p>
                            <p className="font-mono text-xs truncate">{status?.propertyId || "—"}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Room Type ID</p>
                            <p className="font-mono text-xs truncate">{status?.roomTypeId || "—"}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Rate Plan ID</p>
                            <p className="font-mono text-xs truncate">{status?.ratePlanId || "—"}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Last ARI Push</p>
                            <p className="font-medium">
                                {status?.lastAriPush
                                    ? new Date(status.lastAriPush).toLocaleString()
                                    : "Never"}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500">Last Booking Pull</p>
                            <p className="font-medium">
                                {status?.lastBookingPull
                                    ? new Date(status.lastBookingPull).toLocaleString()
                                    : "Never"}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500">Rates</p>
                            <p className="font-medium">
                                {status?.ratesExVat ? "Ex-VAT (net)" : "Tax-inclusive"}
                            </p>
                        </div>
                    </div>

                    {!status?.configured && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                            Set <code>CHANNEX_ENABLED=true</code> and the Channex API key + property/room/rate IDs in the backend <code>.env</code> to activate sync.
                        </div>
                    )}
                </div>

                {/* Manual actions */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-[#333333] mb-4">Manual Actions</h2>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => runAction("push-ari", "Push rates & availability")}
                            disabled={!!actionLoading}
                            className="px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] disabled:opacity-50"
                        >
                            {actionLoading === "Push rates & availability" ? "Pushing…" : "Push Rates & Availability"}
                        </button>
                        <button
                            onClick={() => runAction("pull-bookings", "Pull OTA bookings")}
                            disabled={!!actionLoading}
                            className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#222] disabled:opacity-50"
                        >
                            {actionLoading === "Pull OTA bookings" ? "Pulling…" : "Pull OTA Bookings"}
                        </button>
                    </div>
                </div>

                {/* Rate & availability preview */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-[#333333]">
                            Rate & Availability Preview
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Next 30 days — what will be pushed to Channex</p>
                    </div>
                    <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-sm">
                            <thead className="bg-[#333333] text-white sticky top-0">
                                <tr>
                                    <th className="text-left px-4 py-2">Date</th>
                                    <th className="text-left px-4 py-2">Available</th>
                                    <th className="text-left px-4 py-2">Rate (1 adult)</th>
                                    <th className="text-left px-4 py-2">Rate (2 adults)</th>
                                    <th className="text-left px-4 py-2">Peak</th>
                                </tr>
                            </thead>
                            <tbody>
                                {preview.map((row, i) => (
                                    <tr
                                        key={row.date}
                                        className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                    >
                                        <td className="px-4 py-2">{row.date}</td>
                                        <td className="px-4 py-2 font-medium">{row.availability}</td>
                                        <td className="px-4 py-2">
                                            {row.rateOcc1 != null
                                                ? `₦${Number(row.rateOcc1).toLocaleString()}`
                                                : "—"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {row.rateOcc2 != null
                                                ? `₦${Number(row.rateOcc2).toLocaleString()}`
                                                : "—"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {row.isPeak ? (
                                                <span className="text-orange-600 font-medium">Peak</span>
                                            ) : (
                                                <span className="text-gray-500">Off-peak</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {preview.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                            No preview data
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sync log */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-[#333333]">Sync Log</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[#333333] text-white">
                                <tr>
                                    <th className="text-left px-4 py-2">Time</th>
                                    <th className="text-left px-4 py-2">Type</th>
                                    <th className="text-left px-4 py-2">Status</th>
                                    <th className="text-left px-4 py-2">Attempts</th>
                                    <th className="text-left px-4 py-2">Error</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, i) => (
                                    <tr
                                        key={log.id}
                                        className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                    >
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2">{log.syncType}</td>
                                        <td className="px-4 py-2">{statusBadge(log.status)}</td>
                                        <td className="px-4 py-2">{log.attempts}</td>
                                        <td className="px-4 py-2 text-red-600 truncate max-w-xs">
                                            {log.lastError || "—"}
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                            No sync activity yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

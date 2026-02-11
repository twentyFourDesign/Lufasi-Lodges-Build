import { useState, useEffect } from "react";
import { BASE_URL } from "@/config";
import useAuthStore from "@/store/useAuthStore";
import AdminLayout from "@/components/admin/AdminLayout";

export default function ReportsPage() {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [pods, setPods] = useState([]);
    const [selectedPods, setSelectedPods] = useState([]);
    const [filterType, setFilterType] = useState("Pod");
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Date Filters
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Stats State
    const [stats, setStats] = useState({
        totalRoomsSold: 0,
        totalAvailableRooms: 0,
        totalRoomRevenue: 0,
        totalExtrasRevenue: 0,
        totalGuests: 0,
        totalIncome: 0
    });
    const [statsLoading, setStatsLoading] = useState(false);
    const [recentLogs, setRecentLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);

    useEffect(() => {
        fetchPods();
        fetchRecentLogs();
    }, []);

    const fetchRecentLogs = async () => {
        setLogsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/admin/logs`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setRecentLogs(data.logs?.slice(0, 10) || []);
        } catch (err) {
            console.error("Failed to fetch logs:", err);
        } finally {
            setLogsLoading(false);
        }
    };

    useEffect(() => {
        // Fetch stats whenever filters change
        fetchStats();
    }, [selectedPods, startDate, endDate]);

    const fetchPods = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/pods`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            const podList = data.pods || [];
            setPods(podList);
            // Select all by default
            const allPodIds = podList.map((p) => p.id);
            setSelectedPods(allPodIds);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const params = new URLSearchParams();
            if (startDate) params.append("startDate", startDate);
            if (endDate) params.append("endDate", endDate);
            selectedPods.forEach(id => params.append("podId", id));

            const response = await fetch(`${BASE_URL}/admin/reports/stats?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.stats) {
                setStats(data.stats);
            }
        } catch (err) {
            console.error("Failed to fetch stats:", err);
        } finally {
            setStatsLoading(false);
        }
    };

    const togglePod = (podId) => {
        setSelectedPods((prev) =>
            prev.includes(podId)
                ? prev.filter((id) => id !== podId)
                : [...prev, podId]
        );
    };

    const toggleAll = () => {
        if (selectedPods.length === pods.length) {
            setSelectedPods([]);
        } else {
            setSelectedPods(pods.map((p) => p.id));
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const handleExport = async (format) => {
        setExporting(true);
        setShowExportMenu(false);

        try {
            // Get bookings for selected pods - Using existing endpoint logic locally filtered? 
            // Or ideally use a new endpoint. For now, we stick to existing logic but filter properly.
            // Requirement says "Enhance Reports Page", keeping export.

            const response = await fetch(`${BASE_URL}/admin/logs?status=confirmed`, { // Use logs/confirmed or similar?
                // The previous code used /bookings/admin which fetches ALL bookings.
                // We should probably filter by date in frontend if backend doesn't support it on that endpoint, 
                // OR use the new stats filters to list bookings?
                // For now, let's replicate previous behavior but add date filtering if possible.
                headers: { Authorization: `Bearer ${token}` }
            });

            // Wait, /bookings/admin route might not exist? previous file called `${BASE_URL}/bookings/admin`.
            // Let's assume it exists.

            const bookingsResponse = await fetch(`${BASE_URL}/bookings/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await bookingsResponse.json();

            let bookings = (data.bookings || []).filter((b) =>
                selectedPods.includes(b.podId)
            );

            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                bookings = bookings.filter(b => {
                    const checkIn = new Date(b.checkIn);
                    return checkIn >= start && checkIn <= end;
                });
            }

            if (format === "csv") {
                exportToCSV(bookings);
            } else {
                exportToPDF(bookings);
            }
        } catch (err) {
            alert("Failed to export: " + err.message);
        } finally {
            setExporting(false);
        }
    };

    const exportToCSV = (bookings) => {
        const headers = [
            "Booking Reference",
            "Guest Name",
            "Pod",
            "Check In",
            "Check Out",
            "Total Amount",
            "Status",
        ];

        const rows = bookings.map((b) => [
            b.bookingReference,
            b.GuestDirectory?.fullName || "",
            pods.find((p) => p.id === b.podId)?.podName || "",
            new Date(b.checkIn).toLocaleDateString(),
            new Date(b.checkOut).toLocaleDateString(),
            b.totalAmount,
            b.status,
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `lufasi-report-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportToPDF = (bookings) => {
        // Create a simple printable HTML
        const podNames = pods
            .filter((p) => selectedPods.includes(p.id))
            .map((p) => p.podName)
            .join(", ");

        const tableRows = bookings
            .map(
                (b) => `
        <tr>
          <td>${b.bookingReference}</td>
          <td>${b.GuestDirectory?.fullName || ""}</td>
          <td>${pods.find((p) => p.id === b.podId)?.podName || ""}</td>
          <td>${new Date(b.checkIn).toLocaleDateString()}</td>
          <td>${new Date(b.checkOut).toLocaleDateString()}</td>
          <td>₦${Number(b.totalAmount).toLocaleString()}</td>
          <td>${b.status}</td>
        </tr>
      `
            )
            .join("");

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lufasi Lodges Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #008080; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #333; color: white; }
            tr:nth-child(even) { background: #f9f9f9; }
            .meta { color: #666; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>Lufasi Lodges - Booking Report</h1>
          <p class="meta">
            Generated: ${new Date().toLocaleString()}<br>
            Range: ${startDate || 'All Time'} to ${endDate || 'Present'}<br>
            Pods: ${podNames}<br>
            Total Bookings: ${bookings.length}
          </p>
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Guest</th>
                <th>Pod</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;

        const printWindow = window.open("", "_blank");
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-[#333333]">Reports</h1>
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold text-[#333333] mb-4">Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                />
                                <span className="self-center">-</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                                />
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pods Config</label>
                            {loading ? (
                                <div className="text-sm text-gray-500">Loading pods...</div>
                            ) : (
                                <div className="flex flex-wrap gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedPods.length === pods.length}
                                            onChange={toggleAll}
                                            className="w-4 h-4 text-[#008080] bg-gray-100 border-gray-300 rounded focus:ring-[#008080]"
                                        />
                                        <span className="text-sm font-medium">All Pods</span>
                                    </label>
                                    {pods.map(pod => (
                                        <label key={pod.id} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedPods.includes(pod.id)}
                                                onChange={() => togglePod(pod.id)}
                                                className="w-4 h-4 text-[#008080] bg-gray-100 border-gray-300 rounded focus:ring-[#008080]"
                                            />
                                            <span className="text-sm text-gray-600">{pod.podName}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Total Income */}
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                        <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Total Income</h3>
                        <p className="text-3xl font-bold text-[#008080]">{formatCurrency(stats.totalIncome)}</p>
                    </div>

                    {/* Rooms Sold */}
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                        <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Total Rooms Sold</h3>
                        <p className="text-3xl font-bold text-[#333333]">{stats.totalRoomsSold}</p>
                    </div>

                    {/* Guests Welcomed */}
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                        <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Guests Welcomed</h3>
                        <p className="text-3xl font-bold text-[#333333]">{stats.totalGuests}</p>
                    </div>

                    {/* Room Revenue */}
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                        <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Room Revenue</h3>
                        <p className="text-2xl font-bold text-gray-700">{formatCurrency(stats.totalRoomRevenue)}</p>
                    </div>

                    {/* Extras Revenue */}
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                        <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Extras Revenue</h3>
                        <p className="text-2xl font-bold text-gray-700">{formatCurrency(stats.totalExtrasRevenue)}</p>
                    </div>

                    {/* Available Rooms (Snapshot) */}
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                        <h3 className="text-gray-500 text-sm font-medium uppercase mb-2">Active Pods</h3>
                        <p className="text-2xl font-bold text-gray-700">{stats.totalAvailableRooms}</p>
                        <span className="text-xs text-gray-400">Total active units in fleet</span>
                    </div>
                </div>

                {/* Accountability Logs Section */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-[#333333]">System Accountability Logs</h2>
                        <button 
                            onClick={fetchRecentLogs}
                            className="text-sm text-[#008080] hover:underline"
                        >
                            Refresh
                        </button>
                    </div>
                    
                    {logsLoading ? (
                        <div className="py-4 text-center text-gray-500">Loading logs...</div>
                    ) : recentLogs.length === 0 ? (
                        <div className="py-4 text-center text-gray-500">No recent activity logs.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                    <tr>
                                        <th className="py-2 px-4 text-left">Timestamp</th>
                                        <th className="py-2 px-4 text-left">Action</th>
                                        <th className="py-2 px-4 text-left">Guest Name</th>
                                        <th className="py-2 px-4 text-left">Reference</th>
                                        <th className="py-2 px-4 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                                                {new Date(log.timestamp).toLocaleString([], { 
                                                    month: 'short', 
                                                    day: 'numeric',
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </td>
                                            <td className="py-3 px-4 font-medium text-gray-700">{log.action || "System Update"}</td>
                                            <td className="py-3 px-4 text-gray-600">{log.guestName || "N/A"}</td>
                                            <td className="py-3 px-4 text-gray-600 font-mono text-xs">{log.bookingReference || "N/A"}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    log.status === "ready_for_checkin" 
                                                        ? "bg-green-100 text-green-800"
                                                        : log.status === "confirmed"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-gray-100 text-gray-800"
                                                }`}>
                                                    {log.status?.replace(/_/g, " ") || "N/A"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="mt-4 text-right">
                                <a href="/admin/logs" className="text-sm text-[#008080] font-medium hover:underline inline-flex items-center gap-1">
                                    View Full Audit Trail
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Export Section */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-[#333333]">Export Data</h3>
                        <p className="text-gray-500 text-sm">Download detailed booking reports based on current filters.</p>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            disabled={exporting || selectedPods.length === 0}
                            className="px-6 py-2 bg-[#333333] text-white rounded-lg flex items-center gap-2 hover:bg-[#444444] disabled:opacity-50"
                        >
                            {exporting ? "Exporting..." : "Export Report"}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {showExportMenu && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                                <button
                                    onClick={() => handleExport("pdf")}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-[#333333]"
                                >
                                    Export PDF
                                </button>
                                <hr className="border-gray-100" />
                                <button
                                    onClick={() => handleExport("csv")}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-[#333333]"
                                >
                                    Export CSV
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

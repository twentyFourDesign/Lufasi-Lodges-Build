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
            const podList = data.pods || [];
            setPods(podList);
            // Select all by default
            setSelectedPods(podList.map((p) => p.id));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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

    const handleExport = async (format) => {
        setExporting(true);
        setShowExportMenu(false);

        try {
            // Get bookings for selected pods
            const response = await fetch(`${BASE_URL}/bookings/admin`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            const bookings = (data.bookings || []).filter((b) =>
                selectedPods.includes(b.podId)
            );

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
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-[#333333]">Reports</h1>
                </div>

                {/* Generate Report Card */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-[#333333] mb-6">Generate Report</h2>

                        {/* Filter Dropdown */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Filter</label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080] bg-white"
                            >
                                <option value="Pod">Pod</option>
                                <option value="Date">Date Range</option>
                                <option value="Status">Booking Status</option>
                            </select>
                        </div>

                        {/* Select Pods */}
                        {filterType === "Pod" && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">Select Pods</label>
                                {loading ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#008080]"></div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedPods.length === pods.length}
                                                onChange={toggleAll}
                                                className="w-5 h-5 text-[#008080] bg-gray-100 border-gray-300 rounded focus:ring-[#008080]"
                                            />
                                            <span className="text-[#333333] font-medium">Select All</span>
                                        </label>
                                        {pods.map((pod) => (
                                            <label key={pod.id} className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPods.includes(pod.id)}
                                                    onChange={() => togglePod(pod.id)}
                                                    className="w-5 h-5 text-[#008080] bg-gray-100 border-gray-300 rounded focus:ring-[#008080]"
                                                />
                                                <span className="text-[#333333]">{pod.podName}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Export Button */}
                        <div className="flex justify-end relative">
                            <div className="relative">
                                <button
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    disabled={exporting || selectedPods.length === 0}
                                    className="px-6 py-2 bg-[#008080] text-white rounded-lg flex items-center gap-2 hover:bg-[#006666] disabled:opacity-50"
                                >
                                    {exporting ? "Exporting..." : "Export"}
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
                </div>
            </div>
        </AdminLayout>
    );
}

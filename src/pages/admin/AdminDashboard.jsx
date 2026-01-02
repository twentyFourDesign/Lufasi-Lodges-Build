import { useState, useEffect } from "react";
import { BASE_URL } from "@/config";
import useAuthStore from "@/store/useAuthStore";
import AdminLayout from "@/components/admin/AdminLayout";

// Stats Card Component
function StatsCard({ title, value, textColor = "text-[#333333]" }) {
    return (
        <div className="bg-white rounded-lg p-4 md:p-5 border border-gray-100 shadow-sm">
            <p className="text-xs md:text-sm text-gray-500 mb-1">{title}</p>
            <p className={`text-xl md:text-2xl font-bold ${textColor}`}>{value}</p>
        </div>
    );
}

// Booking Status Pie Chart - Matching Figma Design
function BookingStatusChart({ data, loading }) {
    if (loading) {
        return (
            <div className="bg-white rounded-lg p-4 md:p-5 border border-gray-100 shadow-sm h-full">
                <h3 className="text-base md:text-lg font-semibold text-[#333333] mb-4">Booking Status Overview</h3>
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008080]"></div>
                </div>
            </div>
        );
    }

    const total = data.reduce((sum, item) => sum + item.value, 0) || 0;
    let cumulativePercentage = 0;

    const getConicGradient = () => {
        if (total === 0) return "conic-gradient(#e5e5e5 0% 100%)";
        cumulativePercentage = 0; // Reset
        const gradientStops = data.map((item) => {
            const startPercentage = cumulativePercentage;
            cumulativePercentage += (item.value / total) * 100;
            return `${item.color} ${startPercentage}% ${cumulativePercentage}%`;
        });
        return `conic-gradient(${gradientStops.join(", ")})`;
    };

    return (
        <div className="bg-white rounded-lg p-4 md:p-5 border border-gray-100 shadow-sm h-full flex flex-col">
            <h3 className="text-base md:text-lg font-semibold text-[#333333] mb-4">Booking Status Overview</h3>
            <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-8">
                    {/* Donut Chart */}
                    <div
                        className="w-36 h-36 md:w-44 md:h-44 rounded-full relative flex-shrink-0"
                        style={{ background: getConicGradient() }}
                    >
                        <div className="absolute inset-6 md:inset-8 bg-white rounded-full flex items-center justify-center">
                            <span className="text-xl md:text-2xl font-bold text-[#333333]">{total}</span>
                        </div>
                    </div>

                    {/* Legend on Right */}
                    <div className="flex flex-col gap-3">
                        {data.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm text-gray-600 whitespace-nowrap">
                                    {item.label} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Pods Occupancy Bar Chart - Matching Figma with Y-axis and grid
function PodsOccupancyChart({ data, loading }) {
    const yAxisLabels = [100, 80, 60, 40, 20, 0];
    const chartHeight = 200;

    if (loading) {
        return (
            <div className="bg-white rounded-lg p-4 md:p-5 border border-gray-100 shadow-sm">
                <h3 className="text-base md:text-lg font-semibold text-[#333333] mb-4">Pods Occupancy</h3>
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008080]"></div>
                </div>
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="bg-white rounded-lg p-4 md:p-5 border border-gray-100 shadow-sm">
                <h3 className="text-base md:text-lg font-semibold text-[#333333] mb-4">Pods Occupancy</h3>
                <div className="flex items-center justify-center h-48">
                    <p className="text-gray-500">No pods data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-4 md:p-5 border border-gray-100 shadow-sm">
            <h3 className="text-base md:text-lg font-semibold text-[#333333] mb-4">Pods Occupancy</h3>

            <div className="flex">
                {/* Y-Axis Labels */}
                <div className="flex flex-col justify-between pr-2 text-right" style={{ height: `${chartHeight}px` }}>
                    {yAxisLabels.map((label) => (
                        <span key={label} className="text-xs text-gray-400 leading-none">
                            {label}%
                        </span>
                    ))}
                </div>

                {/* Chart Area with Scrolling */}
                <div className="flex-1 overflow-x-auto">
                    <div
                        className="relative min-w-max"
                        style={{
                            height: `${chartHeight}px`,
                            minWidth: `${Math.max(data.length * 60, 420)}px` // At least 7 pods width
                        }}
                    >
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between">
                            {yAxisLabels.map((label) => (
                                <div
                                    key={label}
                                    className="border-t border-dashed border-gray-200 w-full"
                                />
                            ))}
                        </div>

                        {/* Bars Container */}
                        <div className="absolute inset-0 flex items-end justify-around px-4">
                            {data.map((item, index) => (
                                <div key={index} className="flex flex-col items-center" style={{ width: '48px' }}>
                                    {/* Bar */}
                                    <div
                                        className="w-10 rounded-t-md transition-all duration-300"
                                        style={{
                                            height: `${Math.max(4, (item.value / 100) * (chartHeight - 20))}px`,
                                            backgroundColor: "#008080",
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* X-Axis Labels */}
                    <div
                        className="flex justify-around pt-2 min-w-max"
                        style={{ minWidth: `${Math.max(data.length * 60, 420)}px` }}
                    >
                        {data.map((item, index) => (
                            <span
                                key={index}
                                className="text-xs text-gray-600 text-center"
                                style={{ width: '48px' }}
                            >
                                {item.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Latest Bookings Table - Limited to 5 rows
function LatestBookingsTable({ bookings, loading }) {
    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-NG", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusBadge = (status) => {
        const styles = {
            confirmed: "bg-green-100 text-green-700",
            paid: "bg-green-100 text-green-700",
            pending: "bg-yellow-100 text-yellow-700",
            cancelled: "bg-red-100 text-red-700",
            failed: "bg-red-100 text-red-700",
            expired: "bg-gray-100 text-gray-700",
            abandoned: "bg-gray-100 text-gray-700",
        };
        return styles[status] || "bg-gray-100 text-gray-700";
    };

    // Limit to 5 bookings
    const displayBookings = bookings.slice(0, 5);

    return (
        <div className="bg-white rounded-lg p-4 md:p-5 border border-gray-100 shadow-sm h-full">
            <h3 className="text-base md:text-lg font-semibold text-[#333333] mb-4">Latest Bookings Table</h3>
            {loading ? (
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008080]"></div>
                </div>
            ) : displayBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No bookings found</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-xs md:text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b">
                                <th className="pb-3 pr-3 font-medium whitespace-nowrap">Guest Name</th>
                                <th className="pb-3 px-2 font-medium whitespace-nowrap">Check-in</th>
                                <th className="pb-3 px-2 font-medium whitespace-nowrap">Check-out</th>
                                <th className="pb-3 px-2 font-medium whitespace-nowrap">Pod</th>
                                <th className="pb-3 px-2 font-medium whitespace-nowrap">Amount</th>
                                <th className="pb-3 px-2 font-medium whitespace-nowrap">Status</th>
                                <th className="pb-3 pl-2 font-medium">View</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayBookings.map((booking) => (
                                <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="py-3 pr-3 text-[#333333] whitespace-nowrap">{booking.guestName}</td>
                                    <td className="py-3 px-2 text-gray-600 whitespace-nowrap">{formatDate(booking.checkIn)}</td>
                                    <td className="py-3 px-2 text-gray-600 whitespace-nowrap">{formatDate(booking.checkOut)}</td>
                                    <td className="py-3 px-2 text-gray-600 whitespace-nowrap">{booking.pod}</td>
                                    <td className="py-3 px-2 text-gray-600 whitespace-nowrap">₦{formatCurrency(booking.amount)}</td>
                                    <td className="py-3 px-2">
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusBadge(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="py-3 pl-2">
                                        <a href={`/admin/bookings/${booking.id}`} className="text-[#008080] hover:underline whitespace-nowrap">
                                            View
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// Upcoming Check-ins Table - Limited to 5 rows
function UpcomingCheckinsTable({ checkIns, loading }) {
    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-NG", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusBadge = (status) => {
        const styles = {
            confirmed: "bg-green-100 text-green-700",
            paid: "bg-green-100 text-green-700",
            pending: "bg-yellow-100 text-yellow-700",
        };
        return styles[status] || "bg-yellow-100 text-yellow-700";
    };

    // Limit to 5 check-ins
    const displayCheckIns = checkIns.slice(0, 5);

    return (
        <div className="bg-white rounded-lg p-4 md:p-5 border border-gray-100 shadow-sm">
            <h3 className="text-base md:text-lg font-semibold text-[#333333] mb-4">
                Upcoming Check-ins & Check-outs
            </h3>
            {loading ? (
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008080]"></div>
                </div>
            ) : displayCheckIns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No upcoming check-ins</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-xs md:text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b">
                                <th className="pb-3 pr-3 font-medium whitespace-nowrap">Guest Name</th>
                                <th className="pb-3 px-2 font-medium whitespace-nowrap">Check-in</th>
                                <th className="pb-3 px-2 font-medium whitespace-nowrap">Check-out</th>
                                <th className="pb-3 px-2 font-medium whitespace-nowrap">Pod</th>
                                <th className="pb-3 px-2 font-medium whitespace-nowrap">Amount</th>
                                <th className="pb-3 pl-2 font-medium whitespace-nowrap">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayCheckIns.map((item) => (
                                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="py-3 pr-3 text-[#333333] whitespace-nowrap">{item.guestName}</td>
                                    <td className="py-3 px-2 text-gray-600 whitespace-nowrap">{formatDate(item.checkIn)}</td>
                                    <td className="py-3 px-2 text-gray-600 whitespace-nowrap">{formatDate(item.checkOut)}</td>
                                    <td className="py-3 px-2 text-gray-600 whitespace-nowrap">{item.pod}</td>
                                    <td className="py-3 px-2 text-gray-600 whitespace-nowrap">₦{formatCurrency(item.amount)}</td>
                                    <td className="py-3 pl-2">
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusBadge(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default function AdminDashboard() {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [stats, setStats] = useState({
        totalBookings: 0,
        occupancyRate: 0,
        revenue: 0,
        pending: 0,
    });
    const [statusBreakdown, setStatusBreakdown] = useState([]);
    const [podsOccupancy, setPodsOccupancy] = useState([]);
    const [latestBookings, setLatestBookings] = useState([]);
    const [upcomingCheckIns, setUpcomingCheckIns] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${BASE_URL}/admin/dashboard/summary`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch dashboard data");
            }

            const data = await response.json();

            // Set stats
            setStats({
                totalBookings: data.stats?.totalBookings || 0,
                occupancyRate: data.stats?.occupancyRate || 0,
                revenue: data.stats?.revenue || 0,
                pending: data.stats?.pending || 0,
            });

            // Set status breakdown for pie chart
            if (data.statusBreakdown) {
                setStatusBreakdown([
                    { label: "Successful", value: data.statusBreakdown.successful || 0, color: "#4CAF50" },
                    { label: "Failed", value: data.statusBreakdown.failed || 0, color: "#F44336" },
                    { label: "Cancelled", value: data.statusBreakdown.cancelled || 0, color: "#FFC107" },
                    { label: "Pending", value: data.statusBreakdown.pending || 0, color: "#E8D5C4" },
                ]);
            }

            // Set pods occupancy
            setPodsOccupancy(data.podsOccupancy || []);

            // Set latest bookings (API already limits to 5)
            setLatestBookings(data.latestBookings || []);

            // Set upcoming check-ins (API already limits to 5)
            setUpcomingCheckIns(data.upcomingCheckIns || []);

        } catch (err) {
            console.error("Failed to fetch dashboard data:", err);
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
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <AdminLayout>
            <div className="space-y-4 md:space-y-6">
                {/* Error Banner */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
                        <span>Error loading dashboard: {error}</span>
                        <button
                            onClick={fetchDashboardData}
                            className="text-red-700 hover:text-red-900 underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <StatsCard
                        title="Total Bookings"
                        value={loading ? "..." : stats.totalBookings.toLocaleString()}
                    />
                    <StatsCard
                        title="Occupancy Rate"
                        value={loading ? "..." : `${stats.occupancyRate}%`}
                    />
                    <StatsCard
                        title="Revenue"
                        value={loading ? "..." : formatCurrency(stats.revenue)}
                    />
                    <StatsCard
                        title="Pending"
                        value={loading ? "..." : stats.pending}
                        textColor="text-red-500"
                    />
                </div>

                {/* Latest Bookings & Status Chart - Side by side */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                    <LatestBookingsTable bookings={latestBookings} loading={loading} />
                    <BookingStatusChart data={statusBreakdown} loading={loading} />
                </div>

                {/* Pods Occupancy & Upcoming Check-ins - Side by side */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                    <PodsOccupancyChart data={podsOccupancy} loading={loading} />
                    <UpcomingCheckinsTable checkIns={upcomingCheckIns} loading={loading} />
                </div>
            </div>
        </AdminLayout>
    );
}

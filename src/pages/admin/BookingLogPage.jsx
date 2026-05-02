import { useState, useEffect, useMemo } from "react";
import { MoreVertical } from "lucide-react";
import { BASE_URL } from "@/config";
import useAuthStore from "@/store/useAuthStore";
import AdminLayout from "@/components/admin/AdminLayout";

export default function BookingLogPage() {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [pods, setPods] = useState([]);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState("Week"); // Week, Month, Year
    const [currentDate, setCurrentDate] = useState(new Date());
    const [blocks, setBlocks] = useState([]);
    const [hoveredCell, setHoveredCell] = useState(null);
    const [blockModal, setBlockModal] = useState({ show: false, podId: null, date: null, isBlock: false, reason: "", otherReason: "", currentReason: null });
    const [actionLoading, setActionLoading] = useState(false);
    const [hideGuestDetails, setHideGuestDetails] = useState(false);
    const [tooltip, setTooltip] = useState({ show: false, booking: null, x: 0, y: 0 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch bookings
            const bookingsRes = await fetch(`${BASE_URL}/bookings/admin`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const bookingsData = await bookingsRes.json();

            // Fetch pods
            const podsRes = await fetch(`${BASE_URL}/pods`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const podsData = await podsRes.json();

            setBookings(bookingsData.bookings || []);
            setBlocks(bookingsData.blocks || []);
            setPods(podsData.pods || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Get days for current view
    const days = useMemo(() => {
        const result = [];
        const start = new Date(currentDate);

        if (viewMode === "Week") {
            // Start from Monday of current week
            const dayOfWeek = start.getDay();
            const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            start.setDate(start.getDate() + diff);

            for (let i = 0; i < 7; i++) {
                const d = new Date(start);
                d.setDate(d.getDate() + i);
                result.push(d);
            }
        } else if (viewMode === "Month") {
            // First day of month
            start.setDate(1);
            const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
            for (let i = 0; i < daysInMonth; i++) {
                const d = new Date(start);
                d.setDate(d.getDate() + i);
                result.push(d);
            }
        }

        return result;
    }, [currentDate, viewMode]);

    const formatDateRange = () => {
        if (days.length === 0) return "";
        const first = days[0];
        const last = days[days.length - 1];
        const options = { month: "short", day: "numeric", year: "numeric" };
        return `${first.toLocaleDateString("en-US", options)} - ${last.toLocaleDateString("en-US", options)}`;
    };

    const navigate = (direction) => {
        const newDate = new Date(currentDate);
        if (viewMode === "Week") {
            newDate.setDate(newDate.getDate() + (direction * 7));
        } else if (viewMode === "Month") {
            newDate.setMonth(newDate.getMonth() + direction);
        }
        setCurrentDate(newDate);
    };

    // Only show bookings that are actively occupying a room.
    // Cancelled, expired, failed, and abandoned bookings must NOT block calendar cells.
    const ACTIVE_BOOKING_STATUSES = ["confirmed"];

    // Find booking for a specific pod and date
    const getBookingForCell = (podId, date) => {
        const dateStr = date.toISOString().split("T")[0];
        const toISODateLocal = (str) => {
            if (!str) return "";
            if (typeof str === "string" && str.includes("-") && !str.includes("T")) return str.split("T")[0];
            const d = new Date(str);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };

        const booking = bookings.find((b) => {
            if (b.podId !== podId) return false;

            // Skip bookings that are NOT actively holding the room
            const status = (b.bookingStatus || b.status || "").toLowerCase();
            if (!ACTIVE_BOOKING_STATUSES.includes(status)) return false;

            const checkIn = toISODateLocal(b.checkIn);
            const checkOut = toISODateLocal(b.checkOut);
            return dateStr >= checkIn && dateStr < checkOut;
        });

        if (booking) return booking;

        const block = blocks.find((b) => b.podId === podId && b.date === dateStr);
        if (block) return { isBlock: true, ...block };

        return null;
    };

    const formatDayHeader = (date) => {
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return (
            <div className="text-center">
                <div className="text-sm font-medium">{dayNames[date.getDay()]} {date.getDate()}</div>
            </div>
        );
    };

    const handleCellHover = (e, booking, podId, date) => {
        const dateStr = date.toISOString().split("T")[0];
        setHoveredCell({ podId, dateStr });

        if (!booking || booking.isBlock) {
            setTooltip({ show: false, booking: null, x: 0, y: 0 });
            return;
        }
        const rect = e.target.getBoundingClientRect();
        setTooltip({
            show: true,
            booking,
            x: rect.left + rect.width / 2,
            y: rect.bottom + 10,
        });
    };

    const handleBlockAction = async () => {
        if (!blockModal.isBlock) {
            if (!blockModal.reason) {
                alert("Please select a reason for blocking.");
                return;
            }
            if (blockModal.reason === "Others (Specify)" && (!blockModal.otherReason || !blockModal.otherReason.trim())) {
                alert("Please specify the reason.");
                return;
            }
        }

        setActionLoading(true);
        try {
            const endpoint = blockModal.isBlock ? '/admin/calendar/unblock' : '/admin/calendar/block';
            const dateStr = blockModal.date.toISOString().split("T")[0];
            const finalReason = blockModal.reason === "Others (Specify)" ? blockModal.otherReason : blockModal.reason;
            const res = await fetch(`${BASE_URL}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    podId: blockModal.podId,
                    date: dateStr,
                    reason: finalReason
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to perform action");
            setBlockModal({ show: false, podId: null, date: null, isBlock: false, reason: "", otherReason: "", currentReason: null });
            fetchData();
        } catch (err) {
            alert(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
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
                    <h1 className="text-2xl font-bold text-[#333333]">Booking Log</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setHideGuestDetails(!hideGuestDetails)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-[#333333] hover:bg-gray-50 flex items-center gap-2"
                        >
                            {hideGuestDetails ? "Show" : "Hide"} Guest Details
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={hideGuestDetails ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"} />
                            </svg>
                        </button>
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] flex items-center gap-2"
                        >
                            Print Calendar
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Calendar Card */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                    {/* Controls */}
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 rounded"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <input
                                type="date"
                                value={currentDate.toISOString().split("T")[0]}
                                onChange={(e) => setCurrentDate(new Date(e.target.value))}
                                className="px-3 py-2 border border-gray-300 rounded-lg"
                            />
                            <span className="text-gray-600">{formatDateRange()}</span>
                            <button
                                onClick={() => navigate(1)}
                                className="p-2 hover:bg-gray-100 rounded"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            {["Week", "Month"].map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === mode
                                            ? "bg-[#008080] text-white"
                                            : "text-gray-600 hover:text-gray-900"
                                        }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="overflow-x-auto p-4">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr>
                                    <th className="py-3 px-4 text-left font-semibold text-[#008080] bg-[#008080]/10 border border-gray-200 min-w-[120px]">
                                        Room Type
                                    </th>
                                    {days.map((day, i) => (
                                        <th
                                            key={i}
                                            className="py-3 px-2 text-center font-medium text-gray-700 bg-gray-50 border border-gray-200 min-w-[100px]"
                                        >
                                            {formatDayHeader(day)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {pods.map((pod) => (
                                    <tr key={pod.id}>
                                        <td className="py-3 px-4 font-semibold text-[#008080] border border-gray-200 bg-[#008080]/5">
                                            {pod.podName}
                                        </td>
                                        {days.map((day, i) => {
                                            const booking = getBookingForCell(pod.id, day);
                                            const isHovered = hoveredCell?.podId === pod.id && hoveredCell?.dateStr === day.toISOString().split("T")[0];
                                            return (
                                                <td
                                                    key={i}
                                                    className={`relative py-3 px-2 text-center border border-gray-200 transition-colors ${booking
                                                            ? booking.isBlock ? "bg-gray-200" : "bg-[#008080]/20 hover:bg-[#008080]/30"
                                                            : "hover:bg-gray-50"
                                                        }`}
                                                    onMouseEnter={(e) => handleCellHover(e, booking, pod.id, day)}
                                                    onMouseLeave={() => {
                                                        setHoveredCell(null);
                                                        setTooltip({ show: false, booking: null, x: 0, y: 0 });
                                                    }}
                                                >
                                                    {booking && !booking.isBlock && !hideGuestDetails && (
                                                        <span className="text-xs text-gray-700">
                                                            {booking.GuestDirectory?.fullName?.split(" ")[0] || "Guest"}
                                                        </span>
                                                    )}
                                                    {booking?.isBlock && (
                                                        <span className="text-xs text-gray-500 font-medium">Blocked</span>
                                                    )}
                                                    {(isHovered && (!booking || booking?.isBlock)) && (
                                                        <div 
                                                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded shadow p-1 cursor-pointer hover:bg-gray-100 z-10"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setBlockModal({ 
                                                                    show: true, 
                                                                    podId: pod.id, 
                                                                    date: day, 
                                                                    isBlock: !!booking?.isBlock,
                                                                    reason: "",
                                                                    otherReason: "",
                                                                    currentReason: booking?.reason
                                                                });
                                                            }}
                                                        >
                                                            <MoreVertical size={16} className="text-gray-600" />
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Tooltip */}
                    {tooltip.show && tooltip.booking && (
                        <div
                            className="fixed z-50 bg-[#008080] text-white p-4 rounded-lg shadow-lg max-w-xs"
                            style={{
                                left: tooltip.x,
                                top: tooltip.y,
                                transform: "translateX(-50%)",
                            }}
                        >
                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-[#008080]"></div>
                            <h4 className="font-semibold mb-2">Booking Details</h4>
                            <p className="text-sm">
                                <strong>Pod:</strong> {pods.find((p) => p.id === tooltip.booking.podId)?.podName}
                            </p>
                            <p className="text-sm">
                                <strong>Guest:</strong> {tooltip.booking.GuestDirectory?.fullName}
                            </p>
                            <p className="text-sm">
                                <strong>Status:</strong> {tooltip.booking.bookingStatus}
                            </p>
                            <p className="text-sm">
                                <strong>Arrival:</strong> {new Date(tooltip.booking.checkIn).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                            <p className="text-sm">
                                <strong>Departure:</strong> {new Date(tooltip.booking.checkOut).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                        </div>
                    )}
                </div>

                {/* Block Room Modal */}
                {blockModal.show && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-bold mb-4">
                                {blockModal.isBlock ? "Unblock Room" : "Block Room"}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to {blockModal.isBlock ? "unblock" : "block"} this room on {blockModal.date.toLocaleDateString()}?
                            </p>
                            
                            {!blockModal.isBlock && (
                                <div className="mb-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Reason <span className="text-red-500">*</span></label>
                                        <select
                                            className="w-full border border-gray-300 rounded p-2 text-gray-700"
                                            value={blockModal.reason || ""}
                                            onChange={(e) => setBlockModal({ ...blockModal, reason: e.target.value })}
                                        >
                                            <option value="" disabled>Select a reason</option>
                                            <option value="Maintenance">Maintenance</option>
                                            <option value="Takeover">Takeover</option>
                                            <option value="Others (Specify)">Others (Specify)</option>
                                        </select>
                                    </div>
                                    {blockModal.reason === "Others (Specify)" && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Please specify <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded p-2 text-gray-700"
                                                value={blockModal.otherReason || ""}
                                                onChange={(e) => setBlockModal({ ...blockModal, otherReason: e.target.value })}
                                                placeholder="Enter specific reason..."
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {blockModal.isBlock && blockModal.currentReason && (
                                <div className="mb-6 p-3 bg-gray-50 rounded border border-gray-200">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Reason for block:</p>
                                    <p className="text-sm text-gray-800">{blockModal.currentReason}</p>
                                </div>
                            )}

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setBlockModal({ show: false, podId: null, date: null, isBlock: false, reason: "", otherReason: "", currentReason: null })}
                                    className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
                                    disabled={actionLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBlockAction}
                                    className={`px-4 py-2 text-white rounded ${blockModal.isBlock ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? "Processing..." : blockModal.isBlock ? "Unblock" : "Block"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

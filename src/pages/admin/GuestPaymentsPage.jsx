import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BASE_URL } from "@/config";
import useAuthStore from "@/store/useAuthStore";
import AdminLayout from "@/components/admin/AdminLayout";

const ITEMS_PER_PAGE = 10;

export default function GuestPaymentsPage() {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedVoucher, setSelectedVoucher] = useState(null);

    // Filter
    const [showFilter, setShowFilter] = useState(false);
    const [filters, setFilters] = useState({
        status: "",
        search: "",
    });

    useEffect(() => {
        fetchPayments();
    }, []);

    // Apply filters
    useEffect(() => {
        let result = [...payments];

        if (filters.status) {
            result = result.filter((p) => p.paymentStatus === filters.status);
        }

        if (filters.search) {
            const search = filters.search.toLowerCase();
            result = result.filter(
                (p) =>
                    (p.Booking?.bookingReference || "").toLowerCase().includes(search) ||
                    (p.Booking?.GuestDirectory?.fullName || "").toLowerCase().includes(search) ||
                    (p.transactionReference || "").toLowerCase().includes(search)
            );
        }

        setFilteredPayments(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [payments, filters]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/bookings/admin`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch payments");
            }

            const data = await response.json();
            // Extract payments from bookings
            const allPayments = [];
            (data.bookings || []).forEach((booking) => {
                if (booking.BookingPayments && booking.BookingPayments.length > 0) {
                    booking.BookingPayments.forEach((payment) => {
                        allPayments.push({
                            ...payment,
                            Booking: {
                                id: booking.id,
                                bookingReference: booking.bookingReference,
                                GuestDirectory: booking.GuestDirectory,
                                totalPrice: booking.totalPrice,
                                fullBookingPrice: booking.fullBookingPrice,
                                Voucher: booking.Voucher,
                            },
                        });
                    });
                }
            });
            setPayments(allPayments);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Pagination
    const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
    const paginatedPayments = filteredPayments.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "successful":
                return "text-green-600";
            case "failed":
                return "text-red-600";
            case "initiated":
            case "abandoned":
                return "text-yellow-600";
            default:
                return "text-gray-600";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "successful":
                return "Paid";
            case "failed":
                return "Failed";
            case "initiated":
                return "Pending";
            case "abandoned":
                return "Not Paid";
            default:
                return status;
        }
    };

    return (
        <>
            <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-[#333333]">Guest Payments</h1>
                    <button
                        onClick={() => setShowFilter(!showFilter)}
                        className={`px-4 py-2 border rounded-lg flex items-center gap-2 text-[#333333] ${showFilter
                                ? "bg-gray-100 border-gray-400"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                            />
                        </svg>
                        Filter
                    </button>
                </div>

                {/* Filter Panel */}
                {showFilter && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search
                            </label>
                            <input
                                type="text"
                                placeholder="Search by name, reference..."
                                value={filters.search}
                                onChange={(e) =>
                                    setFilters({ ...filters, search: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                            />
                        </div>
                        <div className="min-w-[150px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) =>
                                    setFilters({ ...filters, status: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
                            >
                                <option value="">All Statuses</option>
                                <option value="successful">Paid</option>
                                <option value="initiated">Pending</option>
                                <option value="failed">Failed</option>
                                <option value="abandoned">Not Paid</option>
                            </select>
                        </div>
                        <button
                            onClick={() => setFilters({ status: "", search: "" })}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* Payments Card */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                    <div className="p-4 md:p-5 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-[#333333]">Payments</h2>
                        <span className="text-sm text-gray-500">
                            Showing {paginatedPayments.length} of {filteredPayments.length} payments
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008080]"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-red-500">{error}</div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No payments found
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto p-4">
                                <table className="w-full text-sm">
                                    {/* Dark Header */}
                                    <thead>
                                        <tr className="bg-[#333333] text-white">
                                            <th className="py-3 px-4 text-left font-medium rounded-l-lg">
                                                Booking ID
                                            </th>
                                            <th className="py-3 px-4 text-left font-medium">Name</th>
                                            <th className="py-3 px-4 text-left font-medium">Booking Price</th>
                                            <th className="py-3 px-4 text-left font-medium">Payment Method</th>
                                            <th className="py-3 px-4 text-left font-medium">Status</th>
                                            <th className="py-3 px-4 text-left font-medium">
                                                Booking Reference
                                            </th>
                                            <th className="py-3 px-4 text-left font-medium rounded-r-lg">
                                                Date
                                            </th>
                                        </tr>
                                    </thead>
                                    {/* Alternating Cyan Rows */}
                                    <tbody>
                                        {paginatedPayments.map((payment, index) => (
                                            <tr
                                                key={payment.id}
                                                className={index % 2 === 1 ? "bg-[#00FFFF]/20" : ""}
                                            >
                                                <td className="py-3 px-4 text-[#333333]">
                                                    {payment.Booking?.id?.slice(0, 8) || "-"}
                                                </td>
                                                <td className="py-3 px-4 text-[#333333]">
                                                    {payment.Booking?.GuestDirectory?.fullName || "Unknown"}
                                                </td>
                                                <td className="py-3 px-4 text-[#333333]">
                                                    {formatCurrency(payment.Booking?.fullBookingPrice || payment.Booking?.totalPrice || payment.amount)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {payment.paymentMethod === "voucher" ? (
                                                        <button
                                                            onClick={() => {
                                                                if (payment.Booking?.Voucher) {
                                                                    setSelectedVoucher(payment.Booking.Voucher);
                                                                } else {
                                                                    // Fallback: extract from reference if possible
                                                                    const ref = payment.transactionReference || "";
                                                                    const parts = ref.split("-");
                                                                    const code = parts.length >= 2 ? parts[1] : "N/A";
                                                                    setSelectedVoucher({ code, value: payment.amount, isMock: true });
                                                                }
                                                            }}
                                                            className="text-[#008080] font-medium hover:underline flex items-center gap-1 text-left"
                                                        >
                                                            Voucher ({payment.Booking?.Voucher?.code || (payment.transactionReference?.split("-")[1]) || "N/A"})
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </button>
                                                    ) : (
                                                        <span className="capitalize">{payment.paymentMethod}</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`font-medium ${getStatusColor(
                                                            payment.paymentStatus
                                                        )}`}
                                                    >
                                                        {getStatusLabel(payment.paymentStatus)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Link
                                                        to={`/admin/bookings/${payment.Booking?.id}`}
                                                        className="text-[#008080] hover:underline"
                                                    >
                                                        {payment.Booking?.bookingReference || "-"}
                                                    </Link>
                                                </td>
                                                <td className="py-3 px-4 text-gray-600">
                                                    {formatDate(payment.paidAt || payment.createdAt)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="p-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-sm text-gray-500">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Previous
                                        </button>
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`px-3 py-1 border rounded-lg text-sm ${currentPage === pageNum
                                                            ? "bg-[#008080] text-white border-[#008080]"
                                                            : "border-gray-300 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>

        {/* Voucher Details Modal */}
        {selectedVoucher && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-[#333333]">Voucher Details</h3>
                        <button onClick={() => setSelectedVoucher(null)} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Code</span>
                            <span className="font-bold text-[#008080]">{selectedVoucher.code}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Value</span>
                            <span className="font-medium">{formatCurrency(selectedVoucher.value)}</span>
                        </div>
                        {selectedVoucher.validFrom && (
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Valid From</span>
                                <span className="font-medium">{formatDate(selectedVoucher.validFrom)}</span>
                            </div>
                        )}
                        {selectedVoucher.validTo && (
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Valid To</span>
                                <span className="font-medium">{formatDate(selectedVoucher.validTo)}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-gray-500">Status</span>
                            <span className={`font-medium ${selectedVoucher.isMock ? 'text-gray-600' : (selectedVoucher.isActive ? 'text-green-600' : 'text-red-600')}`}>
                                {selectedVoucher.isMock ? 'Unknown' : (selectedVoucher.isActive ? 'Active' : 'Inactive')}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setSelectedVoucher(null)}
                        className="w-full mt-6 py-2 bg-[#008080] text-white rounded-lg font-medium hover:bg-[#006666]"
                    >
                        Close
                    </button>
                </div>
            </div>
            )}
        </>
    );
}

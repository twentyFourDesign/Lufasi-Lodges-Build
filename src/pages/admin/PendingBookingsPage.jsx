import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BASE_URL } from "@/config";
import useAuthStore from "@/store/useAuthStore";
import AdminLayout from "@/components/admin/AdminLayout";

export default function PendingBookingsPage() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [error, setError] = useState(null);

  // Email/Action states
  const [sendingAction, setSendingAction] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });

  // Cancellation State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  const confirmedStatuses = ["confirmed", "ready_for_checkin", "confirmed_unassigned", "paid"];

  useEffect(() => {
    fetchBookings();
  }, []);

  // Apply filters when bookings or filters change
  useEffect(() => {
    // Filter out confirmed bookings first
    let result = bookings.filter(
      (b) => !confirmedStatuses.includes(b.bookingStatus || b.status)
    );

    if (filters.status) {
      result = result.filter(
        (b) => (b.bookingStatus || b.status) === filters.status,
      );
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (b) =>
          (b.GuestDirectory?.fullName || b.guestName || "")
            .toLowerCase()
            .includes(search) ||
          (b.bookingReference || "").toLowerCase().includes(search) ||
          (b.Pod?.podName || b.pod || "").toLowerCase().includes(search),
      );
    }

    setFilteredBookings(result);
    setCurrentPage(1);
  }, [bookings, filters]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/bookings/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();
      setBookings(data.bookings || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      confirmed: "text-green-600",
      ready_for_checkin: "text-green-600 font-bold",
      confirmed_unassigned: "text-blue-600",
      paid: "text-green-600",
      pending: "text-yellow-600",
      cancelled: "text-red-600",
      failed: "text-red-600",
    };
    return styles[status] || "text-gray-600";
  };

  const handleResendInvoice = async (bookingId) => {
    setSendingAction(bookingId);
    setActionMessage(null);
    try {
      const response = await fetch(
        `${BASE_URL}/bookings/${bookingId}/resend-invoice`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) throw new Error("Failed to resend invoice");
      setActionMessage({
        type: "success",
        text: "Invoice resent successfully",
      });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setActionMessage({ type: "error", text: err.message });
    } finally {
      setSendingAction(null);
    }
  };

  const handleSendConfirmation = async (bookingId) => {
    setSendingAction(bookingId);
    setActionMessage(null);
    try {
      const response = await fetch(
        `${BASE_URL}/bookings/${bookingId}/send-confirmation`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) throw new Error("Failed to send confirmation");
      setActionMessage({
        type: "success",
        text: "Confirmation email sent successfully",
      });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setActionMessage({ type: "error", text: err.message });
    } finally {
      setSendingAction(null);
    }
  };

  const handleCancel = async () => {
    if (!selectedBooking) return;

    setCancelling(true);
    setCancelError(null);

    try {
      const response = await fetch(
        `${BASE_URL}/bookings/${selectedBooking.id}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel booking");
      }

      setShowCancelModal(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = filteredBookings.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#333333]">
            Pending/Cancelled Bookings
          </h1>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 text-[#333333] ${
              showFilter
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

        {actionMessage && (
          <div
            className={`fixed top-5 right-5 z-[100] p-4 rounded-lg shadow-lg animate-in slide-in-from-right duration-300 ${
              actionMessage.type === "success"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{actionMessage.text}</span>
            </div>
          </div>
        )}

        {showFilter && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name... "
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
                <option value="">All Types</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="failed">Failed</option>
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

        <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
          <div className="p-4 md:p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-[#333333]">
              Pending/Cancelled List
            </h2>
            <span className="text-sm text-gray-500">
              {filteredBookings.length} booking
              {filteredBookings.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008080]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No pending or cancelled bookings found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#333333] text-white">
                      <th className="py-3 px-4 text-left font-medium rounded-l-lg">
                        Booking ID
                      </th>
                      <th className="py-3 px-4 text-left font-medium">
                        Guest Name
                      </th>
                      <th className="py-3 px-4 text-left font-medium">Dates</th>
                      <th className="py-3 px-4 text-left font-medium">
                        Pod Name
                      </th>
                      <th className="py-3 px-4 text-left font-medium">
                        Status
                      </th>
                      <th className="py-3 px-4 text-left font-medium rounded-r-lg">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBookings.map((booking, index) => (
                      <tr
                        key={booking.id}
                        className={index % 2 === 1 ? "bg-[#00FFFF]/20" : ""}
                      >
                        <td className="py-3 px-4 text-[#333333]">
                          {booking.bookingReference || booking.id?.slice(0, 8)}
                        </td>
                        <td className="py-3 px-4 text-[#333333]">
                          {booking.GuestDirectory?.fullName ||
                            booking.guestName ||
                            "Unknown"}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {formatDate(booking.checkIn)} -{" "}
                          {formatDate(booking.checkOut)}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {booking.Pod?.podName || booking.pod || "Unknown"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-medium capitalize ${getStatusBadge(booking.bookingStatus || booking.status)}`}
                          >
                            {booking.bookingStatus || booking.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Link
                              to={`/bookings/admin/${booking.id}`}
                              className="text-[#008080] hover:underline font-medium"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => handleResendInvoice(booking.id)}
                              disabled={sendingAction === booking.id}
                              className="text-[#008080] hover:underline font-medium disabled:opacity-50 whitespace-nowrap"
                            >
                              Resend Invoice
                            </button>
                            {(booking.bookingStatus || booking.status) !==
                              "cancelled" && (
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setShowCancelModal(true);
                                }}
                                className="text-red-500 hover:text-red-700 hover:underline font-medium"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                   <div className="text-sm text-gray-500">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(
                      startIndex + itemsPerPage,
                      filteredBookings.length,
                    )}{" "}
                    of {filteredBookings.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => goToPage(i + 1)}
                        className={`px-3 py-1 rounded-lg ${
                          currentPage === i + 1
                            ? "bg-[#008080] text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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

      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
             <div className="flex items-center gap-3 text-red-600 mb-4">
              <h3 className="text-xl font-bold">Cancel Booking?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel the booking{" "}
              <span className="font-semibold text-gray-900">
                {selectedBooking.bookingReference || selectedBooking.id}
              </span>?
            </p>
            {cancelError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                {cancelError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                  setCancelError(null);
                }}
                disabled={cancelling}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Go Back
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

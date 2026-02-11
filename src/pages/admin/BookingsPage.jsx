import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BASE_URL } from "@/config";
import useAuthStore from "@/store/useAuthStore";
import AdminLayout from "@/components/admin/AdminLayout";

export default function BookingsPage() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [error, setError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  // Apply filters when bookings or filters change
  useEffect(() => {
    let result = [...bookings];

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
    setCurrentPage(1); // Reset to first page on filter change
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

  const handleDelete = async (bookingId) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      const response = await fetch(`${BASE_URL}/bookings/admin/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete booking");
      }

      fetchBookings();
    } catch (err) {
      alert(err.message);
    }
  };

  // Pagination calculations
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#333333]">
            Bookings Management
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

        {/* Filter Panel */}
        {showFilter && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name, reference, pod..."
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
                <option value="confirmed">Confirmed</option>
                <option value="confirmed_unassigned">
                  Confirmed (Unassigned)
                </option>
                <option value="ready_for_checkin">Ready for Check-in</option>
                <option value="paid">Paid</option>
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

        {/* Bookings Card */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
          <div className="p-4 md:p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-[#333333]">
              All Bookings
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
              No bookings found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto p-4">
                <table className="w-full text-sm">
                  {/* Dark Header - Table Design System */}
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
                      <th className="py-3 px-4 text-left font-medium"></th>
                      <th className="py-3 px-4 text-left font-medium"></th>
                      {/* <th className="py-3 px-4 text-left font-medium rounded-r-lg"></th> */}
                    </tr>
                  </thead>
                  {/* Alternating Cyan Rows */}
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
                          <Link
                            to={`/bookings/admin/${booking.id}`}
                            className="text-[#008080] hover:underline"
                          >
                            View
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <button className="text-[#008080] hover:underline">
                            Edit
                          </button>
                        </td>
                        {/* <td className="py-3 px-4">
                                                    <button
                                                        onClick={() => handleDelete(booking.id)}
                                                        className="text-red-500 hover:underline"
                                                    >
                                                        Delete
                                                    </button>
                                                </td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
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
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-1 rounded-lg ${
                            currentPage === pageNum
                              ? "bg-[#008080] text-white"
                              : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
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
    </AdminLayout>
  );
}

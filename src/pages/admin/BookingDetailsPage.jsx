import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "@/config";
import useAuthStore from "@/store/useAuthStore";
import AdminLayout from "@/components/admin/AdminLayout";

export default function BookingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [availablePods, setAvailablePods] = useState([]);
  const [selectedPodIds, setSelectedPodIds] = useState([]);
  const [allocating, setAllocating] = useState(false);
  const [fetchingPods, setFetchingPods] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  useEffect(() => {
    if (booking && selectedPodIds.length === 0) {
      fetchAvailablePods();
      if (booking.podId) {
        setSelectedPodIds([booking.podId]);
      }
    }
  }, [booking]);

  const fetchAvailablePods = async () => {
    if (!booking) return;
    setFetchingPods(true);
    try {
      const guests = booking.BookingGuests?.[0] || {};
      const adults = guests.adults || 1;
      const children = guests.children || 0;
      const infants = guests.infants || 0;

      console.log("Fetching availability with:", {
        startDate: booking.checkIn.split("T")[0],
        endDate: booking.checkOut.split("T")[0],
        adults,
        children,
        infants,
      });

      const response = await fetch(`${BASE_URL}/availability/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: booking.checkIn.split("T")[0],
          endDate: booking.checkOut.split("T")[0],
          adults,
          children,
          infants,
          excludeBookingId: id,
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch available pods");
      const data = await response.json();
      console.log("Availability results:", data);
      // Filter only available pods OR pods currently assigned to this booking
      setAvailablePods(data);
    } catch (err) {
      console.error("Error fetching available pods:", err);
    } finally {
      setFetchingPods(false);
    }
  };

  const togglePodSelection = (podId) => {
    const requiredCount = booking.podCount || 1;
    setSelectedPodIds((prev) => {
      if (prev.includes(podId)) {
        return prev.filter((id) => id !== podId);
      } else {
        if (prev.length < requiredCount) {
          return [...prev, podId];
        } else if (requiredCount === 1) {
          // If only 1 pod is required, clicking a new one should replace the old selection
          return [podId];
        }
        return prev;
      }
    });
  };

  const handleAllocatePod = async () => {
    if (selectedPodIds.length === 0) return;
    if (selectedPodIds.length !== (booking.podCount || 1)) {
      setEmailMessage({
        type: "error",
        text: `Please select exactly ${booking.podCount || 1} pod(s).`,
      });
      return;
    }

    setAllocating(true);
    try {
      const response = await fetch(`${BASE_URL}/bookings/${id}/allocate-pod`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ podIds: selectedPodIds }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to allocate pod");

      setEmailMessage({
        type: "success",
        text: "Pods allocated successfully!",
      });
      fetchBooking(); // Refresh booking details
    } catch (err) {
      setEmailMessage({ type: "error", text: err.message });
    } finally {
      setAllocating(false);
    }
  };

  const fetchBooking = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/bookings/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch booking details");
      }

      const data = await response.json();
      setBooking(data.booking || data);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut) - new Date(checkIn);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getBoardTypeLabel = (boardType) => {
    const labels = {
      breakfastOnly: "Breakfast Only",
      halfBoard: "Half Board",
      fullBoard: "Full Board",
    };
    return labels[boardType] || boardType || "N/A";
  };

  const handleSendConfirmation = async () => {
    if (!booking?.GuestDirectory?.email) {
      setEmailMessage({ type: "error", text: "Guest email not available" });
      return;
    }

    setSendingEmail(true);
    setEmailMessage(null);

    try {
      const response = await fetch(
        `${BASE_URL}/bookings/${id}/send-confirmation`,
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
        throw new Error(data.error || "Failed to send confirmation email");
      }

      setEmailMessage({
        type: "success",
        text: "Confirmation email sent successfully!",
      });
    } catch (err) {
      setEmailMessage({ type: "error", text: err.message });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleResendInvoice = async () => {
    if (!booking?.GuestDirectory?.email) {
      setEmailMessage({ type: "error", text: "Guest email not available" });
      return;
    }

    setSendingEmail(true);
    setEmailMessage(null);

    try {
      const response = await fetch(
        `${BASE_URL}/bookings/${id}/resend-invoice`,
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
        throw new Error(data.error || "Failed to resend invoice");
      }

      setEmailMessage({
        type: "success",
        text: "Invoice resent successfully!",
      });
    } catch (err) {
      setEmailMessage({ type: "error", text: err.message });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCancelBooking = async () => {
    setCancelling(true);
    setEmailMessage(null);

    try {
      const response = await fetch(`${BASE_URL}/bookings/${id}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel booking");
      }

      setEmailMessage({
        type: "success",
        text: "Booking cancelled successfully!",
      });
      setShowCancelModal(false);
      fetchBooking(); // Refresh booking details
    } catch (err) {
      setEmailMessage({ type: "error", text: err.message });
    } finally {
      setCancelling(false);
    }
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

  if (error || !booking) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error || "Booking not found"}</p>
          <button
            onClick={() => navigate("/admin/bookings")}
            className="text-[#008080] hover:underline"
          >
            Back to Bookings
          </button>
        </div>
      </AdminLayout>
    );
  }

  const nights = calculateNights(booking.checkIn, booking.checkOut);
  const guest = booking.GuestDirectory || {};
  const pod = booking.Pod || {};
  const bookingGuests = booking.BookingGuests?.[0] || {};
  const payment = booking.BookingPayments?.[0] || {};
  const isPaid =
    payment.paymentStatus === "successful" ||
    booking.bookingStatus === "paid" ||
    booking.bookingStatus === "confirmed";

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <h1 className="text-2xl font-bold text-[#333333]">
          Bookings Management
        </h1>

        {/* Email Message */}
        {emailMessage && (
          <div
            className={`p-4 rounded-lg ${emailMessage.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
          >
            {emailMessage.text}
          </div>
        )}

        {/* Booking Card */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
          {/* Back Button & Title */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <button
              onClick={() => navigate("/admin/bookings")}
              className="text-[#333333] hover:text-gray-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-[#333333]">
              {booking.bookingReference || booking.id?.slice(0, 8)} -{" "}
              {guest.fullName || "Guest"}
            </h2>
            <span
              className={`ml-auto px-3 py-1 rounded-full text-sm font-medium capitalize ${
                booking.bookingStatus === "confirmed" ||
                booking.bookingStatus === "paid"
                  ? "bg-green-100 text-green-700"
                  : booking.bookingStatus === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {booking.bookingStatus}
            </span>
          </div>

          {/* Guest Details */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <h3 className="font-semibold text-[#333333]">Guests Details</h3>
            </div>
            <p className="text-sm text-gray-600">
              {bookingGuests.adults || 2} Adults (18+)
              {bookingGuests.children > 0 &&
                `, ${bookingGuests.children} Children`}
              {bookingGuests.toddlers > 0 &&
                `, ${bookingGuests.toddlers} Toddlers`}
              {bookingGuests.infants > 0 &&
                `, ${bookingGuests.infants} Infants`}
            </p>
            <p className="text-sm text-gray-600">
              1- {guest.fullName || "Guest"} - {guest.email || ""}
            </p>
            {guest.phone && (
              <p className="text-sm text-gray-600">Phone: {guest.phone}</p>
            )}
          </div>

          {/* Stay Dates */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="font-semibold text-[#333333]">Stay Dates</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Check in: {formatDate(booking.checkIn)}
                </p>
                <p className="text-sm text-gray-500">
                  Check out: {formatDate(booking.checkOut)}
                </p>
              </div>
              <span className="font-semibold text-[#008080]">
                {nights} Nights
              </span>
            </div>
          </div>

          {/* Pod */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <h3 className="font-semibold text-[#333333]">Pod</h3>
            </div>
            <p className="text-sm text-gray-600">
              {pod.podName || "Unknown Pod"}
            </p>
            {pod.description && (
              <p className="text-xs text-gray-400 mt-1">{pod.description}</p>
            )}
          </div>

          {/* Manual Pod Allocation */}
          <div className="mb-6 p-4 bg-[#008080]/5 border border-[#008080]/20 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-[#008080]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <h3 className="font-semibold text-[#333333]">
                  Manual Pod Allocation
                </h3>
              </div>
              <span className="text-xs font-medium text-[#008080] bg-[#008080]/10 px-2 py-1 rounded-full uppercase">
                Requires {booking.podCount || 1} Pod(s)
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {fetchingPods ? (
                  <div className="col-span-full py-8 text-center text-sm text-gray-500 animate-pulse">
                    Loading available pods...
                  </div>
                ) : availablePods.length === 0 ? (
                  <div className="col-span-full py-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm border border-amber-200 mb-2">
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
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      No pods found matching guest capacity.
                    </div>
                    <p className="text-xs text-gray-400">
                      Dates: {booking.checkIn.split("T")[0]} to{" "}
                      {booking.checkOut.split("T")[0]}
                      <br />
                      Guests: {booking.BookingGuests?.[0]?.adults ||
                        1} Adults, {booking.BookingGuests?.[0]?.children || 0}{" "}
                      Children
                    </p>
                  </div>
                ) : (
                  availablePods.map((p) => {
                    const isSelected = selectedPodIds.includes(p.id);
                    const isCurrent = p.id === booking.podId;
                    const isDisabled =
                      !p.available && !isSelected && !isCurrent;

                    return (
                      <div
                        key={p.id}
                        onClick={() => !isDisabled && togglePodSelection(p.id)}
                        className={`relative p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#008080] border-[#008080] text-white shadow-md shadow-[#008080]/20"
                            : isDisabled
                              ? "bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed"
                              : "bg-white border-gray-200 hover:border-[#008080]/50 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span
                            className={`font-medium text-sm ${isSelected ? "text-white" : "text-gray-800"}`}
                          >
                            {p.title}
                          </span>
                          {isSelected && (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : p.available
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {p.available ? "Available" : "Occupied"}
                          </span>
                          {isCurrent && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              Current
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#008080]/10">
                <div className="text-sm">
                  <span className="text-gray-500">Selected: </span>
                  <span className="font-bold text-[#333333]">
                    {selectedPodIds.length} / {booking.podCount || 1}
                  </span>
                </div>
                <button
                  onClick={handleAllocatePod}
                  disabled={
                    selectedPodIds.length !== (booking.podCount || 1) ||
                    allocating
                  }
                  className="px-8 py-2.5 bg-[#008080] text-white rounded-lg text-sm font-semibold hover:bg-[#006666] shadow-lg shadow-[#008080]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  {allocating ? "Processing..." : "Confirm Allocation"}
                </button>
              </div>
            </div>
          </div>

          {/* Meal Plan */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <h3 className="font-semibold text-[#333333]">Meal Plan</h3>
            </div>
            <p className="text-sm text-gray-600">
              {getBoardTypeLabel(booking.boardType)}
            </p>
          </div>

          {/* Extras */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
              <h3 className="font-semibold text-[#333333]">Extras</h3>
            </div>
            {booking.BookingExtras && booking.BookingExtras.length > 0 ? (
              <ul className="text-sm text-gray-600">
                {booking.BookingExtras.map((extra, i) => (
                  <li key={i}>- {extra.Extra?.name || "Extra"}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">N/A</p>
            )}
            {booking.popUpBeds > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Pop-up Beds: {booking.popUpBeds}
              </p>
            )}
          </div>

          {/* Price Summary */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="font-semibold text-[#333333] mb-4">Price Summary</h3>
            <p className="text-sm text-gray-500 mb-3">
              Pod & Meals ({nights} Nights)
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sub Total:</span>
                <span className="text-gray-800">
                  ₦{formatCurrency(parseFloat(booking.totalPrice) * 0.875)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  After consumption tax and VAT(12.5%)
                </span>
                <span className="text-gray-800">
                  ₦{formatCurrency(parseFloat(booking.totalPrice) * 0.125)}
                </span>
              </div>
            </div>

            <div className="flex justify-between py-3 bg-gray-100 px-4 rounded-lg mb-4">
              <span className="font-medium text-gray-700">Total:</span>
              <span className="font-bold text-[#333333]">
                ₦{formatCurrency(booking.totalPrice)}
              </span>
            </div>

            <div className="flex justify-between py-3 bg-[#00CED1]/20 px-4 rounded-lg mb-6">
              <span className="text-gray-700">Payment Status:</span>
              <div className="flex items-center gap-2">
                <span
                  className={`font-medium ${isPaid ? "text-green-600" : "text-red-500"}`}
                >
                  {isPaid ? "Paid" : "Not Paid"}
                </span>
                {!isPaid && <span className="text-red-500">✕</span>}
                {isPaid && <span className="text-green-500">✓</span>}
              </div>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-[#333333] mb-2">
                Pricing Configuration At Booking Time
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Base Price Per Pod:</span>
                  <span className="font-semibold text-gray-800">
                    {booking.configBasePricePerPod != null
                      ? `₦${parseFloat(booking.configBasePricePerPod).toLocaleString()}`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Extra Guest Fee:</span>
                  <span className="font-semibold text-gray-800">
                    {booking.configExtraGuestFee != null
                      ? `₦${parseFloat(booking.configExtraGuestFee).toLocaleString()}`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Max Guests Per Pod:</span>
                  <span className="font-semibold text-gray-800">
                    {booking.configMaxGuestsPerPod != null
                      ? booking.configMaxGuestsPerPod
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Min Guests Per Booking:</span>
                  <span className="font-semibold text-gray-800">
                    {booking.configMinGuestsPerPod != null
                      ? booking.configMinGuestsPerPod
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Pods Available:</span>
                  <span className="font-semibold text-gray-800">
                    {booking.configTotalPodsAvailable != null
                      ? booking.configTotalPodsAvailable
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Currency:</span>
                  <span className="font-semibold text-gray-800">
                    {booking.configCurrency || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            {payment.id && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-[#333333] mb-2">
                  Payment Details
                </h4>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-gray-500">Method:</span>{" "}
                    {payment.paymentMethod || payment.gateway}
                  </p>
                  <p>
                    <span className="text-gray-500">Reference:</span>{" "}
                    {payment.transactionReference}
                  </p>
                  {payment.paidAt && (
                    <p>
                      <span className="text-gray-500">Paid At:</span>{" "}
                      {new Date(payment.paidAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleResendInvoice}
                disabled={sendingEmail || booking.bookingStatus === "cancelled"}
                className="flex-1 min-w-[150px] py-3 border border-gray-300 rounded-lg text-[#333333] hover:bg-gray-50 font-medium disabled:opacity-50 transition-colors"
              >
                {sendingEmail ? "Sending..." : "Resend Invoice"}
              </button>
              <button
                onClick={handleSendConfirmation}
                disabled={sendingEmail}
                className={`flex-1 min-w-[150px] py-3 rounded-lg font-medium disabled:opacity-50 transition-colors ${
                  booking.bookingStatus === "cancelled"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-[#008080] text-white hover:bg-[#006666]"
                }`}
              >
                {sendingEmail
                  ? "Sending..."
                  : booking.bookingStatus === "cancelled"
                    ? "Send Cancellation Email"
                    : "Send Confirmation Email"}
              </button>
              {booking.bookingStatus !== "cancelled" && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="flex-1 min-w-[150px] py-3 bg-white border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Cancel Booking?</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this booking for{" "}
              <span className="font-semibold text-gray-900">
                {guest.fullName}
              </span>
              ? This action will:
              <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
                <li>Mark the booking as cancelled</li>
                <li>Release the pod for the selected dates</li>
                <li>Send a cancellation email to the guest</li>
              </ul>
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Go Back
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Cancelling...
                  </>
                ) : (
                  "Yes, Cancel Booking"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

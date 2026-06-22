import React, { useState, useEffect, useCallback } from "react";
import CommonNavbar from "@/components/shared/common/CommonNavbar/CommonNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Home,
  Info,
  Wallet,
  Check,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useBookingStore, calculateDynamicSubTotal } from "@/store/useBookingStore";
import { BASE_URL } from "@/config";
import { formatDateSafe, parseAvailabilityCheckResponse, resolveMediaUrl, DEFAULT_POD_IMAGE_URL, toISODate } from "@/lib/utils";
import { calculateStayRoomSubtotal } from "@/lib/stayPricing";
import {
  findMinValidPodCount,
  findMaxValidPodCount,
  isFamilyCompositionAllowed,
  normalizeFamilyGuests,
} from "@/lib/familyRules";

function formatPrice(n) {
  return n.toLocaleString();
}

function PodThumbnail({ src, alt, className = "" }) {
  const [imgSrc, setImgSrc] = useState(() => resolveMediaUrl(src));

  useEffect(() => {
    setImgSrc(resolveMediaUrl(src));
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      loading="lazy"
      onError={() => setImgSrc(DEFAULT_POD_IMAGE_URL)}
      className={className}
    />
  );
}

function buildDomeDetailsFromSelection(selectedPodIds, availablePods) {
  return selectedPodIds.map((id) => {
    const pod = availablePods.find((p) => p.id === id);
    return {
      podId: id,
      podName: pod?.title || "Dome",
      bedConfig: "1 x King Bed (6 foot)",
      guests: ["", ""],
    };
  });
}

export default function SelectRooms() {
  const navigate = useNavigate();
  const bookingStore = useBookingStore();
  const pricingConfig = bookingStore.draft.pricingConfig;
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [selectedPodIds, setSelectedPodIds] = useState(
    () => bookingStore.draft.selectedPodIds || [],
  );
  const [roomCount, setRoomCount] = useState(
    () => Number(bookingStore.draft.podCount) || 0,
  );

  const availablePods = Array.isArray(bookingStore.draft.availablePods)
    ? bookingStore.draft.availablePods
    : [];
  const availablePodsCount = availablePods.filter((p) => p.available === true).length;

  const getPodLimits = useCallback(() => {
    const guests = normalizeFamilyGuests(bookingStore.draft.guests || {});
    const guestCount = guests.adults + guests.teenagers;

    if (availablePodsCount <= 0) {
      return { guestCount, guests, minPods: 0, maxPods: 0 };
    }

    const minByRules = findMinValidPodCount(guests);
    const maxByRules = findMaxValidPodCount(guests, availablePodsCount);

    if (minByRules === null || maxByRules === null) {
      return { guestCount, guests, minPods: 0, maxPods: 0 };
    }

    const minPods = Math.min(minByRules, availablePodsCount);
    const maxPods = Math.min(maxByRules, availablePodsCount);

    return { guestCount, guests, minPods, maxPods };
  }, [bookingStore.draft.guests, availablePodsCount]);

  const computeSubTotal = useCallback(
    (podCount) => {
      const { guests, guestCount } = getPodLimits();
      const { subtotal } = calculateStayRoomSubtotal({
        checkIn: bookingStore.draft.dates?.checkIn,
        checkOut: bookingStore.draft.dates?.checkOut,
        podsCount: podCount,
        guestCounts: guests,
        guestsCount: guestCount,
        pricingConfig: pricingConfig ?? {},
        seasonalRates: bookingStore.draft.seasonalRatePeriods ?? [],
      });
      return subtotal;
    },
    [bookingStore.draft.dates, bookingStore.draft.seasonalRatePeriods, getPodLimits, pricingConfig],
  );

  const refreshAvailability = useCallback(async () => {
    const { dates, guests } = bookingStore.draft;
    if (!dates?.checkIn || !dates?.checkOut) return false;

    const startDate = toISODate(dates.checkIn);
    const endDate = toISODate(dates.checkOut);
    if (!startDate || !endDate) return false;

    setFetchError(null);
    try {
      const response = await fetch(`${BASE_URL}/availability/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          endDate,
          adults: (guests?.adults || 0) + (guests?.teenagers || 0),
        }),
      });
      if (!response.ok) {
        throw new Error(`Availability check failed (${response.status})`);
      }
      const data = await response.json();
      const { pods, peakRateInfo, weekdayPeakInfo, seasonalRatePeriods } =
        parseAvailabilityCheckResponse(data);
      bookingStore.updateDraft({
        availablePods: pods,
        peakRateInfo,
        weekdayPeakInfo,
        seasonalRatePeriods,
      });
      return true;
    } catch (err) {
      console.error("SelectRooms availability error:", err);
      const hasCachedPods =
        Array.isArray(bookingStore.draft.availablePods) &&
        bookingStore.draft.availablePods.length > 0;
      if (!hasCachedPods) {
        setFetchError("We couldn't refresh room availability. Please try again.");
      }
      return false;
    }
  }, [bookingStore]);

  useEffect(() => {
    if (!bookingStore.draft.dates?.checkIn || !bookingStore.draft.dates?.checkOut) {
      navigate("/", { replace: true });
      return;
    }
    if (!bookingStore.draft.guests?.adults) {
      navigate("/guest-details", { replace: true });
      return;
    }

    async function init() {
      setLoading(true);
      if (!pricingConfig) {
        try {
          const response = await fetch(`${BASE_URL}/config/pricing`);
          if (response.ok) {
            const data = await response.json();
            bookingStore.updateDraft({
              pricingConfig: {
                basePricePerPod: data.base_price_per_pod,
                extraGuestFee: data.extra_guest_fee,
                basePricePerPodOffPeak: data.base_price_per_pod_off_peak,
                basePricePerPodPeak: data.base_price_per_pod_peak,
                extraGuestFeeOffPeak: data.extra_guest_fee_off_peak,
                extraGuestFeePeak: data.extra_guest_fee_peak,
                maxGuestsPerPod: data.max_guests_per_pod,
                minGuestsPerPod: data.min_guests_per_pod,
                totalPodsAvailable: data.total_pods_available,
                twelveGuestDiscountPercent: data.twelve_guest_discount_percent ?? 10,
                currency: data.currency,
              },
            });
          }
        } catch (err) {
          console.error("Error fetching pricing:", err);
        }
      }

      await refreshAvailability();
      setLoading(false);
    }

    init();
  }, []);

  useEffect(() => {
    if (loading || availablePodsCount <= 0) return;

    const { minPods, maxPods, guests } = getPodLimits();
    if (minPods < 1) return;

    let nextCount = roomCount;
    if (nextCount < minPods || nextCount > maxPods) {
      const draftPods = Number(bookingStore.draft.podCount) || 0;
      const validDraft =
        draftPods >= minPods &&
        draftPods <= maxPods &&
        isFamilyCompositionAllowed(guests, draftPods);
      nextCount = validDraft ? draftPods : minPods;
      setRoomCount(nextCount);
    }

    if (nextCount !== bookingStore.draft.podCount) {
      bookingStore.updateDraft({
        podCount: nextCount,
        subTotal: computeSubTotal(nextCount),
      });
    }
  }, [loading, availablePodsCount, getPodLimits]);

  useEffect(() => {
    const stored = bookingStore.draft.selectedPodIds || [];
    const pods = bookingStore.draft.availablePods || [];
    const validStored = stored.filter((id) => {
      const pod = pods.find((p) => p.id === id);
      return pod?.available === true;
    });
    if (validStored.length !== stored.length) {
      setSelectedPodIds(validStored);
    }
  }, [bookingStore.draft.availablePods]);

  const onChangeRooms = (type) => {
    const { minPods, maxPods } = getPodLimits();
    let nextCount = roomCount;

    if (type === "dec") {
      if (roomCount <= minPods) return;
      nextCount = roomCount - 1;
    } else {
      if (roomCount < minPods) {
        nextCount = minPods;
      } else if (roomCount < maxPods) {
        nextCount = roomCount + 1;
      } else {
        return;
      }
    }

    setRoomCount(nextCount);
    setSelectedPodIds([]);
    bookingStore.updateDraft({
      podCount: nextCount,
      selectedPodIds: [],
      podId: undefined,
      domeDetails: [],
      bedConfiguration: "",
      subTotal: computeSubTotal(nextCount),
    });
  };

  const togglePodSelection = (podId) => {
    const pod = availablePods.find((p) => p.id === podId);
    if (!pod?.available) return;

    const required = roomCount || Number(bookingStore.draft.podCount) || 1;

    setSelectedPodIds((prev) => {
      let next;
      if (prev.includes(podId)) {
        next = prev.filter((id) => id !== podId);
      } else if (prev.length < required) {
        next = [...prev, podId];
      } else if (required === 1) {
        next = [podId];
      } else {
        return prev;
      }

      const domeDetails = buildDomeDetailsFromSelection(next, availablePods);
      bookingStore.updateDraft({
        selectedPodIds: next,
        podId: next[0] || undefined,
        domeDetails,
        bedConfiguration: domeDetails[0]?.bedConfig || "",
      });
      return next;
    });
  };

  const handleContinue = () => {
    const required = roomCount || Number(bookingStore.draft.podCount) || 1;
    if (selectedPodIds.length !== required) return;

    const domeDetails = buildDomeDetailsFromSelection(selectedPodIds, availablePods);
    bookingStore.updateDraft({
      selectedPodIds,
      podId: selectedPodIds[0],
      podCount: required,
      domeDetails,
      bedConfiguration: domeDetails[0]?.bedConfig || "",
      subTotal: computeSubTotal(required),
    });
    navigate("/meal-plan");
  };

  const { minPods, maxPods } = getPodLimits();
  const requiredCount = roomCount || Number(bookingStore.draft.podCount) || 0;
  const selectionComplete =
    requiredCount > 0 && selectedPodIds.length === requiredCount;
  const showRoomCountPicker = minPods > 0 && maxPods > 0 && minPods !== maxPods;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#09432B]" />
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden min-h-screen w-full bg-[#F7F5F0]">
      <CommonNavbar />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-sm text-gray-700 mb-6 pl-0 hover:bg-transparent"
        >
          <ArrowLeft className="w-4 h-4" />
          <Link to="/guest-details">Back</Link>
        </Button>

        <h2 className="text-2xl md:text-5xl font-bold text-[#09432B] text-center">
          Choose Your Dome
        </h2>
        <p className="text-center text-sm md:text-lg font-medium text-[#737373] mt-2 mb-6">
          Step 2 of 6 — Select your preferred room{requiredCount > 1 ? "s" : ""}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-5">
            <div
              className="rounded-lg border border-[#C7C3B5] px-4 py-3 flex items-center gap-2 text-[#09432B]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(181,171,132,0.28) 0%, rgba(161,146,87,0.28) 100%)",
              }}
            >
              <Info className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">
                {requiredCount > 1
                  ? `Select ${requiredCount} available domes for your stay. Tap a dome to select or deselect.`
                  : "Tap an available dome below to reserve it for your stay."}
              </span>
            </div>

            {fetchError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {fetchError}
                <button
                  type="button"
                  onClick={refreshAvailability}
                  className="ml-2 underline font-semibold"
                >
                  Retry
                </button>
              </div>
            )}

            {showRoomCountPicker && (
              <Card className="bg-white rounded-xl shadow-sm border border-[#C7C3B5]">
                <CardContent className="p-5">
                  <span className="text-lg font-semibold text-[#09432B]">
                    How many domes do you need?
                  </span>
                  <div className="flex items-center gap-6 mt-4 justify-center">
                    <button
                      type="button"
                      onClick={() => onChangeRooms("dec")}
                      disabled={roomCount <= minPods}
                      className="w-12 h-12 rounded-full border-2 border-[#0F5B45] flex items-center justify-center text-[#0F5B45] text-xl disabled:opacity-50"
                    >
                      –
                    </button>
                    <span className="text-2xl font-bold text-[#09432B] w-8 text-center">
                      {roomCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => onChangeRooms("inc")}
                      disabled={roomCount >= maxPods}
                      className="w-12 h-12 rounded-full border-2 border-[#0F5B45] flex items-center justify-center text-[#0F5B45] text-xl disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm text-[#737373] text-center mt-3">
                    Your guest mix allows {minPods}–{maxPods} dome
                    {maxPods === 1 ? "" : "s"} for these dates.
                  </p>
                </CardContent>
              </Card>
            )}

            {availablePodsCount < 1 ? (
              <Card className="bg-white rounded-xl shadow-sm border border-[#C7C3B5]">
                <CardContent className="p-6 text-center">
                  <p className="text-lg font-semibold text-[#09432B] mb-2">
                    No domes available
                  </p>
                  <p className="text-sm text-[#737373] mb-4">
                    All domes are booked for your selected dates. Please try different dates or
                    adjust your guest count.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button variant="outline" asChild>
                      <Link to="/guest-details">Change guests</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/">Change dates</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : minPods < 1 ? (
              <Card className="bg-white rounded-xl shadow-sm border border-[#C7C3B5]">
                <CardContent className="p-6 text-center">
                  <p className="text-lg font-semibold text-[#09432B] mb-2">
                    Not enough domes for your guest mix
                  </p>
                  <p className="text-sm text-[#737373] mb-4">
                    Your guests need more domes than are available for these dates.
                  </p>
                  <Button variant="outline" asChild>
                    <Link to="/guest-details">Adjust guests</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-2.5">
                {availablePods.map((pod) => {
                  const isSelected = selectedPodIds.includes(pod.id);
                  const isDisabled = !pod.available;

                  return (
                    <button
                      key={pod.id}
                      type="button"
                      onClick={() => togglePodSelection(pod.id)}
                      disabled={isDisabled}
                      className={`relative flex w-full items-center gap-3 rounded-lg border-2 px-3 py-2.5 text-left transition-all ${
                        isSelected
                          ? "border-[#09432B] bg-[#E6F2EE] shadow-sm"
                          : isDisabled
                            ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                            : "border-gray-200 bg-white hover:border-[#09432B]/40 hover:shadow-sm"
                      }`}
                    >
                      <div className="w-20 h-16 sm:w-24 sm:h-[4.5rem] shrink-0 rounded-md overflow-hidden bg-gray-100">
                        <PodThumbnail
                          src={pod.img}
                          alt={pod.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 py-0.5">
                        <h3 className="text-sm sm:text-base font-bold text-[#09432B] truncate pr-6">
                          {pod.title}
                        </h3>

                        {pod.desc && (
                          <p className="text-[11px] sm:text-xs text-[#737373] mt-0.5 line-clamp-1">
                            {pod.desc}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <span
                            className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold ${
                              pod.available
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {pod.available ? "Available" : "Occupied"}
                          </span>
                          {Array.isArray(pod.tags) &&
                            pod.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="text-[9px] sm:text-[10px] bg-[#F2EFE7] text-[#09432B] px-1.5 py-0.5 rounded-full truncate max-w-[7rem]"
                              >
                                {tag}
                              </span>
                            ))}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#09432B] flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {requiredCount > 0 && availablePodsCount > 0 && (
              <p className="text-sm text-center text-[#737373]">
                Selected:{" "}
                <span className="font-semibold text-[#09432B]">
                  {selectedPodIds.length} / {requiredCount}
                </span>
              </p>
            )}
          </div>

          <div className="md:col-span-4 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#E6F2EE] rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-[#09432B]" />
                </div>
                <h4 className="text-[#09432B] font-bold text-base">Stay Dates</h4>
              </div>
              <div className="flex items-start justify-between w-full">
                <div>
                  <p className="text-sm text-[#737373]">Check in:</p>
                  <p className="text-sm font-medium text-[#4F4F4F] mt-1">
                    {formatDateSafe(bookingStore.draft.dates?.checkIn, "dd/MM/yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#737373]">Check out:</p>
                  <p className="text-sm font-medium text-[#4F4F4F] mt-1">
                    {formatDateSafe(bookingStore.draft.dates?.checkOut, "dd/MM/yyyy")}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[#09432B] whitespace-nowrap">
                  {bookingStore.draft.numberOfNights} Nights
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#E6F2EE] rounded-full flex items-center justify-center">
                  <Home className="w-4 h-4 text-[#09432B]" />
                </div>
                <h4 className="text-[#09432B] font-bold">Your Rooms</h4>
              </div>
              {selectedPodIds.length > 0 ? (
                <ul className="space-y-1">
                  {selectedPodIds.map((id) => {
                    const pod = availablePods.find((p) => p.id === id);
                    return (
                      <li key={id} className="text-sm text-[#737373] font-medium">
                        {pod?.title || "Dome"}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-[#737373] font-medium">
                  {requiredCount > 0
                    ? `Select ${requiredCount} dome${requiredCount === 1 ? "" : "s"}`
                    : "—"}
                </p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#E6F2EE] rounded-full flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-[#09432B]" />
                </div>
                <h4 className="text-[#09432B] font-bold">Price Summary</h4>
              </div>
              {(() => {
                const dynamicSubTotal = calculateDynamicSubTotal(bookingStore.draft);
                const taxableBase = dynamicSubTotal;
                const taxAmount =
                  taxableBase > 0 ? Math.round(taxableBase * 0.125) : 0;
                const totalAmount =
                  taxableBase > 0 ? Math.round(taxableBase * 1.125) : 0;

                return (
                  <div className="space-y-3 text-sm font-semibold text-[#09432B]">
                    <div className="flex justify-between">
                      <span>Sub Total:</span>
                      <span>₦{formatPrice(dynamicSubTotal)}</span>
                    </div>
                    <div className="flex justify-between leading-snug">
                      <span>
                        After consumption tax and <br /> VAT(12.5%)
                      </span>
                      <span>₦{formatPrice(taxAmount)}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between bg-[#F2EFE7] px-3 py-2 rounded-md">
                      <span>Total:</span>
                      <span>₦{formatPrice(totalAmount)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="w-full rounded-t-xl overflow-hidden">
              <div
                className="px-4 py-3 text-[#0A4C30] text-sm font-medium"
                style={{ backgroundColor: "#B7FFFF" }}
              >
                {selectionComplete
                  ? "Your dome selection looks good — let's continue"
                  : `Select ${requiredCount} dome${requiredCount === 1 ? "" : "s"} to continue`}
              </div>
              <Button
                className={`w-full text-white text-base font-bold py-6 rounded-none rounded-b-xl ${
                  selectionComplete
                    ? "bg-[#09432B] hover:bg-[#083f28]"
                    : "bg-gray-400 cursor-not-allowed opacity-50"
                }`}
                disabled={!selectionComplete}
                onClick={handleContinue}
              >
                Continue to Bed Configuration →
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full py-6 mt-4 rounded-md border border-[#09432B] text-[#09432B] font-bold cursor-pointer"
              onClick={() => {
                bookingStore.resetBooking();
                navigate("/");
              }}
            >
              Restart Booking
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

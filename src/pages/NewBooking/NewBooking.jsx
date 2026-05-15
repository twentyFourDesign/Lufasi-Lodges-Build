import React, { useState, useCallback, useEffect } from "react";
import CommonNavbar from "@/components/shared/common/CommonNavbar/CommonNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Home, Info, Star, Wallet, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useBookingStore, calculateDynamicSubTotal } from "@/store/useBookingStore";
import { format, differenceInCalendarDays } from "date-fns";
import { BASE_URL } from "@/config";
import EditStayDatesModal from "@/components/edit-booking/EditStayDatesModal";
import { toISODate, formatDateSafe, parseAvailabilityCheckResponse } from "@/lib/utils";
import { calculateStayRoomSubtotal } from "@/lib/stayPricing";
import image1 from "@/assets/lodges/image.png";
import image2 from "@/assets/lodges/image copy.png";
import image3 from "@/assets/lodges/image copy 2.png";
import image4 from "@/assets/lodges/image copy 3.png";
import image5 from "@/assets/lodges/image copy 4.png";
import image6 from "@/assets/lodges/image copy 5.png";

function formatPrice(n) {
  return n.toLocaleString();
}

export default function NewBooking() {
  const navigate = useNavigate();
  const bookingStore = useBookingStore();
  const [stayOpen, setStayOpen] = useState(false);
  const pricingConfig = bookingStore.draft.pricingConfig;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [image1, image2, image3, image4, image5, image6];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Count available pods
  const availablePodsCount = Array.isArray(bookingStore.draft.availablePods)
    ? bookingStore.draft.availablePods.filter((pod) => pod.available === true)
      .length
    : 0;
  const [roomCount, setRoomCount] = useState(0);

  const podTags = ["Air conditioning", "Wifi", "Forest View"];

  const getPodLimits = () => {
    const adults = bookingStore.draft.guests?.adults || 0;
    const guestCount = adults > 0 ? adults : 1;

    let minPods = 0;
    let maxPods = 0;

    if (availablePodsCount > 0) {
      if (guestCount === 1) {
        minPods = 1;
        maxPods = 1;
      } else if (guestCount === 2) {
        minPods = 1;
        maxPods = 2;
      } else if (guestCount === 3) {
        minPods = 2;
        maxPods = 3;
      } else if (guestCount === 4) {
        minPods = 2;
        maxPods = 4;
      } else if (guestCount === 5) {
        minPods = 3;
        maxPods = 5;
      } else if (guestCount === 6) {
        minPods = 3;
        maxPods = 6;
      } else if (guestCount === 7) {
        minPods = 4;
        maxPods = 6;
      } else if (guestCount === 8) {
        minPods = 4;
        maxPods = 6;
      } else if (guestCount === 9) {
        minPods = 5;
        maxPods = 6;
      } else if (guestCount === 10) {
        minPods = 5;
        maxPods = 6;
      } else if (guestCount === 11) {
        minPods = 6;
        maxPods = 6;
      } else if (guestCount === 12) {
        minPods = 6;
        maxPods = 6;
      }

      if (maxPods > availablePodsCount) {
        maxPods = availablePodsCount;
      }
      if (minPods > maxPods) {
        minPods = maxPods;
      }
    }

    return { guestCount, minPods, maxPods };
  };

  const computeSubTotal = (guestCount, podCount) => {
    const weekday = bookingStore.draft.weekdayPeakInfo;
    const { subtotal } = calculateStayRoomSubtotal({
      checkIn: bookingStore.draft.dates?.checkIn,
      checkOut: bookingStore.draft.dates?.checkOut,
      podsCount: podCount,
      guestsCount: guestCount,
      basePricePerPod: pricingConfig?.basePricePerPod ?? 400000,
      extraGuestFee: pricingConfig?.extraGuestFee ?? 100000,
      weekdayPeakPercent:
        weekday?.peakPercent ?? pricingConfig?.weekdayPeakPercent ?? 0,
      weekdayOffPeakPercent:
        weekday?.offPeakPercent ?? pricingConfig?.weekdayOffPeakPercent ?? 0,
      seasonalRates: bookingStore.draft.seasonalRatePeriods ?? [],
    });
    return subtotal;
  };

  useEffect(() => {
    async function fetchPricingConfig() {
      try {
        const response = await fetch(`${BASE_URL}/config/pricing`);
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        bookingStore.updateDraft({
          pricingConfig: {
            basePricePerPod: data.base_price_per_pod,
            extraGuestFee: data.extra_guest_fee,
            maxGuestsPerPod: data.max_guests_per_pod,
            minGuestsPerPod: data.min_guests_per_pod,
            totalPodsAvailable: data.total_pods_available,
            twelveGuestDiscountPercent: data.twelve_guest_discount_percent ?? 10,
            currency: data.currency,
            weekdayPeakPercent: data.weekday_peak_percent ?? 0,
            weekdayOffPeakPercent: data.weekday_off_peak_percent ?? 0,
          },
        });
      } catch (error) {
        console.error("Error fetching pricing configuration:", error);
      }
    }

    fetchPricingConfig();
  }, []);

  const onChangeRooms = (type) => {
    const { guestCount, minPods, maxPods } = getPodLimits();

    if (type === "dec") {
      if (roomCount <= minPods) {
        return;
      }
      const nextCount = roomCount - 1;
      setRoomCount(nextCount);
      bookingStore.updateDraft({
        podCount: nextCount,
        subTotal: computeSubTotal(guestCount, nextCount),
      });
    } else if (type === "inc") {
      let nextCount = roomCount;
      if (roomCount < minPods) {
        nextCount = minPods;
      } else if (roomCount < maxPods) {
        nextCount = roomCount + 1;
      } else {
        return;
      }
      setRoomCount(nextCount);
      bookingStore.updateDraft({
        podCount: nextCount,
        subTotal: computeSubTotal(guestCount, nextCount),
      });
    }
  };

  useEffect(() => {
    if (availablePodsCount <= 0) {
      return;
    }
    if (roomCount !== 0) {
      return;
    }
    const { guestCount, minPods } = getPodLimits();
    if (minPods < 1) {
      return;
    }
    setRoomCount(minPods);
    bookingStore.updateDraft({
      podCount: minPods,
      subTotal: computeSubTotal(guestCount, minPods),
    });
  }, [availablePodsCount, roomCount, bookingStore]);

  const checkPodAvalability = useCallback(async (customCheckIn, customCheckOut, customAdults) => {
    try {
      const response = await fetch(`${BASE_URL}/availability/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: customCheckIn || bookingStore.draft.dates?.checkIn,
          endDate: customCheckOut || bookingStore.draft.dates?.checkOut,
          adults: customAdults || parseInt(bookingStore.draft.guests?.adults) || 1,
        }),
      });
      const data = await response.json();
      console.log("checkPodAvalability data:", data);
      const { pods, peakRateInfo, weekdayPeakInfo, seasonalRatePeriods } =
        parseAvailabilityCheckResponse(data);

      bookingStore.updateDraft({
        availablePods: pods,
        peakRateInfo,
        weekdayPeakInfo,
        seasonalRatePeriods,
      });
    } catch (error) {
      console.error("Error checking availability:", error);
    }
  }, [bookingStore]);

  const setStayDates = (dates) => {
    function parseDate(ddmmyyyy) {
      if (!ddmmyyyy) return null;
      const [day, month, year] = ddmmyyyy.split("/");
      return new Date(year, month - 1, day);
    }
    const checkIn = parseDate(dates.checkIn);
    const checkOut = parseDate(dates.checkOut);

    bookingStore.updateDraft({
      dates: {
        checkIn: toISODate(checkIn),
        checkOut: toISODate(checkOut),
      },
      numberOfNights: differenceInCalendarDays(checkOut, checkIn),
      guests: {
        ...bookingStore.draft.guests,
        adults: parseInt(dates.guests.match(/(\d+)/)[1]) || 1,
      },
    });
    
    checkPodAvalability(
      toISODate(checkIn),
      toISODate(checkOut),
      parseInt(dates.guests.match(/(\d+)/)[1]) || 1
    );
    setStayOpen(false);
  };

  return (
    <div className="overflow-x-hidden min-h-screen lg:min-h-[80vh] w-full bg-[#F7F5F0]">
      <CommonNavbar />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-sm text-gray-700 mb-6 pl-0 hover:bg-transparent"
        >
          <ArrowLeft className="w-4 h-4" />
          <Link to="/">Back to Home</Link>
        </Button>
        <h2 className="text-2xl md:text-5xl font-bold text-[#09432B] text-center">
          Select Rooms
        </h2>

        <p className="text-center text-sm md:text-lg font-medium text-[#737373] mt-2 mb-6">
          Step 1 of 6 — Select your perfect sanctuary
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-24">
          <div className="md:col-span-8 w-full">
            <div
              className="rounded-lg border border-[#C7C3B5] px-4 py-3 flex items-center gap-2 text-[#09432B]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(181,171,132,0.28) 0%, rgba(161,146,87,0.28) 100%)",
              }}
            >
              <Info className="w-4 h-4" />
              <span className="text-sm font-medium">
                You can only select the number of rooms that are currently
                available for your chosen dates.
              </span>
            </div>
            <Card className="bg-white rounded-xl shadow-sm overflow-hidden transition-all opacity-100 mt-5">
              <CardContent className="p-5">
                <div className="flex flex-col items-start gap-2 justify-between md:flex-row md:items-center pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-[#09432B]">
                        Geodesic Dome
                      </h3>
                      {availablePodsCount < 1 && (
                        <span className="text-xs px-3 py-1 rounded-full bg-red-500 text-white font-semibold">
                          Sold
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1 mt-1">
                      <Star className="w-5 h-5 text-[#09432B] fill-[#43EE00]" />
                      <Star className="w-5 h-5 text-[#09432B] fill-[#43EE00]" />
                      <Star className="w-5 h-5 text-[#09432B] fill-[#43EE00]" />
                      <Star className="w-5 h-5 text-[#09432B] fill-[#43EE00]" />
                      <Star className="w-5 h-5 text-[#09432B] fill-[#43EE00]" />
                      <span className="text-sm text-[#09432B] font-semibold ml-2">
                        (5 stars)
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end items-start mt-[-4px]">
                    <span className="text-sm text-[#737373] font-bold whitespace-nowrap"> From {" "}
                      {/* {pricingConfig?.basePricePerPod != null
                        ? `₦${formatPrice(pricingConfig.basePricePerPod)}`
                        : "₦--"}{" "} */}
                      250,000
                      <span className="font-normal">
                        (Single Occupancy, Full Board)
                      </span>
                    </span>
                    <span className="text-[11px] text-red-600 font-semibold">
                      Full camp takeover, all 6 domes, 12 people
                    </span>
                  </div>
                </div>
                <div className="relative group mb-3 w-full">
                  <div className="flex gap-2 overflow-hidden">
                    <div className="w-full sm:w-1/2 aspect-[4/3] overflow-hidden rounded-lg bg-gray-50">
                      <img
                        src={images[currentImageIndex]}
                        alt={`Lodge image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover transition-all duration-500 ease-in-out hover:scale-105"
                      />
                    </div>
                    <div className="hidden sm:block sm:w-1/2 aspect-[4/3] overflow-hidden rounded-lg bg-gray-50">
                      <img
                        src={images[(currentImageIndex + 1) % images.length]}
                        alt={`Lodge image ${((currentImageIndex + 1) % images.length) + 1}`}
                        className="w-full h-full object-cover transition-all duration-500 ease-in-out hover:scale-105"
                      />
                    </div>
                  </div>

                  <button
                    onClick={prevImage}
                    className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white shadow-md border border-gray-200 text-[#09432B] p-2 rounded-full hover:bg-gray-50 transition-all z-10"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white shadow-md border border-gray-200 text-[#09432B] p-2 rounded-full hover:bg-gray-50 transition-all z-10"
                  >
                    <ChevronRight size={20} />
                  </button>

                  <div className="mt-2 flex justify-center gap-1.5">
                    {images.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImageIndex ? "bg-[#09432B] scale-125" : "bg-gray-300"
                          }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-sm text-[#737373] mt-1">
                  Each private dome features a large en-suite bathroom, with double sinks and shower skylight, and its own plunge pool.
                </p>

                <div className="flex flex-wrap gap-2 mt-3">
                  {podTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-[#E6F2EE] text-[#09432B] px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {availablePodsCount > 0 ? (
                  <div
                    className="flex flex-col items-center text-center rounded-md p-4 mt-3"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(181,171,132,0.18) 0%, rgba(161,146,87,0.18) 100%)",
                      border: "1px solid rgba(181,171,132,0.35)",
                    }}
                  >
                    <span className="text-lg font-semibold text-[#09432B] pb-4">
                      How many Pods do you need?
                    </span>

                    <div className="flex items-center gap-6 mt-4 sm:mt-0">
                      <button
                        onClick={() => onChangeRooms("dec")}
                        className="w-12 h-12 rounded-full border-2 border-[#0F5B45] flex items-center justify-center text-[#0F5B45] text-xl"
                      >
                        –
                      </button>

                      <span className="text-2xl font-bold text-[#09432B] w-8 text-center">
                        {roomCount}
                      </span>

                      <button
                        onClick={() => onChangeRooms("inc")}
                        className="w-12 h-12 rounded-full border-2 border-[#0F5B45] flex items-center justify-center text-[#0F5B45] text-xl  disabled:pointer-events-none disabled:opacity-50"
                        disabled={
                          getPodLimits().maxPods > 0 &&
                          roomCount >= getPodLimits().maxPods
                        }
                      >
                        +
                      </button>
                    </div>
                    <span className="text-md text-[#09432B] pt-4">
                      {availablePodsCount - roomCount === 0
                        ? "Max availability reached for these dates."
                        : `Only ${availablePodsCount - roomCount} left for your dates`}
                    </span>
                  </div>
                ) : (
                  <div
                    className="flex flex-col rounded-md p-4 mt-3"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(181,171,132,0.18) 0%, rgba(161,146,87,0.18) 100%)",
                      border: "1px solid rgba(181,171,132,0.35)",
                    }}
                  >
                    <span className="text-md font-semibold text-[#09432B] pb-4">
                      No Rooms Available
                    </span>
                    <span className="text-md text-[#09432B] pb-4">
                      There are no rooms available for your selected dates.
                      Please try a different date.
                    </span>
                    <button
                      onClick={() => setStayOpen(true)}
                      className="border-2 border-[#0F5B45] rounded-xs transition font-semibold px-6 py-2 text-sm max-width p-2 self-end"
                    >
                      Change dates
                    </button>
                    <EditStayDatesModal
                      open={stayOpen}
                      onOpenChange={setStayOpen}
                      value={{
                        checkIn: formatDateSafe(
                          bookingStore.draft.dates.checkIn,
                          "dd/MM/yyyy",
                        ),
                        checkOut: formatDateSafe(
                          bookingStore.draft.dates.checkOut,
                          "dd/MM/yyyy",
                        ),
                        numberOfNights: bookingStore.draft.numberOfNights,
                        guests: `${bookingStore.draft.guests.adults} Guests`,
                      }}
                      onSave={setStayDates}
                      showPenaltyInfo={false}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-4 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#E6F2EE] rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-[#09432B]" />
                </div>
                <h4 className="text-[#09432B] font-bold text-base">
                  Stay Dates
                </h4>
              </div>
              <div className="flex items-start justify-between w-full">
                <div>
                  <p className="text-sm text-[#737373] leading-tight">
                    Check in:
                  </p>
                  <p className="text-sm font-medium text-[#4F4F4F] leading-tight mt-1">
                    {formatDateSafe(bookingStore.draft.dates.checkIn, "dd/MM/yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#737373] leading-tight">
                    Check out:
                  </p>
                  <p className="text-sm font-medium text-[#4F4F4F] leading-tight mt-1">
                    {formatDateSafe(bookingStore.draft.dates.checkOut, "dd/MM/yyyy")}
                  </p>
                </div>
                <div className="flex items-center justify-end">
                  <p className="text-sm font-semibold text-[#09432B] whitespace-nowrap">
                    {bookingStore.draft.numberOfNights} Nights
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#E6F2EE] rounded-full flex items-center justify-center">
                  <Home className="w-4 h-4 text-[#09432B]" />
                </div>
                <h4 className="text-[#09432B] font-bold">Your Rooms</h4>
              </div>

              <p className="text-sm text-[#737373] font-medium">
                {`x${roomCount} Rooms`}
              </p>
              <p className="text-sm text-[#737373] font-medium mt-1">
                {`Guests: ${(bookingStore.draft.guests?.adults || 0) +
                  (bookingStore.draft.guests?.teenagers || 0) +
                  (bookingStore.draft.guests?.children || 0)
                  }`}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#E6F2EE] rounded-full flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-[#09432B]" />
                </div>
                <h4 className="text-[#09432B] font-bold">Price Summary</h4>
              </div>

              <p className="text-xs font-medium text-[#737373] mb-3">
                Rooms x {roomCount}
              </p>

              {(() => {
                const guestCounts = bookingStore.draft.guests || {};
                const totalGuests =
                  (guestCounts.adults || 0) +
                  (guestCounts.teenagers || 0) +
                  (guestCounts.children || 0);
                const basePricePerPod =
                  pricingConfig?.basePricePerPod !== undefined
                    ? pricingConfig.basePricePerPod
                    : 400000;
                const nights = bookingStore.draft.numberOfNights || 1;
                const pods = roomCount || bookingStore.draft.podCount || 1;
                const baseForStayPreview = pods * basePricePerPod * nights;
                const configuredDiscountPercent =
                  pricingConfig?.twelveGuestDiscountPercent ?? 10;
                const discountPercent =
                  totalGuests === 12 ? configuredDiscountPercent : 0;
                const discountAmount =
                  discountPercent > 0
                    ? Math.round(
                      baseForStayPreview * (configuredDiscountPercent / 100),
                    )
                    : 0;
                const dynamicSubTotal = roomCount ? calculateDynamicSubTotal(bookingStore.draft) : 0;
                const taxableBase = dynamicSubTotal - discountAmount;
                const taxAmount =
                  taxableBase > 0 ? Math.round(taxableBase * 0.125) : 0;
                const totalAmount =
                  taxableBase > 0 ? Math.round(taxableBase * 1.125) : 0;

                return (
                  <div className="space-y-3 text-sm font-semibold text-[#09432B]">
                    <div className="flex justify-between">
                      <span>Sub Total:</span>
                      <span className="text-[#09432B] font-semibold">
                        ₦{roomCount ? dynamicSubTotal.toLocaleString() : "0"}
                      </span>
                    </div>

                    <div className="flex justify-between leading-snug">
                      <span>
                        After consumption tax and <br /> VAT(12.5%)
                      </span>
                      <span className="text-[#09432B] font-semibold">
                        ₦{roomCount ? taxAmount.toLocaleString() : "0"}
                      </span>
                    </div>

                    {(() => {
                      const w = bookingStore.draft.weekdayPeakInfo;
                      const showPeak =
                        w && w.peakPercent !== 0 && (w.peakNights ?? 0) > 0;
                      const showOffPeak =
                        w && w.offPeakPercent !== 0 && (w.offPeakNights ?? 0) > 0;
                      if (!showPeak && !showOffPeak) return null;
                      return (
                        <div className="flex gap-3 text-[#008080] text-xs">
                          {showPeak && <span>Peak rate</span>}
                          {showOffPeak && <span>Off-peak rate</span>}
                        </div>
                      );
                    })()}
                    {bookingStore.draft.peakRateInfo && (
                      <div className="text-[#008080] text-xs">
                        Seasonal rate
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Discount</span>
                      <span className="text-[#09432B] font-semibold">
                        {discountPercent > 0 ? `${discountPercent}%` : "0%"}
                      </span>
                    </div>

                    <div className="border-t pt-3 flex justify-between font-semibold bg-[#F2EFE7] px-3 py-2 rounded-md text-[#09432B]">
                      <span>Total:</span>
                      <span>
                        ₦{roomCount ? totalAmount.toLocaleString() : "0"}
                      </span>
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
                Happy with your Dome? let's move ahead
              </div>

              {roomCount < 1 ? (
                <Button
                  className="w-full bg-gray-400 text-white text-base font-bold py-6 rounded-none rounded-b-xl opacity-50 cursor-not-allowed"
                  disabled={true}
                >
                  Continue to Bed Configuration →
                </Button>
              ) : (
                <Button
                  asChild
                  className="w-full bg-[#09432B] hover:bg-[#083f28] text-white text-base font-bold py-6 rounded-none rounded-b-xl"
                >
                  <Link
                    to="/meal-plan"
                    className="flex items-center justify-center gap-2"
                  >
                    Continue to Bed Configuration →
                  </Link>
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              className="w-full py-6 rounded-md border border-[#A19257] hover:text-white bg-gradient-to-r from-[#B5AB84] to-[#A19257] font-bold text-white"
            >
              Quick Book
            </Button>
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

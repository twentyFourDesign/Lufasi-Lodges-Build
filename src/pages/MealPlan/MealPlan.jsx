import React, { useState, useEffect } from "react";
import CommonNavbar from "@/components/shared/common/CommonNavbar/CommonNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import mealIcon from "../../assets/SVG.png";
import {
  ArrowLeft,
  Calendar,
  Home,
  Wallet,
  Check,
  Loader2,
} from "lucide-react";
import { LuBedSingle } from "react-icons/lu";
import { IoBedOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import FunnelMobileStickyCta from "@/components/booking/FunnelMobileStickyCta";
import ReservationGuestsCard from "@/components/booking/ReservationGuestsCard";
import { BASE_URL } from "@/config";
import { useBookingStore, calculateDynamicSubTotal } from "@/store/useBookingStore";
import { format } from "date-fns";
import { formatDateSafe } from "@/lib/utils";
import { ensurePricingConfig } from "@/lib/pricingConfig";
import { calculateStayRoomSubtotal } from "@/lib/stayPricing";
import { isGuestAllocationComplete } from "@/lib/guestAllocation";

function formatPrice(n) {
  return n?.toLocaleString() || "0";
}

export default function MealPlan() {
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const bookingStore = useBookingStore();
  const navigate = useNavigate();
  const podCount = bookingStore.draft.podCount || 1;
  const pricingConfig = bookingStore.draft.pricingConfig;
  const domeDetails = bookingStore.draft.domeDetails?.length
    ? bookingStore.draft.domeDetails
    : Array.from({ length: podCount }, () => ({
        bedConfig: "1 x King Bed (6 foot)",
        guests: ["", ""],
      }));
  const bedConfig = domeDetails[0]?.bedConfig || "1 x King Bed (6 foot)";

  useEffect(() => {
    if (!bookingStore.draft.dates || !bookingStore.draft.podCount) {
      navigate("/book-your-stay", { replace: true });
      return;
    }
    if (
      !bookingStore.draft.selectedPodIds?.length ||
      bookingStore.draft.selectedPodIds.length !== bookingStore.draft.podCount
    ) {
      navigate("/select-rooms", { replace: true });
      return;
    }

    if (
      !isGuestAllocationComplete(
        bookingStore.draft.domeDetails,
        bookingStore.draft.guests,
        bookingStore.draft.podCount,
      )
    ) {
      navigate("/assign-guests", { replace: true });
      return;
    }

    let cancelled = false;
    async function init() {
      const config = await ensurePricingConfig(bookingStore);
      if (cancelled) return;
      bookingStore.updateDraft({
        basePrice: config.basePricePerPod,
        bedConfiguration: bedConfig,
      });
      setLoading(false);
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [bookingStore.draft.dates, bookingStore.draft.podCount, navigate]);

  const handleSelectDomeBedConfig = (domeIdx, value) => {
    const updatedDetails = [...domeDetails];
    updatedDetails[domeIdx] = {
      ...updatedDetails[domeIdx],
      bedConfig: value,
    };
    bookingStore.updateDraft({
      domeDetails: updatedDetails,
      bedConfiguration: updatedDetails[0].bedConfig, // Maintain legacy field for compatibility with parts of UI
    });
  };

  if (
    !bookingStore.draft.dates ||
    !bookingStore.draft.podCount ||
    !bookingStore.draft.selectedPodIds?.length
  ) {
    return null;
  }

  return (
    <div className="overflow-x-hidden min-h-screen w-full bg-[#F7F5F0] pb-28 md:pb-0">
      <CommonNavbar />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10">
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-sm text-gray-700 mb-6 pl-0 hover:bg-transparent"
        >
          <ArrowLeft className="w-4 h-4" />
          <Link to="/assign-guests">Back</Link>
        </Button>

        <h2 className="text-2xl md:text-5xl font-bold text-[#09432B] text-center">
          Bed Configuration
        </h2>

        <p className="text-center text-sm md:text-lg font-medium text-[#737373] mt-2 mb-10">
          Step 4 of 7 – Full Board meals are always included
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-6">
            <Card className="bg-white rounded-xl shadow-sm px-6 py-6 border border-[#C7C3B5]">
              <CardContent className="p-0">
                <h3 className="text-xl font-bold text-[#09432B] leading-tight mb-3">
                  Accommodation Details
                </h3>
                <p className="text-sm text-[#737373] mb-4">
                  Six dome eco pods, each with plunge pool and en-suite
                  bathroom. Each room sleeps two adults.
                </p>
                <p className="text-sm text-[#737373] mb-2">
                  Choose your preferred bed setup.
                </p>

                <div className="space-y-8">
                  {Array.from({ length: podCount }).map((_, domeIdx) => (
                    <div key={domeIdx} className={domeIdx > 0 ? "pt-6 border-t border-gray-100" : ""}>
                      <h4 className="text-lg font-bold text-[#09432B] mb-4">
                        {domeDetails[domeIdx]?.podName || `Dome ${domeIdx + 1}`}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleSelectDomeBedConfig(domeIdx, "1 x King Bed (6 foot)")
                          }
                          className={`w-full text-left rounded-xl border px-4 py-4 flex items-center justify-between gap-3 transition-all ${
                            domeDetails[domeIdx]?.bedConfig === "1 x King Bed (6 foot)"
                              ? "border-[#09432B] bg-[#E6F2EE]"
                              : "border-gray-200 bg-white hover:border-[#09432B]/60"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#E6F2EE] flex items-center justify-center">
                              <IoBedOutline className="w-5 h-5 text-[#09432B]" />
                            </div>
                            <div>
                              <p className="font-semibold text-[#09432B]">
                                1 x King Bed (6 foot)
                              </p>
                            </div>
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                              domeDetails[domeIdx]?.bedConfig === "1 x King Bed (6 foot)"
                                ? "border-[#09432B] bg-[#09432B]"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {domeDetails[domeIdx]?.bedConfig === "1 x King Bed (6 foot)" && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleSelectDomeBedConfig(domeIdx, "2 x Single Beds (3 foot)")
                          }
                          className={`w-full text-left rounded-xl border px-4 py-4 flex items-center justify-between gap-3 transition-all ${
                            domeDetails[domeIdx]?.bedConfig === "2 x Single Beds (3 foot)"
                              ? "border-[#09432B] bg-[#E6F2EE]"
                              : "border-gray-200 bg-white hover:border-[#09432B]/60"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#E6F2EE] flex items-center justify-center">
                              <LuBedSingle className="w-5 h-5 text-[#09432B]" />
                              <LuBedSingle className="w-5 h-5 text-[#09432B]" />
                            </div>
                            <div>
                              <p className="font-semibold text-[#09432B]">
                                2 x Single Beds (3 foot)
                              </p>
                            </div>
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                              domeDetails[domeIdx]?.bedConfig === "2 x Single Beds (3 foot)"
                                ? "border-[#09432B] bg-[#09432B]"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {domeDetails[domeIdx]?.bedConfig === "2 x Single Beds (3 foot)" && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 text-sm text-[#737373]">
                  Full Board meals (breakfast, lunch, and dinner) are
                  automatically included with every pod booking.
                </div>
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
                  <p className="text-sm text-[#737373]">Check in:</p>
                  <p className="text-sm font-medium text-[#4F4F4F] mt-1">
                    {formatDateSafe(bookingStore.draft.dates.checkIn, "dd/MM/yyyy")}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#737373]">Check out:</p>
                  <p className="text-sm font-medium text-[#4F4F4F] mt-1">
                    {formatDateSafe(bookingStore.draft.dates.checkOut, "dd/MM/yyyy")}
                  </p>
                </div>

                <p className="text-sm font-semibold text-[#09432B] whitespace-nowrap">
                  {bookingStore.draft.numberOfNights} Nights
                </p>
              </div>
            </div>

            {/* Selected Pod Card */}
            <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#E6F2EE] rounded-full flex items-center justify-center">
                  <Home className="w-4 h-4 text-[#09432B]" />
                </div>
                <h4 className="text-[#09432B] font-bold">Your Rooms</h4>
              </div>

              <p className="text-sm text-[#737373] font-medium">
                {domeDetails.map((d) => d.podName || "Dome").join(", ")}
              </p>
            </div>

            <ReservationGuestsCard
              guests={bookingStore.draft.guests}
              popUpBeds={bookingStore.draft.popUpBeds}
            />

            <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#E6F2EE] rounded-full flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-[#09432B]" />
                </div>
                <h4 className="text-[#09432B] font-bold">Price Summary</h4>
              </div>

              <p className="text-xs font-medium text-[#737373] mb-3">
                Pod & Meals ({bookingStore.draft.numberOfNights} Nights)
              </p>

              {(() => {
                const guestCounts = bookingStore.draft.guests || {};
                const totalGuests =
                  (guestCounts.adults || 0) +
                  (guestCounts.teenagers || 0) +
                  (guestCounts.toddlers || 0) +
                  (guestCounts.children || 0) +
                  (guestCounts.infants || 0);
                const pricingConfig = bookingStore.draft.pricingConfig || {};
                const pods = bookingStore.draft.podCount || 1;
                const configuredDiscountPercent =
                  pricingConfig.twelveGuestDiscountPercent ?? 0;
                const discountPercent =
                  totalGuests === 12 ? configuredDiscountPercent : 0;
                const dynamicSubTotal = calculateDynamicSubTotal(bookingStore.draft);
                const { subtotal: baseForDiscount } = calculateStayRoomSubtotal({
                  checkIn: bookingStore.draft.dates?.checkIn,
                  checkOut: bookingStore.draft.dates?.checkOut,
                  podsCount: pods,
                  guestCounts: { adults: pods },
                  pricingConfig,
                  seasonalRates: bookingStore.draft.seasonalRatePeriods ?? [],
                });
                const discountAmount =
                  discountPercent > 0
                    ? Math.round(baseForDiscount * (configuredDiscountPercent / 100))
                    : 0;
                const taxableBase = dynamicSubTotal - discountAmount;
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

                    <div className="flex justify-between">
                      <span>Discount</span>
                      <span>
                        {discountPercent > 0 ? `${discountPercent}%` : "0%"}
                      </span>
                    </div>

                    <div className="border-t pt-3 flex justify-between bg-[#F2EFE7] px-3 py-2 rounded-md">
                      <span>Total:</span>
                      <span>₦{formatPrice(totalAmount)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="hidden md:block w-full rounded-t-xl overflow-hidden">
              <div
                className="px-4 py-3 text-[#0A4C30] text-sm font-medium"
                style={{ backgroundColor: "#B7FFFF" }}
              >
                Bed configuration and meals confirmed. Let's move ahead.
              </div>

              <Button
                asChild
                className="w-full bg-[#09432B] hover:bg-[#083f28] text-white text-base font-bold py-6 rounded-none rounded-b-xl"
              >
                <Link
                  to="/extras"
                  className="flex items-center gap-2 justify-center"
                >
                  Continue to Extras →
                </Link>
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full py-6 rounded-md border border-[#A19257] bg-gradient-to-r from-[#B5AB84] to-[#A19257] font-bold text-white hover:text-white"
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

      <FunnelMobileStickyCta>
        <Button
          asChild
          className="w-full bg-[#09432B] hover:bg-[#083f28] text-white text-base font-bold py-6 rounded-xl"
        >
          <Link to="/extras" className="flex items-center gap-2 justify-center">
            Continue to Extras →
          </Link>
        </Button>
      </FunnelMobileStickyCta>
    </div>
  );
}

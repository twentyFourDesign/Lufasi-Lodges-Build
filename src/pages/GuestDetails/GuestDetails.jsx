import React, { useState } from "react";
import CommonNavbar from "@/components/shared/common/CommonNavbar/CommonNavbar";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Home,
  Wallet,
  Info,
  Users,
  Plus,
  Minus,
  UtensilsCrossed,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useBookingStore } from "@/store/useBookingStore";
import { format } from "date-fns";

function formatPrice(n) {
  return n.toLocaleString();
}

export default function GuestDetails() {
  const bookingStore = useBookingStore();
  const pricingConfig = bookingStore.draft.pricingConfig;
  const [adults, setAdults] = useState(bookingStore.draft.guests?.adults || 2);
  const [teens, setTeens] = useState(0);
  const [infants, setInfants] = useState(0);
  const [subTotal, setSubTotal] = useState(bookingStore.draft?.subTotal || 0);

  const computeSubTotal = (guestCount, podCount, nights) => {
    const basePricePerPod =
      pricingConfig?.basePricePerPod !== undefined
        ? pricingConfig.basePricePerPod
        : 400000;
    const extraGuestFee =
      pricingConfig?.extraGuestFee !== undefined
        ? pricingConfig.extraGuestFee
        : 100000;
    const effectiveGuests = guestCount < 1 ? 1 : guestCount;
    const pods = podCount < 1 ? 1 : podCount;
    const basePerNight = pods * basePricePerPod;
    const extraGuests = effectiveGuests > pods ? effectiveGuests - pods : 0;
    const extraPerNight = extraGuests * extraGuestFee;
    return (basePerNight + extraPerNight) * nights;
  };

  const onChangeAdults = (type) => {
    if (type === "dec" && adults > 1) {
      const nextAdults = adults - 1;
      const guestCount = nextAdults + teens;
      const nights = bookingStore.draft.numberOfNights || 1;
      const pods = bookingStore.draft.podCount || 1;
      const nextSubTotal = computeSubTotal(guestCount, pods, nights);
      setAdults(nextAdults);
      setSubTotal(nextSubTotal);
      bookingStore.updateDraft({
        guests: {
          ...bookingStore.draft.guests,
          adults: nextAdults,
        },
        subTotal: nextSubTotal,
      });
    } else if (type === "inc") {
      const nextAdults = adults + 1;
      const guestCount = nextAdults + teens;
      const nights = bookingStore.draft.numberOfNights || 1;
      const pods = bookingStore.draft.podCount || 1;
      const nextSubTotal = computeSubTotal(guestCount, pods, nights);
      setAdults(nextAdults);
      setSubTotal(nextSubTotal);
      bookingStore.updateDraft({
        guests: {
          ...bookingStore.draft.guests,
          adults: nextAdults,
        },
        subTotal: nextSubTotal,
      });
    }
  };

  const onChangeTeens = (type) => {
    if (type === "dec" && teens > 0) {
      const nextTeens = teens - 1;
      const guestCount = adults + nextTeens;
      const nights = bookingStore.draft.numberOfNights || 1;
      const pods = bookingStore.draft.podCount || 1;
      const nextSubTotal = computeSubTotal(guestCount, pods, nights);
      setTeens(nextTeens);
      setSubTotal(nextSubTotal);
      bookingStore.updateDraft({
        guests: {
          ...bookingStore.draft.guests,
          teenagers: nextTeens,
        },
        subTotal: nextSubTotal,
      });
    } else if (type === "inc") {
      const nextTeens = teens + 1;
      const guestCount = adults + nextTeens;
      const nights = bookingStore.draft.numberOfNights || 1;
      const pods = bookingStore.draft.podCount || 1;
      const nextSubTotal = computeSubTotal(guestCount, pods, nights);
      setTeens(nextTeens);
      setSubTotal(nextSubTotal);
      bookingStore.updateDraft({
        guests: {
          ...bookingStore.draft.guests,
          teenagers: nextTeens,
        },
        subTotal: nextSubTotal,
      });
    }
  };

  const onChangeInfants = (type) => {
    if (type === "dec" && infants > 0) {
      setInfants(infants - 1);
    } else if (type === "inc") {
      setInfants(infants + 1);
    }
  };

  return (
    <div className="overflow-x-hidden min-h-screen w-full bg-[#F7F5F0]">
      <CommonNavbar />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10">
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-sm text-gray-700 mb-6 pl-0 hover:bg-transparent"
        >
          <ArrowLeft className="w-4 h-4" />
          <Link to="/meal-plan">Back</Link>
        </Button>
        <h2 className="text-2xl md:text-5xl font-bold text-[#09432B] text-center">
          Guest Details
        </h2>

        <p className="text-center text-sm md:text-lg font-medium text-[#737373] mt-2 mb-10">
          Step 3 of 6 – Who’s joining you?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-8">
            <div className="bg-white rounded-xl px-6 py-8 shadow-sm border border-gray-200">
              <div
                className="
    flex flex-col items-center text-center py-6
    sm:flex-row sm:justify-between sm:text-left
  "
              >
                <span className="text-lg font-semibold text-[#09432B]">
                  Adults (18+ years)
                </span>

                <div className="flex items-center gap-6 mt-4 sm:mt-0">
                  <button
                    onClick={() => onChangeAdults("dec")}
                    className="w-12 h-12 rounded-full border-2 border-[#0F5B45] flex items-center justify-center text-[#0F5B45] text-xl"
                  >
                    –
                  </button>

                  <span className="text-2xl font-bold text-[#09432B] w-8 text-center">
                    {adults}
                  </span>

                  <button
                    onClick={() => onChangeAdults("inc")}
                    className="w-12 h-12 rounded-full border-2 border-[#0F5B45] flex items-center justify-center text-[#0F5B45] text-xl"
                  >
                    +
                  </button>
                </div>
              </div>
              <div
                className="
    flex flex-col items-center text-center py-6
    sm:flex-row sm:justify-between sm:text-left
  "
              >
                <span className="text-lg font-semibold text-[#09432B]">
                  Teenagers (11–17 years)
                </span>

                <div className="flex items-center gap-6 mt-4 sm:mt-0">
                  <button
                    onClick={() => onChangeTeens("dec")}
                    className="w-12 h-12 rounded-full border-2 border-[#0F5B45] flex items-center justify-center text-[#0F5B45] text-xl"
                  >
                    –
                  </button>

                  <span className="text-2xl font-bold text-[#09432B] w-8 text-center">
                    {teens}
                  </span>

                  <button
                    onClick={() => onChangeTeens("inc")}
                    className="w-12 h-12 rounded-full border-2 border-[#0F5B45] flex items-center justify-center text-[#0F5B45] text-xl"
                  >
                    +
                  </button>
                </div>
              </div>
              <div
                className="
    flex flex-col items-center text-center py-6
    sm:flex-row sm:justify-between sm:text-left
  "
              >
                <span className="text-lg font-semibold text-[#09432B]">
                  Infants (0–1 years)
                </span>

                <div className="flex items-center gap-6 mt-4 sm:mt-0">
                  <button
                    onClick={() => onChangeInfants("dec")}
                    className="w-12 h-12 rounded-full border-2 border-[#0F5B45] flex items-center justify-center text-[#0F5B45] text-xl"
                  >
                    –
                  </button>

                  <span className="text-2xl font-bold text-[#09432B] w-8 text-center">
                    {infants}
                  </span>

                  <button
                    onClick={() => onChangeInfants("inc")}
                    className="w-12 h-12 rounded-full border-2 border-[#0F5B45] flex items-center justify-center text-[#0F5B45] text-xl"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-[#C5F8FF] rounded-xl px-6 py-6 border border-[#8FE8FF] shadow-sm">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#0A4C30]" />

                <div>
                  <h4 className="text-[#0A4C30] font-semibold">Age Policy</h4>
                  <p className="text-sm text-[#0A4C30] mt-1 leading-snug">
                    Children aged 2–10 years are not permitted unless you book
                    the entire camp for exclusive use. Please contact us if
                    you'd like to arrange a full camp takeover.
                  </p>

                  <button className="mt-3 text-sm font-semibold text-[#09432B] underline">
                    Learn more
                  </button>
                </div>
              </div>
            </div>
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
                    {format(bookingStore.draft.dates.checkIn, "dd/MM/yyyy")}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#737373]">Check out:</p>
                  <p className="text-sm font-medium text-[#4F4F4F] mt-1">
                    {format(bookingStore.draft.dates.checkOut, "dd/MM/yyyy")}
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

              <p className="text-sm text-[#737373] font-medium">
                {`x${bookingStore.draft.podCount || 0} Rooms`}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#E6F2EE] rounded-full flex items-center justify-center">
                  <UtensilsCrossed className="w-4 h-4 text-[#09432B]" />
                </div>
                <h4 className="text-[#09432B] font-bold">Meal Plan</h4>
              </div>

              <p className="text-sm text-[#737373] font-medium">
                {bookingStore.draft.mealPlan?.title || "N/A"}
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
                Pod & Meals ({bookingStore.draft.numberOfNights} Nights)
              </p>

              {(() => {
                const guestCounts = bookingStore.draft.guests || {};
                const totalGuests =
                  (guestCounts.adults || 0) +
                  (guestCounts.teenagers || 0) +
                  (guestCounts.infants || 0);
                const pricingConfig = bookingStore.draft.pricingConfig || {};
                const basePricePerPod =
                  pricingConfig.basePricePerPod !== undefined
                    ? pricingConfig.basePricePerPod
                    : 400000;
                const nights = bookingStore.draft.numberOfNights || 1;
                const pods = bookingStore.draft.podCount || 1;
                const baseForStayPreview = pods * basePricePerPod * nights;
                const discountPercent = totalGuests === 12 ? 10 : 0;
                const discountAmount =
                  discountPercent > 0
                    ? Math.round(baseForStayPreview * 0.1)
                    : 0;
                const subTotalLocal = subTotal || 0;
                const taxableBase = subTotalLocal - discountAmount;
                const taxAmount =
                  taxableBase > 0 ? Math.round(taxableBase * 0.125) : 0;
                const totalAmount =
                  taxableBase > 0 ? Math.round(taxableBase * 1.125) : 0;

                return (
                  <div className="space-y-3 text-sm font-semibold text-[#09432B]">
                    <div className="flex justify-between">
                      <span>Sub Total:</span>
                      <span>₦{formatPrice(subTotalLocal)}</span>
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
            <div className="w-full rounded-t-xl overflow-hidden">
              <div
                className="px-4 py-3 text-[#0A4C30] text-sm font-medium"
                style={{ backgroundColor: "#B7FFFF" }}
              >
                Happy with your guest details? let’s move ahead
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
              className="w-full py-6 rounded-md border border-[#A19257] hover:text-white bg-gradient-to-r from-[#B5AB84] to-[#A19257] font-bold text-white"
            >
              Quick Book
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
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
import { Link, useNavigate } from "react-router-dom";
import { useBookingStore, calculateDynamicSubTotal } from "@/store/useBookingStore";
import { format } from "date-fns";
import { BASE_URL } from "@/config";
import { formatDateSafe } from "@/lib/utils";
import {
  isFamilyCompositionAllowed,
  normalizeFamilyGuests,
} from "@/lib/familyRules";
function formatPrice(n) {
  return n.toLocaleString();
}

export default function GuestDetails() {
  const navigate = useNavigate();
  const bookingStore = useBookingStore();
  const pricingConfig = bookingStore.draft.pricingConfig;
  const [adults, setAdults] = useState(bookingStore.draft.guests?.adults || 2);
  const [teens, setTeens] = useState(bookingStore.draft.guests?.teenagers || 0);
  const [toddlers, setToddlers] = useState(bookingStore.draft.guests?.toddlers || 0);
  const [children, setChildren] = useState(bookingStore.draft.guests?.children || 0);
  const [infants, setInfants] = useState(bookingStore.draft.guests?.infants || 0);
  const [subTotal, setSubTotal] = useState(bookingStore.draft?.subTotal || 0);
  const [schoolHolidays, setSchoolHolidays] = useState([]);

  useEffect(() => {
    async function fetchHolidays() {
      try {
        const response = await fetch(`${BASE_URL}/config/holidays`);
        if (response.ok) {
          const data = await response.json();
          setSchoolHolidays(data);
        }
      } catch (error) {
        console.error("Error fetching school holidays", error);
      }
    }
    fetchHolidays();
  }, []);

  const isChildrenPermitted = () => {
    // Permitted if full camp takeover (6 pods)
    if (bookingStore.draft.podCount === 6) return true;

    // Check if check-in or check-out falls within any designated school holiday
    const parseLocalDate = (str) => {
      const [y, m, d] = str.split("-").map(Number);
      return new Date(y, m - 1, d);
    };

    const checkIn = parseLocalDate(bookingStore.draft.dates?.checkIn);
    const checkOut = parseLocalDate(bookingStore.draft.dates?.checkOut);

    return schoolHolidays.some(holiday => {
      const start = parseLocalDate(holiday.startDate);
      const end = parseLocalDate(holiday.endDate);
      return (checkIn >= start && checkIn <= end) || (checkOut >= start && checkOut <= end) || (checkIn <= start && checkOut >= end);
    });
  };

  const isValidGuestCount = (nextGuests) => {
    const podCount = bookingStore.draft.podCount || 1;
    return isFamilyCompositionAllowed(nextGuests, podCount);
  };

  const currentGuests = () => ({
    adults,
    teenagers: teens,
    toddlers,
    children,
    infants,
  });

  const updateGuestCounts = (nextGuests) => {
    const normalized = normalizeFamilyGuests(nextGuests);
    if (!isValidGuestCount(normalized)) return;
    if (
      (normalized.infants + normalized.toddlers + normalized.children > 0) &&
      !isChildrenPermitted()
    ) {
      return;
    }

    const nextDraft = {
      ...bookingStore.draft,
      guests: normalized,
    };
    const nextSubTotal = calculateDynamicSubTotal(nextDraft);

    setAdults(normalized.adults);
    setTeens(normalized.teenagers);
    setToddlers(normalized.toddlers);
    setChildren(normalized.children);
    setInfants(normalized.infants);
    setSubTotal(nextSubTotal);
    bookingStore.updateDraft({
      guests: normalized,
      subTotal: nextSubTotal,
    });
  };

  const onChangeAdults = (type) => {
    const nextAdults = type === "dec" ? adults - 1 : adults + 1;
    if (nextAdults < 1) return;
    updateGuestCounts({ ...currentGuests(), adults: nextAdults });
  };

  const onChangeTeens = (type) => {
    const nextTeens = type === "dec" ? teens - 1 : teens + 1;
    if (nextTeens < 0) return;
    updateGuestCounts({ ...currentGuests(), teenagers: nextTeens });
  };

  const onChangeToddlers = (type) => {
    const nextToddlers = type === "dec" ? toddlers - 1 : toddlers + 1;
    if (nextToddlers < 0) return;
    updateGuestCounts({ ...currentGuests(), toddlers: nextToddlers });
  };

  const onChangeChildren = (type) => {
    const nextChildren = type === "dec" ? children - 1 : children + 1;
    if (nextChildren < 0) return;
    updateGuestCounts({ ...currentGuests(), children: nextChildren });
  };

  const onChangeInfants = (type) => {
    const nextInfants = type === "dec" ? infants - 1 : infants + 1;
    if (nextInfants < 0) return;
    updateGuestCounts({ ...currentGuests(), infants: nextInfants });
  };

  const canSetGuests = (patch) =>
    isValidGuestCount({ ...currentGuests(), ...patch });

  const canAddUnder13 = (patch) => isChildrenPermitted() && canSetGuests(patch);

  const renderGuestCounter = ({ label, value, onChange, decDisabled, incDisabled }) => (
    <div
      className="
    flex flex-col items-center text-center py-6
    sm:flex-row sm:justify-between sm:text-left
  "
    >
      <span className="text-lg font-semibold text-[#09432B]">{label}</span>

      <div className="flex items-center gap-6 mt-4 sm:mt-0">
        <button
          onClick={() => onChange("dec")}
          className={`w-12 h-12 rounded-full border-2 border-[#0F5B45] flex items-center justify-center text-xl ${
            decDisabled
              ? "text-gray-300 border-gray-300 cursor-not-allowed opacity-30"
              : "text-[#0F5B45]"
          }`}
          disabled={decDisabled}
        >
          –
        </button>

        <span className="text-2xl font-bold text-[#09432B] w-8 text-center">
          {value}
        </span>

        <button
          onClick={() => onChange("inc")}
          className={`w-12 h-12 rounded-full border-2 border-[#0F5B45] flex items-center justify-center text-xl ${
            incDisabled
              ? "text-gray-300 border-gray-300 cursor-not-allowed opacity-30"
              : "text-[#0F5B45]"
          }`}
          disabled={incDisabled}
        >
          +
        </button>
      </div>
    </div>
  );

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
              {renderGuestCounter({
                label: "Adults (18+ years)",
                value: adults,
                onChange: onChangeAdults,
                decDisabled: adults <= 1 || !canSetGuests({ adults: adults - 1 }),
                incDisabled: !canSetGuests({ adults: adults + 1 }),
              })}
              {renderGuestCounter({
                label: "Teens (13–17 years)",
                value: teens,
                onChange: onChangeTeens,
                decDisabled: teens <= 0 || !canSetGuests({ teenagers: teens - 1 }),
                incDisabled: !canSetGuests({ teenagers: teens + 1 }),
              })}
              {renderGuestCounter({
                label: "Infants (0–1 year) — Free",
                value: infants,
                onChange: onChangeInfants,
                decDisabled: infants <= 0 || !canSetGuests({ infants: infants - 1 }),
                incDisabled: !canAddUnder13({ infants: infants + 1 }),
              })}
              {renderGuestCounter({
                label: "Toddlers (1–3 years) — 75% of base pod rate",
                value: toddlers,
                onChange: onChangeToddlers,
                decDisabled: toddlers <= 0 || !canSetGuests({ toddlers: toddlers - 1 }),
                incDisabled: !canAddUnder13({ toddlers: toddlers + 1 }),
              })}
              {renderGuestCounter({
                label: "Children (4–12 years) — 50% of base pod rate",
                value: children,
                onChange: onChangeChildren,
                decDisabled: children <= 0 || !canSetGuests({ children: children - 1 }),
                incDisabled: !canAddUnder13({ children: children + 1 }),
              })}
              
              {!isChildrenPermitted() && (
                <div className="flex items-center gap-2 mt-4 text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <p className="text-xs font-semibold">
                    Children aged 0-12 are only permitted when booking a full camp takeover (all 6 domes) or on dates designated by the lodge.
                  </p>
                </div>
              )}
            </div>
            {!isChildrenPermitted() && (
              <div className="bg-[#C5F8FF] rounded-xl px-5 py-5 border border-[#8FE8FF] shadow-sm">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#0A4C30] flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <h4 className="text-[#0A4C30] font-semibold text-sm">Age Policy</h4>
                    <p className="text-sm text-[#0A4C30] mt-1 leading-relaxed">
                      Children aged 0–12 years are not permitted unless you book the entire camp for exclusive use (6 Domes) or your stay falls on a date designated by the lodge. Please contact us if you'd like to arrange a full camp takeover.
                    </p>
                    <button className="mt-2 text-sm font-semibold text-[#09432B] underline hover:text-[#083f28]">
                      Learn more
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                <h4 className="text-[#09432B] font-bold">Bed Configuration</h4>
              </div>

              <p className="text-sm text-[#737373] font-medium">
                {bookingStore.draft.domeDetails && bookingStore.draft.domeDetails.length > 1 
                  ? "Multiple Configurations" 
                  : (bookingStore.draft.bedConfiguration || "1 x King Bed (6 foot)")}
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
                  (guestCounts.toddlers || 0) +
                  (guestCounts.children || 0) +
                  (guestCounts.infants || 0);
                const pricingConfig = bookingStore.draft.pricingConfig || {};
                const basePricePerPod =
                  pricingConfig.basePricePerPod !== undefined
                    ? pricingConfig.basePricePerPod
                    : 400000;
                const nights = bookingStore.draft.numberOfNights || 1;
                const pods = bookingStore.draft.podCount || 1;
                const baseForStayPreview = pods * basePricePerPod * nights;
                const configuredDiscountPercent =
                  pricingConfig.twelveGuestDiscountPercent ?? 10;
                const discountPercent =
                  totalGuests === 12 ? configuredDiscountPercent : 0;
                const discountAmount =
                  discountPercent > 0
                    ? Math.round(
                        baseForStayPreview * (configuredDiscountPercent / 100),
                      )
                    : 0;
                const subTotalLocal = calculateDynamicSubTotal(bookingStore.draft);
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

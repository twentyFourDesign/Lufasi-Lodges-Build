import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar as CalendarIcon, Users, ChevronDown, Info } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { addDays, differenceInCalendarDays, startOfDay } from "date-fns";

import { BASE_URL } from "@/config";
import { useBookingStore } from "@/store/useBookingStore";
import { useNavigate } from "react-router-dom";
import { toISODate, parseAvailabilityCheckResponse } from "@/lib/utils";
import {
  findMinValidPodCount,
  normalizeFamilyGuests,
} from "@/lib/familyRules";

const EMPTY_GUESTS = {
  adults: 2,
  teenagers: 0,
  toddlers: 0,
  children: 0,
  infants: 0,
};

function isDateInRanges(date, ranges = []) {
  if (!date) return false;
  return ranges.some((r) => {
    if (!r?.startDate || !r?.endDate) return false;
    const [sy, sm, sd] = r.startDate.split("-").map(Number);
    const [ey, em, ed] = r.endDate.split("-").map(Number);
    const start = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);
    return date >= start && date <= end;
  });
}

function summarizeGuests(g) {
  const parts = [];
  if (g.adults) parts.push(`${g.adults} Adult${g.adults === 1 ? "" : "s"}`);
  if (g.teenagers) parts.push(`${g.teenagers} Teen${g.teenagers === 1 ? "" : "s"}`);
  if (g.children) parts.push(`${g.children} Child${g.children === 1 ? "" : "ren"}`);
  if (g.toddlers) parts.push(`${g.toddlers} Toddler${g.toddlers === 1 ? "" : "s"}`);
  if (g.infants) parts.push(`${g.infants} Infant${g.infants === 1 ? "" : "s"}`);
  return parts.length ? parts.join(", ") : "Select guests";
}

function GuestCounter({ label, sublabel, value, onChange, decDisabled, incDisabled, incHint }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="min-w-0 pr-3">
        <div className="text-sm font-semibold text-[#09432B]">{label}</div>
        {sublabel && (
          <div className="text-[11px] text-gray-500 leading-tight">{sublabel}</div>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onChange(-1)}
          disabled={decDisabled}
          className="w-8 h-8 rounded-full border border-[#0F5B45] text-[#0F5B45] disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
        >
          –
        </button>
        <span className="w-6 text-center text-sm font-semibold text-[#09432B]">{value}</span>
        <button
          type="button"
          onClick={() => onChange(+1)}
          disabled={incDisabled}
          title={incDisabled && incHint ? incHint : undefined}
          className="w-8 h-8 rounded-full border border-[#0F5B45] text-[#0F5B45] disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function BookingForm() {
  const [checkIn, setCheckIn] = useState();
  const [checkOut, setCheckOut] = useState();
  const [guests, setGuests] = useState(EMPTY_GUESTS);
  const [loading, setLoading] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [submitError, setSubmitError] = useState(null);
  const bookingStore = useBookingStore();
  const navigate = useNavigate();

  const launchDate = new Date(2026, 4, 1);
  const today = startOfDay(new Date());

  const isCheckoutDisabled = (date) => {
    const day = startOfDay(date);
    if (checkIn) return day <= startOfDay(checkIn);
    const floor = launchDate.getTime() > Date.now() ? startOfDay(launchDate) : today;
    return day <= floor;
  };

  useEffect(() => {
    fetch(`${BASE_URL}/config/holidays`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setHolidays(Array.isArray(data) ? data : []))
      .catch(() => setHolidays([]));
  }, []);

  const childrenAllowedForDates = useMemo(() => {
    if (!checkIn || !checkOut) return false;
    return (
      isDateInRanges(checkIn, holidays) ||
      isDateInRanges(checkOut, holidays) ||
      holidays.some((r) => {
        if (!r?.startDate || !r?.endDate) return false;
        const [sy, sm, sd] = r.startDate.split("-").map(Number);
        const [ey, em, ed] = r.endDate.split("-").map(Number);
        const start = new Date(sy, sm - 1, sd);
        const end = new Date(ey, em - 1, ed);
        return checkIn <= start && checkOut >= end;
      })
    );
  }, [checkIn, checkOut, holidays]);

  const totalGuestsDisplay =
    guests.adults + guests.teenagers + guests.toddlers + guests.children + guests.infants;

  const canIncrement = (patch) => {
    const next = normalizeFamilyGuests({ ...guests, ...patch });
    return findMinValidPodCount(next) !== null;
  };

  const canDecrement = (patch) => {
    const next = normalizeFamilyGuests({ ...guests, ...patch });
    return findMinValidPodCount(next) !== null;
  };

  const tryIncrement = (key, delta) => {
    setSubmitError(null);
    const nextVal = Math.max(0, (guests[key] || 0) + delta);
    const next = { ...guests, [key]: nextVal };

    if (delta > 0) {
      if (!canIncrement({ [key]: nextVal })) return;
      const isUnder13 = key === "children" || key === "toddlers" || key === "infants";
      if (isUnder13) {
        // Allow if Children-Allowed Dates OR if composition forces a full takeover (6 pods)
        const minPods = findMinValidPodCount(next);
        const takeoverOnly = minPods === 6;
        if (!childrenAllowedForDates && !takeoverOnly) {
          setSubmitError(
            "Children aged 0-12 are only permitted on Children-Allowed Dates or with a full camp takeover (6 domes). Pick eligible dates or contact us.",
          );
          return;
        }
      }
    } else if (delta < 0) {
      if (!canDecrement({ [key]: nextVal })) return;
    }

    setGuests(next);
  };

  const handleCheckAvailability = async () => {
    setSubmitError(null);
    if (!checkIn || !checkOut) {
      setSubmitError("Please select check-in and check-out dates.");
      return;
    }
    if (checkOut <= checkIn) {
      setSubmitError("Check-out must be after check-in.");
      return;
    }

    const normalized = normalizeFamilyGuests(guests);
    const minPods = findMinValidPodCount(normalized);
    if (minPods === null) {
      setSubmitError(
        "This guest mix can't be accommodated under the dome occupancy rules. Please adjust guest counts.",
      );
      return;
    }

    const hasUnder13 = normalized.children + normalized.toddlers + normalized.infants > 0;
    if (hasUnder13 && !childrenAllowedForDates && minPods !== 6) {
      setSubmitError(
        "Children aged 0-12 are only permitted on Children-Allowed Dates or with a full camp takeover (6 domes).",
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/availability/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: toISODate(checkIn),
          endDate: toISODate(checkOut),
          adults: normalized.adults + normalized.teenagers,
        }),
      });
      const data = await response.json();
      const { pods, peakRateInfo, weekdayPeakInfo, seasonalRatePeriods } =
        parseAvailabilityCheckResponse(data);

      bookingStore.updateDraft({
        dates: {
          checkIn: toISODate(checkIn),
          checkOut: toISODate(checkOut),
        },
        guests: normalized,
        popUpBeds: 0,
        numberOfNights: differenceInCalendarDays(checkOut, checkIn),
        availablePods: pods,
        peakRateInfo,
        weekdayPeakInfo,
        seasonalRatePeriods,
      });

      navigate("/guest-details");
    } catch (error) {
      console.error("Error checking availability:", error);
      setSubmitError("We couldn't check availability right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-xl px-5 py-6 md:px-8 md:py-8 flex flex-col md:flex-row gap-5 md:gap-6 items-start md:items-center">
      {/* CHECK-IN */}
      <div className="w-full md:w-1/5">
        <label className="text-gray-700 font-semibold text-sm">Check-in</label>
        <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
          <PopoverTrigger asChild>
            <button className="w-full mt-1 border border-gray-300 rounded-md px-3 py-3 flex justify-between items-center text-gray-700 bg-white">
              {checkIn ? checkIn.toLocaleDateString() : "mm/dd/yyyy"}
              <CalendarIcon className="w-5 h-5 text-gray-600" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="p-0 bg-white shadow-lg rounded-md w-auto">
            <Calendar
              mode="single"
              selected={checkIn}
              onSelect={(date) => {
                setCheckIn(date);
                setCheckInOpen(false);
                if (date) {
                  setCheckOut(addDays(startOfDay(date), 1));
                }
              }}
              disabled={(date) => {
                const day = startOfDay(date);
                return day < startOfDay(launchDate) || day < today;
              }}
              className="rounded-md"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* CHECK-OUT */}
      <div className="w-full md:w-1/5">
        <label className="text-gray-700 font-semibold text-sm">Check-out</label>
        <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
          <PopoverTrigger asChild>
            <button className="w-full mt-1 border border-gray-300 rounded-md px-3 py-3 flex justify-between items-center text-gray-700 bg-white">
              {checkOut ? checkOut.toLocaleDateString() : "mm/dd/yyyy"}
              <CalendarIcon className="w-5 h-5 text-gray-600" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="p-0 bg-white shadow-lg rounded-md w-auto">
            <Calendar
              mode="single"
              selected={checkOut}
              defaultMonth={checkOut ?? (checkIn ? addDays(checkIn, 1) : undefined)}
              onSelect={(date) => {
                setCheckOut(date);
                setCheckOutOpen(false);
              }}
              disabled={isCheckoutDisabled}
              className="rounded-md"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* STAY NIGHTS */}
      <div className="w-full md:w-1/5">
        <label className="text-gray-700 font-semibold text-sm">You are staying for</label>
        <div className="w-full mt-1 border border-gray-300 rounded-md px-3 py-3 flex items-center text-gray-700 bg-gray-50">
          {checkIn && checkOut
            ? `${differenceInCalendarDays(checkOut, checkIn)} night${differenceInCalendarDays(checkOut, checkIn) === 1 ? "" : "s"}`
            : "Select dates"}
        </div>
      </div>

      {/* GUESTS */}
      <div className="w-full md:w-1/4">
        <label className="text-gray-700 font-semibold text-sm">Guests</label>
        <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-3 flex justify-between items-center text-gray-700 bg-white text-left"
            >
              <span className="flex items-center gap-2 truncate">
                <Users className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="truncate text-sm">{summarizeGuests(guests)}</span>
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="bg-white shadow-lg rounded-md w-80 p-3">
            <div className="divide-y">
              <GuestCounter
                label="Adults"
                sublabel="18+ years"
                value={guests.adults}
                onChange={(d) => tryIncrement("adults", d)}
                decDisabled={guests.adults <= 0 || !canDecrement({ adults: guests.adults - 1 })}
                incDisabled={!canIncrement({ adults: guests.adults + 1 })}
                incHint="No valid pod arrangement"
              />
              <GuestCounter
                label="Teens"
                sublabel="13–17 years"
                value={guests.teenagers}
                onChange={(d) => tryIncrement("teenagers", d)}
                decDisabled={guests.teenagers <= 0 || !canDecrement({ teenagers: guests.teenagers - 1 })}
                incDisabled={!canIncrement({ teenagers: guests.teenagers + 1 })}
                incHint="No valid pod arrangement"
              />
              <GuestCounter
                label="Children"
                sublabel="4–12 years"
                value={guests.children}
                onChange={(d) => tryIncrement("children", d)}
                decDisabled={guests.children <= 0 || !canDecrement({ children: guests.children - 1 })}
                incDisabled={!canIncrement({ children: guests.children + 1 })}
                incHint="No valid pod arrangement"
              />
              <GuestCounter
                label="Toddlers"
                sublabel="1–3 years"
                value={guests.toddlers}
                onChange={(d) => tryIncrement("toddlers", d)}
                decDisabled={guests.toddlers <= 0 || !canDecrement({ toddlers: guests.toddlers - 1 })}
                incDisabled={!canIncrement({ toddlers: guests.toddlers + 1 })}
                incHint="No valid pod arrangement"
              />
              <GuestCounter
                label="Infants"
                sublabel="0–1 year"
                value={guests.infants}
                onChange={(d) => tryIncrement("infants", d)}
                decDisabled={guests.infants <= 0 || !canDecrement({ infants: guests.infants - 1 })}
                incDisabled={!canIncrement({ infants: guests.infants + 1 })}
                incHint="No valid pod arrangement"
              />
            </div>
            {(guests.children + guests.toddlers + guests.infants > 0) && checkIn && checkOut && !childrenAllowedForDates && (
              <div className="mt-3 flex gap-2 items-start text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  Children aged 0–12 are only permitted on Children-Allowed Dates or with a full camp takeover (6 domes).
                </span>
              </div>
            )}
            <Button
              type="button"
              onClick={() => setGuestsOpen(false)}
              className="w-full mt-3 bg-[#09432B] hover:bg-[#083f28] text-white"
            >
              Done
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      {/* BUTTON */}
      <div className="w-full md:w-auto flex flex-col items-stretch md:items-end gap-2 md:mt-6">
        <Button
          onClick={handleCheckAvailability}
          disabled={loading}
          className="w-full md:w-auto h-12 flex items-center justify-center gap-2 text-white font-semibold rounded-md transition px-6 py-3 bg-[#09432B] md:bg-[#09432B] hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Checking..." : "Check Availability"}
          <ArrowRight className="w-4 h-4" />
        </Button>
        {submitError && (
          <div className="text-xs text-red-600 md:text-right md:max-w-[300px]">{submitError}</div>
        )}
        {!submitError && totalGuestsDisplay > 0 && (
          <div className="text-[11px] text-gray-500 md:text-right">
            {(() => {
              const minPods = findMinValidPodCount(normalizeFamilyGuests(guests));
              if (!minPods) return null;
              return `Minimum ${minPods} dome${minPods === 1 ? "" : "s"} required for this guest mix`;
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

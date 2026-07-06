import React, { useEffect, useMemo, useState } from "react";
import CommonNavbar from "@/components/shared/common/CommonNavbar/CommonNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Home,
  Info,
  Users,
  Wallet,
  X,
  RotateCcw,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import FunnelMobileStickyCta from "@/components/booking/FunnelMobileStickyCta";
import { useBookingStore, calculateDynamicSubTotal } from "@/store/useBookingStore";
import { formatDateSafe } from "@/lib/utils";
import {
  GUEST_TYPE_LABELS,
  GUEST_TYPE_ORDER,
  applyDefaultGuestAllocation,
  canAddGuestToPod,
  getRemainingGuestPool,
  isGuestAllocationComplete,
  validatePodAllocation,
  podAllocationFromDomeDetails,
} from "@/lib/guestAllocation";

const TYPE_STYLES = {
  adult: "bg-[#09432B] text-white",
  teen: "bg-[#1B6B4A] text-white",
  child: "bg-[#3D8B6E] text-white",
  toddler: "bg-[#6BAF93] text-[#09432B]",
  infant: "bg-[#E6F2EE] text-[#09432B] border border-[#09432B]/20",
};

function formatPrice(n) {
  return n.toLocaleString();
}

function GuestTypeBadge({ type, onRemove }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${TYPE_STYLES[type] || "bg-gray-200"}`}
    >
      {GUEST_TYPE_LABELS[type] || type}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full hover:bg-black/10 p-0.5"
          aria-label={`Remove ${GUEST_TYPE_LABELS[type]}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

export default function AssignGuests() {
  const navigate = useNavigate();
  const bookingStore = useBookingStore();
  const guests = bookingStore.draft.guests || {};
  const podCount = bookingStore.draft.podCount || 1;
  const [validationErrors, setValidationErrors] = useState([]);

  const domeDetails = useMemo(() => {
    if (bookingStore.draft.domeDetails?.length) {
      return bookingStore.draft.domeDetails;
    }
    return Array.from({ length: podCount }, (_, i) => ({
      podName: `Dome ${i + 1}`,
      bedConfig: "1 x King Bed (6 foot)",
      guests: ["", ""],
      guestTypes: [],
    }));
  }, [bookingStore.draft.domeDetails, podCount]);

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
    }
  }, [bookingStore.draft, navigate]);

  useEffect(() => {
    const needsInit =
      !domeDetails.some((d) => Array.isArray(d.guestTypes) && d.guestTypes.length > 0);
    if (needsInit && guests) {
      const updated = applyDefaultGuestAllocation(domeDetails, guests, podCount);
      bookingStore.updateDraft({ domeDetails: updated });
    }
  }, []);

  const podAllocation = useMemo(
    () => podAllocationFromDomeDetails(domeDetails) || domeDetails.map(() => []),
    [domeDetails],
  );

  const remaining = useMemo(
    () => getRemainingGuestPool(guests, podAllocation),
    [guests, podAllocation],
  );

  const isComplete = isGuestAllocationComplete(domeDetails, guests, podCount);

  const updateDomeDetails = (nextDetails) => {
    bookingStore.updateDraft({
      domeDetails: nextDetails,
      subTotal: calculateDynamicSubTotal({
        ...bookingStore.draft,
        domeDetails: nextDetails,
      }),
    });
    const alloc = podAllocationFromDomeDetails(nextDetails) || nextDetails.map(() => []);
    const { errors } = validatePodAllocation(alloc, guests, podCount);
    setValidationErrors(errors);
  };

  const addGuestToDome = (domeIdx, type) => {
    if ((remaining[type] || 0) < 1) return;
    const podGuests = [...(domeDetails[domeIdx]?.guestTypes || [])];
    if (!canAddGuestToPod(podGuests, type, guests, podCount, domeIdx)) return;

    const next = domeDetails.map((dome, i) =>
      i === domeIdx
        ? { ...dome, guestTypes: [...(dome.guestTypes || []), type] }
        : dome,
    );
    updateDomeDetails(next);
  };

  const removeGuestFromDome = (domeIdx, guestIdx) => {
    const next = domeDetails.map((dome, i) => {
      if (i !== domeIdx) return dome;
      const types = [...(dome.guestTypes || [])];
      types.splice(guestIdx, 1);
      return { ...dome, guestTypes: types };
    });
    updateDomeDetails(next);
  };

  const resetToSuggested = () => {
    const updated = applyDefaultGuestAllocation(domeDetails, guests, podCount);
    updateDomeDetails(updated);
  };

  const handleContinue = () => {
    const { valid, errors } = validatePodAllocation(podAllocation, guests, podCount);
    if (!valid) {
      setValidationErrors(errors);
      return;
    }
    navigate("/meal-plan");
  };

  if (!bookingStore.draft.dates || !bookingStore.draft.podCount) {
    return null;
  }

  const unassignedTotal = GUEST_TYPE_ORDER.reduce(
    (sum, key) => sum + (remaining[key] || 0),
    0,
  );

  return (
    <div className="overflow-x-hidden min-h-screen w-full bg-[#F7F5F0] pb-28 md:pb-0">
      <CommonNavbar />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-sm text-gray-700 mb-6 pl-0 hover:bg-transparent"
        >
          <ArrowLeft className="w-4 h-4" />
          <Link to="/select-rooms">Back</Link>
        </Button>

        <h2 className="text-2xl md:text-5xl font-bold text-[#09432B] text-center">
          Assign Guests to Domes
        </h2>
        <p className="text-center text-sm md:text-lg font-medium text-[#737373] mt-2 mb-6">
          Step 3 of 7 — Who stays in which dome affects your price
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-5">
            <div
              className="rounded-lg border border-[#C7C3B5] px-4 py-3 flex items-start gap-2 text-[#09432B]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(181,171,132,0.28) 0%, rgba(161,146,87,0.28) 100%)",
              }}
            >
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-sm font-medium space-y-1">
                <p>
                  Place each guest in a dome. A teen alone in a dome pays the full adult rate.
                  Children without an adult in the same dome still pay the adult base for the first slot.
                </p>
                <p className="text-[#5a5a5a]">
                  We&apos;ve suggested a layout — adjust if you prefer a different arrangement.
                </p>
              </div>
            </div>

            {unassignedTotal > 0 && (
              <Card className="bg-amber-50 border-amber-200 rounded-xl">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-amber-900 mb-2">
                    Still to assign ({unassignedTotal})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {GUEST_TYPE_ORDER.flatMap((type) =>
                      Array.from({ length: remaining[type] || 0 }, (_, i) => (
                        <GuestTypeBadge key={`${type}-${i}`} type={type} />
                      )),
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {validationErrors.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 space-y-1">
                {validationErrors.map((err) => (
                  <p key={err}>{err}</p>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-[#09432B] border-[#09432B]"
                onClick={resetToSuggested}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to suggested
              </Button>
            </div>

            <div className="space-y-4">
              {domeDetails.map((dome, domeIdx) => (
                <Card
                  key={dome.podId || domeIdx}
                  className="bg-white rounded-xl shadow-sm border border-[#C7C3B5]"
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-[#E6F2EE] rounded-full flex items-center justify-center">
                        <Home className="w-4 h-4 text-[#09432B]" />
                      </div>
                      <h3 className="text-lg font-bold text-[#09432B]">
                        {dome.podName || `Dome ${domeIdx + 1}`}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-2 min-h-[2rem] mb-4">
                      {(dome.guestTypes || []).length === 0 ? (
                        <span className="text-sm text-[#737373] italic">
                          No guests assigned yet
                        </span>
                      ) : (
                        (dome.guestTypes || []).map((type, guestIdx) => (
                          <GuestTypeBadge
                            key={`${domeIdx}-${guestIdx}-${type}`}
                            type={type}
                            onRemove={() => removeGuestFromDome(domeIdx, guestIdx)}
                          />
                        ))
                      )}
                    </div>

                    <p className="text-xs font-semibold text-[#737373] uppercase tracking-wide mb-2">
                      Add guest
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {GUEST_TYPE_ORDER.map((type) => {
                        const podGuests = dome.guestTypes || [];
                        const canAdd =
                          (remaining[type] || 0) > 0 &&
                          canAddGuestToPod(
                            podGuests,
                            type,
                            guests,
                            podCount,
                            domeIdx,
                          );
                        if ((remaining[type] || 0) < 1) return null;
                        return (
                          <Button
                            key={type}
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={!canAdd}
                            className="text-xs border-[#09432B]/30 text-[#09432B] disabled:opacity-40"
                            onClick={() => addGuestToDome(domeIdx, type)}
                          >
                            + {GUEST_TYPE_LABELS[type]}
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                  <Users className="w-4 h-4 text-[#09432B]" />
                </div>
                <h4 className="text-[#09432B] font-bold">Your Party</h4>
              </div>
              <div className="text-sm text-[#737373] space-y-1">
                {(guests.adults || 0) > 0 && <p>{guests.adults} Adult(s)</p>}
                {(guests.teenagers || 0) > 0 && <p>{guests.teenagers} Teen(s)</p>}
                {(guests.children || 0) > 0 && <p>{guests.children} Child(ren)</p>}
                {(guests.toddlers || 0) > 0 && <p>{guests.toddlers} Toddler(s)</p>}
                {(guests.infants || 0) > 0 && <p>{guests.infants} Infant(s)</p>}
              </div>
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
                const taxAmount =
                  dynamicSubTotal > 0 ? Math.round(dynamicSubTotal * 0.125) : 0;
                const totalAmount =
                  dynamicSubTotal > 0 ? Math.round(dynamicSubTotal * 1.125) : 0;
                return (
                  <div className="space-y-3 text-sm font-semibold text-[#09432B]">
                    <div className="flex justify-between">
                      <span>Sub Total:</span>
                      <span>₦{formatPrice(dynamicSubTotal)}</span>
                    </div>
                    <div className="flex justify-between leading-snug">
                      <span>Tax & VAT (12.5%)</span>
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

            <div className="hidden md:block w-full rounded-t-xl overflow-hidden">
              <div
                className="px-4 py-3 text-[#0A4C30] text-sm font-medium"
                style={{ backgroundColor: "#B7FFFF" }}
              >
                {isComplete
                  ? "All guests assigned — continue to bed setup"
                  : "Assign every guest to a dome to continue"}
              </div>
              <Button
                className={`w-full text-white text-base font-bold py-6 rounded-none rounded-b-xl ${
                  isComplete
                    ? "bg-[#09432B] hover:bg-[#083f28]"
                    : "bg-gray-400 cursor-not-allowed opacity-50"
                }`}
                disabled={!isComplete}
                onClick={handleContinue}
              >
                Continue to Bed Configuration →
              </Button>
            </div>
          </div>
        </div>
      </div>

      <FunnelMobileStickyCta>
        <Button
          className={`w-full text-white text-base font-bold py-6 rounded-xl ${
            isComplete
              ? "bg-[#09432B] hover:bg-[#083f28]"
              : "bg-gray-400 cursor-not-allowed opacity-50"
          }`}
          disabled={!isComplete}
          onClick={handleContinue}
        >
          Continue to Bed Configuration →
        </Button>
      </FunnelMobileStickyCta>
    </div>
  );
}

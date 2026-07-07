import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Calendar,
  Home,
  Users,
  Utensils,
  Percent,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import CommonNavbar from "@/components/shared/common/CommonNavbar/CommonNavbar";
import { useBookingStore } from "@/store/useBookingStore";
import { format } from "date-fns/format";
import { BASE_URL } from "@/config";
import { formatDateSafe } from "@/lib/utils";
import { formatSelectedRoomNames } from "@/lib/bookingDisplay";
import { calculateStayRoomSubtotal } from "@/lib/stayPricing";
import { isFamilyCompositionAllowed, isAllowedGuestCombination } from "@/lib/familyRules";
import { podAllocationFromDomeDetails, GUEST_TYPE_LABELS } from "@/lib/guestAllocation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

function formatPrice(n) {
  return n.toLocaleString();
}
export default function ReviewYourBooking() {
  const bookingStore = useBookingStore();
  const [voucherCode, setVoucherCode] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [creating, setCreating] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const navigate = useNavigate();

  const applyVoucher = async () => {
    if (!voucherCode) return;
    try {
      const response = await fetch(`${BASE_URL}/vouchers/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: voucherCode }),
      });
      const data = await response.json();
      if (data.valid) {
        setAppliedVoucher(data.voucher);
        setSuccessMessage(`Voucher applied: ₦${data.voucher.value.toLocaleString()}`);
        setSuccessDialogOpen(true);
      } else {
        setErrorMessage(data.reason || "Invalid voucher code");
        setErrorDialogOpen(true);
      }
    } catch (error) {
      console.error("Error applying voucher:", error);
      setErrorMessage("Failed to validate voucher");
      setErrorDialogOpen(true);
    }
  };

  const applyDiscount = async () => {
    if (!discountCode) return;
    try {
      const response = await fetch(`${BASE_URL}/discounts/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountCode }),
      });
      const data = await response.json();
      if (data.valid) {
        setAppliedDiscount(data.discount);
        setSuccessMessage(`Discount applied: ${data.discount.type === 'percentage' ? data.discount.value + '%' : '₦' + Number(data.discount.value).toLocaleString()}`);
        setSuccessDialogOpen(true);
      } else {
        setErrorMessage(data.reason || "Invalid discount code");
        setErrorDialogOpen(true);
      }
    } catch (error) {
      console.error("Error applying discount:", error);
      setErrorMessage("Failed to validate discount");
      setErrorDialogOpen(true);
    }
  };

  const calculatePricing = () => {
    const guestCounts = bookingStore.draft.guests || {};
    const totalGuests =
      (guestCounts.adults || 0) +
      (guestCounts.teenagers || 0) +
      (guestCounts.toddlers || 0) +
      (guestCounts.children || 0) +
      (guestCounts.infants || 0);
    const pricingConfig = bookingStore.draft.pricingConfig || {};
    const pods = bookingStore.draft.podCount || 1;
    const checkIn = bookingStore.draft.dates?.checkIn;
    const checkOut = bookingStore.draft.dates?.checkOut;
    const seasonalRates = bookingStore.draft.seasonalRatePeriods ?? [];

    const stayPricingArgs = {
      checkIn,
      checkOut,
      podsCount: pods,
      pricingConfig,
      seasonalRates,
    };

    const podAllocation = podAllocationFromDomeDetails(
      bookingStore.draft.domeDetails,
    );

    const { subtotal: roomSubtotal } = calculateStayRoomSubtotal({
      ...stayPricingArgs,
      guestCounts,
      podAllocation,
    });

    const { subtotal: baseForStayPreview } = calculateStayRoomSubtotal({
      ...stayPricingArgs,
      guestCounts: { adults: pods },
    });

    const extrasTotal =
      bookingStore.draft.extras?.reduce(
        (sum, e) => sum + Number(e.price) * (e.quantity || 1),
        0,
      ) || 0;

    const subTotal = roomSubtotal + extrasTotal;
    
    // 1. Twelve Guest Discount
    const configuredDiscountPercent = pricingConfig.twelveGuestDiscountPercent ?? 10;
    const twelveGuestDiscountPercent = totalGuests === 12 ? configuredDiscountPercent : 0;
    const twelveGuestDiscountAmount = twelveGuestDiscountPercent > 0
        ? Math.round(baseForStayPreview * (twelveGuestDiscountPercent / 100))
        : 0;
    
    let runningTotal = subTotal - twelveGuestDiscountAmount;
    
    // 2. Applied Discount Code
    let promoDiscountAmount = 0;
    if (appliedDiscount) {
      if (appliedDiscount.type === 'percentage') {
        promoDiscountAmount = Math.round(runningTotal * (Number(appliedDiscount.value) / 100));
      } else {
        promoDiscountAmount = Number(appliedDiscount.value);
      }
      runningTotal -= promoDiscountAmount;
    }
    
    // 3. Applied Voucher
    let voucherDiscountAmount = 0;
    if (appliedVoucher) {
      voucherDiscountAmount = Number(appliedVoucher.value);
      runningTotal -= voucherDiscountAmount;
    }

    const taxableBase = Math.max(0, runningTotal);
    const taxAmount = Math.round(taxableBase * 0.125);
    const finalTotal = Math.round(taxableBase * 1.125);

    return {
      subTotal,
      twelveGuestDiscountAmount,
      twelveGuestDiscountPercent,
      promoDiscountAmount,
      voucherDiscountAmount,
      taxableBase,
      taxAmount,
      finalTotal,
      totalSavings: twelveGuestDiscountAmount + promoDiscountAmount + voucherDiscountAmount
    };
  };

  const pricing = calculatePricing();

  const validateBooking = () => {
    const { draft } = bookingStore;
    if (!draft.dates || !draft.dates.checkIn || !draft.dates.checkOut) {
      return "Please select your check-in and check-out dates before continuing.";
    }
    if (!draft.podCount || draft.podCount < 1) {
      return "Please select at least one room before continuing.";
    }
    if (
      !draft.selectedPodIds?.length ||
      draft.selectedPodIds.length !== draft.podCount
    ) {
      return "Please select your preferred dome(s) before continuing.";
    }
    if (!draft.podId) {
      return "Please select your preferred dome before continuing.";
    }
    const contact = draft.contact || {};
    if (!contact.firstName || !contact.lastName) {
      return "Please enter your first and last name on the details page.";
    }
    if (!contact.email) {
      return "Please enter your email address on the details page.";
    }
    if (!contact.phone) {
      return "Please enter your phone number on the details page.";
    }
    if (!contact.gender) {
      return "Please select your gender on the details page.";
    }
    if (!contact.dob) {
      return "Please enter your date of birth on the details page.";
    }
    const guests = draft.guests || {};
    if (!isAllowedGuestCombination(guests)) {
      return "This guest combination is not available for booking.";
    }
    if (!isFamilyCompositionAllowed(guests, draft.podCount || 1)) {
      return "This guest combination cannot be accommodated in the selected number of domes.";
    }
    return null;
  };

  // API: Create booking
  const handleConfirmBooking = async () => {
    const validationError = validateBooking();
    if (validationError) {
      setErrorMessage(validationError);
      setErrorDialogOpen(true);
      return;
    }
    const contact = bookingStore.draft.contact || {};
    const { identification, ...contactWithoutId } = contact;
    const selectedPodIds =
      bookingStore.draft.selectedPodIds?.length > 0
        ? bookingStore.draft.selectedPodIds
        : bookingStore.draft.podId
          ? [bookingStore.draft.podId]
          : [];
    const payload = {
      dates: bookingStore.draft.dates,
      contact: contactWithoutId,
      podId: selectedPodIds[0],
      podIds: selectedPodIds,
      podCount: bookingStore.draft.podCount,
      boardType: bookingStore.draft.mealPlan?.boardType || "fullBoard",
      guests: bookingStore.draft.guests,
      popUpBeds: bookingStore.draft.popUpBeds || 0,
      extras: bookingStore.draft.extras || [],
      discountCode,
      voucherCode,
      bedConfiguration: bookingStore.draft.bedConfiguration,
      domeDetails: bookingStore.draft.domeDetails,
      welcomeNote: bookingStore.draft.welcomeNote,
      extraPersonalizations: bookingStore.draft.extraPersonalizations,
    };

    try {
      setCreating(true);
      console.log("[ReviewYourBooking] Preparing booking payload", {
        hasIdentification: !!identification,
        contactEmail: contactWithoutId.email,
        podId: payload.podId,
        dates: payload.dates,
      });
      const formData = new FormData();
      formData.append("payload", JSON.stringify(payload));
      if (identification) {
        console.log(
          "[ReviewYourBooking] Appending identification file to FormData",
          {
            name: identification.name,
            size: identification.size,
            type: identification.type,
          },
        );
        formData.append("identification", identification);
      }

      const response = await fetch(`${BASE_URL}/bookings`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        // Clear applied codes on success
        setAppliedDiscount(null);
        setAppliedVoucher(null);

        if (result.amountDue === 0) {
          // Redirect directly to confirmation page for zero-amount bookings
          navigate("/booking-confirmation", {
            state: {
              booking: {
                bookingReference: result.bookingReference,
                id: result.bookingId,
              },
              roomNames: formatSelectedRoomNames(bookingStore.draft),
            },
          });
          return;
        }

        // Navigate to payment page with payment details
        navigate("/payment", {
          state: {
            paymentLink: result.paymentLink,
            bookingReference: result.bookingReference,
            amountDue: result.amountDue,
            bookingId: result.bookingId,
          },
        });
      } else if (response.status === 409) {
        setErrorMessage(
          (result.error || "Your selected dome is no longer available.") +
            " Please go back and choose another room.",
        );
        setErrorDialogOpen(true);
      } else {
        console.log("Booking failed: " + (result.error || "Unknown error"));
        setErrorMessage(result.error || "Booking failed. Please try again.");
        setErrorDialogOpen(true);
      }
    } catch (error) {
      console.error("Booking failed:", error);
      setErrorMessage("Booking failed. Please try again.");
      setErrorDialogOpen(true);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#0A2F22]">
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking issue</DialogTitle>
            <DialogDescription>{errorMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setErrorDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Success</DialogTitle>
            <DialogDescription>{successMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSuccessDialogOpen(false)}>Great!</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <CommonNavbar />
      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-10">
        <div className="mb-4">
          <Link
            to="/enter-your-details"
            className="inline-flex items-center gap-2 text-[#3E6350] text-sm hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-center text-[#09432B]">
          Review Your Booking
        </h1>
        <p className="text-center text-sm text-[#6B6B6B] mt-1 mb-8">
          Step 7 of 7 - Confirm and pay
        </p>

        <div className="max-w-3xl mx-auto space-y-4">
          <div className="space-y-4">
            <Card className="rounded-xl border border-gray-200">
              <CardContent className="p-4 flex gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E6F2EE] flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-[#09432B]" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-semibold text-[#09432B]">Stay Dates</h4>
                    <span className="font-semibold text-[#09432B] text-sm">
                      {bookingStore.draft.numberOfNights} Nights
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    <div>
                      <div className="text-xs text-[#6B6B6B]">Check in</div>
                      <div className="font-medium mt-1">
                        {formatDateSafe(bookingStore.draft.dates.checkIn, "dd/MM/yyyy")}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#6B6B6B]">Check out</div>
                      <div className="font-medium mt-1">
                        {formatDateSafe(
                          bookingStore.draft.dates.checkOut,
                          "dd/MM/yyyy",
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-gray-200">
              <CardContent className="p-4 flex gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E6F2EE] flex items-center justify-center">
                  <Home className="w-4 h-4 text-[#09432B]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#09432B]">Your Rooms</h4>
                  <p className="text-sm text-[#6B6B6B]">
                    {formatSelectedRoomNames(bookingStore.draft)}
                  </p>
                  {bookingStore.draft.domeDetails && bookingStore.draft.domeDetails.length > 0 ? (
                    <div className="mt-2 space-y-2">
                       {bookingStore.draft.domeDetails.map((dome, idx) => (
                         <div key={idx} className="text-xs text-[#6B6B6B] border-l-2 border-[#E6F2EE] pl-2">
                           <span className="font-semibold">{dome.podName || `Dome ${idx + 1}`}:</span> {dome.bedConfig}
                           {dome.guestTypes?.length > 0 && (
                             <div className="text-gray-500 mt-0.5">
                               {dome.guestTypes.map((t) => GUEST_TYPE_LABELS[t] || t).join(", ")}
                             </div>
                           )}
                           {dome.guests?.[0] && <div className="italic text-gray-500">- {dome.guests.join(', ').replace(/, $/, '')}</div>}
                         </div>
                       ))}
                    </div>
                  ) : (
                    bookingStore.draft.bedConfiguration && (
                      <p className="text-sm text-[#6B6B6B] mt-1">
                        {bookingStore.draft.bedConfiguration}
                      </p>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-gray-200">
              <CardContent className="p-4 flex gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E6F2EE] flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#09432B]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#09432B]">Guests</h4>
                  <div className="text-sm text-[#6B6B6B] space-y-1">
                    <p>{bookingStore.draft.guests?.adults || 0} Adults (18+)</p>
                    {(bookingStore.draft.guests?.teenagers || 0) > 0 && (
                      <p>{bookingStore.draft.guests?.teenagers} Teens (13–17)</p>
                    )}
                    {(bookingStore.draft.guests?.infants || 0) > 0 && (
                      <p>{bookingStore.draft.guests?.infants} Infants (0–1)</p>
                    )}
                    {(bookingStore.draft.guests?.toddlers || 0) > 0 && (
                      <p>{bookingStore.draft.guests?.toddlers} Toddlers (1–3)</p>
                    )}
                    {(bookingStore.draft.guests?.children || 0) > 0 && (
                      <p>{bookingStore.draft.guests?.children} Children (4–12)</p>
                    )}
                    {(bookingStore.draft.popUpBeds || 0) > 0 && (
                      <p className="text-[#09432B] italic">
                        + {bookingStore.draft.popUpBeds} Pop-up bed{(bookingStore.draft.popUpBeds || 0) === 1 ? "" : "s"} (no extra charge)
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {bookingStore.draft.mealPlan?.title && (
              <Card className="rounded-xl border border-gray-200">
                <CardContent className="p-4 flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E6F2EE] flex items-center justify-center">
                    <Utensils className="w-4 h-4 text-[#09432B]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#09432B]">Meal Plan</h4>
                    <p className="text-sm text-[#6B6B6B]">
                      {bookingStore.draft.mealPlan.title}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="rounded-xl border border-gray-200">
              <CardContent className="p-4 flex gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E6F2EE] flex items-center justify-center">
                  <Percent className="w-4 h-4 text-[#09432B]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#09432B]">Extras</h4>
                  <p className="text-sm text-[#6B6B6B]">
                    {bookingStore.draft.extras?.length > 0
                      ? bookingStore.draft.extras
                          .map((e) => e.name || e.title)
                          .filter(Boolean)
                          .join(", ")
                      : "N/A"}
                  </p>
                  {bookingStore.draft.extraPersonalizations?.map((item) => (
                    <div
                      key={item.extraId}
                      className="mt-2 text-xs text-[#6B6B6B] border-l-2 border-[#E6F2EE] pl-2"
                    >
                      <span className="font-semibold text-[#09432B]">
                        {item.extraName}:
                      </span>{" "}
                      {item.text}
                      {item.dates?.length > 0 && (
                        <div className="text-gray-500 mt-0.5">
                          Dates: {item.dates.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                  {bookingStore.draft.welcomeNote?.text && (
                    <div className="mt-2 text-xs text-[#6B6B6B] border-l-2 border-[#E6F2EE] pl-2">
                      <span className="font-semibold text-[#09432B]">
                        Welcome note:
                      </span>{" "}
                      {bookingStore.draft.welcomeNote.text}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="rounded-xl border border-gray-200">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-[#09432B] mb-1">
                Price Summary
              </h3>
              <p className="text-xs text-[#6B6B6B] mb-4">
                Pod & Meals ({bookingStore.draft.numberOfNights || 0} Nights)
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B]">Sub Total:</span>
                  <span className="font-semibold text-[#09432B]">
                    ₦{formatPrice(pricing.subTotal)}
                  </span>
                </div>

                {(() => {
                  const w = bookingStore.draft.weekdayPeakInfo;
                  const showPeak = w && (w.peakNights ?? 0) > 0;
                  const showOffPeak = w && (w.offPeakNights ?? 0) > 0;
                  if (!showPeak && !showOffPeak) return null;
                  return (
                    <div className="flex gap-3 text-[#008080] text-xs">
                      {showPeak && <span>Peak rate</span>}
                      {showOffPeak && <span>Off-peak rate</span>}
                    </div>
                  );
                })()}
                {bookingStore.draft.peakRateInfo && (
                  <div className="text-[#008080] text-xs">Seasonal rate</div>
                )}

                {pricing.twelveGuestDiscountAmount > 0 && (
                  <div className="flex justify-between text-[#008080]">
                    <span className="">12 Guest Discount ({pricing.twelveGuestDiscountPercent}%):</span>
                    <span className="font-semibold">
                      - ₦{formatPrice(pricing.twelveGuestDiscountAmount)}
                    </span>
                  </div>
                )}

                {pricing.promoDiscountAmount > 0 && (
                  <div className="flex justify-between text-[#008080]">
                    <span className="">Promo Discount ({appliedDiscount.code}):</span>
                    <span className="font-semibold">
                      - ₦{formatPrice(pricing.promoDiscountAmount)}
                    </span>
                  </div>
                )}

                {pricing.voucherDiscountAmount > 0 && (
                  <div className="flex justify-between text-[#008080]">
                    <span className="">Voucher ({appliedVoucher.code}):</span>
                    <span className="font-semibold">
                      - ₦{formatPrice(pricing.voucherDiscountAmount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-[#6B6B6B]">
                    Consumption tax & VAT (12.5%):
                  </span>
                  <span className="font-semibold text-[#09432B]">
                    ₦{formatPrice(pricing.taxAmount)}
                  </span>
                </div>
              </div>
              <div className="mt-5 rounded-xl overflow-hidden border border-[#d9d9d9]">
                <div className="bg-[#B7FFFF] px-4 py-3 text-[#0A4C30] font-medium flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <span>Savings:</span>
                    <span className="font-semibold">
                      ₦{formatPrice(pricing.totalSavings)}
                    </span>
                  </div>
                  <div className="text-sm text-[#4b4b4b]">
                    Apply voucher or discount code
                  </div>
                </div>
                <div className="p-4 bg-[#B7FFFF]">
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                      <div className="flex-1 min-w-0">
                        <Label className="text-sm">Voucher Code</Label>
                        <Input
                          placeholder="Enter Voucher Code"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <Button
                        onClick={applyVoucher}
                        className="w-full sm:w-28 shrink-0 h-10"
                      >
                        Apply
                      </Button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                      <div className="flex-1 min-w-0">
                        <Label className="text-sm">Discount Code</Label>
                        <Input
                          placeholder="Enter Discount Code"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <Button
                        onClick={applyDiscount}
                        className="w-full sm:w-28 shrink-0 h-10"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>

                  <div className="border-t mt-4 pt-3 bg-[#F2EFE7] px-3 py-2 rounded-md flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>₦{formatPrice(pricing.finalTotal)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <Button
                  onClick={handleConfirmBooking}
                  disabled={creating}
                  className="w-full bg-[#09432B] hover:bg-[#09432B] text-white font-semibold py-3"
                >
                  {creating
                    ? "Creating Booking..."
                    : pricing.finalTotal === 0
                      ? "Confirm Booking"
                      : "Proceed to Payment"}
                </Button>

                <div className="w-full mt-2">
                  <Button className="w-full text-white font-semibold bg-gradient-to-r from-[#B5AB84] to-[#A19257] py-3">
                    Download a Performa Invoice
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="w-full border border-[#09432B] text-[#09432B] font-semibold py-3 mt-2 cursor-pointer"
                  onClick={() => {
                    bookingStore.resetBooking();
                    navigate("/");
                  }}
                >
                  Restart Booking
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

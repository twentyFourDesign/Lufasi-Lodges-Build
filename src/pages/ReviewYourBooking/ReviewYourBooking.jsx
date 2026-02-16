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
  const [clubId, setClubId] = useState("");
  const [creating, setCreating] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const applyVoucher = () => {};
  const applyDiscount = () => {};
  const applyClub = () => {};

  // API: Create booking
  const handleConfirmBooking = async () => {
    try {
      setCreating(true);
      const response = await fetch(`${BASE_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dates: bookingStore.draft.dates,
          contact: bookingStore.draft.contact,
          podId: bookingStore.draft.availablePods[0]?.id, // Pods will be assigned manually later
          podCount: bookingStore.draft.podCount,
          boardType: bookingStore.draft.mealPlan?.boardType || "fullBoard",
          guests: bookingStore.draft.guests,
          popUpBeds: bookingStore.draft.popUpBeds || 0,
          extras: bookingStore.draft.extras || [],
          discountCode,
          voucherCode,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        // Navigate to payment page with payment details
        navigate("/payment", {
          state: {
            paymentLink: result.paymentLink,
            bookingReference: result.bookingReference,
            amountDue: result.amountDue,
            bookingId: result.bookingId,
          },
        });
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
          Step 6 of 6 - Confirm and pay
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
                        {format(bookingStore.draft.dates.checkIn, "dd/MM/yyyy")}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#6B6B6B]">Check out</div>
                      <div className="font-medium mt-1">
                        {format(
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
                    {`x${bookingStore.draft.podCount || 0} Rooms`}
                  </p>
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
                  <p className="text-sm text-[#6B6B6B]">
                    {bookingStore.draft.guests?.adults || 0} Adults (18+)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-gray-200">
              <CardContent className="p-4 flex gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E6F2EE] flex items-center justify-center">
                  <Utensils className="w-4 h-4 text-[#09432B]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#09432B]">Meal Plan</h4>
                  <p className="text-sm text-[#6B6B6B]">
                    {bookingStore.draft.mealPlan?.title || "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-gray-200">
              <CardContent className="p-4 flex gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E6F2EE] flex items-center justify-center">
                  <Percent className="w-4 h-4 text-[#09432B]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#09432B]">Extras</h4>
                  <p className="text-sm text-[#6B6B6B]">
                    {bookingStore.draft.extras.length > 0
                      ? `${bookingStore.draft.extras.length} Selected`
                      : "N/A"}
                  </p>
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
                  <span className="font-semibold">
                    ₦{formatPrice(bookingStore.draft.subTotal)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#6B6B6B]">
                    After consumption tax and VAT(12.5%)
                  </span>
                  <span className="font-semibold">
                    ₦
                    {formatPrice(
                      Math.round(bookingStore.draft.subTotal * 0.125),
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#6B6B6B]">Discount</span>
                  <span className="font-semibold">0%</span>
                </div>
              </div>
              <div className="mt-5 rounded-xl overflow-hidden border border-[#d9d9d9]">
                <div className="bg-[#B7FFFF] px-4 py-3 text-[#0A4C30] font-medium flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Discount:</span>
                    <span className="text-sm font-semibold ml-2">0%</span>
                  </div>
                  <div className="text-sm text-[#4b4b4b]">
                    Apply Discount Code
                  </div>
                </div>
                <div className="p-4 bg-[#B7FFFF]">
                  <div className="text-sm font-semibold mb-3">
                    Enter Guests Information ▲
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-3 items-center">
                      <div className="flex-1">
                        <Label className="text-sm">Voucher Code</Label>
                        <Input
                          placeholder="Enter Voucher Code"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="w-28 flex-shrink-0">
                        <Button
                          onClick={applyVoucher}
                          className="w-full  h-10 mt-5"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-3 items-center">
                      <div className="flex-1">
                        <Label className="text-sm">Discount Code</Label>
                        <Input
                          placeholder="Enter Discount Code"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="w-28 flex-shrink-0">
                        <Button
                          onClick={applyDiscount}
                          className="w-full h-10 mt-5"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-3 items-center">
                      <div className="flex-1">
                        <Label className="text-sm">100Club ID</Label>
                        <Input
                          placeholder="Enter 100Club ID"
                          value={clubId}
                          onChange={(e) => setClubId(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="w-28 flex-shrink-0 mt-5">
                        {" "}
                        <Button onClick={applyClub} className="w-full h-10">
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t mt-4 pt-3 bg-[#F2EFE7] px-3 py-2 rounded-md flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>
                      ₦
                      {formatPrice(
                        Math.round(bookingStore.draft.subTotal * 1.125),
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <Button
                  onClick={handleConfirmBooking}
                  disabled={creating}
                  className="w-full bg-[#09432B] hover:bg-[#09432B] text-white font-semibold py-3"
                >
                  {creating ? "Creating Booking..." : "Proceed to Payment"}
                </Button>

                <div className="md:flex  gap-3">
                  <Button
                    variant="outline"
                    className="w-full md:flex-1 border border-[#09432B]"
                  >
                    Restart Booking
                  </Button>
                  <Button className="md:flex-1 w-full md:mt-0 mt-2 text-white font-semibold bg-gradient-to-r from-[#B5AB84] to-[#A19257]">
                    Download a Performa Invoice
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

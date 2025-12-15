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
import { Link } from "react-router-dom";
import CommonNavbar from "@/components/shared/common/CommonNavbar/CommonNavbar";

export default function ReviewYourBooking() {
  const stay = { checkIn: "01/02/2025", checkOut: "09/02/2025", nights: 2 };
  const pod = { title: "Sunset Vista", subtitle: "King Bed" };
  const mealPlan = { title: "Half Board" };
  const guests = { adults: 2 };
  const extras = "N/A";

  const priceSummary = {
    subtotal: 400000,
    vat: 12500,
    discountPercent: 0,
    total: 412500,
  };

  const [voucher, setVoucher] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [clubId, setClubId] = useState("");

  const applyVoucher = () => alert("Demo: voucher applied");
  const applyDiscount = () => alert("Demo: discount applied");
  const applyClub = () => alert("Demo: 100Club applied");

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#0A2F22]">
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
                      {stay.nights} Nights
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    <div>
                      <div className="text-xs text-[#6B6B6B]">Check in</div>
                      <div className="font-medium mt-1">{stay.checkIn}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#6B6B6B]">Check out</div>
                      <div className="font-medium mt-1">{stay.checkOut}</div>
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
                  <h4 className="font-semibold text-[#09432B]">Your Pod</h4>
                  <p className="text-sm text-[#6B6B6B]">
                    {pod.title} — {pod.subtitle}
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
                    {guests.adults} Adults (18+)
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
                  <p className="text-sm text-[#6B6B6B]">{mealPlan.title}</p>
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
                  <p className="text-sm text-[#6B6B6B]">{extras}</p>
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
                Pod & Meals (2 Nights)
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B]">Sub Total:</span>
                  <span className="font-semibold">
                    ₦{priceSummary.subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#6B6B6B]">
                    After consumption tax and VAT(12.5%)
                  </span>
                  <span className="font-semibold">
                    ₦{priceSummary.vat.toLocaleString()}
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
                          value={voucher}
                          onChange={(e) => setVoucher(e.target.value)}
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
                    <span>₦{priceSummary.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <Button className="w-full bg-[#09432B] hover:bg-[#09432B] text-white font-semibold py-3">
                  <Link to="/booking-confirmation">Pay Now with Squad</Link>
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

import React, { useState } from "react";
import CommonNavbar from "@/components/shared/common/CommonNavbar/CommonNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Home,
  Info,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { useBookingStore } from "@/store/useBookingStore";
import { format } from "date-fns";

function formatPrice(n) {
  return n.toLocaleString();
}

export default function NewBooking() {
  const [selectedPod, setSelectedPod] = useState(null);
  const bookingStore = useBookingStore();

  const onSelectPod = (pod) => {
    setSelectedPod(pod);
    bookingStore.updateDraft({
      selectedPod: pod,
      podsTotal:
        pod.price *
        bookingStore.draft.numberOfGuests *
        bookingStore.draft.numberOfNights,
      subTotal:
        pod.price *
        bookingStore.draft.numberOfGuests *
        bookingStore.draft.numberOfNights,
    });
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
          Choose Your Eco Pod
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
                Some nights may require different pods due to availability
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              {bookingStore.draft.availablePods.map((pod) => (
                <Card
                  key={pod.id}
                  className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all ${
                    pod.available ? "opacity-100" : "opacity-60"
                  }`}
                >
                  <CardContent className="p-0">
                    <div className="w-full h-48 relative overflow-hidden">
                      <img
                        src={pod.img}
                        className="w-full h-full object-cover"
                        alt={pod.title}
                      />

                      <div className="absolute top-3 left-3">
                        {pod.available ? (
                          <Badge className="bg-[#09432B] text-white">
                            Live view
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700">
                            Unavailable
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-[#09432B]">
                        {pod.title}
                      </h3>

                      <p className="text-sm text-[#737373] mt-1">{pod.desc}</p>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {pod.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-[#E6F2EE] text-[#09432B] px-3 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-6">
                        <span className="text-sm text-[#737373] font-bold whitespace-nowrap">
                          ₦{formatPrice(pod.price)}{" "}
                          <span className="font-normal">per person/night</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-end mt-2">
                        {/* === DESKTOP & TABLET BUTTON WITH ARROW === */}
                        <Button
                          onClick={() => onSelectPod(pod)}
                          disabled={!pod.available}
                          className={`
      hidden sm:flex items-center gap-2
      px-0 py-0 font-semibold text-[#09432B]
      hover:bg-transparent
      ${pod.available ? "" : "opacity-50 cursor-not-allowed"}
    `}
                          variant="ghost"
                        >
                          Select Pod
                          <ArrowRight className="w-4 h-4 text-[#09432B]" />
                        </Button>

                        {/* === MOBILE CHECKBOX VERSION === */}
                        <div className="flex items-center gap-2 sm:hidden">
                          <span className="text-sm font-semibold text-[#09432B] whitespace-nowrap">
                            Select Pod
                          </span>

                          <Checkbox
                            checked={selectedPod?.id === pod.id}
                            onCheckedChange={() =>
                              onSelectPod(
                                selectedPod?.id === pod.id ? null : pod
                              )
                            }
                            disabled={!pod.available}
                            className={`
        border-[#09432B] text-[#09432B]
        ${pod.available ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}
      `}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-12 mb-12">
              <Accordion type="single" collapsible defaultValue="multi">
                <AccordionItem
                  value="multi"
                  className="border border-[#0F5B45] rounded-xl overflow-hidden"
                >
                  {/* HEADER - sits INSIDE border, not clipping top */}
                  <AccordionTrigger
                    className="
          flex items-center justify-between
          w-full px-4 py-4
          text-left text-[#09432B] font-semibold
          hover:no-underline
          bg-[#F7F5F0]
        "
                  >
                    Multi Room Assignment
                  </AccordionTrigger>

                  {/* CONTENT */}
                  <AccordionContent className="px-4 pb-6 pt-4 bg-white">
                    {/* Beige Info Box */}
                    <div
                      className="rounded-md p-4 mb-6 text-[#09432B]"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(181,171,132,0.18) 0%, rgba(161,146,87,0.18) 100%)",
                        border: "1px solid rgba(181,171,132,0.35)",
                      }}
                    >
                      <p className="text-sm font-semibold mb-1">
                        Multi Night Assignment: 2 Nights Selected
                      </p>
                      <p className="text-sm text-[#444]">
                        Select pods for each night based on availability
                      </p>
                    </div>

                    {/* DAY 1 */}
                    <div className="mb-6">
                      <label className="text-sm font-semibold text-[#09432B] block mb-2">
                        Day 1
                      </label>

                      <div className="relative">
                        <select className="w-full border border-[#0F5B45] rounded-md px-3 py-3 text-sm appearance-none">
                          <option>Forest Haven</option>
                          {bookingStore.draft.availablePods.map((p) => (
                            <option key={p.id}>{p.title}</option>
                          ))}
                        </select>

                        <span className="absolute right-4 top-3.5 text-[#09432B] text-lg">
                          ▼
                        </span>
                      </div>
                    </div>

                    {/* DAY 2 */}
                    <div>
                      <label className="text-sm font-semibold text-[#09432B] block mb-2">
                        Day 2
                      </label>

                      <div className="relative">
                        <select className="w-full border border-[#0F5B45] rounded-md px-3 py-3 text-sm appearance-none">
                          <option>Select A different pod</option>
                          {bookingStore.draft.availablePods.map((p) => (
                            <option key={p.id + "-2"}>{p.title}</option>
                          ))}
                        </select>

                        {/* Chevron */}
                        <span className="absolute right-4 top-3.5 text-[#09432B] text-lg">
                          ▼
                        </span>

                        {/* Unavailable Badge */}
                        <span className="absolute right-2 -top-7 bg-red-600 text-white text-xs px-3 py-1 rounded-full">
                          Unavailable
                        </span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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
                  <p className="text-sm text-[#737373] leading-tight">
                    Check in:
                  </p>
                  <p className="text-sm font-medium text-[#4F4F4F] leading-tight mt-1">
                    {format(bookingStore.draft.dates.checkIn, "dd/MM/yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#737373] leading-tight">
                    Check out:
                  </p>
                  <p className="text-sm font-medium text-[#4F4F4F] leading-tight mt-1">
                    {format(bookingStore.draft.dates.checkOut, "dd/MM/yyyy")}
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
                <h4 className="text-[#09432B] font-bold">Your Pod</h4>
              </div>

              <p className="text-sm text-[#737373] font-medium">
                {selectedPod ? selectedPod.title : "N/A"}
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

              <div className="space-y-3 text-sm font-semibold text-[#09432B]">
                <div className="flex justify-between">
                  <span>Sub Total:</span>
                  <span className="text-[#09432B] font-semibold">
                    ₦{selectedPod ? bookingStore.draft.subTotal : "0"}
                  </span>
                </div>

                <div className="flex justify-between leading-snug">
                  <span>
                    After consumption tax and <br /> VAT(12.5%)
                  </span>
                  <span className="text-[#09432B] font-semibold">
                    ₦
                    {selectedPod
                      ? Math.round(
                          (bookingStore.draft.subTotal || 0) * 0.125
                        ).toLocaleString()
                      : "0"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Discount</span>
                  <span className="text-[#09432B] font-semibold">0%</span>
                </div>

                <div className="border-t pt-3 flex justify-between font-semibold bg-[#F2EFE7] px-3 py-2 rounded-md text-[#09432B]">
                  <span>Total:</span>
                  <span>
                    ₦
                    {selectedPod
                      ? Math.round(
                          (bookingStore.draft.subTotal || 0) * 1.125
                        ).toLocaleString()
                      : "0"}
                  </span>
                </div>
              </div>
            </div>
            <div className="w-full rounded-t-xl overflow-hidden">
              <div
                className="px-4 py-3 text-[#0A4C30] text-sm font-medium"
                style={{ backgroundColor: "#B7FFFF" }}
              >
                Happy with your pod let’s move ahead
              </div>

              {!selectedPod ? (
                <Button
                  className="w-full bg-gray-400 text-white text-base font-bold py-6 rounded-none rounded-b-xl opacity-50 cursor-not-allowed"
                  disabled={true}
                >
                  Continue to Meal Plan →
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
                    Continue to Meal Plan →
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
          </div>
        </div>
      </div>
    </div>
  );
}

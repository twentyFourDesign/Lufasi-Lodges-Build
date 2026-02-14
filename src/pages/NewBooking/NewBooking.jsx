import React, { useState, useCallback } from "react";
import CommonNavbar from "@/components/shared/common/CommonNavbar/CommonNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Home, Info, Star, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { useBookingStore } from "@/store/useBookingStore";
import { format, differenceInCalendarDays } from "date-fns";
import { BASE_URL } from "@/config";
import EditStayDatesModal from "@/components/edit-booking/EditStayDatesModal";
import gardenHaven from "@/assets/garden-retreat.svg";
import forestRetreat from "@/assets/forest-haven.svg";

function formatPrice(n) {
  return n.toLocaleString();
}

export default function NewBooking() {
  const bookingStore = useBookingStore();
  const [stayOpen, setStayOpen] = useState(false);

  // Count available pods
  const availablePodsCount = bookingStore.draft.availablePods
    ? bookingStore.draft.availablePods.filter((pod) => pod.available === true)
        .length
    : 0;
  const [roomCount, setRoomCount] = useState(0);

  const podTags = ["Air conditioning", "Wifi", "Forest View"];

  const onChangeRooms = (type) => {
    if (type === "dec" && roomCount > 1) {
      setRoomCount(roomCount - 1);

      bookingStore.updateDraft({
        podCount: roomCount - 1,
        subTotal:
          bookingStore.draft.availablePods[0].price *
          bookingStore.draft.guests?.adults *
          bookingStore.draft.numberOfNights,
      });
    } else if (type === "inc" && roomCount < availablePodsCount) {
      setRoomCount(roomCount + 1);
      bookingStore.updateDraft({
        podCount: roomCount + 1,
        subTotal:
          bookingStore.draft.availablePods[0].price *
          bookingStore.draft.guests?.adults *
          bookingStore.draft.numberOfNights,
      });
    }
  };

  const checkPodAvalability = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/availability/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: format(bookingStore.draft.dates.checkIn, "yyyy-MM-dd"), // "2025-12-20"
          endDate: format(bookingStore.draft.dates.checkOut, "yyyy-MM-dd"), // "2025-12-20"
          adults: parseInt(bookingStore.draft.guests.adults) || 1, // Extract number from "2 Guests"
        }),
      });
      const data = await response.json();

      bookingStore.updateDraft({
        availablePods: data,
      });
    } catch (error) {
      console.error("Error checking availability:", error);
    }
  }, [bookingStore]);

  const setStayDates = (dates) => {
    function parseDate(ddmmyyyy) {
      const [day, month, year] = ddmmyyyy.split("/");
      return new Date(`${year}-${month}-${day}`);
    }
    bookingStore.updateDraft({
      dates: {
        checkIn: parseDate(dates.checkIn),
        checkOut: parseDate(dates.checkOut),
      },
      numberOfNights: differenceInCalendarDays(
        parseDate(dates.checkOut),
        parseDate(dates.checkIn),
      ),
      guests: {
        ...bookingStore.draft.guests,
        adults: parseInt(dates.guests.match(/(\d+)/)[1]) || 1,
      },
    });
    checkPodAvalability();
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
                        Nature Pod - Standard
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
                  <span className="text-sm text-[#737373] font-bold whitespace-nowrap">
                    ₦{formatPrice(250000)}{" "}
                    <span className="font-normal">per person/night</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <img src={gardenHaven} alt="Garden Retreat" />
                  <img
                    src={forestRetreat}
                    alt="Forest Retreat"
                    className="sm:block hidden"
                  />
                </div>

                <p className="text-sm text-[#737373] mt-1">
                  The perfect escape into the nature. Timber construction with
                  modern amenities sleeps 2 people.
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
                        disabled={roomCount === availablePodsCount}
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
                        checkIn: format(
                          bookingStore.draft.dates.checkIn,
                          "dd/MM/yyyy",
                        ),
                        checkOut: format(
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
                <h4 className="text-[#09432B] font-bold">Your Rooms</h4>
              </div>

              <p className="text-sm text-[#737373] font-medium">
                {`x${roomCount} Rooms`}
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

              <div className="space-y-3 text-sm font-semibold text-[#09432B]">
                <div className="flex justify-between">
                  <span>Sub Total:</span>
                  <span className="text-[#09432B] font-semibold">
                    ₦{roomCount ? bookingStore.draft.subTotal : "0"}
                  </span>
                </div>

                <div className="flex justify-between leading-snug">
                  <span>
                    After consumption tax and <br /> VAT(12.5%)
                  </span>
                  <span className="text-[#09432B] font-semibold">
                    ₦
                    {roomCount
                      ? Math.round(
                          (bookingStore.draft.subTotal || 0) * 0.125,
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
                    {roomCount
                      ? Math.round(
                          (bookingStore.draft.subTotal || 0) * 1.125,
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
                Happy with your room let's move ahead
              </div>

              {roomCount < 1 ? (
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

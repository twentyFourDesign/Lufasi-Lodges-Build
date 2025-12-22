import React, { useState } from "react";
import CommonNavbar from "@/components/shared/common/CommonNavbar/CommonNavbar";
import { Button } from "@/components/ui/button";
import { Calendar, Home, Users, Utensils, Gift, Pencil } from "lucide-react";
import EditStayDatesModal from "@/components/edit-booking/EditStayDatesModal";
import EditPodModal from "@/components/edit-booking/EditPodModal";
import EditGuestsModal from "@/components/edit-booking/EditGuestsModal";
import EditMealPlanModal from "@/components/edit-booking/EditMealPlanModal";
import EditExtrasModal from "@/components/edit-booking/EditExtrasModal";
import { format, differenceInCalendarDays } from "date-fns";
import { BoardType, useBookingStore } from "@/store/useBookingStore";
import { BASE_URL } from "@/config";

const Row = ({ icon, title, subtitle, onClick }) => (
  <div className="w-full border border-[#E5E5E5] rounded-xl bg-white px-4 py-4 flex items-center justify-between">
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-[#E6F2EE] flex items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[#09432B] font-medium">{title}</span>
        {subtitle && (
          <span className="text-sm text-[#737373] font-medium">{subtitle}</span>
        )}
      </div>
    </div>
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-[#027A48] font-medium text-sm"
    >
      Edit
      <Pencil size={15} />
    </button>
  </div>
);

export default function EditBookingPage() {
  const bookingStore = useBookingStore();
  const [stayOpen, setStayOpen] = useState(false);
  const [podOpen, setPodOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);

  const checkPodAvalability = async () => {
    try {
      const response = await fetch(`${BASE_URL}/availability/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: bookingStore.draft.dates.checkIn
            .toISOString()
            .split("T")[0], // "2025-12-20"
          endDate: bookingStore.draft.dates.checkOut
            .toISOString()
            .split("T")[0], // "2025-12-22"
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
  };
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
        parseDate(dates.checkIn)
      ),
      guests: {
        ...bookingStore.draft.guests,
        adults: parseInt(dates.guests.match(/(\d+)/)[1]) || 1,
      },
    });
    checkPodAvalability();
  };

  const setPod = (pod) => {
    bookingStore.updateDraft({
      pod,
    });
  };

  const setGuests = (guests) => {
    bookingStore.updateDraft({
      guests,
    });
  };

  // const setMealPlan = (mealPlan) => {
  //   bookingStore.updateDraft({
  //     mealPlan,
  //   });
  // };
  // const setExtras = (extras) => {
  //   bookingStore.updateDraft({
  //     extras,
  //   });
  // };

  console.log("Booking Draft:", bookingStore.draft);

  return (
    <div className="min-h-screen bg-[#F7F5F0] pb-12">
      <CommonNavbar />
      <div className="max-w-2xl mx-auto px-4 mt-6">
        <h1 className="text-center text-3xl font-bold text-[#09432B]">
          Edit Your Booking
        </h1>
        <p className="text-center text-sm text-[#737373] mt-1">
          Step 6 of 6 – Confirm and pay
        </p>
        <div className="mt-8 space-y-4">
          <Row
            icon={<Calendar size={18} className="text-[#09432B]" />}
            title="Stay Dates"
            subtitle={`Check in: ${format(
              bookingStore.draft.dates.checkIn,
              "dd/MM/yyyy"
            )}  
            Check out: ${format(
              bookingStore.draft.dates.checkOut,
              "dd/MM/yyyy"
            )} • ${bookingStore.draft.numberOfNights} Nights`}
            onClick={() => setStayOpen(true)}
          />
          <Row
            icon={<Home size={18} className="text-[#09432B]" />}
            title="Your Pod"
            subtitle={`${bookingStore.draft.pod.title} - King Bed`}
            onClick={() => setPodOpen(true)}
          />
          <Row
            icon={<Users size={18} className="text-[#09432B]" />}
            title="Guests"
            subtitle={`${bookingStore.draft.guests.adults} Adults (18+)`}
            onClick={() => setGuestOpen(true)}
          />
          {/*<Row
            icon={<Utensils size={18} className="text-[#09432B]" />}
            title="Meal Plan"
            subtitle={bookingStore.draft.mealPlan?.title}
            onClick={() => setMealOpen(true)}
          />
          <Row
            icon={<Gift size={18} className="text-[#09432B]" />}
            title="Extras"
            subtitle={
              bookingStore.draft.extras?.length > 0
                ? bookingStore.draft.extras
                    .map((extra) => extra.type)
                    .join(", ")
                : "N/A"
            }
            onClick={() => setExtrasOpen(true)}
          /> */}
        </div>
        <div className="mt-6 border border-[#E5E5E5] bg-white rounded-xl p-5">
          <h3 className="text-[#09432B] font-semibold pb-2">Price Summary</h3>

          <p className="text-xs text-[#737373]">
            Pod & Meals ({bookingStore.draft.numberOfNights} Nights)
          </p>

          <div className="mt-4 space-y-3 text-sm font-medium">
            <div className="flex justify-between">
              <span>Sub Total:</span>
              <span>₦{bookingStore.draft.subTotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between">
              <span>After consumption tax and VAT(12.5%)</span>
              <span>
                ₦{(bookingStore.draft.subTotal * 0.125).toLocaleString()}
              </span>
            </div>
            <div className="bg-[#DFFBFF] px-4 py-3 rounded-lg flex justify-between">
              <span>Discount:</span>
              <span>0% &nbsp; Apply Discount Code</span>
            </div>
            <div className="flex justify-between border-t pt-3 font-semibold">
              <span>Total:</span>
              <span>
                ₦{(bookingStore.draft.subTotal * 1.125).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <Button className="w-full py-5 bg-[#B19E6A] hover:bg-[#A08E5D] text-white font-semibold rounded-lg">
            Download a Performa Invoice
          </Button>

          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              className="px-8 py-5 border-[#09432B] text-[#09432B] rounded-lg"
            >
              Go Back
            </Button>
            <button className="text-red-600 font-medium">Cancel Booking</button>
          </div>
        </div>
      </div>
      <EditStayDatesModal
        open={stayOpen}
        onOpenChange={setStayOpen}
        value={{
          checkIn: format(bookingStore.draft.dates.checkIn, "dd/MM/yyyy"),
          checkOut: format(bookingStore.draft.dates.checkOut, "dd/MM/yyyy"),
          numberOfNights: bookingStore.draft.numberOfNights,
          guests: `${bookingStore.draft.guests.adults} Guests`,
        }}
        onSave={setStayDates}
      />

      <EditPodModal
        open={podOpen}
        onOpenChange={setPodOpen}
        value={{
          availablePods: bookingStore.draft.availablePods,
          pod: bookingStore.draft.pod,
        }}
        onSave={setPod}
      />

      <EditGuestsModal
        open={guestOpen}
        onOpenChange={setGuestOpen}
        value={bookingStore.draft.guests}
        onSave={setGuests}
      />

      {/* <EditMealPlanModal
        open={mealOpen}
        onOpenChange={setMealOpen}
        value={bookingStore.draft.mealPlan}
        onSave={setMealPlan}
      />

      <EditExtrasModal
        open={extrasOpen}
        onOpenChange={setExtrasOpen}
        value={bookingStore.draft.extras}
        onSave={setExtras}
      /> */}
    </div>
  );
}

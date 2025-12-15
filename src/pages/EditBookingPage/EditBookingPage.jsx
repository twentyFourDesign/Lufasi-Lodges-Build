import React, { useState } from "react";
import CommonNavbar from "@/components/shared/common/CommonNavbar/CommonNavbar";
import { Button } from "@/components/ui/button";
import { Calendar, Home, Users, Utensils, Gift, Pencil } from "lucide-react";
import EditStayDatesModal from "@/components/edit-booking/EditStayDatesModal";
import EditPodModal from "@/components/edit-booking/EditPodModal";
import EditGuestsModal from "@/components/edit-booking/EditGuestsModal";
import EditMealPlanModal from "@/components/edit-booking/EditMealPlanModal";
import EditExtrasModal from "@/components/edit-booking/EditExtrasModal";

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
  const [stayDates, setStayDates] = useState({
    checkIn: "01/02/2025",
    checkOut: "03/02/2025",
    nights: 2,
  });
  const [pod, setPod] = useState({
    id: "pod-1",
    title: "Sunset Vista - King Bed",
    price: 400000,
  });
  const [guests, setGuests] = useState({ adults: 2 });
  const [mealPlan, setMealPlan] = useState("Half Board");
  const [extras, setExtras] = useState([]);
  const [stayOpen, setStayOpen] = useState(false);
  const [podOpen, setPodOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  const [mealOpen, setMealOpen] = useState(false);
  const [extrasOpen, setExtrasOpen] = useState(false);

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
            subtitle={`Check in: ${stayDates.checkIn}    Check out: ${stayDates.checkOut}    • ${stayDates.nights} Nights`}
            onClick={() => setStayOpen(true)}
          />
          <Row
            icon={<Home size={18} className="text-[#09432B]" />}
            title="Your Pod"
            subtitle={pod.title}
            onClick={() => setPodOpen(true)}
          />
          <Row
            icon={<Users size={18} className="text-[#09432B]" />}
            title="Guests"
            subtitle={`${guests.adults} Adults (18+)`}
            onClick={() => setGuestOpen(true)}
          />
          <Row
            icon={<Utensils size={18} className="text-[#09432B]" />}
            title="Meal Plan"
            subtitle={mealPlan}
            onClick={() => setMealOpen(true)}
          />
          <Row
            icon={<Gift size={18} className="text-[#09432B]" />}
            title="Extras"
            subtitle={extras.length > 0 ? extras.join(", ") : "N/A"}
            onClick={() => setExtrasOpen(true)}
          />
        </div>
        <div className="mt-6 border border-[#E5E5E5] bg-white rounded-xl p-5">
          <h3 className="text-[#09432B] font-semibold pb-2">Price Summary</h3>

          <p className="text-xs text-[#737373]">
            Pod & Meals ({stayDates.nights} Nights)
          </p>

          <div className="mt-4 space-y-3 text-sm font-medium">
            <div className="flex justify-between">
              <span>Sub Total:</span>
              <span>₦{pod.price.toLocaleString()}</span>
            </div>

            <div className="flex justify-between">
              <span>After consumption tax and VAT(12.5%)</span>
              <span>₦12,500</span>
            </div>
            <div className="bg-[#DFFBFF] px-4 py-3 rounded-lg flex justify-between">
              <span>Discount:</span>
              <span>0% &nbsp; Apply Discount Code</span>
            </div>
            <div className="flex justify-between border-t pt-3 font-semibold">
              <span>Total:</span>
              <span>₦412,500</span>
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
        value={stayDates}
        onSave={setStayDates}
      />

      <EditPodModal
        open={podOpen}
        onOpenChange={setPodOpen}
        value={pod}
        onSave={setPod}
      />

      <EditGuestsModal
        open={guestOpen}
        onOpenChange={setGuestOpen}
        value={guests}
        onSave={setGuests}
      />

      <EditMealPlanModal
        open={mealOpen}
        onOpenChange={setMealOpen}
        value={mealPlan}
        onSave={setMealPlan}
      />

      <EditExtrasModal
        open={extrasOpen}
        onOpenChange={setExtrasOpen}
        value={extras}
        onSave={setExtras}
      />
    </div>
  );
}

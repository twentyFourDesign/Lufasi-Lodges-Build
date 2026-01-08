import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar as CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { differenceInCalendarDays } from "date-fns";

import { BASE_URL } from "@/config";
import { useBookingStore } from "@/store/useBookingStore";
import { useNavigate } from "react-router-dom";

export default function BookingForm() {
  const [checkIn, setCheckIn] = useState();
  const [checkOut, setCheckOut] = useState();
  const [guests, setGuests] = useState("2 Guests");
  const [loading, setLoading] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const bookingStore = useBookingStore();
  const navigate = useNavigate();

  const handleCheckAvailability = async () => {
    if (!checkIn || !checkOut) {
      return;
    }

    if (checkOut <= checkIn) {
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
          startDate: checkIn.toISOString().split("T")[0], // "2025-12-20"
          endDate: checkOut.toISOString().split("T")[0], // "2025-12-22"
          adults: parseInt(guests.match(/(\d+)/)[1]) || 1, // Extract number from "2 Guests"
        }),
      });
      const data = await response.json();

      bookingStore.updateDraft({
        dates: {
          checkIn: checkIn.toISOString().split("T")[0],
          checkOut: checkOut.toISOString().split("T")[0],
        },
        guests: {
          adults: parseInt(guests.match(/(\d+)/)[1]) || 1,
          teenagers: 0,
          infants: 0,
        },
        numberOfNights: differenceInCalendarDays(
          checkOut.toISOString().split("T")[0],
          checkIn.toISOString().split("T")[0]
        ),
        availablePods: data,
      });

      navigate("/new-booking");
    } catch (error) {
      console.error("Error checking availability:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        w-full max-w-6xl mx-auto
        bg-white
        rounded-xl shadow-xl

        px-5 py-6
        md:px-8 md:py-8

        flex flex-col md:flex-row
        gap-5 md:gap-6
        items-start md:items-center
      "
    >
      {/* CHECK-IN */}
      <div className="w-full md:w-1/4">
        <label className="text-gray-700 font-semibold text-sm">Check-in</label>

        <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
          <PopoverTrigger asChild>
            <button
              className="
                w-full mt-1 
                border border-gray-300 rounded-md 
                px-3 py-3 
                flex justify-between items-center
                text-gray-700 bg-white
              "
            >
              {checkIn ? checkIn.toLocaleDateString() : "mm/dd/yyyy"}
              <CalendarIcon className="w-5 h-5 text-gray-600" />
            </button>
          </PopoverTrigger>

          <PopoverContent className="p-0 bg-white shadow-lg rounded-md">
            <Calendar
              mode="single"
              selected={checkIn}
              onSelect={(date) => {
                setCheckIn(date);
                setCheckInOpen(false);
              }}
              disabled={(date) => date < new Date()} // Disable past dates
              className="rounded-md"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* CHECK-OUT */}
      <div className="w-full md:w-1/4">
        <label className="text-gray-700 font-semibold text-sm">Check-out</label>

        <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
          <PopoverTrigger asChild>
            <button
              className="
                w-full mt-1 
                border border-gray-300 rounded-md 
                px-3 py-3 
                flex justify-between items-center
                text-gray-700 bg-white
              "
            >
              {checkOut ? checkOut.toLocaleDateString() : "mm/dd/yyyy"}
              <CalendarIcon className="w-5 h-5 text-gray-600" />
            </button>
          </PopoverTrigger>

          <PopoverContent className="p-0 bg-white shadow-lg rounded-md">
            <Calendar
              mode="single"
              selected={checkOut}
              onSelect={(date) => {
                setCheckOut(date);
                setCheckOutOpen(false);
              }}
              disabled={(date) => date <= (checkIn || new Date())} // Disable dates before check-in
              className="rounded-md"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* GUESTS */}
      <div className="w-full md:w-1/4">
        <label className="text-gray-700 font-semibold text-sm">Guests</label>

        <Select value={guests} onValueChange={setGuests}>
          <SelectTrigger
            className="
              w-full mt-1 
              border border-gray-300 rounded-md 
              px-3 py-3
              text-gray-700 bg-white
            "
          >
            <SelectValue placeholder="Select Guests" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="1 Guest">1 Guest</SelectItem>
            <SelectItem value="2 Guests">2 Guests</SelectItem>
            <SelectItem value="3 Guests">3 Guests</SelectItem>
            <SelectItem value="4 Guests">4 Guests</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* BUTTON */}
      <div className="w-full md:w-auto flex items-center justify-center md:justify-end md:mt-6">
        <Button
          onClick={handleCheckAvailability}
          disabled={loading}
          className="
            w-full md:w-auto
            h-12
            flex items-center justify-center gap-2

            text-white font-semibold
            rounded-md transition

            px-6 py-3

            bg-[#09432B] md:bg-[#09432B]
            hover:bg-green-900
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {loading ? "Checking..." : "Check Availability"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}


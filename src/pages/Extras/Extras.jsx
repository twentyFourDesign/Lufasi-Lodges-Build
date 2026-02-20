import React, { useState, useEffect } from "react";
import CommonNavbar from "@/components/shared/common/CommonNavbar/CommonNavbar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useBookingStore } from "@/store/useBookingStore";
import { format } from "date-fns";

import image1 from "../../assets/Frame 19 (1).png";

import {
  ArrowLeft,
  ChevronDown,
  Calendar,
  Home,
  User,
  Gift,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { BASE_URL } from "@/config";

function formatPrice(n) {
  return Number(n || 0).toLocaleString();
}
function ExtrasCard({ item, selectedExtras, onToggleExtra }) {
  const [open, setOpen] = useState(item.defaultOpen || false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* HEADER */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full p-4 sm:p-5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg overflow-hidden">
            <img src={image1} alt="" className="w-full h-full object-cover" />
          </div>

          <div>
            <h3 className="text-[#09432B] font-semibold text-base sm:text-lg">
              {item.title}
            </h3>
            <p className="text-sm text-[#737373] mt-1">{item.subtitle}</p>
          </div>
        </div>

        <ChevronDown
          className={`w-5 h-5 text-[#09432B] transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="px-5 pb-4">
          {item.options.length === 0 && (
            <p className="text-sm text-[#737373] py-2">No selectable items.</p>
          )}

          {item.options.map((opt) => (
            <div
              key={opt.id}
              className="flex items-center justify-between py-3 border-b last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedExtras.some((extra) => extra.id === opt.id)}
                  onCheckedChange={() => onToggleExtra(opt)}
                />
                <span className="text-sm text-[#4F4F4F]">{opt.label}</span>
              </div>

              <span className="text-[#09432B] font-semibold text-sm">
                ₦{opt.price.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Extras() {
  const bookingStore = useBookingStore();
  const [extras, setExtras] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const draft = bookingStore.draft || {};

  useEffect(() => {
    fetchExtras();
  }, []);

  const fetchExtras = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/extras/by-category`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setExtras(data);
    } catch (error) {
      console.error("Error fetching extras:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExtra = (extra) => {
    setSelectedExtras((prev) => {
      const isSelected = prev.some((item) => item.id === extra.id);

      let updatedExtras;
      if (isSelected) {
        updatedExtras = prev.filter((item) => item.id !== extra.id);
        const currentSubTotal = bookingStore.draft.subTotal || 0;
        bookingStore.updateDraft({
          subTotal: currentSubTotal - extra.price,
        });
      } else {
        updatedExtras = [...prev, extra];
        const currentSubTotal = bookingStore.draft.subTotal || 0;
        bookingStore.updateDraft({
          subTotal: currentSubTotal + extra.price,
        });
      }
      return updatedExtras;
    });
  };

  const handleContinue = () => {
    // Store selected extras in booking store
    bookingStore.updateDraft({
      extras: selectedExtras,
    });
  };

  return (
    <div className="overflow-x-hidden min-h-screen w-full bg-[#F7F5F0]">
      <CommonNavbar />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10">
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-sm text-gray-700 mb-6 pl-0 hover:bg-transparent"
        >
          <ArrowLeft className="w-4 h-4" />
          <Link to="/guest-details">Back</Link>
        </Button>

        <h2 className="text-2xl md:text-5xl font-bold text-[#09432B] text-center">
          Enhance Your Experience
        </h2>
        <p className="text-center text-sm md:text-lg text-[#737373] mt-2 mb-10">
          Step 4 of 6 – Add special touches to your stay
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-6">
            {!loading && error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                <p className="text-red-700 text-sm">
                  Unable to load extras from server. Showing default options.
                </p>
              </div>
            )}

            {loading && !error && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-[#09432B] animate-spin" />
              </div>
            )}

            {!loading &&
              !error &&
              extras.map((item) => (
                <ExtrasCard
                  key={item.id}
                  item={item}
                  selectedExtras={selectedExtras}
                  onToggleExtra={handleToggleExtra}
                />
              ))}
          </div>

          <div className="md:col-span-4 space-y-4">
            {/* Stay Dates Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#E6F2EE] rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-[#09432B]" />
                </div>
                <h4 className="text-[#09432B] font-bold">Stay Dates</h4>
              </div>

              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-[#737373]">Check in:</p>
                  <p className="font-medium text-[#4F4F4F]">
                    {draft.dates?.checkIn
                      ? format(draft.dates.checkIn, "dd/MM/yyyy")
                      : "--"}
                  </p>
                </div>

                <div>
                  <p className="text-[#737373]">Check out:</p>
                  <p className="font-medium text-[#4F4F4F]">
                    {draft.dates?.checkOut
                      ? format(draft.dates.checkOut, "dd/MM/yyyy")
                      : "--"}
                  </p>
                </div>

                <p className="font-semibold text-[#09432B]">
                  {draft.numberOfNights || 0} Nights
                </p>
              </div>
            </div>

            {/* Pod Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#E6F2EE] rounded-full flex items-center justify-center">
                  <Home className="w-4 h-4 text-[#09432B]" />
                </div>
                <h4 className="text-[#09432B] font-bold">Rooms</h4>
              </div>
              <p className="text-sm text-[#737373]">
                {`x${draft.podCount || 0} Rooms`}
              </p>
            </div>

            {/* Meal Plan Card */}
            {draft.mealPlan?.title && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-[#E6F2EE] rounded-full flex items-center justify-center">
                    <Gift className="w-4 h-4 text-[#09432B]" />
                  </div>
                  <h4 className="text-[#09432B] font-bold">Meal Plan</h4>
                </div>
                <p className="text-sm text-[#737373]">
                  {draft.mealPlan.title}
                </p>
              </div>
            )}

            {/* Guests Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#E6F2EE] rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-[#09432B]" />
                </div>
                <h4 className="text-[#09432B] font-bold">Guests</h4>
              </div>
              <p className="text-sm text-[#737373]">
                {(draft.guests?.adults || 0)} Adults (18+)
              </p>
            </div>

            {/* Selected Extras Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#E6F2EE] rounded-full flex items-center justify-center">
                  <Gift className="w-4 h-4 text-[#09432B]" />
                </div>
                <h4 className="text-[#09432B] font-bold">Extras</h4>
              </div>

              {selectedExtras.length === 0 ? (
                <p className="text-sm text-[#737373]">None selected</p>
              ) : (
                <p className="text-sm text-[#737373]">
                  {selectedExtras.length} selected
                </p>
              )}
            </div>

            {/* Price Summary Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h4 className="text-[#09432B] font-bold mb-3">Price Summary</h4>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Sub Total:</span>
                  <span>₦{formatPrice(draft.subTotal)}</span>
                </div>

                <div className="flex justify-between leading-snug">
                  <span>
                    After consumption tax and <br /> VAT(12.5%)
                  </span>
                  <span>
                    ₦
                    {formatPrice(
                      Math.round((draft.subTotal || 0) * 0.125),
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>0%</span>
                </div>

                <div className="border-t flex justify-between bg-[#F2EFE7] px-3 py-2 rounded-md font-semibold">
                  <span>Total:</span>
                  <span>
                    ₦
                    {formatPrice(
                      Math.round((draft.subTotal || 0) * 1.125),
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <div className="w-full rounded-t-xl overflow-hidden">
              <div
                className="px-4 py-3 text-[#0A4C30] font-medium text-sm"
                style={{ background: "#B7FFFF" }}
              >
                Happy with your Extras? Let’s move ahead
              </div>

              <Button
                asChild
                onClick={handleContinue}
                className="w-full bg-[#09432B] hover:bg-[#083f28] text-white font-bold py-6 rounded-none rounded-b-xl"
              >
                <Link
                  to="/enter-your-details"
                  className="flex items-center gap-2 justify-center"
                >
                  Continue to Guest Details →
                </Link>
              </Button>
            </div>

            {/* Skip Button */}
            <Button
              asChild
              variant="outline"
              className="w-full py-6 rounded-md border font-bold border-[#0A4C30] text-[#0A4C30] hover:bg-[#0A4C30] hover:text-white"
            >
              <Link to="/enter-your-details">Skip Extras</Link>
            </Button>

            {/* Quick Book Button */}
            <Button className="w-full py-6 rounded-md hover:text-white hover:bg-[#A19257] bg-[#A19257] text-white font-bold">
              Quick Book
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

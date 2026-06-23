import React, { useState, useEffect } from "react";
import CommonNavbar from "@/components/shared/common/CommonNavbar/CommonNavbar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useBookingStore, calculateDynamicSubTotal } from "@/store/useBookingStore";
import { format, addDays, differenceInDays } from "date-fns";

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
import { Link, useNavigate } from "react-router-dom";
import FunnelMobileStickyCta from "@/components/booking/FunnelMobileStickyCta";
import { BASE_URL } from "@/config";
import { formatDateSafe } from "@/lib/utils";
import { formatSelectedRoomNames } from "@/lib/bookingDisplay";

function formatPrice(n) {
  return Number(n || 0).toLocaleString();
}
function ExtraRow({ opt, selectedExtras, onToggleExtra }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b last:border-b-0">
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={selectedExtras.some((extra) => extra.id === opt.id)}
            onCheckedChange={() => onToggleExtra(opt)}
          />
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-[#4F4F4F] font-medium hover:text-[#09432B] transition-colors text-left flex items-center gap-1.5"
          >
            {opt.name}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""
                }`}
            />
          </button>
        </div>

        <span className="text-[#09432B] font-semibold text-sm">
          ₦{opt.price.toLocaleString()}
        </span>
      </div>

      {expanded && (
        <div className="pb-3 pl-8 pr-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-xs text-[#737373] leading-relaxed">
            {opt.description || "No description available for this extra."}
          </p>
        </div>
      )}
    </div>
  );
}

function ExtrasCard({ item, selectedExtras, onToggleExtra }) {
  const [open, setOpen] = useState(item.defaultOpen || false);
  const categoryImage =
    (item.options && item.options.length > 0 && item.options[0].imageUrl) ||
    image1;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* HEADER */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full p-4 sm:p-5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg overflow-hidden">
            <img
              src={categoryImage}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-left">
            <h3 className="text-[#09432B] font-semibold text-base sm:text-lg">
              {item.title}
            </h3>
            <p className="text-sm text-[#737373] mt-1">{item.subtitle}</p>
          </div>
        </div>

        <ChevronDown
          className={`w-5 h-5 text-[#09432B] transition-transform duration-300 ${open ? "rotate-180" : ""
            }`}
        />
      </button>

      {open && (
        <div className="px-5 pb-4">
          {item.options.length === 0 && (
            <p className="text-sm text-[#737373] py-2">No selectable items.</p>
          )}

          {item.options.map((opt) => (
            <ExtraRow
              key={opt.id}
              opt={opt}
              selectedExtras={selectedExtras}
              onToggleExtra={onToggleExtra}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Extras() {
  const navigate = useNavigate();
  const bookingStore = useBookingStore();
  const [extras, setExtras] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const draft = bookingStore.draft || {};
  const [welcomeNote, setWelcomeNote] = useState({
    enabled: false,
    text: "",
    dates: [],
  });

  const nights = draft.numberOfNights || 1;
  const stayDates = [];
  if (draft.dates?.checkIn && nights > 1) {
    for (let i = 0; i < nights; i++) {
      stayDates.push(addDays(new Date(draft.dates.checkIn), i));
    }
  }

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
    // Store selected extras and welcome note in booking store
    bookingStore.updateDraft({
      extras: selectedExtras,
      welcomeNote: welcomeNote.enabled ? welcomeNote : null,
    });
  };

  return (
    <div className="overflow-x-hidden min-h-screen w-full bg-[#F7F5F0] pb-28 md:pb-0">
      <CommonNavbar />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10">
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-sm text-gray-700 mb-6 pl-0 hover:bg-transparent"
        >
          <ArrowLeft className="w-4 h-4" />
          <Link to="/meal-plan">Back</Link>
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

            {/* Welcome Note Card */}
            {!loading && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-[#09432B] to-[#0A4C30] px-4 py-3 flex items-center justify-between">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Gift className="w-5 h-5 text-[#B5AB84]" />
                    Personalised Welcome Note
                  </h3>
                  <span className="text-xs bg-[#B5AB84] text-[#09432B] px-2 py-0.5 rounded font-bold">
                    Free
                  </span>
                </div>
                <div className="p-4 bg-white/50 space-y-4">
                  <div className="border-b last:border-b-0 pb-3">
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={welcomeNote.enabled}
                          onCheckedChange={(checked) =>
                            setWelcomeNote({ ...welcomeNote, enabled: checked })
                          }
                        />
                        <span className="text-sm text-[#4F4F4F] font-medium">
                          Add a welcome note
                        </span>
                      </div>
                      <span className="text-[#09432B] font-semibold text-sm">₦0</span>
                    </div>

                    {welcomeNote.enabled && (
                      <div className="ml-8 mt-2 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                        <p className="text-xs text-[#737373]">
                          Want to surprise your partner or share a special message? Enter your personalized welcome note below.
                        </p>
                        <textarea
                          placeholder="Type your welcome note here..."
                          className="w-full text-sm p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#09432B] resize-none"
                          rows="3"
                          value={welcomeNote.text}
                          onChange={(e) =>
                            setWelcomeNote({ ...welcomeNote, text: e.target.value })
                          }
                        />
                        
                        {stayDates.length > 0 && (
                          <div className="space-y-2 mt-4">
                            <p className="text-xs font-semibold text-[#09432B]">
                              Select date(s) for the note during your {nights}-night stay:
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {stayDates.map((date, idx) => {
                                const dateStr = format(date, "yyyy-MM-dd");
                                const isChecked = welcomeNote.dates.includes(dateStr);
                                return (
                                  <div key={idx} className="flex items-center gap-2">
                                    <Checkbox
                                      checked={isChecked}
                                      onCheckedChange={(checked) => {
                                        setWelcomeNote((prev) => ({
                                          ...prev,
                                          dates: checked
                                            ? [...prev.dates, dateStr]
                                            : prev.dates.filter((d) => d !== dateStr),
                                        }));
                                      }}
                                    />
                                    <span className="text-xs text-[#4F4F4F]">
                                      {format(date, "MMM do")}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
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
                    {formatDateSafe(draft.dates.checkIn, "dd/MM/yyyy")}
                  </p>
                </div>

                <div>
                  <p className="text-[#737373]">Check out:</p>
                  <p className="font-medium text-[#4F4F4F]">
                    {formatDateSafe(draft.dates.checkOut, "dd/MM/yyyy")}
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
                {formatSelectedRoomNames(draft)}
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
                  <span>₦{formatPrice(calculateDynamicSubTotal(draft))}</span>
                </div>

                <div className="flex justify-between leading-snug">
                  <span>
                    After consumption tax and <br /> VAT(12.5%)
                  </span>
                  <span>
                    ₦
                    {formatPrice(
                      Math.round(calculateDynamicSubTotal(draft) * 0.125),
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
                      Math.round(calculateDynamicSubTotal(draft) * 1.125),
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <div className="hidden md:block w-full rounded-t-xl overflow-hidden">
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
            <Button
              variant="outline"
              className="w-full py-6 mt-4 rounded-md border border-[#09432B] text-[#09432B] font-bold cursor-pointer"
              onClick={() => {
                bookingStore.resetBooking();
                navigate("/");
              }}
            >
              Restart Booking
            </Button>
          </div>
        </div>
      </div>

      <FunnelMobileStickyCta>
        <Button
          asChild
          className="w-full bg-[#09432B] hover:bg-[#083f28] text-white font-bold py-6 rounded-xl"
        >
          <Link
            to="/enter-your-details"
            onClick={handleContinue}
            className="flex items-center gap-2 justify-center"
          >
            Continue to Guest Details →
          </Link>
        </Button>
      </FunnelMobileStickyCta>
    </div>
  );
}

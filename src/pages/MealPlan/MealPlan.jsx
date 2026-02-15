import React, { useState, useEffect } from "react";
import CommonNavbar from "@/components/shared/common/CommonNavbar/CommonNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import mealIcon from "../../assets/SVG.png";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Home,
  Wallet,
  Check,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "@/config";
import { useBookingStore } from "@/store/useBookingStore";
import { format } from "date-fns";

function formatPrice(n) {
  return n?.toLocaleString() || "0";
}

export default function MealPlan() {
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const bookingStore = useBookingStore();
  const navigate = useNavigate();

  const selectedMealPlan = bookingStore.draft.mealPlan;

  useEffect(() => {
    if (!bookingStore.draft.dates || !bookingStore.draft.podCount) {
      navigate("/book-your-stay", { replace: true });
      return;
    }

    const fullBoard = {
      id: "FULL_BOARD",
      boardType: "fullBoard",
      title: "Full Board",
      subtitle: "Includes Breakfast, Lunch, and Dinner.",
      items: ["Breakfast included", "Lunch included", "Dinner included"],
      price: 0,
      isActive: true,
    };

    setMealPlans([fullBoard]);
    bookingStore.updateDraft({
      mealPlan: fullBoard,
      basePrice: 400000,
    });
    setLoading(false);
  }, [bookingStore, navigate]);

  const fetchMealPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/meal-plans`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMealPlans(data.mealPlans || []);
    } catch (error) {
      console.error("Error fetching meal plans:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMealPlan = (plan) => {
    bookingStore.updateDraft({
      mealPlan: plan,
      basePrice: plan.price,
      subTotal:
        plan.price *
        (bookingStore.draft.guests?.adults || 0) *
        (bookingStore.draft.numberOfNights || 0),
    });
  };

  // Guard: Don't render if booking data is missing (redirect will happen)
  if (!bookingStore.draft.dates || !bookingStore.draft.podCount) {
    return null;
  }

  return (
    <div className="overflow-x-hidden min-h-screen w-full bg-[#F7F5F0]">
      <CommonNavbar />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10">
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-sm text-gray-700 mb-6 pl-0 hover:bg-transparent"
        >
          <ArrowLeft className="w-4 h-4" />
          <Link to="/new-booking">Back</Link>
        </Button>

        <h2 className="text-2xl md:text-5xl font-bold text-[#09432B] text-center">
          Your Meal Plan
        </h2>

        <p className="text-center text-sm md:text-lg font-medium text-[#737373] mt-2 mb-10">
          Step 2 of 6 – Full Board is included with your stay
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-6">
            {loading && !error && (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex items-center gap-2 text-[#09432B]">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-lg font-medium">
                    Loading meal plans...
                  </span>
                </div>
              </div>
            )}
            {!loading && error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                <p className="text-red-700 text-sm">
                  Unable to load meal plans from server.
                </p>
              </div>
            )}
            {!loading &&
              !error &&
              mealPlans.map((plan) => {
                const isSelected = true;
                return (
                  <Card
                    key={plan.id}
                    className="bg-white rounded-xl shadow-sm px-6 py-6 border-2 border-[#09432B] ring-1 ring-[#09432B]"
                  >
                    <CardContent className="p-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-[#09432B] text-white"
                                : "bg-[#E6F2EE]"
                            }`}
                          >
                            <img
                              src={mealIcon}
                              className={`w-5 h-5 ${isSelected ? "brightness-0 invert" : ""}`}
                              alt="Meal Icon"
                            />
                          </div>

                          <div>
                            <h3 className="text-xl font-bold text-[#09432B] leading-tight">
                              {plan.title}
                            </h3>
                            <p className="text-sm text-[#737373] mt-1">
                              {plan.subtitle}
                            </p>
                          </div>
                        </div>
                        <div className="bg-[#09432B] text-white rounded-full p-1">
                          <Check className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="mt-5 space-y-3">
                        {plan.items.map((item) => (
                          <div key={item} className="flex items-center gap-2">
                            <Check
                              className={`w-4 h-4 ${isSelected ? "text-[#09432B]" : "text-[#09432B]"}`}
                            />
                            <span className="text-sm text-[#09432B]">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 flex-col items-start gap-4 flex sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-lg font-bold text-[#09432B] whitespace-nowrap">
                          Full Board Included
                          <span className="text-sm font-normal text-[#737373] ml-1">
                            (Mandatory for Pods)
                          </span>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>

          <div className="md:col-span-4 space-y-4">
            {/* Stay Dates Card */}
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
                  <p className="text-sm text-[#737373]">Check in:</p>
                  <p className="text-sm font-medium text-[#4F4F4F] mt-1">
                    {format(bookingStore.draft.dates.checkIn, "dd/MM/yyyy")}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#737373]">Check out:</p>
                  <p className="text-sm font-medium text-[#4F4F4F] mt-1">
                    {format(bookingStore.draft.dates.checkOut, "dd/MM/yyyy")}
                  </p>
                </div>

                <p className="text-sm font-semibold text-[#09432B] whitespace-nowrap">
                  {bookingStore.draft.numberOfNights} Nights
                </p>
              </div>
            </div>

            {/* Selected Pod Card */}
            <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#E6F2EE] rounded-full flex items-center justify-center">
                  <Home className="w-4 h-4 text-[#09432B]" />
                </div>
                <h4 className="text-[#09432B] font-bold">Your Rooms</h4>
              </div>

              <p className="text-sm text-[#737373] font-medium">
                {`x${bookingStore.draft.podCount || 0} Rooms`}
              </p>
            </div>

            {/* Price Summary Card */}
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
                  <span>₦{formatPrice(bookingStore.draft.subTotal)}</span>
                </div>

                <div className="flex justify-between leading-snug">
                  <span>
                    After consumption tax and <br /> VAT(12.5%)
                  </span>
                  <span>
                    ₦
                    {formatPrice(
                      Math.round(bookingStore.draft.subTotal * 0.125),
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>0%</span>
                </div>

                <div className="border-t pt-3 flex justify-between bg-[#F2EFE7] px-3 py-2 rounded-md">
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

            {/* Continue Button */}
            <div className="w-full rounded-t-xl overflow-hidden">
              <div
                className="px-4 py-3 text-[#0A4C30] text-sm font-medium"
                style={{ backgroundColor: "#B7FFFF" }}
              >
                Happy with your meal plan? let's move ahead
              </div>

              <Button
                asChild
                className="w-full bg-[#09432B] hover:bg-[#083f28] text-white text-base font-bold py-6 rounded-none rounded-b-xl"
              >
                <Link
                  to="/guest-details"
                  className="flex items-center gap-2 justify-center"
                >
                  Continue to Guest Details →
                </Link>
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full py-6 rounded-md border border-[#A19257] bg-gradient-to-r from-[#B5AB84] to-[#A19257] font-bold text-white hover:text-white"
            >
              Quick Book
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

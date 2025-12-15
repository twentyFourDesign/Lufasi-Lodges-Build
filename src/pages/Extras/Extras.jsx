import React, { useState } from "react";
import CommonNavbar from "@/components/shared/common/CommonNavbar/CommonNavbar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import image1 from "../../assets/Frame 19 (1).png";

import {
  ArrowLeft,
  ChevronDown,
  Calendar,
  Home,
  Wallet,
  User,
  Gift,
} from "lucide-react";
import { Link } from "react-router-dom";

const EXTRAS = [
  {
    id: "decor",
    title: "Special Room Decor",
    subtitle: "Romantic setup with flowers, candles, and petals",
    options: [],
  },
  {
    id: "picnic",
    title: "Private Sunset Picnic",
    subtitle: "Curated picnic experience at our premium sunset spot",

    options: [],
  },
  {
    id: "drinks",
    title: "Premium Drinks Package",
    subtitle: "Selection of premium wines, spirits, and cocktails",
    defaultOpen: true,
    options: [
      { id: 1, label: "Carrot and Coconut cake (6 inches)", price: 40000 },
      { id: 2, label: "Fruit Cake single plain (8 inches)", price: 55000 },
      {
        id: 3,
        label: "Premium Cactus Cake – Chocolate sponge cake",
        price: 60000,
      },
      { id: 4, label: "Chocolate spongecake", price: 70000 },
      { id: 5, label: "Carrot and Coconut cake", price: 50000 },
      { id: 6, label: "Cortina cake", price: 50000 },
      { id: 7, label: "Two Layers Vanilla/Marble", price: 50000 },
    ],
  },
  {
    id: "painting",
    title: "DIY Painting Session",
    subtitle: "Guided painting session with all materials included",
    options: [],
  },
];

function ExtrasCard({ item }) {
  const [open, setOpen] = useState(item.defaultOpen || false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* HEADER */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full p-4 sm:p-5"
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
                <Checkbox />
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
            {EXTRAS.map((item) => (
              <ExtrasCard key={item.id} item={item} />
            ))}
          </div>
          <div className="md:col-span-4 space-y-4">
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
                  <p className="font-medium text-[#4F4F4F]">01/02/2025</p>
                </div>

                <div>
                  <p className="text-[#737373]">Check out:</p>
                  <p className="font-medium text-[#4F4F4F]">09/02/2025</p>
                </div>

                <p className="font-semibold text-[#09432B]">2 Nights</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#E6F2EE] rounded-full flex items-center justify-center">
                  <Home className="w-4 h-4 text-[#09432B]" />
                </div>
                <h4 className="text-[#09432B] font-bold">Your Pod</h4>
              </div>
              <p className="text-sm text-[#737373]">Forest Haven</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#E6F2EE] rounded-full flex items-center justify-center">
                  <Gift className="w-4 h-4 text-[#09432B]" />
                </div>
                <h4 className="text-[#09432B] font-bold">Meal Plan</h4>
              </div>
              <p className="text-sm text-[#737373]">Full Board</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#E6F2EE] rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-[#09432B]" />
                </div>
                <h4 className="text-[#09432B] font-bold">Guests</h4>
              </div>
              <p className="text-sm text-[#737373]">2 Adults (18+)</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#E6F2EE] rounded-full flex items-center justify-center">
                  <Gift className="w-4 h-4 text-[#09432B]" />
                </div>
                <h4 className="text-[#09432B] font-bold">Extras</h4>
              </div>
              <p className="text-sm text-[#737373]">N/A</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h4 className="text-[#09432B] font-bold mb-3">Price Summary</h4>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Sub Total:</span>
                  <span>₦0</span>
                </div>

                <div className="flex justify-between leading-snug">
                  <span>
                    After consumption tax and <br /> VAT(12.5%)
                  </span>
                  <span>₦0</span>
                </div>

                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>0%</span>
                </div>

                <div className="border-t flex justify-between bg-[#F2EFE7] px-3 py-2 rounded-md font-semibold">
                  <span>Total:</span>
                  <span>₦0</span>
                </div>
              </div>
            </div>
            <div className="w-full rounded-t-xl overflow-hidden">
              <div
                className="px-4 py-3 text-[#0A4C30] font-medium text-sm"
                style={{ background: "#B7FFFF" }}
              >
                Happy with your Extras? Let’s move ahead
              </div>

              <Button
                asChild
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

            <Button
              variant="outline"
              className="w-full py-6 rounded-md border font-bold border-[#0A4C30]"
            >
              Skip Extras
            </Button>

            <Button className="w-full py-6 rounded-md hover:text-white hover:bg-[#A19257] bg-[#A19257] text-white font-bold">
              Quick Book
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

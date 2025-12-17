import CommonNavbar from "@/components/shared/common/CommonNavbar/CommonNavbar";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function ManageBooking() {
  return (
    <div className="min-h-screen lg:min-h-[93vh] w-full bg-[#F7F5F0] ">
      <CommonNavbar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Button
          variant="ghost"
          className="
            flex items-center gap-2 
            text-sm text-gray-700 mb-6 pl-0 hover:bg-transparent
          "
        >
          <ArrowLeft className="w-4 h-4" />
          <Link to="/">Back to Home</Link>
        </Button>

        <h1 className="text-3xl md:text-5xl font-bold text-center text-[#09432B]">
          Manage Your Booking
        </h1>
        <p className="text-center text-lg text-[#737373] mt-2 mb-12 max-w-xl mx-auto leading-relaxed">
          Enter Details Below to find you booking details
        </p>
        <Card className="w-full max-w-sm h-[376px] bg-white rounded-xl shadow-md hover:shadow-lg transition px-8 py-10 m-auto">
          <form className="flex flex-col gap-8">
            {/* Form fields can be added here in the future */}
            <div className="flex flex-col gap-3">
              <label className="text-gray-700 font-semibold text-sm">
                Booking Reference
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 mt-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#09432B]"
                placeholder="Enter your booking reference"
                required
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-gray-700 font-semibold text-sm">
                Last Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 mt-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#09432B]"
                placeholder="Enter your last name"
                required
              />
            </div>
            <div className="flex items-center gap-2 md:gap-4 w-full box-border">
              <Button
                className="
                hidden md:flex                     
                bg-white
                text-[#09432B]
                rounded-md
                font-bold
                hover:bg-gray-100
                transition

                md:h-9 lg:h-12
                p-6
                items-center justify-center gap-2
                flex-1
                border-[#09432B]
              "
                variant="outline"
              >
                <Link to="/">Go Back</Link>
              </Button>

              <Button
                className="
                bg-[#09432B]
                text-white
                rounded-md
                font-bold
                hover:bg-green-900
                transition
                
                md:h-9 lg:h-12
                p-6
                hidden md:flex                     
                items-center justify-center gap-2
                flex-1
              "
                type="submit"
              >
                Find Booking
                <ArrowRight className="w-4 h-4 mt-1" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Mail, Calendar, MapPin } from "lucide-react";
import CommonNavbar from "@/components/shared/common/CommonNavbar/CommonNavbar";
import { Link, useLocation } from "react-router-dom";

export default function BookingConfirmation() {
  const location = useLocation();
  const { bookingReference } = location.state?.booking || {
    bookingReference: "N/A",
  };
  return (
    <div className="min-h-screen bg-[#F7F5EF] ">
      <CommonNavbar />
      <div className="flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-3xl rounded-3xl shadow-md border-none ">
          <CardContent className="p-6 md:p-10 ">
            <div className="flex justify-center">
              <div className="bg-[#EFEBDD] w-20 h-20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-[#0A4C30]" />
              </div>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-center text-[#0A4C30] mt-6">
              Booking Confirmed!
            </h1>

            <p className="text-center text-gray-600 mt-2 max-w-lg mx-auto text-sm md:text-base">
              Your nature escape awaits. We can’t wait to welcome you to Lufasi
              Lodges.
            </p>
            <div className="bg-[#C8EBEF] rounded-xl py-5 px-4 text-center mt-6">
              <p className="text-xs md:text-sm text-gray-600">
                Your Booking Reference
              </p>
              <p className="text-xl md:text-2xl font-bold tracking-wide text-[#0A4C30]">
                {bookingReference}
              </p>
            </div>
            <div className="bg-[#F0EDDD] rounded-xl p-4 md:p-6 mt-6 space-y-4">
              <div className="flex gap-3">
                <Mail className="w-5 h-5 text-[#0A4C30]" />
                <div>
                  <p className="font-semibold text-sm md:text-base text-[#0A4C30]">
                    Confirmation Email Sent
                  </p>
                  <p className="text-xs md:text-sm text-gray-600">
                    Check your inbox for your booking details and pre-arrival
                    information.
                  </p>
                </div>
              </div>

              <Separator />
              <div className="flex gap-3">
                <Calendar className="w-5 h-5 text-[#0A4C30]" />
                <div>
                  <p className="font-semibold text-sm md:text-base text-[#0A4C30]">
                    Add to Calendar
                  </p>
                  <p className="text-xs md:text-sm text-gray-600">
                    Save your dates and start counting down to your nature
                    retreat.
                  </p>
                </div>
              </div>

              <Separator />
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-[#0A4C30]" />
                <div>
                  <p className="font-semibold text-sm md:text-base text-[#0A4C30]">
                    Location & Directions
                  </p>
                  <p className="text-xs md:text-sm text-gray-600">
                    Detailed directions and what to bring will be in your
                    confirmation email.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Button className="w-full bg-[#0A4C30] hover:bg-[#0A4C30] text-white h-12 rounded-xl text-sm md:text-base">
                <Link to="/">Go Back to Homepage</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

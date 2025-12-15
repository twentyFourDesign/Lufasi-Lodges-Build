import CommonNavbar from "@/components/shared/common/CommonNavbar/CommonNavbar";
import { ArrowLeft, BedDouble, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import addHomeIcon from "../../assets/Add_Home.png";
import nightSheltarIcon from "../../assets/Night_shelter.png";
export default function BookYourStay() {
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
          Book Your Stay
        </h1>
        <p className="text-center text-lg text-[#737373] mt-2 mb-12 max-w-xl mx-auto leading-relaxed">
          Do you want to create a new booking or manage{" "}
          <br className="hidden md:block" />
          an existing one?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 place-items-center">
          <Card className="w-full max-w-sm h-[230px] bg-white rounded-xl shadow-md hover:shadow-lg transition">
            <CardContent className="h-full flex flex-col items-center justify-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(181,171,132,0.28) 0%, rgba(161,146,87,0.28) 100%)",
                }}
              >
                <img
                  src={nightSheltarIcon}
                  alt="Add Home"
                  className="w-8 h-8"
                />
              </div>

              <p className="font-bold text-[#09432B] text-lg flex items-center gap-1">
                <Link to="/edit-your-booking">Existing Booking</Link>

                <ArrowLeft className="w-4 h-4 rotate-180 mt-1" />
              </p>
            </CardContent>
          </Card>
          <Card className="w-full max-w-sm h-[230px] bg-white rounded-xl shadow-md hover:shadow-lg transition">
            <CardContent className="h-full flex flex-col items-center justify-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(181,171,132,0.28) 0%, rgba(161,146,87,0.28) 100%)",
                }}
              >
                <img
                  src={addHomeIcon}
                  alt="Night Sheltar"
                  className="w-8 h-8 "
                />
              </div>

              <p className="font-bold text-[#09432B] text-lg flex items-center gap-1">
                <Link to="/new-booking">New Booking</Link>
                <ArrowLeft className="w-4 h-4 rotate-180 mt-1" />
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

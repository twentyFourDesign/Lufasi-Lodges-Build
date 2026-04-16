import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import heroImage from "../../assets/image copy.png";
import heroImageMobile from "../../assets/image-mobile.png";
import Navbar from "../../components/shared/Navbar/Navbar";
import { ArrowRight } from "lucide-react";
import BookingForm from "@/components/Home/BookingForm/BookingForm";
import Footer from "@/components/shared/Footer/Footer";
import { Link } from "react-router-dom";
import ComingSoonPage from "@/components/shared/ComingSoonPage";
import { isComingSoonEnabled } from "@/config";

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isComingSoonEnabled()) {
    return <ComingSoonPage />;
  }

  return (
    <div
      style={{
        backgroundImage: `url(${isMobile ? heroImageMobile : heroImage})`,
      }}
      className="
        w-full min-h-[85vh] md:min-h-screen
        bg-cover bg-[center_right_15%] md:bg-center bg-no-repeat
        -mt-6 p-0 overflow-auto overflow-x-hidden opacity-98
      "
    >
      {/* NAVBAR */}
      <Navbar />

      {/* HERO CONTENT */}
      <div
        className="
          w-full
          flex flex-col items-center text-center text-white px-4
          justify-center pt-32
          sm:pt-48 sm:justify-start
          lg:pt-40 lg:justify-center
          
        "
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 drop-shadow-md">
          Wake Up Wild
        </h1>

        <p className="max-w-xl text-base md:text-lg font-semibold mb-6 drop-shadow-md">
          Immerse yourself in the rhythm of nature, surrounded by refined beauty
          and effortless elegance. Welcome to Lufasi Lodges.
        </p>

        {/* HERO BUTTONS */}
        <div className="flex gap-3 mb-10">
          <Button
            className="
              bg-[#B5AB84] text-white font-bold
              px-5 py-2 md:px-6 md:py-3
              rounded-md hover:bg-[#a79b6e] transition
              h-10 md:h-12 flex items-center gap-2
            "
          >
            <Link to="/manage-your-booking">Manage Booking</Link>

            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            className="
              text-white border border-white/40
              bg-white/0 backdrop-blur-md
              rounded-md font-bold
              px-4 py-2 md:px-6 md:py-3
              h-10 md:h-12
            "
          >
            Explore our Lodges
          </Button>
        </div>

        {/* BOOKING FORM */}
        <div className="w-full flex justify-center mb-10">
          <BookingForm />
        </div>
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
}

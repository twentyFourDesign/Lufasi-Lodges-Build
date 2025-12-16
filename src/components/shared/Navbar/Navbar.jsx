import { Button } from "@/components/ui/button";
import logo from "../../../assets/logo.png";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[85%] max-w-[1600px] z-50 mt-2 ">
      <nav
        className="
          w-full
          flex items-center justify-between
          px-4 py-2 
          md:px-10    
          bg-white/10
          backdrop-blur-lg
          border border-white/40
          rounded-xl
          text-white
        "
      >
        <div className="flex items-center gap-3">
          <img src={logo} alt="Lufasi Lodges" className="h-10 md:h-18" />
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button
            className="
              hidden md:flex                     
              bg-[#09432B]
              text-white
              rounded-md
              font-bold
              hover:bg-green-900
              transition

             md:h-9 lg:h-12
              px-6 py-3

              items-center justify-center gap-2
            "
          >
            <Link to="/book-your-stay">Book your stay</Link>
            <ArrowRight className="w-4 h-4 mt-1" />
          </Button>

          <Button
            variant="outline"
            className="
              text-white
              hover:text-white
              border border-white/40
              bg-white/0
              backdrop-blur-md
              rounded-md
              shadow-sm
              hover:bg-white/20
              font-bold
              transition

              h-8 md:h-9 lg:h-12
              px-4 py-2 md:px-6 md:py-3
              text-sm md:text-base
            "
          >
            Contact us
          </Button>
        </div>
      </nav>
    </div>
  );
}

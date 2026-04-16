import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { Link } from "react-router-dom";

export default function CommonNavbar() {
  return (
    <div className="w-full bg-[#F7F5F0] pt-4 px-4 sm:px-6 ">
      <div
        className="
          w-full
          max-w-7xl mx-auto
          bg-white 
          rounded-xl 
          shadow-sm 
          border border-gray-200/40
          px-6 md:px-10 py-4
          flex items-center justify-between
        "
      >
        <Link to="/">
          <img src={logo} alt="Lufasi Lodges" className="h-12 md:h-14" />
        </Link>

        <Button
          className="
            bg-[#09432B] hover:bg-[#083f28] text-white font-medium
            px-6 h-10 md:h-11
            rounded-md
          "
        >
          <a href="https://www.lufasilodges.com/" target="_blank" rel="noopener noreferrer">
            Contact us
          </a>
        </Button>
      </div>
    </div>
  );
}

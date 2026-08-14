import { Users } from "lucide-react";
import { getGuestSummaryLines, getGuestCountLabel } from "@/lib/bookingDisplay";

export default function ReservationGuestsCard({
  guests,
  popUpBeds = 0,
  className = "px-5 py-4",
}) {
  const lines = getGuestSummaryLines(guests, popUpBeds);

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#E6F2EE] rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-[#09432B]" />
          </div>
          <h4 className="text-[#09432B] font-bold">Guests</h4>
        </div>
        <p className="text-sm font-semibold text-[#09432B] whitespace-nowrap">
          {getGuestCountLabel(guests)}
        </p>
      </div>
      <div className="text-sm text-[#737373] space-y-1">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}

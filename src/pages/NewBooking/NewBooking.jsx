import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBookingStore } from "@/store/useBookingStore";

/** Legacy route — redirects into the current booking flow. */
export default function NewBooking() {
  const navigate = useNavigate();
  const bookingStore = useBookingStore();

  useEffect(() => {
    const { draft } = bookingStore;
    if (draft.dates?.checkIn && draft.guests?.adults) {
      if (draft.selectedPodIds?.length === draft.podCount) {
        navigate("/meal-plan", { replace: true });
      } else {
        navigate("/select-rooms", { replace: true });
      }
    } else if (draft.dates?.checkIn) {
      navigate("/guest-details", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [navigate, bookingStore]);

  return null;
}

import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home";
import BookYourStay from "@/pages/BookYourStay/BookYourStay";
import NewBooking from "@/pages/NewBooking/NewBooking";
import MealPlan from "@/pages/MealPlan/MealPlan";
import GuestDetails from "@/pages/GuestDetails/GuestDetails";
import ExtrasPage from "@/pages/Extras/Extras";
import EnterYourDetails from "@/pages/EnterYourDetails/EnterYourDetails";
import ReviewYourBooking from "@/pages/ReviewYourBooking/ReviewYourBooking";
import BookingConfirmation from "@/pages/BookingConfirmation/BookingConfirmation";
import EditBookingPage from "@/pages/EditBookingPage/EditBookingPage";
import ManageBooking from "@/pages/ManageBooking";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/manage-your-booking" element={<ManageBooking />} />
      <Route path="/book-your-stay" element={<BookYourStay />} />
      <Route path="/new-booking" element={<NewBooking />} />
      <Route path="/meal-plan" element={<MealPlan />} />
      <Route path="/guest-details" element={<GuestDetails />} />
      <Route path="/extras" element={<ExtrasPage />} />
      <Route path="/enter-your-details" element={<EnterYourDetails />} />
      <Route path="/review-your-booking" element={<ReviewYourBooking />} />
      <Route path="/booking-confirmation" element={<BookingConfirmation />} />
      <Route path="/edit-your-booking" element={<EditBookingPage />} />
    </Routes>
  );
}

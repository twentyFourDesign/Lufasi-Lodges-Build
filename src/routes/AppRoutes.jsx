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
import AdminLogin from "@/pages/AdminLogin/AdminLogin";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import BookingsPage from "@/pages/admin/BookingsPage";
import BookingDetailsPage from "@/pages/admin/BookingDetailsPage";
import SettingsPage from "@/pages/admin/SettingsPage";
import PricingPage from "@/pages/admin/PricingPage";

// Placeholder component for pages not yet implemented
function PlaceholderPage({ title }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#333333] mb-2">{title}</h1>
        <p className="text-gray-500">Coming soon...</p>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
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
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* Protected Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute>
            <BookingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bookings/:id"
        element={
          <ProtectedRoute>
            <BookingDetailsPage />
          </ProtectedRoute>
        }
      />
      {/* Alternate route for bookings (user prefers this URL structure) */}
      <Route
        path="/bookings/admin/:id"
        element={
          <ProtectedRoute>
            <BookingDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      {/* Placeholder routes for future pages */}
      <Route
        path="/admin/booking-page"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pricing"
        element={
          <ProtectedRoute>
            <PricingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/vouchers"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/extras"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pods"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

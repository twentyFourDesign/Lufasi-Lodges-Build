import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "../pages/Home/Home";
import BookYourStay from "@/pages/BookYourStay/BookYourStay";
import NewBooking from "@/pages/NewBooking/NewBooking";
import MealPlan from "@/pages/MealPlan/MealPlan";
import GuestDetails from "@/pages/GuestDetails/GuestDetails";
import ExtrasPage from "@/pages/Extras/Extras";
import EnterYourDetails from "@/pages/EnterYourDetails/EnterYourDetails";
import ReviewYourBooking from "@/pages/ReviewYourBooking/ReviewYourBooking";
import BookingConfirmation from "@/pages/BookingConfirmation/BookingConfirmation";
import PaymentPage from "@/pages/Payment/PaymentPage";
import PaymentResult from "@/pages/Payment/PaymentResult";
import EditBookingPage from "@/pages/EditBookingPage/EditBookingPage";
import ManageBooking from "@/pages/ManageBooking";
import AdminLogin from "@/pages/AdminLogin/AdminLogin";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import BookingsPage from "@/pages/admin/BookingsPage";
import PendingBookingsPage from "@/pages/admin/PendingBookingsPage";
import BookingDetailsPage from "@/pages/admin/BookingDetailsPage";
import SettingsPage from "@/pages/admin/SettingsPage";
import PricingPage from "@/pages/admin/PricingPage";
import ChannexSyncPage from "@/pages/admin/ChannexSyncPage";
import GuestPaymentsPage from "@/pages/admin/GuestPaymentsPage";
import BookingLogPage from "@/pages/admin/BookingLogPage";
import PageContentSettingsPage from "@/pages/admin/PageContentSettingsPage";
import PodsManagementPage from "@/pages/admin/PodsManagementPage";
import AdminExtrasPage from "@/pages/admin/ExtrasPage";
import MealsPage from "@/pages/admin/MealsPage";
import ReportsPage from "@/pages/admin/ReportsPage";
import VouchersPage from "@/pages/admin/VouchersPage";
import BookingLogsList from "@/pages/admin/BookingLogsList";
import GuestDetailsPage from "@/pages/admin/GuestDetailsPage";
import { isAdminSubdomain, isBookingSubdomain } from "@/utils/subdomain";
import useAuthStore from "@/store/useAuthStore";
import { isComingSoonEnabled } from "@/config";

// Component to block admin access on booking subdomain
function AdminRoute({ children }) {
  // If on booking subdomain (not admin), redirect to home
  if (isBookingSubdomain() && !isAdminSubdomain()) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Admin login route - only accessible on admin subdomain
function AdminLoginRoute() {
  const { isAuthenticated } = useAuthStore();

  // If on booking subdomain (not admin), redirect to home
  if (isBookingSubdomain() && !isAdminSubdomain()) {
    return <Navigate to="/" replace />;
  }

  // If already authenticated on admin subdomain, redirect to dashboard
  if (isAdminSubdomain() && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AdminLogin />;
}

// Home route - handles subdomain-specific behavior
function HomeRoute() {
  const { isAuthenticated } = useAuthStore();
  const hostname = window.location.hostname;

  // If on a real admin subdomain (not localhost/ngrok), redirect based on auth state
  if (
    isAdminSubdomain() &&
    !hostname.includes("localhost") &&
    !hostname.includes("ngrok-free.dev")
  ) {
    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  // On localhost, ngrok, or booking subdomain - show home page
  return <Home />;
}

function isAdminAccessiblePath(pathname) {
  const adminExactPaths = ["/login", "/admin-login", "/dashboard"];
  const adminPathPrefixes = ["/admin", "/bookings/admin"];

  if (adminExactPaths.includes(pathname)) {
    return true;
  }

  return adminPathPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

// Route middleware for live/coming-soon mode
function RouteModeMiddleware({ children }) {
  const location = useLocation();

  if (!isComingSoonEnabled()) {
    return children;
  }

  if (location.pathname === "/" || isAdminAccessiblePath(location.pathname)) {
    return children;
  }

  return <Navigate to="/" replace />;
}

export default function AppRoutes() {
  return (
    <RouteModeMiddleware>
      <Routes>
        {/* Root Route - handles subdomain-specific behavior */}
        <Route path="/" element={<HomeRoute />} />
        <Route path="/manage-your-booking" element={<ManageBooking />} />
        <Route path="/book-your-stay" element={<BookYourStay />} />
        <Route path="/new-booking" element={<NewBooking />} />
        <Route path="/meal-plan" element={<MealPlan />} />
        <Route path="/guest-details" element={<GuestDetails />} />
        <Route path="/extras" element={<ExtrasPage />} />
        <Route path="/enter-your-details" element={<EnterYourDetails />} />
        <Route path="/review-your-booking" element={<ReviewYourBooking />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/result" element={<PaymentResult />} />
        <Route path="/booking-confirmation" element={<BookingConfirmation />} />
        <Route path="/edit-your-booking" element={<EditBookingPage />} />

        {/* Admin Login Routes - blocked on booking subdomain */}
        <Route path="/admin-login" element={<AdminLoginRoute />} />
        <Route path="/admin/login" element={<AdminLoginRoute />} />
        <Route path="/login" element={<AdminLoginRoute />} />

        {/* Admin Dashboard Route - for admin subdomain clean URL */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

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
        path="/admin/pending-bookings"
        element={
          <ProtectedRoute>
            <PendingBookingsPage />
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
        {/* Alternate route for bookings */}
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
        <Route
        path="/admin/booking-page"
        element={
          <ProtectedRoute>
            <BookingLogPage />
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
        path="/admin/channel-manager"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ChannexSyncPage />
          </ProtectedRoute>
        }
      />
        <Route
        path="/admin/guest-payments"
        element={
          <ProtectedRoute>
            <GuestPaymentsPage />
          </ProtectedRoute>
        }
      />
        <Route
        path="/admin/page-settings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <PageContentSettingsPage />
          </ProtectedRoute>
        }
      />
        <Route
        path="/admin/pods"
        element={
          <ProtectedRoute>
            <PodsManagementPage />
          </ProtectedRoute>
        }
      />
        <Route
        path="/admin/vouchers"
        element={
          <ProtectedRoute>
            <VouchersPage />
          </ProtectedRoute>
        }
      />
        <Route
        path="/admin/extras"
        element={
          <ProtectedRoute>
            <AdminExtrasPage />
          </ProtectedRoute>
        }
      />
        <Route
        path="/admin/meals"
        element={
          <ProtectedRoute>
            <MealsPage />
          </ProtectedRoute>
        }
      />
        <Route
        path="/admin/reports"
        element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
        <Route
        path="/admin/logs"
        element={
          <ProtectedRoute>
            <BookingLogsList />
          </ProtectedRoute>
        }
      />
        <Route
        path="/admin/guests"
        element={
          <ProtectedRoute>
            <GuestDetailsPage />
          </ProtectedRoute>
        }
        />
      </Routes>
    </RouteModeMiddleware>
  );
}

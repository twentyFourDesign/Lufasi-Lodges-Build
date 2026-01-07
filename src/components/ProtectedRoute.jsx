import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";
import { isAdminSubdomain, isBookingSubdomain } from "@/utils/subdomain";

export default function ProtectedRoute({ children, allowedRoles = ["admin", "staff"] }) {
    const { isAuthenticated, user } = useAuthStore();
    const location = useLocation();

    // Block admin routes on booking subdomain
    if (isBookingSubdomain() && !isAdminSubdomain()) {
        return <Navigate to="/" replace />;
    }

    if (!isAuthenticated) {
        // Redirect to login page with return url
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    // Check if user has required role
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
}


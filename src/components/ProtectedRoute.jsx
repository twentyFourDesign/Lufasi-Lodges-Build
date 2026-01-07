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

    // Determine login redirect path based on subdomain
    const loginPath = isAdminSubdomain() ? "/login" : "/admin/login";

    if (!isAuthenticated) {
        // Redirect to login page with return url
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    // Check if user has required role
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        return <Navigate to={loginPath} replace />;
    }

    return children;
}


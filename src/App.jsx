import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/shared/ScrollToTop";

export default function App() {
  const location = useLocation();

  // Routes that need full-screen layout (no padding)
  const fullScreenRoutes = ["/admin-login", "/admin/login", "/login", "/dashboard"];
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isFullScreen = fullScreenRoutes.includes(location.pathname) || isAdminRoute;

  return (
    <>
      <ScrollToTop />
      <div className={isFullScreen ? "" : "p-6"}>
        <AppRoutes />
      </div>
    </>
  );
}

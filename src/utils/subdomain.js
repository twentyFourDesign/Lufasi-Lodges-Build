export function isAdminSubdomain() {
  const hostname = window.location.hostname;
  return (
    hostname.startsWith("admin.") ||
    hostname === "localhost" ||
    hostname.includes("ngrok-free.dev")
  );
}

export function isBookingSubdomain() {
  const hostname = window.location.hostname;
  // On localhost or ngrok, we want to allow both/be flexible, so we return false here
  // to prevent the "Booking Subdomain" restrictions from kicking in
  if (hostname === "localhost" || hostname.includes("ngrok-free.dev"))
    return false;

  return (
    hostname.startsWith("booking.") ||
    hostname === "lufasilodges.com" ||
    hostname === "www.lufasilodges.com"
  );
}

export function getSubdomainType() {
  if (isAdminSubdomain()) return "admin";
  if (isBookingSubdomain()) return "booking";
  return "unknown";
}

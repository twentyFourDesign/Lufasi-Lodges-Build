
export function isAdminSubdomain() {
    const hostname = window.location.hostname;
    return hostname.startsWith('admin.');
}


export function isBookingSubdomain() {
    const hostname = window.location.hostname;
    return hostname.startsWith('booking.') ||
        hostname === 'lufasilodges.com' ||
        hostname === 'www.lufasilodges.com' ||
        hostname === 'localhost'; // For local development
}


export function getSubdomainType() {
    if (isAdminSubdomain()) return 'admin';
    if (isBookingSubdomain()) return 'booking';
    return 'unknown';
}

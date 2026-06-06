export const BASE_URL = "https://api.admin.lufasilodges.com";
// export const BASE_URL = "http://localhost:4000";

// Toggle this between "live" and "coming-soon"
export const SITE_MODE = "live";

export const isComingSoonEnabled = () => SITE_MODE === "coming-soon";

// ---------------------------------------------------------------------------
// Analytics (GA4) — fill ONE of these in when the client provides it.
//   - GTM_CONTAINER_ID : "GTM-XXXXXXX"  (preferred — marketer manages tags)
//   - GA4_MEASUREMENT_ID: "G-XXXXXXXXXX" (direct GA4, no Tag Manager)
// Leave both empty to disable analytics. The dataLayer events still fire
// regardless, so GTM will pick them up the moment the container ID is set.
// ---------------------------------------------------------------------- -----
export const GTM_CONTAINER_ID = "GTM-TWTNPJZ4";
export const GA4_MEASUREMENT_ID = "";

// Reporting currency for ecommerce events
export const ANALYTICS_CURRENCY = "NGN";

// VAT / consumption tax rate baked into booking totalPrice. Conversion value
// reported to GA4 is the pre-tax (ex-VAT) amount, so we divide it back out.
export const VAT_RATE = 0.125;

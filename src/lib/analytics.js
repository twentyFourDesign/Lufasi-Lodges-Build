/**
 * GA4 analytics helper (GTM-first, gtag fallback).
 *
 * How it works:
 *  - Everything is pushed to `window.dataLayer`. Google Tag Manager reads this
 *    natively, so once the client sets GTM_CONTAINER_ID in src/config, all the
 *    events below light up with zero further code changes.
 *  - If they give a direct GA4 Measurement ID instead (GA4_MEASUREMENT_ID),
 *    we load gtag.js and forward the same events to GA4.
 *  - If neither ID is set, the dataLayer pushes still happen (harmless) but no
 *    network calls are made — so nothing breaks in dev / before go-live.
 *
 * Event names follow the GA4 recommended ecommerce schema:
 *   https://developers.google.com/analytics/devguides/collection/ga4/ecommerce
 */

import {
  GTM_CONTAINER_ID,
  GA4_MEASUREMENT_ID,
  ANALYTICS_CURRENCY,
} from "@/config";

let initialized = false;

function getDataLayer() {
  if (typeof window === "undefined") return [];
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

/**
 * Inject Google Tag Manager (container) script.
 */
function loadGtm(containerId) {
  if (document.getElementById("gtm-script")) return;
  const dl = getDataLayer();
  dl.push({ "gtm.start": Date.now(), event: "gtm.js" });

  const script = document.createElement("script");
  script.id = "gtm-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
  document.head.appendChild(script);

  // <noscript> iframe fallback for users with JS disabled
  const noscript = document.createElement("noscript");
  const iframe = document.createElement("iframe");
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${containerId}`;
  iframe.height = "0";
  iframe.width = "0";
  iframe.style.display = "none";
  iframe.style.visibility = "hidden";
  noscript.appendChild(iframe);
  document.body.insertBefore(noscript, document.body.firstChild);
}

/**
 * Inject direct GA4 gtag.js script.
 */
function loadGtag(measurementId) {
  if (document.getElementById("gtag-script")) return;
  const script = document.createElement("script");
  script.id = "gtag-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  const dl = getDataLayer();
  // gtag() pushes its arguments object onto the dataLayer
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    dl.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId);
}

/**
 * Call once at app startup.
 */
export function initAnalytics() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  getDataLayer(); // ensure it exists before anything pushes

  if (GTM_CONTAINER_ID) {
    loadGtm(GTM_CONTAINER_ID);
  } else if (GA4_MEASUREMENT_ID) {
    loadGtag(GA4_MEASUREMENT_ID);
  }
  // If neither is set, dataLayer still works; events just queue up.
}

/**
 * Low-level push. Clears the previous `ecommerce` object first (GA4 best
 * practice) so stale items don't leak between events.
 */
export function pushEvent(eventName, payload = {}) {
  const dl = getDataLayer();
  if (payload.ecommerce) {
    dl.push({ ecommerce: null });
  }
  dl.push({ event: eventName, ...payload });
}

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function buildItems({ roomName, price, quantity, nights }) {
  return [
    {
      item_name: roomName || "Geodesic Dome",
      item_category: "Lodge booking",
      price: toNumber(price),
      quantity: toNumber(quantity) || 1,
      ...(nights ? { item_variant: `${nights} night(s)` } : {}),
    },
  ];
}

/**
 * Fire when a user reaches the payment step.
 */
export function trackBeginCheckout({ value, roomName, pods, nights } = {}) {
  pushEvent("begin_checkout", {
    ecommerce: {
      currency: ANALYTICS_CURRENCY,
      value: toNumber(value),
      items: buildItems({ roomName, price: value, quantity: pods, nights }),
    },
  });
}

/**
 * Fire ONCE on a confirmed/paid booking. Deduplicated per transaction id via
 * sessionStorage so a page refresh on the success screen won't double-count.
 */
export function trackPurchase({
  transactionId,
  value,
  roomName,
  pods,
  nights,
  tax,
} = {}) {
  if (!transactionId) return;

  const dedupeKey = `ga4_purchase_${transactionId}`;
  try {
    if (sessionStorage.getItem(dedupeKey)) return;
    sessionStorage.setItem(dedupeKey, "1");
  } catch {
    // sessionStorage unavailable — fall through and still fire once
  }

  pushEvent("purchase", {
    ecommerce: {
      transaction_id: transactionId,
      currency: ANALYTICS_CURRENCY,
      value: toNumber(value),
      ...(tax ? { tax: toNumber(tax) } : {}),
      items: buildItems({ roomName, price: value, quantity: pods, nights }),
    },
  });
}

/**
 * Generic passthrough for any custom event the marketer asks for later.
 */
export function trackEvent(eventName, params = {}) {
  pushEvent(eventName, params);
}

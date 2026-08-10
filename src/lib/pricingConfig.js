import { BASE_URL } from "@/config";

/**
 * Safe fallback used only if /config/pricing cannot be reached.
 * Must include peak + off-peak fields so we never silently charge
 * a flat legacy rate for every night (the 400k×nights bug).
 */
export const FALLBACK_PRICING_CONFIG = {
  basePricePerPod: 300000,
  extraGuestFee: 200000,
  basePricePerPodOffPeak: 300000,
  basePricePerPodPeak: 325000,
  extraGuestFeeOffPeak: 200000,
  extraGuestFeePeak: 225000,
  maxGuestsPerPod: 2,
  minGuestsPerPod: 1,
  totalPodsAvailable: 6,
  twelveGuestDiscountPercent: 0,
  currency: "NGN",
};

function numOrNull(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** True when draft has usable peak + off-peak nightly rates. */
export function isPricingConfigComplete(config) {
  if (!config || typeof config !== "object") return false;
  const peak = numOrNull(
    config.basePricePerPodPeak ?? config.base_price_per_pod_peak,
  );
  const offPeak = numOrNull(
    config.basePricePerPodOffPeak ?? config.base_price_per_pod_off_peak,
  );
  return peak != null && peak > 0 && offPeak != null && offPeak > 0;
}

/**
 * Normalize API or partial config into the draft shape used by stayPricing.
 */
export function normalizePricingConfig(data = {}) {
  const legacyBase =
    numOrNull(data.basePricePerPod ?? data.base_price_per_pod) ??
    FALLBACK_PRICING_CONFIG.basePricePerPod;
  const legacyExtra =
    numOrNull(data.extraGuestFee ?? data.extra_guest_fee) ??
    FALLBACK_PRICING_CONFIG.extraGuestFee;

  const offPeakBase =
    numOrNull(
      data.basePricePerPodOffPeak ?? data.base_price_per_pod_off_peak,
    ) ?? legacyBase;
  const peakBase =
    numOrNull(data.basePricePerPodPeak ?? data.base_price_per_pod_peak) ??
    legacyBase;
  const offPeakExtra =
    numOrNull(data.extraGuestFeeOffPeak ?? data.extra_guest_fee_off_peak) ??
    legacyExtra;
  const peakExtra =
    numOrNull(data.extraGuestFeePeak ?? data.extra_guest_fee_peak) ??
    legacyExtra;

  return {
    basePricePerPod: legacyBase,
    extraGuestFee: legacyExtra,
    basePricePerPodOffPeak: offPeakBase,
    basePricePerPodPeak: peakBase,
    extraGuestFeeOffPeak: offPeakExtra,
    extraGuestFeePeak: peakExtra,
    maxGuestsPerPod:
      numOrNull(data.maxGuestsPerPod ?? data.max_guests_per_pod) ??
      FALLBACK_PRICING_CONFIG.maxGuestsPerPod,
    minGuestsPerPod:
      numOrNull(data.minGuestsPerPod ?? data.min_guests_per_pod) ??
      FALLBACK_PRICING_CONFIG.minGuestsPerPod,
    totalPodsAvailable:
      numOrNull(data.totalPodsAvailable ?? data.total_pods_available) ??
      FALLBACK_PRICING_CONFIG.totalPodsAvailable,
    twelveGuestDiscountPercent:
      numOrNull(
        data.twelveGuestDiscountPercent ?? data.twelve_guest_discount_percent,
      ) ?? FALLBACK_PRICING_CONFIG.twelveGuestDiscountPercent,
    currency: data.currency || FALLBACK_PRICING_CONFIG.currency,
  };
}

export async function fetchPricingConfig() {
  const response = await fetch(`${BASE_URL}/config/pricing`);
  if (!response.ok) {
    throw new Error(`Pricing config HTTP ${response.status}`);
  }
  const data = await response.json();
  return normalizePricingConfig(data);
}

/**
 * Load pricing from API into the booking draft.
 * Always refreshes from the server so stale sessionStorage / incomplete
 * drafts cannot keep flat legacy rates (the 400k×nights bug).
 * @returns {Promise<object>} normalized pricingConfig
 */
export async function ensurePricingConfig(bookingStore) {
  try {
    const pricingConfig = await fetchPricingConfig();
    bookingStore.updateDraft({ pricingConfig });
    return pricingConfig;
  } catch (err) {
    console.error("Failed to load pricing configuration:", err);
    const current = bookingStore?.draft?.pricingConfig;
    const pricingConfig = isPricingConfigComplete(current)
      ? normalizePricingConfig(current)
      : { ...FALLBACK_PRICING_CONFIG };
    bookingStore.updateDraft({ pricingConfig });
    return pricingConfig;
  }
}

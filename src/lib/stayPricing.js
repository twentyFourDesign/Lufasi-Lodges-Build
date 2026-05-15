/** Mirrors backend utils/weekdayPeakPricing.js for booking UI totals */

function parseLocalDate(dateInput) {
  if (!dateInput) return null;
  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    return new Date(
      dateInput.getFullYear(),
      dateInput.getMonth(),
      dateInput.getDate(),
    );
  }
  const str = String(dateInput).slice(0, 10);
  const [y, m, d] = str.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function isWeekdayPeakNight(date) {
  const day = date.getDay();
  return day === 5 || day === 6;
}

function iterStayNights(checkIn, checkOut) {
  const start = parseLocalDate(checkIn);
  const end = parseLocalDate(checkOut);
  if (!start || !end || start >= end) return [];

  const nights = [];
  const cur = new Date(start);
  while (cur < end) {
    nights.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return nights;
}

function toYmd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function getNightRatesFromConfig(config, isPeakNight) {
  const legacyBase = num(
    config?.basePricePerPod ?? config?.base_price_per_pod,
    400000,
  );
  const legacyExtra = num(
    config?.extraGuestFee ?? config?.extra_guest_fee,
    100000,
  );

  if (isPeakNight) {
    return {
      basePerPod: num(
        config?.basePricePerPodPeak ?? config?.base_price_per_pod_peak,
        legacyBase,
      ),
      extraGuestFee: num(
        config?.extraGuestFeePeak ?? config?.extra_guest_fee_peak,
        legacyExtra,
      ),
    };
  }

  return {
    basePerPod: num(
      config?.basePricePerPodOffPeak ?? config?.base_price_per_pod_off_peak,
      legacyBase,
    ),
    extraGuestFee: num(
      config?.extraGuestFeeOffPeak ?? config?.extra_guest_fee_off_peak,
      legacyExtra,
    ),
  };
}

function getSeasonalPercentForDate(dateYmd, seasonalRates) {
  if (!seasonalRates?.length) return 0;

  let best = null;
  for (const rate of seasonalRates) {
    if (rate.isActive === false) continue;
    if (rate.startDate <= dateYmd && rate.endDate >= dateYmd) {
      const pct = Number(rate.percentageAdjustment) || 0;
      if (
        !best ||
        Math.abs(pct) > Math.abs(Number(best.percentageAdjustment))
      ) {
        best = rate;
      }
    }
  }
  return best ? Number(best.percentageAdjustment) : 0;
}

export function calculateStayRoomSubtotal({
  checkIn,
  checkOut,
  podsCount,
  guestsCount,
  pricingConfig = {},
  seasonalRates = [],
}) {
  const pods = podsCount < 1 ? 1 : podsCount;
  const totalGuests = guestsCount < 1 ? 1 : guestsCount;
  const extraGuests = totalGuests > pods ? totalGuests - pods : 0;

  const nights = iterStayNights(checkIn, checkOut);
  if (!nights.length) {
    return { subtotal: 0, peakNights: 0, offPeakNights: 0, nights: 0 };
  }

  let subtotal = 0;
  let peakNights = 0;
  let offPeakNights = 0;

  for (const nightDate of nights) {
    const ymd = toYmd(nightDate);
    const isPeak = isWeekdayPeakNight(nightDate);
    const { basePerPod, extraGuestFee } = getNightRatesFromConfig(
      pricingConfig,
      isPeak,
    );
    const seasonalPct = getSeasonalPercentForDate(ymd, seasonalRates);
    const multiplier = 1 + seasonalPct / 100;

    const nightBase = pods * basePerPod * multiplier;
    const nightExtra = extraGuests * extraGuestFee * multiplier;
    subtotal += nightBase + nightExtra;
    if (isPeak) peakNights += 1;
    else offPeakNights += 1;
  }

  return { subtotal, peakNights, offPeakNights, nights: nights.length };
}

/** Alcohol is included in published stay rates. Opting out credits this amount. */
export const ALCOHOL_PACKAGE_PER_ADULT_PER_NIGHT = 45000;

export function isAlcoholPackageIncluded(value) {
  return value !== false;
}

export function getAlcoholPackageAdultCount(guests = {}) {
  return Math.max(0, Number(guests.adults) || 0);
}

export function getStayNightCount(draft = {}) {
  const fromDraft = Number(draft.numberOfNights);
  if (Number.isFinite(fromDraft) && fromDraft > 0) return fromDraft;

  const checkIn = draft.dates?.checkIn;
  const checkOut = draft.dates?.checkOut;
  if (!checkIn || !checkOut) return 0;

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;

  const nights = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 0;
}

export function calculateAlcoholPackageAmount({ guests, nights } = {}) {
  const adults = getAlcoholPackageAdultCount(guests);
  const n = Math.max(0, Number(nights) || 0);
  return adults * n * ALCOHOL_PACKAGE_PER_ADULT_PER_NIGHT;
}

/** Credit applied when the guest removes the included alcohol package. */
export function calculateAlcoholOptOutCredit({
  alcoholPackageIncluded,
  guests,
  nights,
} = {}) {
  if (isAlcoholPackageIncluded(alcoholPackageIncluded)) return 0;
  return calculateAlcoholPackageAmount({ guests, nights });
}

export function getAlcoholPackageSummary({
  alcoholPackageIncluded,
  guests,
  nights,
} = {}) {
  const adults = getAlcoholPackageAdultCount(guests);
  const included = isAlcoholPackageIncluded(alcoholPackageIncluded);
  const amount = calculateAlcoholPackageAmount({ guests, nights });
  const credit = included ? 0 : amount;

  return {
    included,
    adults,
    nights: Math.max(0, Number(nights) || 0),
    perAdultPerNight: ALCOHOL_PACKAGE_PER_ADULT_PER_NIGHT,
    amount,
    credit,
  };
}

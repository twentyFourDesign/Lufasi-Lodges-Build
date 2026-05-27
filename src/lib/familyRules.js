export function normalizeFamilyGuests(guests = {}) {
  return {
    adults: Number(guests.adults) || 0,
    teenagers: Number(guests.teenagers) || 0,
    toddlers: Number(guests.toddlers) || 0,
    children: Number(guests.children) || 0,
    infants: Number(guests.infants) || 0,
  };
}

export function hasUnder13Guests(guests = {}) {
  const g = normalizeFamilyGuests(guests);
  return g.infants + g.toddlers + g.children > 0;
}

export function getBillableGuestCount(guests = {}) {
  const g = normalizeFamilyGuests(guests);
  return g.adults + g.teenagers + g.toddlers + g.children;
}

export function getDisplayGuestCount(guests = {}) {
  const g = normalizeFamilyGuests(guests);
  return g.adults + g.teenagers + g.toddlers + g.children + g.infants;
}

export function isFamilyCompositionAllowed(guests = {}, podCount = 1) {
  const g = normalizeFamilyGuests(guests);
  const pods = Number(podCount) || 1;
  const adultRateGuests = g.adults + g.teenagers;
  const childLikeGuests = g.toddlers + g.children;

  if (pods < 1 || pods > 6) return false;
  if (adultRateGuests < 1) return false;
  if (adultRateGuests > pods * 2) return false;
  if (g.infants > pods) return false;
  // At least one adult/teen per dome (no unsupervised children).
  if (adultRateGuests < pods) return false;
  // At least one billable (non-infant) guest per dome.
  if (adultRateGuests + childLikeGuests < pods) return false;

  // Explicit client rule: 2 adults + 2 children (4-12) must take 2 domes.
  if (adultRateGuests >= 2 && g.children >= 2 && pods < 2) return false;

  // Explicit client rule: 1 adult + 2 children (4-12) may stay in 1 dome.
  if (pods === 1 && adultRateGuests === 1 && g.children === 2 && g.toddlers === 0) {
    return g.infants <= 1;
  }

  // Recommended interpretation: toddlers count like children for capacity.
  return childLikeGuests <= pods;
}

/**
 * Returns the smallest pod count (1-6) that satisfies all family-occupancy rules
 * for the given composition, or null if no valid pod count exists.
 */
export function findMinValidPodCount(guests = {}) {
  for (let p = 1; p <= 6; p += 1) {
    if (isFamilyCompositionAllowed(guests, p)) return p;
  }
  return null;
}

/**
 * Returns the largest pod count (1-6) that satisfies all family-occupancy rules
 * for the given composition, capped at `availablePods`. Useful for the dome
 * selection step.
 */
export function findMaxValidPodCount(guests = {}, availablePods = 6) {
  const cap = Math.min(6, Math.max(1, Number(availablePods) || 6));
  let best = null;
  for (let p = 1; p <= cap; p += 1) {
    if (isFamilyCompositionAllowed(guests, p)) best = p;
  }
  return best;
}

/**
 * Max number of pop-up beds the composition may book.
 * Per rule 1: only 1 child (4-12) is allowed per dome, so a pop-up bed
 * is meaningful only when there are children-like guests (toddlers + children)
 * who would otherwise share the king bed. Capped by pods.
 */
export function getMaxPopUpBeds(guests = {}, podCount = 1) {
  const g = normalizeFamilyGuests(guests);
  const pods = Math.max(1, Number(podCount) || 1);
  return Math.min(pods, g.toddlers + g.children);
}


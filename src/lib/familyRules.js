import { isAllowedGuestCombination } from "./allowedGuestCombinations";

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

export { isAllowedGuestCombination } from "./allowedGuestCombinations";

export function isFamilyCompositionAllowed(guests = {}, podCount = 1) {
  const g = normalizeFamilyGuests(guests);
  const pods = Number(podCount) || 1;
  const billable = getBillableGuestCount(guests);
  const childLikeGuests = g.toddlers + g.children;
  const oneAdultTwoChildrenOnePod =
    pods === 1 &&
    g.adults === 1 &&
    g.teenagers === 0 &&
    g.children === 2 &&
    g.toddlers === 0;

  if (!isAllowedGuestCombination(g)) return false;
  if (pods < 1 || pods > 6) return false;
  if (g.adults + g.teenagers < 1) return false;
  if (billable > pods * 2 && !oneAdultTwoChildrenOnePod) return false;
  if (billable < pods) return false;
  if (g.infants > pods) return false;

  if (oneAdultTwoChildrenOnePod) {
    return g.infants <= 1;
  }

  return childLikeGuests <= pods;
}

/**
 * Returns the smallest pod count (1-6) that satisfies all family-occupancy rules
 * for the given composition, or null if no valid pod count exists.
 */
export function findMinValidPodCount(guests = {}) {
  if (!isAllowedGuestCombination(normalizeFamilyGuests(guests))) return null;
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
  if (!isAllowedGuestCombination(normalizeFamilyGuests(guests))) return null;
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

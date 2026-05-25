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

  // Explicit client rule: 2 adults + 2 children (4-12) must take 2 domes.
  if (adultRateGuests >= 2 && g.children >= 2 && pods < 2) return false;

  // Explicit client rule: 1 adult + 2 children (4-12) may stay in 1 dome.
  if (pods === 1 && adultRateGuests === 1 && g.children === 2 && g.toddlers === 0) {
    return g.infants <= 1;
  }

  // Recommended interpretation: toddlers count like children for capacity.
  return childLikeGuests <= pods;
}


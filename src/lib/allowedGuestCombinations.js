/**
 * Client-approved guest mixes (adults, teens, children, toddlers, infants).
 * Only these exact combinations may book.
 */

function guestCombinationKey(guests) {
  return [
    Number(guests.adults) || 0,
    Number(guests.teenagers) || 0,
    Number(guests.children) || 0,
    Number(guests.toddlers) || 0,
    Number(guests.infants) || 0,
  ].join(",");
}

/** adults, teenagers, children, toddlers, infants */
const ALLOWED_GUEST_COMBINATION_KEYS = new Set([
  // 3 billable + infant
  "2,1,0,0,1",
  "2,0,1,0,1",
  "2,0,0,1,1",
  "1,2,0,0,1",
  "1,0,2,0,1",
  "1,0,0,2,1",
  "1,1,1,0,1",
  "1,1,0,1,1",
  "1,0,1,1,1",
  // 3 billable
  "2,1,0,0,0",
  "2,0,1,0,0",
  "2,0,0,1,0",
  "1,2,0,0,0",
  "1,0,2,0,0",
  "1,0,0,2,0",
  "1,1,1,0,0",
  "1,1,0,1,0",
  "1,0,1,1,0",
  // 2 billable + infant
  "2,0,0,0,1",
  "1,1,0,0,1",
  "1,0,1,0,1",
  "1,0,0,1,1",
  // 2 billable
  "0,2,0,0,0",
  "2,0,0,0,0",
  "1,1,0,0,0",
  "1,0,1,0,0",
  "1,0,0,1,0",
  // teen-led (3 billable)
  "0,2,1,0,0",
  "0,2,0,1,0",
  "0,1,2,0,0",
  "0,1,0,2,0",
  "0,1,1,1,0",
  "0,1,1,0,0",
  "0,1,0,1,0",
  // 1 billable + infant
  "1,0,0,0,1",
  "0,1,0,0,1",
  // 1 billable
  "1,0,0,0,0",
  "0,1,0,0,0",
]);

export function isAllowedGuestCombination(guests = {}) {
  return ALLOWED_GUEST_COMBINATION_KEYS.has(guestCombinationKey(guests));
}

export function getAllowedGuestCombinationCount() {
  return ALLOWED_GUEST_COMBINATION_KEYS.size;
}

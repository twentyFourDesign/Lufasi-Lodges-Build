/** Mirrors backend utils/podGuestPricing.js */

const TEEN_RATE_MULTIPLIER = 0.75;
const CHILD_RATE_MULTIPLIER = 0.5;
const TODDLER_RATE_MULTIPLIER = 0.25;

const BILLABLE_PRIORITY = {
  adult: 0,
  teen: 1,
  child: 2,
  toddler: 3,
};

function getAgeMultiplier(guestType) {
  if (guestType === "teen") return TEEN_RATE_MULTIPLIER;
  if (guestType === "child") return CHILD_RATE_MULTIPLIER;
  if (guestType === "toddler") return TODDLER_RATE_MULTIPLIER;
  return 1;
}

function isOneAdultTwoChildrenOnePod(guests, podCount) {
  return (
    podCount === 1 &&
    guests.adults === 1 &&
    guests.teenagers === 0 &&
    guests.children === 2 &&
    guests.toddlers === 0
  );
}

export function allocateGuestsToPods(guests, podCount) {
  const pods = Array.from({ length: podCount }, () => []);
  let adults = guests.adults;
  let teens = guests.teenagers;
  let children = guests.children;
  let toddlers = guests.toddlers;
  let infants = guests.infants;
  const allowTripleOccupancy = isOneAdultTwoChildrenOnePod(guests, podCount);

  const pushToPod = (p, type) => {
    if (p < 0 || p >= podCount) return false;
    const billable = pods[p].filter((g) => g !== "infant").length;
    const maxBillable = allowTripleOccupancy && p === 0 ? 3 : 2;
    if (type === "infant") {
      if (pods[p].filter((g) => g === "infant").length >= 1) return false;
      pods[p].push("infant");
      return true;
    }
    if (billable >= maxBillable) return false;
    pods[p].push(type);
    return true;
  };

  for (let p = 0; p < podCount && adults > 0; p++) {
    pushToPod(p, "adult");
    adults--;
  }

  while (adults > 0) {
    let placed = false;
    for (let p = 0; p < podCount && adults > 0; p++) {
      if (pushToPod(p, "adult")) {
        adults--;
        placed = true;
      }
    }
    if (!placed) break;
  }

  while (teens > 0) {
    let placed = false;
    for (let p = 0; p < podCount && teens > 0; p++) {
      if (pods[p].filter((g) => g !== "infant").length === 0) {
        pushToPod(p, "teen");
        teens--;
        placed = true;
      }
    }
    if (!placed) {
      for (let p = 0; p < podCount && teens > 0; p++) {
        if (pushToPod(p, "teen")) {
          teens--;
          placed = true;
        }
      }
    }
    if (!placed) break;
  }

  while (children > 0) {
    let placed = false;
    for (let p = 0; p < podCount && children > 0; p++) {
      if (pods[p].filter((g) => g !== "infant").length === 0) {
        pushToPod(p, "child");
        children--;
        placed = true;
      }
    }
    if (!placed) {
      for (let p = 0; p < podCount && children > 0; p++) {
        if (pushToPod(p, "child")) {
          children--;
          placed = true;
        }
      }
    }
    if (!placed) break;
  }

  while (toddlers > 0) {
    let placed = false;
    for (let p = 0; p < podCount && toddlers > 0; p++) {
      if (pods[p].filter((g) => g !== "infant").length === 0) {
        pushToPod(p, "toddler");
        toddlers--;
        placed = true;
      }
    }
    if (!placed) {
      for (let p = 0; p < podCount && toddlers > 0; p++) {
        if (pushToPod(p, "toddler")) {
          toddlers--;
          placed = true;
        }
      }
    }
    if (!placed) break;
  }

  while (infants > 0) {
    let placed = false;
    for (let p = 0; p < podCount && infants > 0; p++) {
      if (pushToPod(p, "infant")) {
        infants--;
        placed = true;
      }
    }
    if (!placed) break;
  }

  return pods;
}

export function calculatePodNightCharge(podGuests, basePerPod, extraGuestFee) {
  const billable = podGuests.filter((g) => g !== "infant");
  if (billable.length === 0) {
    return {
      total: 0,
      base: 0,
      extraAdult: 0,
      teenExtra: 0,
      childExtra: 0,
      toddlerExtra: 0,
      aloneTeen: false,
    };
  }

  let charge = basePerPod;
  let extraAdult = 0;
  let teenExtra = 0;
  let childExtra = 0;
  let toddlerExtra = 0;

  if (billable.length === 1) {
    const only = billable[0];
    return {
      total: charge,
      base: basePerPod,
      extraAdult: 0,
      teenExtra: 0,
      childExtra: 0,
      toddlerExtra: 0,
      aloneTeen: only === "teen",
    };
  }

  const sorted = [...billable].sort(
    (a, b) => (BILLABLE_PRIORITY[a] ?? 9) - (BILLABLE_PRIORITY[b] ?? 9),
  );

  for (let i = 1; i < sorted.length; i++) {
    const guestType = sorted[i];
    const mult = getAgeMultiplier(guestType);
    const extra = extraGuestFee * mult;
    charge += extra;

    if (guestType === "teen") teenExtra += extra;
    else if (guestType === "child") childExtra += extra;
    else if (guestType === "toddler") toddlerExtra += extra;
    else extraAdult += extra;
  }

  return {
    total: charge,
    base: basePerPod,
    extraAdult,
    teenExtra,
    childExtra,
    toddlerExtra,
    aloneTeen: false,
  };
}

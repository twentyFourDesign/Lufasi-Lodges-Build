import { allocateGuestsToPods } from "./podGuestPricing";
import { normalizeFamilyGuests } from "./familyRules";

export const GUEST_TYPE_LABELS = {
  adult: "Adult (18+)",
  teen: "Teen (13 to 18)",
  child: "Child (4 to 12)",
  toddler: "Toddler (1 to 3)",
  infant: "Infant (0 to 1)",
};

export const GUEST_TYPE_ORDER = ["adult", "teen", "child", "toddler", "infant"];

export function guestPoolFromCounts(guests = {}) {
  const g = normalizeFamilyGuests(guests);
  return {
    adult: g.adults,
    teen: g.teenagers,
    child: g.children,
    toddler: g.toddlers,
    infant: g.infants,
  };
}

export function countTypesInPod(podGuests = []) {
  const counts = { adult: 0, teen: 0, child: 0, toddler: 0, infant: 0 };
  for (const type of podGuests) {
    if (counts[type] != null) counts[type] += 1;
  }
  return counts;
}

export function countTypesAcrossPods(podAllocation = []) {
  const totals = { adult: 0, teen: 0, child: 0, toddler: 0, infant: 0 };
  for (const pod of podAllocation) {
    const podCounts = countTypesInPod(pod);
    for (const key of GUEST_TYPE_ORDER) {
      totals[key] += podCounts[key];
    }
  }
  return totals;
}

export function isOneAdultTwoChildrenOnePod(guests, podCount) {
  const g = normalizeFamilyGuests(guests);
  return (
    podCount === 1 &&
    g.adults === 1 &&
    g.teenagers === 0 &&
    g.children === 2 &&
    g.toddlers === 0
  );
}

export function canAddGuestToPod(podGuests, type, guests, podCount, podIndex) {
  if (!GUEST_TYPE_ORDER.includes(type)) return false;
  const billable = podGuests.filter((g) => g !== "infant").length;
  const allowTriple =
    isOneAdultTwoChildrenOnePod(guests, podCount) && podIndex === 0;
  const maxBillable = allowTriple ? 3 : 2;

  if (type === "infant") {
    return podGuests.filter((g) => g === "infant").length < 1;
  }
  return billable < maxBillable;
}

export function getRemainingGuestPool(guests, podAllocation) {
  const expected = guestPoolFromCounts(guests);
  const assigned = countTypesAcrossPods(podAllocation);
  const remaining = {};
  for (const key of GUEST_TYPE_ORDER) {
    remaining[key] = Math.max(0, expected[key] - assigned[key]);
  }
  return remaining;
}

export function podAllocationFromDomeDetails(domeDetails) {
  if (!Array.isArray(domeDetails) || domeDetails.length === 0) return null;
  const allocation = domeDetails.map((d) =>
    Array.isArray(d.guestTypes) ? [...d.guestTypes] : [],
  );
  if (!allocation.some((pod) => pod.length > 0)) return null;
  return allocation;
}

export function validatePodAllocation(podAllocation, guests, podCount) {
  const errors = [];
  const g = normalizeFamilyGuests(guests);
  const expected = guestPoolFromCounts(g);
  const assigned = countTypesAcrossPods(podAllocation);

  for (const key of GUEST_TYPE_ORDER) {
    if (assigned[key] !== expected[key]) {
      errors.push(
        `Assign all ${GUEST_TYPE_LABELS[key]} (${expected[key]} needed, ${assigned[key]} placed).`,
      );
    }
  }

  const pods = Number(podCount) || 1;
  for (let i = 0; i < podAllocation.length; i++) {
    const pod = podAllocation[i] || [];
    const billable = pod.filter((t) => t !== "infant").length;
    const allowTriple = isOneAdultTwoChildrenOnePod(g, pods) && i === 0;
    const maxBillable = allowTriple ? 3 : 2;
    if (billable > maxBillable) {
      errors.push(`Dome ${i + 1} has too many guests.`);
    }
    if (pod.filter((t) => t === "infant").length > 1) {
      errors.push(`Dome ${i + 1} can only have one infant.`);
    }
  }

  if (
    g.infants + g.toddlers + g.children > 0 &&
    g.adults < 1
  ) {
    errors.push("An adult must be in the booking when traveling with children.");
  }

  return { valid: errors.length === 0, errors };
}

export function isGuestAllocationComplete(domeDetails, guests, podCount) {
  const allocation = podAllocationFromDomeDetails(domeDetails);
  if (!allocation) return false;
  return validatePodAllocation(allocation, guests, podCount).valid;
}

export function applyDefaultGuestAllocation(domeDetails, guests, podCount) {
  const g = normalizeFamilyGuests(guests);
  const pods = Number(podCount) || 1;
  const allocation = allocateGuestsToPods(g, pods);
  return domeDetails.map((dome, index) => ({
    ...dome,
    guestTypes: allocation[index] || [],
  }));
}

export function tryAssignGuestToDome(
  domeDetails,
  type,
  toDomeIdx,
  guests,
  podCount,
) {
  const podGuests = [...(domeDetails[toDomeIdx]?.guestTypes || [])];
  if (!canAddGuestToPod(podGuests, type, guests, podCount, toDomeIdx)) {
    return null;
  }
  return domeDetails.map((dome, i) =>
    i === toDomeIdx
      ? { ...dome, guestTypes: [...(dome.guestTypes || []), type] }
      : dome,
  );
}

export function tryMoveGuestBetweenDomes(
  domeDetails,
  fromDomeIdx,
  guestIdx,
  toDomeIdx,
  guests,
  podCount,
) {
  if (fromDomeIdx === toDomeIdx) return null;
  const type = domeDetails[fromDomeIdx]?.guestTypes?.[guestIdx];
  if (!type) return null;

  const targetPod = [...(domeDetails[toDomeIdx]?.guestTypes || [])];
  if (!canAddGuestToPod(targetPod, type, guests, podCount, toDomeIdx)) {
    return null;
  }

  return domeDetails.map((dome, i) => {
    if (i === fromDomeIdx) {
      const types = [...(dome.guestTypes || [])];
      types.splice(guestIdx, 1);
      return { ...dome, guestTypes: types };
    }
    if (i === toDomeIdx) {
      return { ...dome, guestTypes: [...(dome.guestTypes || []), type] };
    }
    return dome;
  });
}

export function tryRemoveGuestFromDome(domeDetails, fromDomeIdx, guestIdx) {
  const type = domeDetails[fromDomeIdx]?.guestTypes?.[guestIdx];
  if (!type) return null;
  return domeDetails.map((dome, i) => {
    if (i !== fromDomeIdx) return dome;
    const types = [...(dome.guestTypes || [])];
    types.splice(guestIdx, 1);
    return { ...dome, guestTypes: types };
  });
}

function domeLabel(domeDetails, domeIdx) {
  return domeDetails[domeIdx]?.podName || `Dome ${domeIdx + 1}`;
}

/** Human-readable reason a guest cannot move to a target dome, or null if allowed. */
export function getWhyGuestCannotMoveToDome(
  domeDetails,
  fromDomeIdx,
  guestIdx,
  toDomeIdx,
  guests,
  podCount,
) {
  const type = domeDetails[fromDomeIdx]?.guestTypes?.[guestIdx];
  if (!type) return "This guest is not in a dome.";

  const targetPod = [...(domeDetails[toDomeIdx]?.guestTypes || [])];
  const targetName = domeLabel(domeDetails, toDomeIdx);

  if (canAddGuestToPod(targetPod, type, guests, podCount, toDomeIdx)) {
    return null;
  }

  if (type === "infant" && targetPod.filter((g) => g === "infant").length >= 1) {
    return `${targetName} already has an infant. Only one infant per dome.`;
  }

  const billable = targetPod.filter((g) => g !== "infant").length;
  const allowTriple =
    isOneAdultTwoChildrenOnePod(guests, podCount) && toDomeIdx === 0;
  const maxBillable = allowTriple ? 3 : 2;

  if (billable >= maxBillable) {
    return `${targetName} is full. Max ${maxBillable} guest${maxBillable === 1 ? "" : "s"} per dome.`;
  }

  return `Cannot move this guest to ${targetName}.`;
}

/** Whether ↑/↓ is allowed and why not when disabled. */
export function getGuestMoveArrowState(
  domeDetails,
  domeIdx,
  guestIdx,
  direction,
  guests,
  podCount,
) {
  const toDomeIdx = direction === "up" ? domeIdx - 1 : domeIdx + 1;
  const targetName =
    toDomeIdx >= 0 && toDomeIdx < domeDetails.length
      ? domeLabel(domeDetails, toDomeIdx)
      : null;

  if (direction === "up" && domeIdx <= 0) {
    return { canMove: false, reason: "Already in the top dome." };
  }
  if (direction === "down" && domeIdx >= domeDetails.length - 1) {
    return { canMove: false, reason: "Already in the bottom dome." };
  }

  const blockReason = getWhyGuestCannotMoveToDome(
    domeDetails,
    domeIdx,
    guestIdx,
    toDomeIdx,
    guests,
    podCount,
  );
  if (blockReason) {
    return { canMove: false, reason: blockReason };
  }

  return {
    canMove: true,
    reason: `Move to ${targetName}`,
  };
}

export function getWhyGuestCannotAssignToDome(
  domeDetails,
  type,
  toDomeIdx,
  guests,
  podCount,
) {
  const targetPod = [...(domeDetails[toDomeIdx]?.guestTypes || [])];
  const targetName = domeLabel(domeDetails, toDomeIdx);

  if (!canAddGuestToPod(targetPod, type, guests, podCount, toDomeIdx)) {
    if (type === "infant" && targetPod.filter((g) => g === "infant").length >= 1) {
      return `${targetName} already has an infant. Only one infant per dome.`;
    }
    const billable = targetPod.filter((g) => g !== "infant").length;
    const allowTriple =
      isOneAdultTwoChildrenOnePod(guests, podCount) && toDomeIdx === 0;
    const maxBillable = allowTriple ? 3 : 2;
    if (billable >= maxBillable) {
      return `${targetName} is full. Max ${maxBillable} guest${maxBillable === 1 ? "" : "s"} per dome.`;
    }
    return `Cannot add ${GUEST_TYPE_LABELS[type] || type} to ${targetName}.`;
  }
  return null;
}

export function buildUnassignedTypeList(remaining) {
  return GUEST_TYPE_ORDER.flatMap((type) =>
    Array.from({ length: remaining[type] || 0 }, (_, i) => ({
      type,
      key: `${type}-pool-${i}`,
    })),
  );
}

export function buildDomeDetailsWithGuestTypes(
  selectedPodIds,
  availablePods,
  guests,
  podCount,
) {
  const g = normalizeFamilyGuests(guests);
  const pods = Number(podCount) || selectedPodIds.length || 1;
  const allocation = allocateGuestsToPods(g, pods);

  return selectedPodIds.map((id, index) => {
    const pod = availablePods.find((p) => p.id === id);
    return {
      podId: id,
      podName: pod?.title || "Dome",
      bedConfig: "1 x King Bed (6 foot)",
      guests: ["", ""],
      guestTypes: allocation[index] || [],
    };
  });
}

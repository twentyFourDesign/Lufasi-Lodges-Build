import { getDisplayGuestCount, normalizeFamilyGuests } from "@/lib/familyRules";

/** Human-readable selected dome names for booking summaries. */
export function formatSelectedRoomNames(draft = {}) {
  if (Array.isArray(draft.domeDetails) && draft.domeDetails.length > 0) {
    const names = draft.domeDetails.map((d) => d.podName).filter(Boolean);
    if (names.length > 0) return names.join(", ");
  }

  if (
    Array.isArray(draft.selectedPodIds) &&
    draft.selectedPodIds.length > 0 &&
    Array.isArray(draft.availablePods)
  ) {
    const names = draft.selectedPodIds
      .map((id) => draft.availablePods.find((p) => p.id === id)?.title)
      .filter(Boolean);
    if (names.length > 0) return names.join(", ");
  }

  const count = Number(draft.podCount) || 0;
  if (count > 0) {
    return `${count} dome${count === 1 ? "" : "s"}`;
  }

  return "—";
}

export function getGuestCountLabel(guests = {}) {
  const count = getDisplayGuestCount(guests);
  return `${count} Guest${count === 1 ? "" : "s"}`;
}

/** Per-type lines for reservation sidebars (adults always shown). */
export function getGuestSummaryLines(guests = {}, popUpBeds = 0) {
  const g = normalizeFamilyGuests(guests);
  const lines = [
    `${g.adults} Adult${g.adults === 1 ? "" : "s"} (18+)`,
  ];
  if (g.teenagers > 0) {
    lines.push(`${g.teenagers} Teen${g.teenagers === 1 ? "" : "s"} (13–17)`);
  }
  if (g.children > 0) {
    lines.push(
      `${g.children} ${g.children === 1 ? "Child" : "Children"} (4–12)`,
    );
  }
  if (g.toddlers > 0) {
    lines.push(`${g.toddlers} Toddler${g.toddlers === 1 ? "" : "s"} (1–3)`);
  }
  if (g.infants > 0) {
    lines.push(`${g.infants} Infant${g.infants === 1 ? "" : "s"} (0–1)`);
  }
  const beds = Number(popUpBeds) || 0;
  if (beds > 0) {
    lines.push(`+ ${beds} Pop-up bed${beds === 1 ? "" : "s"}`);
  }
  return lines;
}

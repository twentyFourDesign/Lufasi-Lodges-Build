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

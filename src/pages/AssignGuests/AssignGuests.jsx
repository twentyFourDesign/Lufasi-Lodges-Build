import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CommonNavbar from "@/components/shared/common/CommonNavbar/CommonNavbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Home,
  Info,
  Wallet,
  RotateCcw,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import FunnelMobileStickyCta from "@/components/booking/FunnelMobileStickyCta";
import ReservationGuestsCard from "@/components/booking/ReservationGuestsCard";
import { useBookingStore, calculateDynamicSubTotal } from "@/store/useBookingStore";
import { formatDateSafe } from "@/lib/utils";
import { ensurePricingConfig } from "@/lib/pricingConfig";
import {
  GUEST_TYPE_LABELS,
  applyDefaultGuestAllocation,
  buildUnassignedTypeList,
  getGuestMoveArrowState,
  getRemainingGuestPool,
  getWhyGuestCannotAssignToDome,
  getWhyGuestCannotMoveToDome,
  isGuestAllocationComplete,
  podAllocationFromDomeDetails,
  tryAssignGuestToDome,
  tryMoveGuestBetweenDomes,
  tryRemoveGuestFromDome,
  validatePodAllocation,
} from "@/lib/guestAllocation";

const TYPE_BLOCK_STYLES = {
  adult: "bg-[#E6F2EE] text-[#09432B] border-[#B8D4CA]",
  teen: "bg-[#EAF5F0] text-[#1A5C42] border-[#BDD9CE]",
  child: "bg-[#F0F7F3] text-[#2A6B50] border-[#C8E0D4]",
  toddler: "bg-[#F4FAF7] text-[#3A7560] border-[#D0E8DC]",
  infant: "bg-[#FAFCFB] text-[#4A6358] border-[#D8E8E0]",
};

function formatPrice(n) {
  return n.toLocaleString();
}

function ArrowMoveButton({ direction, canMove, reason, onActivate, onBlocked }) {
  const Icon = direction === "up" ? ChevronUp : ChevronDown;
  const label = direction === "up" ? "Move to dome above" : "Move to dome below";

  const handleClick = (e) => {
    e.stopPropagation();
    if (!canMove) {
      onBlocked?.(reason);
      return;
    }
    onActivate?.();
  };

  return (
    <div className="relative group flex flex-col items-center">
      <button
        type="button"
        aria-disabled={!canMove}
        title={reason || label}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={handleClick}
        aria-label={canMove ? label : reason || label}
        className={[
          "w-7 h-7 rounded-md flex items-center justify-center transition-colors",
          canMove
            ? "bg-[#09432B]/10 hover:bg-[#09432B]/18 text-[#09432B] cursor-pointer"
            : "bg-[#09432B]/5 text-[#09432B]/35 cursor-not-allowed",
        ].join(" ")}
      >
        <Icon className="w-4 h-4" />
      </button>
      {reason && (
        <div
          role="tooltip"
          className={[
            "pointer-events-none absolute z-[60] w-48 sm:w-56",
            "bottom-full left-1/2 -translate-x-1/2 mb-2",
            "px-3 py-2 text-[11px] leading-snug rounded-lg",
            "bg-white text-[#4A4A4A] border border-[#D4DED9]",
            "shadow-[0_4px_16px_rgba(9,67,43,0.12)]",
            "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
            "transition-opacity duration-150",
          ].join(" ")}
        >
          {reason}
          <span
            className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0
              border-l-[6px] border-r-[6px] border-t-[6px]
              border-l-transparent border-r-transparent border-t-white"
            aria-hidden
          />
        </div>
      )}
    </div>
  );
}

function GuestBlock({
  type,
  selected,
  dragging,
  showArrows,
  moveUp,
  moveDown,
  onPointerDown,
  onMoveUp,
  onMoveDown,
  onBlockedAction,
  onTap,
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onClick={(e) => {
        e.stopPropagation();
        onTap?.();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onTap?.();
      }}
      className={[
        "guest-block select-none touch-none rounded-xl border-2 px-3 py-3 min-w-[148px] max-w-full",
        "flex items-center gap-2 shadow-sm transition-all duration-150 overflow-visible",
        TYPE_BLOCK_STYLES[type] || "bg-gray-200 text-gray-800",
        dragging ? "opacity-40 scale-95" : "opacity-100",
        selected ? "ring-2 ring-[#B7FFFF] ring-offset-2 ring-offset-[#F7F5F0]" : "",
        "active:scale-[0.98] cursor-grab active:cursor-grabbing",
      ].join(" ")}
    >
      <GripVertical className="w-4 h-4 shrink-0 opacity-70" aria-hidden />
      <span className="text-sm font-semibold leading-tight flex-1">
        {GUEST_TYPE_LABELS[type] || type}
      </span>
      {showArrows && (
        <div className="flex flex-col gap-0.5 shrink-0 overflow-visible">
          <ArrowMoveButton
            direction="up"
            canMove={moveUp?.canMove}
            reason={moveUp?.reason}
            onActivate={onMoveUp}
            onBlocked={onBlockedAction}
          />
          <ArrowMoveButton
            direction="down"
            canMove={moveDown?.canMove}
            reason={moveDown?.reason}
            onActivate={onMoveDown}
            onBlocked={onBlockedAction}
          />
        </div>
      )}
    </div>
  );
}

function DragGhost({ dragState }) {
  if (!dragState?.active) return null;
  const { type, x, y } = dragState;
  return (
    <div
      className="fixed z-[100] pointer-events-none -translate-x-1/2 -translate-y-1/2"
      style={{ left: x, top: y }}
    >
      <div
        className={[
          "rounded-xl border-2 px-4 py-3 shadow-2xl scale-105 rotate-1",
          "flex items-center gap-2 min-w-[148px]",
          TYPE_BLOCK_STYLES[type] || "bg-gray-200",
        ].join(" ")}
      >
        <GripVertical className="w-4 h-4 opacity-70" />
        <span className="text-sm font-semibold">{GUEST_TYPE_LABELS[type]}</span>
      </div>
    </div>
  );
}

export default function AssignGuests() {
  const navigate = useNavigate();
  const bookingStore = useBookingStore();
  const guests = bookingStore.draft.guests || {};
  const podCount = bookingStore.draft.podCount || 1;
  const [validationErrors, setValidationErrors] = useState([]);
  const [dragState, setDragState] = useState(null);
  const [hoverDrop, setHoverDrop] = useState(null);
  const [picked, setPicked] = useState(null);
  const [actionHint, setActionHint] = useState(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);
  const hintTimerRef = useRef(null);

  const showActionHint = useCallback((message) => {
    if (!message) return;
    setActionHint(message);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => setActionHint(null), 4000);
  }, []);

  useEffect(
    () => () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    },
    [],
  );

  const domeDetails = useMemo(() => {
    if (bookingStore.draft.domeDetails?.length) {
      return bookingStore.draft.domeDetails;
    }
    return Array.from({ length: podCount }, (_, i) => ({
      podName: `Dome ${i + 1}`,
      bedConfig: "1 x King Bed (6 foot)",
      guests: ["", ""],
      guestTypes: [],
    }));
  }, [bookingStore.draft.domeDetails, podCount]);

  useEffect(() => {
    if (!bookingStore.draft.dates || !bookingStore.draft.podCount) {
      navigate("/book-your-stay", { replace: true });
      return;
    }
    if (
      !bookingStore.draft.selectedPodIds?.length ||
      bookingStore.draft.selectedPodIds.length !== bookingStore.draft.podCount
    ) {
      navigate("/select-rooms", { replace: true });
    }
  }, [bookingStore.draft, navigate]);

  useEffect(() => {
    ensurePricingConfig(bookingStore);
  }, []);

  useEffect(() => {
    const needsInit =
      !domeDetails.some((d) => Array.isArray(d.guestTypes) && d.guestTypes.length > 0);
    if (needsInit && guests) {
      const updated = applyDefaultGuestAllocation(domeDetails, guests, podCount);
      bookingStore.updateDraft({ domeDetails: updated });
    }
  }, []);

  const podAllocation = useMemo(
    () => podAllocationFromDomeDetails(domeDetails) || domeDetails.map(() => []),
    [domeDetails],
  );

  const remaining = useMemo(
    () => getRemainingGuestPool(guests, podAllocation),
    [guests, podAllocation],
  );

  const unassignedBlocks = useMemo(
    () => buildUnassignedTypeList(remaining),
    [remaining],
  );

  const isComplete = isGuestAllocationComplete(domeDetails, guests, podCount);

  const updateDomeDetails = useCallback(
    (nextDetails) => {
      bookingStore.updateDraft({
        domeDetails: nextDetails,
        subTotal: calculateDynamicSubTotal({
          ...bookingStore.draft,
          domeDetails: nextDetails,
        }),
      });
      const alloc =
        podAllocationFromDomeDetails(nextDetails) || nextDetails.map(() => []);
      const { errors } = validatePodAllocation(alloc, guests, podCount);
      setValidationErrors(errors);
    },
    [bookingStore, guests, podCount],
  );

  const resolveDropTarget = useCallback((clientX, clientY) => {
    const el = document.elementFromPoint(clientX, clientY);
    const zone = el?.closest("[data-drop-zone]");
    if (!zone) return null;
    const zoneId = zone.getAttribute("data-drop-zone");
    if (zoneId === "unassigned") return { kind: "unassigned" };
    const domeIdx = zone.getAttribute("data-dome-idx");
    if (domeIdx != null) return { kind: "dome", domeIdx: Number(domeIdx) };
    return null;
  }, []);

  const applyDrop = useCallback(
    (source, target) => {
      if (!target) return;

      if (source.kind === "pool") {
        if (target.kind !== "dome") return;
        const next = tryAssignGuestToDome(
          domeDetails,
          source.type,
          target.domeIdx,
          guests,
          podCount,
        );
        if (next) {
          updateDomeDetails(next);
        } else {
          showActionHint(
            getWhyGuestCannotAssignToDome(
              domeDetails,
              source.type,
              target.domeIdx,
              guests,
              podCount,
            ) || "Cannot place this guest in that dome.",
          );
        }
        return;
      }

      if (source.kind === "dome") {
        if (target.kind === "unassigned") {
          const next = tryRemoveGuestFromDome(
            domeDetails,
            source.domeIdx,
            source.guestIdx,
          );
          if (next) updateDomeDetails(next);
          return;
        }
        if (target.kind === "dome") {
          const next = tryMoveGuestBetweenDomes(
            domeDetails,
            source.domeIdx,
            source.guestIdx,
            target.domeIdx,
            guests,
            podCount,
          );
          if (next) {
            updateDomeDetails(next);
          } else {
            showActionHint(
              getWhyGuestCannotMoveToDome(
                domeDetails,
                source.domeIdx,
                source.guestIdx,
                target.domeIdx,
                guests,
                podCount,
              ) || "Cannot move this guest to that dome.",
            );
          }
        }
      }
    },
    [domeDetails, guests, podCount, updateDomeDetails, showActionHint],
  );

  const startDrag = useCallback((e, payload) => {
    e.preventDefault();
    const point = { x: e.clientX, y: e.clientY };
    dragRef.current = { ...payload, startX: point.x, startY: point.y, moved: false };
    setDragState({ active: true, type: payload.type, x: point.x, y: point.y });
    setPicked(null);

    const onMove = (ev) => {
      const cx = ev.clientX;
      const cy = ev.clientY;
      if (dragRef.current) {
        const dx = Math.abs(cx - dragRef.current.startX);
        const dy = Math.abs(cy - dragRef.current.startY);
        if (dx > 6 || dy > 6) dragRef.current.moved = true;
      }
      setDragState((prev) =>
        prev ? { ...prev, x: cx, y: cy } : prev,
      );
      const target = resolveDropTarget(cx, cy);
      setHoverDrop(target);
    };

    const onUp = (ev) => {
      const cx = ev.clientX;
      const cy = ev.clientY;
      const target = resolveDropTarget(cx, cy);
      if (dragRef.current?.moved) {
        suppressClickRef.current = true;
        applyDrop(dragRef.current, target);
      }
      dragRef.current = null;
      setDragState(null);
      setHoverDrop(null);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }, [applyDrop, resolveDropTarget]);

  const handlePoolTap = (type) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    setPicked((prev) =>
      prev?.kind === "pool" && prev.type === type ? null : { kind: "pool", type },
    );
  };

  const handleDomeGuestTap = (domeIdx, guestIdx, type) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    setPicked((prev) =>
      prev?.kind === "dome" &&
      prev.domeIdx === domeIdx &&
      prev.guestIdx === guestIdx
        ? null
        : { kind: "dome", domeIdx, guestIdx, type },
    );
  };

  const handleDropZoneTap = (target) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if (!picked) return;

    if (picked.kind === "pool" && target.kind === "dome") {
      const next = tryAssignGuestToDome(
        domeDetails,
        picked.type,
        target.domeIdx,
        guests,
        podCount,
      );
      if (next) {
        updateDomeDetails(next);
        setPicked(null);
      } else {
        showActionHint(
          getWhyGuestCannotAssignToDome(
            domeDetails,
            picked.type,
            target.domeIdx,
            guests,
            podCount,
          ) || "Cannot place this guest in that dome.",
        );
      }
      return;
    }

    if (picked.kind === "dome" && target.kind === "dome") {
      const next = tryMoveGuestBetweenDomes(
        domeDetails,
        picked.domeIdx,
        picked.guestIdx,
        target.domeIdx,
        guests,
        podCount,
      );
      if (next) {
        updateDomeDetails(next);
        setPicked(null);
      } else {
        showActionHint(
          getWhyGuestCannotMoveToDome(
            domeDetails,
            picked.domeIdx,
            picked.guestIdx,
            target.domeIdx,
            guests,
            podCount,
          ) || "Cannot move this guest to that dome.",
        );
      }
      return;
    }

    applyDrop(picked, target);
    setPicked(null);
  };

  const moveGuestByArrow = (fromDomeIdx, guestIdx, direction) => {
    const state = getGuestMoveArrowState(
      domeDetails,
      fromDomeIdx,
      guestIdx,
      direction,
      guests,
      podCount,
    );
    if (!state.canMove) {
      showActionHint(state.reason);
      return;
    }
    const toDomeIdx = direction === "up" ? fromDomeIdx - 1 : fromDomeIdx + 1;
    const next = tryMoveGuestBetweenDomes(
      domeDetails,
      fromDomeIdx,
      guestIdx,
      toDomeIdx,
      guests,
      podCount,
    );
    if (next) updateDomeDetails(next);
  };

  const resetToSuggested = () => {
    const updated = applyDefaultGuestAllocation(domeDetails, guests, podCount);
    updateDomeDetails(updated);
    setPicked(null);
  };

  const handleContinue = () => {
    const { valid, errors } = validatePodAllocation(podAllocation, guests, podCount);
    if (!valid) {
      setValidationErrors(errors);
      return;
    }
    navigate("/meal-plan");
  };

  const isDropHighlighted = (zone) => {
    if (!hoverDrop) return false;
    if (zone.kind === "unassigned") return hoverDrop.kind === "unassigned";
    return hoverDrop.kind === "dome" && hoverDrop.domeIdx === zone.domeIdx;
  };

  if (!bookingStore.draft.dates || !bookingStore.draft.podCount) {
    return null;
  }

  const unassignedTotal = unassignedBlocks.length;

  return (
    <div className="overflow-x-hidden min-h-screen w-full bg-[#F7F5F0] pb-28 md:pb-0">
      <CommonNavbar />
      <DragGhost dragState={dragState} />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-sm text-gray-700 mb-6 pl-0 hover:bg-transparent"
        >
          <ArrowLeft className="w-4 h-4" />
          <Link to="/select-rooms">Back</Link>
        </Button>

        <h2 className="text-2xl md:text-5xl font-bold text-[#09432B] text-center">
          Assign Guests to Domes
        </h2>
        <p className="text-center text-sm md:text-lg font-medium text-[#737373] mt-2 mb-2">
          Step 3 of 7. Drag guests into each dome
        </p>
        <p className="text-center text-xs text-[#737373] mb-6 md:hidden">
          Hold a guest block and drag, or tap to select then tap a dome. Use arrows to move between domes.
        </p>

        {actionHint && (
          <div className="mb-4 rounded-xl border border-[#D4E8DF] bg-[#F7FBF9] px-4 py-3 text-sm text-[#3D5C50] font-medium text-center shadow-sm">
            {actionHint}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-5">
            <div
              className="rounded-lg border border-[#C7C3B5] px-4 py-3 flex items-start gap-2 text-[#09432B]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(181,171,132,0.28) 0%, rgba(161,146,87,0.28) 100%)",
              }}
            >
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-sm font-medium space-y-1">
                <p>
                  Drag each guest block into a dome, or use the arrows to move between domes.
                </p>
                <p className="text-[#5a5a5a] hidden md:block">
                  Hold and drag on mobile, or tap a block then tap a dome.
                </p>
              </div>
            </div>

            <Card
              data-drop-zone="unassigned"
              onClick={() => handleDropZoneTap({ kind: "unassigned" })}
              className={[
                "rounded-xl border-2 border-dashed transition-colors",
                unassignedTotal > 0 ? "bg-amber-50/80 border-amber-300" : "bg-white border-gray-200",
                isDropHighlighted({ kind: "unassigned" })
                  ? "border-[#09432B] bg-[#E6F2EE]"
                  : "",
                picked ? "cursor-pointer" : "",
              ].join(" ")}
            >
              <CardContent className="p-4">
                <p className="text-sm font-bold text-[#09432B] mb-1">
                  {unassignedTotal > 0
                    ? `Unassigned guests (${unassignedTotal})`
                    : "All guests placed"}
                </p>
                <p className="text-xs text-[#737373] mb-3">
                  {unassignedTotal > 0
                    ? "Drag blocks here to remove from a dome, or drag from here into a dome below"
                    : "Drag a guest out of a dome to rearrange"}
                </p>
                <div className="flex flex-wrap gap-3 min-h-[3.5rem]">
                  {unassignedBlocks.map(({ type, key }) => (
                    <GuestBlock
                      key={key}
                      type={type}
                      selected={picked?.kind === "pool" && picked.type === type}
                      dragging={
                        dragState?.active &&
                        dragRef.current?.kind === "pool" &&
                        dragRef.current?.type === type
                      }
                      onPointerDown={(e) =>
                        startDrag(e, { kind: "pool", type })
                      }
                      onTap={() => handlePoolTap(type)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {validationErrors.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 space-y-1">
                {validationErrors.map((err) => (
                  <p key={err}>{err}</p>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-[#09432B] border-[#09432B]"
                onClick={resetToSuggested}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to suggested
              </Button>
            </div>

            <div className="space-y-4">
              {domeDetails.map((dome, domeIdx) => {
                const domeGuests = dome.guestTypes || [];
                const highlighted = isDropHighlighted({ kind: "dome", domeIdx });

                return (
                  <Card
                    key={dome.podId || domeIdx}
                    data-drop-zone="dome"
                    data-dome-idx={domeIdx}
                    onClick={() => handleDropZoneTap({ kind: "dome", domeIdx })}
                    className={[
                      "rounded-xl shadow-sm border-2 transition-colors",
                      highlighted
                        ? "border-[#09432B] bg-[#E6F2EE]/60"
                        : "border-[#C7C3B5] bg-white",
                      picked ? "cursor-pointer" : "",
                    ].join(" ")}
                  >
                    <CardContent className="p-4 sm:p-5 overflow-visible">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-9 h-9 bg-[#E6F2EE] rounded-full flex items-center justify-center shrink-0">
                          <Home className="w-4 h-4 text-[#09432B]" />
                        </div>
                        <h3 className="text-lg font-bold text-[#09432B]">
                          {dome.podName || `Dome ${domeIdx + 1}`}
                        </h3>
                      </div>

                      <div
                        className={[
                          "rounded-xl border-2 border-dashed min-h-[5.5rem] p-3 flex flex-wrap gap-3 content-start transition-colors overflow-visible",
                          highlighted ? "border-[#09432B] bg-white/80" : "border-gray-200 bg-[#FAFAF8]",
                        ].join(" ")}
                      >
                        {domeGuests.length === 0 ? (
                          <p className="text-sm text-[#737373] italic w-full text-center py-4">
                            Drop guests here
                          </p>
                        ) : (
                          domeGuests.map((type, guestIdx) => (
                            <GuestBlock
                              key={`${domeIdx}-${guestIdx}-${type}`}
                              type={type}
                              showArrows
                              moveUp={getGuestMoveArrowState(
                                domeDetails,
                                domeIdx,
                                guestIdx,
                                "up",
                                guests,
                                podCount,
                              )}
                              moveDown={getGuestMoveArrowState(
                                domeDetails,
                                domeIdx,
                                guestIdx,
                                "down",
                                guests,
                                podCount,
                              )}
                              selected={
                                picked?.kind === "dome" &&
                                picked.domeIdx === domeIdx &&
                                picked.guestIdx === guestIdx
                              }
                              dragging={
                                dragState?.active &&
                                dragRef.current?.kind === "dome" &&
                                dragRef.current?.domeIdx === domeIdx &&
                                dragRef.current?.guestIdx === guestIdx
                              }
                              onPointerDown={(e) =>
                                startDrag(e, {
                                  kind: "dome",
                                  domeIdx,
                                  guestIdx,
                                  type,
                                })
                              }
                              onTap={() =>
                                handleDomeGuestTap(domeIdx, guestIdx, type)
                              }
                              onMoveUp={() =>
                                moveGuestByArrow(domeIdx, guestIdx, "up")
                              }
                              onMoveDown={() =>
                                moveGuestByArrow(domeIdx, guestIdx, "down")
                              }
                              onBlockedAction={showActionHint}
                            />
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-4 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#E6F2EE] rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-[#09432B]" />
                </div>
                <h4 className="text-[#09432B] font-bold text-base">Stay Dates</h4>
              </div>
              <div className="flex items-start justify-between w-full gap-2">
                <div>
                  <p className="text-sm text-[#737373]">Check in:</p>
                  <p className="text-sm font-medium text-[#4F4F4F] mt-1">
                    {formatDateSafe(bookingStore.draft.dates?.checkIn, "dd/MM/yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#737373]">Check out:</p>
                  <p className="text-sm font-medium text-[#4F4F4F] mt-1">
                    {formatDateSafe(bookingStore.draft.dates?.checkOut, "dd/MM/yyyy")}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[#09432B] whitespace-nowrap">
                  {bookingStore.draft.numberOfNights} Nights
                </p>
              </div>
            </div>

            <ReservationGuestsCard
              guests={guests}
              popUpBeds={bookingStore.draft.popUpBeds}
            />

            <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#E6F2EE] rounded-full flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-[#09432B]" />
                </div>
                <h4 className="text-[#09432B] font-bold">Price Summary</h4>
              </div>
              {(() => {
                const dynamicSubTotal = calculateDynamicSubTotal(bookingStore.draft);
                const taxAmount =
                  dynamicSubTotal > 0 ? Math.round(dynamicSubTotal * 0.125) : 0;
                const totalAmount =
                  dynamicSubTotal > 0 ? Math.round(dynamicSubTotal * 1.125) : 0;
                return (
                  <div className="space-y-3 text-sm font-semibold text-[#09432B]">
                    <div className="flex justify-between">
                      <span>Sub Total:</span>
                      <span>₦{formatPrice(dynamicSubTotal)}</span>
                    </div>
                    <div className="flex justify-between leading-snug">
                      <span>Tax & VAT (12.5%)</span>
                      <span>₦{formatPrice(taxAmount)}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between bg-[#F2EFE7] px-3 py-2 rounded-md">
                      <span>Total:</span>
                      <span>₦{formatPrice(totalAmount)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="hidden md:block w-full rounded-t-xl overflow-hidden">
              <div
                className="px-4 py-3 text-[#0A4C30] text-sm font-medium"
                style={{ backgroundColor: "#B7FFFF" }}
              >
                {isComplete
                  ? "All guests assigned. Continue to bed setup"
                  : "Place every guest block in a dome to continue"}
              </div>
              <Button
                className={`w-full text-white text-base font-bold py-6 rounded-none rounded-b-xl ${
                  isComplete
                    ? "bg-[#09432B] hover:bg-[#083f28]"
                    : "bg-gray-400 cursor-not-allowed opacity-50"
                }`}
                disabled={!isComplete}
                onClick={handleContinue}
              >
                Continue to Bed Configuration →
              </Button>
            </div>
          </div>
        </div>
      </div>

      <FunnelMobileStickyCta>
        <Button
          className={`w-full text-white text-base font-bold py-6 rounded-xl ${
            isComplete
              ? "bg-[#09432B] hover:bg-[#083f28]"
              : "bg-gray-400 cursor-not-allowed opacity-50"
          }`}
          disabled={!isComplete}
          onClick={handleContinue}
        >
          Continue to Bed Configuration →
        </Button>
      </FunnelMobileStickyCta>
    </div>
  );
}

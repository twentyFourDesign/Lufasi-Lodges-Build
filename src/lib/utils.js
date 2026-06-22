import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { format } from "date-fns";
import { BASE_URL } from "@/config";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Returns a YYYY-MM-DD string in local time.
 */
export function toISODate(date) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Safely formats a date (string or Date object) for display in local time.
 * Handles YYYY-MM-DD strings without converting them to UTC.
 */
export function formatDateSafe(date, formatStr = "dd/MM/yyyy") {
  if (!date) return "--";
  
  if (typeof date === "string" && date.includes("-") && !date.includes("T")) {
    const parts = date.split("-");
    if (parts.length === 3) {
      const [y, m, d] = parts.map(Number);
      return format(new Date(y, m - 1, d), formatStr);
    }
  }
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return "--";
  return format(d, formatStr);
}

/**
 * POST /availability/check returns { pods, peakRateInfo } (legacy: array of pods only).
 */
/** Fix URLs like https://domain.comfile.jpg → https://domain.com/file.jpg */
export function repairMediaUrl(url) {
  if (!url || typeof url !== "string") return url;
  return url.replace(
    /(https?:\/\/[^/]+\.(?:com|org|net|io|dev))([a-zA-Z0-9])/,
    "$1/$2",
  );
}

export const DEFAULT_POD_IMAGE_URL = `${BASE_URL}/uploads/pods/default-pod.png`;

/** Normalize API/media paths to absolute URLs for <img src>. */
export function resolveMediaUrl(url) {
  const repaired = repairMediaUrl(url);
  if (!repaired) return DEFAULT_POD_IMAGE_URL;
  if (repaired.startsWith("http://") || repaired.startsWith("https://")) {
    return repaired;
  }
  if (repaired.startsWith("/")) return `${BASE_URL}${repaired}`;
  return `${BASE_URL}/${repaired}`;
}

export function parseAvailabilityCheckResponse(data) {
  if (!data) {
    return { pods: [], peakRateInfo: null, weekdayPeakInfo: null, seasonalRatePeriods: [] };
  }
  if (Array.isArray(data)) {
    return { pods: data, peakRateInfo: null, weekdayPeakInfo: null, seasonalRatePeriods: [] };
  }
  const pods = Array.isArray(data.pods) ? data.pods : [];
  return {
    pods,
    peakRateInfo: data.peakRateInfo ?? null,
    weekdayPeakInfo: data.weekdayPeakInfo ?? null,
    seasonalRatePeriods: Array.isArray(data.seasonalRatePeriods)
      ? data.seasonalRatePeriods
      : [],
  };
}


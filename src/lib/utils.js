import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { format } from "date-fns";

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


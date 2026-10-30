/**
 * Nepal Standard Time (NPT) Utilities
 * IANA Timezone: Asia/Kathmandu (UTC+05:45)
 */

export const NEPAL_TIMEZONE = "Asia/Kathmandu";

/**
 * Converts a Nepal local date (YYYY-MM-DD) and 24h time (HH:mm) into a UTC Date.
 * Nepal is permanently UTC+05:45 with no daylight savings time.
 */
export function nepalDateAndTimeToUtc(dateStr: string, timeStr: string): Date {
  const cleanDate = (dateStr || "").trim();
  let cleanTime = (timeStr || "23:59").trim();

  // If 12-hour format e.g. "11:59 PM" or "02:30 AM", convert to 24-hour
  if (/am|pm/i.test(cleanTime)) {
    const match = cleanTime.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      const meridiem = match[3].toLowerCase();
      if (meridiem === "pm" && hours < 12) hours += 12;
      if (meridiem === "am" && hours === 12) hours = 0;
      cleanTime = `${hours.toString().padStart(2, "0")}:${minutes}`;
    }
  }

  // Ensure HH:mm format
  if (!/^\d{2}:\d{2}/.test(cleanTime)) {
    cleanTime = "23:59";
  }

  const isoWithNepalOffset = `${cleanDate}T${cleanTime}:00+05:45`;
  const parsed = new Date(isoWithNepalOffset);

  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date or time provided: ${dateStr} ${timeStr}`);
  }

  return parsed;
}

/**
 * Converts a UTC Date into its Nepal (Asia/Kathmandu) components:
 * - dateStr: "YYYY-MM-DD"
 * - timeStr: "HH:mm" (24-hour)
 * - formatted: "MMM DD, YYYY, hh:mm A NPT"
 */
export function utcToNepalParts(dateInput: Date | string | null | undefined): {
  dateStr: string;
  timeStr: string;
  formatted: string;
} | null {
  if (!dateInput) return null;
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return null;

  // Format date part in YYYY-MM-DD using en-CA locale (standard ISO format)
  const dateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: NEPAL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);

  // Format time part in 24h HH:mm using en-GB locale
  const timeStr = new Intl.DateTimeFormat("en-GB", {
    timeZone: NEPAL_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);

  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: NEPAL_TIMEZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);

  return {
    dateStr,
    timeStr,
    formatted: `${formatted} (NPT)`,
  };
}

/**
 * Formats a Date in Nepal Standard Time for participant display.
 */
export function formatNepalDateTime(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "—";
  const parts = utcToNepalParts(dateInput);
  return parts ? parts.formatted : "—";
}

/**
 * Convenience alias for formatting Nepal time.
 */
export function formatNepalTime(dateInput: Date | string | null | undefined, _customFormat?: string): string {
  return formatNepalDateTime(dateInput);
}

/**
 * Alias for nepalDateAndTimeToUtc
 */
export const parseNepalTimeToUtc = nepalDateAndTimeToUtc;

/**
 * Checks if a given deadline (stored in UTC) has passed.
 */
export function isPastDeadline(deadlineInput: Date | string | null | undefined): boolean {
  if (!deadlineInput) return false;
  const d = typeof deadlineInput === "string" ? new Date(deadlineInput) : deadlineInput;
  if (isNaN(d.getTime())) return false;
  return new Date() >= d;
}


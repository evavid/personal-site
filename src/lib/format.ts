const short = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const shortYear = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const long = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

/** "12 Sep", or "12 Sep 2025" when not in the current year. */
export function shortDate(d: Date): string {
  return d.getFullYear() === new Date().getFullYear() ? short.format(d) : shortYear.format(d);
}

export function fullShortDate(d: Date): string {
  return shortYear.format(d);
}

/** "21 July 2026" */
export function longDate(d: Date): string {
  return long.format(d);
}

/** "2d ago", "3w ago", "5mo ago". Pass `suffix: false` for the compact table form ("2d"). */
export function relativeTime(iso: string, suffix = true): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const units: [number, string][] = [
    [60 * 60 * 24 * 365, "y"],
    [60 * 60 * 24 * 30, "mo"],
    [60 * 60 * 24 * 7, "w"],
    [60 * 60 * 24, "d"],
    [60 * 60, "h"],
    [60, "m"],
  ];
  for (const [size, label] of units) {
    if (s >= size) return `${Math.floor(s / size)}${label}${suffix ? " ago" : ""}`;
  }
  return "just now";
}

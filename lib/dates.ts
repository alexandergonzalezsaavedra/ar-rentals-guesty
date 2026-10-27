// Dates in the visitor's storage are kept readable: "DD/MM/YYYY HH:mm:ss" in
// the browser's local time (e.g. "27/10/2026 11:04:35"). These helpers write
// that format and read it back to milliseconds for the few places that do
// arithmetic with dates (expiry, gap between visits).

/** A date as stored: "DD/MM/YYYY HH:mm:ss". */
export type StoredDate = string;

const pad = (value: number) => String(value).padStart(2, '0');

export function toStoredDate(date: Date | number = new Date()): StoredDate {
  const d = typeof date === 'number' ? new Date(date) : date;

  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** Milliseconds since epoch, or NaN if it can't be read. Also accepts plain numbers (values saved before this format). */
export function fromStoredDate(value: StoredDate | number | null | undefined): number {
  if (typeof value === 'number') return value;
  if (!value) return Number.NaN;

  const match = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/.exec(value);

  if (!match) return Number.NaN;

  const [, day, month, year, hours, minutes, seconds] = match.map(Number);
  return new Date(year, month - 1, day, hours, minutes, seconds).getTime();
}

/** Time since a stored date, in milliseconds (Infinity if it can't be read). */
export function msSince(value: StoredDate | number | null | undefined): number {
  const time = fromStoredDate(value);
  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : Date.now() - time;
}

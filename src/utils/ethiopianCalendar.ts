/**
 * Ethiopian <-> Gregorian calendar conversion.
 * All client data is stored internally as Gregorian ISO dates (YYYY-MM-DD)
 * for reliable date math (adding weeks/months for frequency cycles).
 * The Ethiopian calendar is used ONLY for display, per the requirement
 * that the app "works on Ethiopian calendar only" for what the owner sees.
 *
 * Algorithm: standard Ethiopian/Ge\u0027ez calendar <-> JDN conversion,
 * widely used in Ethiopian calendar libraries.
 */

import { tArray } from "../i18n/i18n";

const JD_EPOCH_OFFSET_AMETE_MIHRET = 1723856; // Ethiopian epoch (Amete Mihret) in JDN
const JD_EPOCH_OFFSET_GREGORIAN = 1721426; // Gregorian epoch in JDN

export interface EthiopianDate {
  year: number;
  month: number; // 1-13 (13th = Pagume)
  day: number;
}

function isGregorianLeap(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function gregorianToJdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function jdnToGregorian(jdn: number): { year: number; month: number; day: number } {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

function isEthiopianLeap(year: number): boolean {
  // Ethiopian leap year aligns with the year before a Gregorian leap year
  return year % 4 === 3;
}

function ethiopianToJdn(year: number, month: number, day: number): number {
  const leapOffset = isEthiopianLeap(year - 1) ? 1 : 0;
  return (
    JD_EPOCH_OFFSET_AMETE_MIHRET +
    leapOffset +
    365 * (year - 1) +
    Math.floor(year / 4) +
    30 * (month - 1) +
    day -
    1
  );
}

function jdnToEthiopian(jdn: number): EthiopianDate {
  const r = (jdn - JD_EPOCH_OFFSET_AMETE_MIHRET) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const year =
    4 * Math.floor((jdn - JD_EPOCH_OFFSET_AMETE_MIHRET) / 1461) +
    Math.floor(r / 365) -
    Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;
  return { year, month, day };
}

/** Convert a Gregorian ISO date string (YYYY-MM-DD) to an Ethiopian date. */
export function gregorianToEthiopian(isoDate: string): EthiopianDate {
  const [y, m, d] = isoDate.split("-").map(Number);
  const jdn = gregorianToJdn(y, m, d);
  return jdnToEthiopian(jdn);
}

/** Convert an Ethiopian date to a Gregorian ISO date string (YYYY-MM-DD). */
export function ethiopianToGregorian(ed: EthiopianDate): string {
  const jdn = ethiopianToJdn(ed.year, ed.month, ed.day);
  const g = jdnToGregorian(jdn);
  const mm = String(g.month).padStart(2, "0");
  const dd = String(g.day).padStart(2, "0");
  return `${g.year}-${mm}-${dd}`;
}

/** Human-readable Ethiopian date string, e.g. "12 Meskerem 2018", localized. */
export function formatEthiopian(isoDate: string): string {
  if (!isoDate) return "-";
  const ed = gregorianToEthiopian(isoDate);
  const months = tArray("date.et_months");
  const monthName = months[ed.month - 1] ?? String(ed.month);
  return `${ed.day} ${monthName} ${ed.year}`;
}

export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function tomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

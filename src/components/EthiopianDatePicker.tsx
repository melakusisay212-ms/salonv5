import { useMemo } from "react";
import {
  gregorianToEthiopian,
  ethiopianToGregorian,
  formatEthiopian,
  type EthiopianDate,
} from "../utils/ethiopianCalendar";
import { tArray } from "../i18n/i18n";

interface Props {
  /** Gregorian ISO date string YYYY-MM-DD (or empty) */
  value: string;
  onChange: (iso: string) => void;
}

function daysInEthiopianMonth(year: number, month: number): number {
  if (month === 13) {
    // Pagume: 6 days in leap year (year % 4 === 3), else 5
    return year % 4 === 3 ? 6 : 5;
  }
  return 30;
}

export default function EthiopianDatePicker({ value, onChange }: Props) {
  const months = tArray("date.et_months");

  const ed: EthiopianDate = useMemo(() => {
    if (value) return gregorianToEthiopian(value);
    // Default to today in Ethiopian
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return gregorianToEthiopian(iso);
  }, [value]);

  // Year range: current Ethiopian year ± 10
  const currentEtYear = useMemo(() => {
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return gregorianToEthiopian(iso).year;
  }, []);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = currentEtYear - 15; y <= currentEtYear + 2; y++) list.push(y);
    return list;
  }, [currentEtYear]);

  const maxDay = daysInEthiopianMonth(ed.year, ed.month);

  const update = (patch: Partial<EthiopianDate>) => {
    const next = { ...ed, ...patch };
    // Clamp day if month/year change reduces max days
    const max = daysInEthiopianMonth(next.year, next.month);
    if (next.day > max) next.day = max;
    onChange(ethiopianToGregorian(next));
  };

  const dayOptions = useMemo(() => {
    const opts: number[] = [];
    for (let d = 1; d <= maxDay; d++) opts.push(d);
    return opts;
  }, [maxDay]);

  return (
    <div className="et-picker">
      <div className="et-picker-row">
        <select
          value={ed.day}
          onChange={(e) => update({ day: Number(e.target.value) })}
          aria-label="Day"
        >
          {dayOptions.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={ed.month}
          onChange={(e) => update({ month: Number(e.target.value) })}
          aria-label="Month"
          style={{ flex: 1.6 }}
        >
          {months.map((name, i) => (
            <option key={i + 1} value={i + 1}>{name}</option>
          ))}
        </select>
        <select
          value={ed.year}
          onChange={(e) => update({ year: Number(e.target.value) })}
          aria-label="Year"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      {value && (
        <div className="et-preview">{formatEthiopian(value)}</div>
      )}
    </div>
  );
}

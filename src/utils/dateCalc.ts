export type Frequency = "2w" | "1m" | "2m" | "3m";

export const FREQUENCY_LABEL_KEY: Record<Frequency, string> = {
  "2w": "client.freq_2w",
  "1m": "client.freq_1m",
  "2m": "client.freq_2m",
  "3m": "client.freq_3m",
};

export const FREQUENCY_OPTIONS: Frequency[] = ["2w", "1m", "2m", "3m"];

/** Add a frequency interval to a Gregorian ISO date, returning a new ISO date. */
export function addFrequency(isoDate: string, freq: Frequency): string {
  const d = new Date(isoDate + "T00:00:00");
  switch (freq) {
    case "2w":
      d.setDate(d.getDate() + 14);
      break;
    case "1m":
      d.setMonth(d.getMonth() + 1);
      break;
    case "2m":
      d.setMonth(d.getMonth() + 2);
      break;
    case "3m":
      d.setMonth(d.getMonth() + 3);
      break;
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function isSameDate(a: string, b: string): boolean {
  return a === b;
}

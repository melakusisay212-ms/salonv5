import Papa from "papaparse";
import type { Client } from "../db/database";
import type { Frequency } from "./dateCalc";

/**
 * CSV import is designed for exports coming from KoboCollect / KoboToolbox.
 * Kobo exports use arbitrary question labels as headers, so we match
 * loosely (case-insensitive, ignores punctuation/spaces) against a list
 * of accepted header aliases per field, rather than requiring an exact
 * Kobo template.
 *
 * Required columns (at least one alias must be present): full name, phone.
 * Optional columns: status, frequency, last service date, notes.
 */

const HEADER_ALIASES: Record<string, string[]> = {
  fullName: ["full name", "fullname", "name", "client name", "customer name"],
  phone: ["phone", "phone number", "mobile", "telephone", "contact"],
  status: ["status", "client status", "new_or_returning"],
  frequency: ["frequency", "visit frequency", "cycle"],
  lastService: ["last service date", "last_service_date", "last visit", "last service"],
  notes: ["notes", "note", "comment", "remarks"],
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[_\-]+/g, " ").replace(/\s+/g, " ");
}

function matchField(header: string): string | null {
  const norm = normalizeHeader(header);
  for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
    if (aliases.includes(norm)) return field;
  }
  return null;
}

function normalizeFrequency(raw: string | undefined): Frequency {
  const v = (raw || "").toLowerCase();
  if (v.includes("2") && v.includes("week")) return "2w";
  if (v.includes("3") && v.includes("month")) return "3m";
  if (v.includes("2") && v.includes("month")) return "2m";
  return "1m"; // default / "every 1 month"
}

function normalizeStatus(raw: string | undefined): "new" | "returning" {
  const v = (raw || "").toLowerCase();
  return v.startsWith("return") ? "returning" : "new";
}

function normalizeDate(raw: string | undefined): string {
  if (!raw) return "";
  const v = raw.trim();
  // Accept YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if (iso.test(v)) return v;
  const parts = v.split(/[\/\.]/);
  if (parts.length === 3) {
    let [a, b, c] = parts.map((p) => p.trim());
    if (c.length === 4) {
      // DD/MM/YYYY assumed (common in Ethiopia)
      const day = a.padStart(2, "0");
      const month = b.padStart(2, "0");
      return `${c}-${month}-${day}`;
    }
  }
  return "";
}

export interface ParsedImportResult {
  clients: Omit<Client, "id" | "nextExpectedDate" | "cyclesCompleted" | "smsSentForNextDate">[];
  errors: string[];
}

export function parseClientsCsv(csvText: string): ParsedImportResult {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const fieldMap = new Map<string, string>();
  (result.meta.fields || []).forEach((h) => {
    const field = matchField(h);
    if (field) fieldMap.set(field, h);
  });

  const errors: string[] = [...result.errors.map((e) => e.message)];
  if (!fieldMap.has("fullName") || !fieldMap.has("phone")) {
    errors.push("CSV must include a name column and a phone column.");
    return { clients: [], errors };
  }

  const clients = result.data
    .map((row) => {
      const name = row[fieldMap.get("fullName")!]?.trim();
      const phone = row[fieldMap.get("phone")!]?.trim();
      if (!name || !phone) return null;
      return {
        fullName: name,
        phone,
        status: normalizeStatus(fieldMap.has("status") ? row[fieldMap.get("status")!] : undefined),
        frequency: normalizeFrequency(
          fieldMap.has("frequency") ? row[fieldMap.get("frequency")!] : undefined
        ),
        lastServiceDate: normalizeDate(
          fieldMap.has("lastService") ? row[fieldMap.get("lastService")!] : undefined
        ),
        notes: fieldMap.has("notes") ? row[fieldMap.get("notes")!] ?? "" : "",
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  return { clients, errors };
}

export function clientsToCsv(clients: Client[]): string {
  const rows = clients.map((c) => ({
    "Full Name": c.fullName,
    "Phone Number": c.phone,
    Status: c.status,
    Frequency: c.frequency,
    "Last Service Date": c.lastServiceDate,
    "Next Expected Date": c.nextExpectedDate,
    "Cycles Completed": c.cyclesCompleted,
    Notes: c.notes ?? "",
  }));
  return Papa.unparse(rows);
}

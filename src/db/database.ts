import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from "@capacitor-community/sqlite";
import { Capacitor } from "@capacitor/core";
import { addFrequency } from "../utils/dateCalc";
import type { Frequency } from "../utils/dateCalc";
import { todayIso } from "../utils/ethiopianCalendar";

export interface Client {
  id: number;
  fullName: string;
  phone: string;
  status: "new" | "returning";
  frequency: Frequency;
  lastServiceDate: string; // ISO Gregorian, "" if never serviced
  nextExpectedDate: string; // ISO Gregorian, auto-calculated
  cyclesCompleted: number;
  notes: string;
  smsSentForNextDate: 0 | 1; // reset every time nextExpectedDate changes
}

const DB_NAME = "salon_manager.db";
const sqlite = new SQLiteConnection(CapacitorSQLite);
let db: SQLiteDBConnection | null = null;
let initPromise: Promise<void> | null = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fullName TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT "new",
  frequency TEXT NOT NULL DEFAULT "1m",
  lastServiceDate TEXT NOT NULL DEFAULT "",
  nextExpectedDate TEXT NOT NULL DEFAULT "",
  cyclesCompleted INTEGER NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT "",
  smsSentForNextDate INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_clients_next ON clients(nextExpectedDate);
`;

async function ensureWebStore() {
  // Web/dev fallback only: on native Android this branch is never used.
  if (Capacitor.getPlatform() === "web") {
    const jeepEl = document.createElement("jeep-sqlite");
    document.body.appendChild(jeepEl);
    await customElements.whenDefined("jeep-sqlite");
    await sqlite.initWebStore();
  }
}

export async function initDb(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    await ensureWebStore();
    const ret = await sqlite.checkConnectionsConsistency();
    const isConn = (await sqlite.isConnection(DB_NAME, false)).result;
    if (ret.result && isConn) {
      db = await sqlite.retrieveConnection(DB_NAME, false);
    } else {
      db = await sqlite.createConnection(DB_NAME, false, "no-encryption", 1, false);
    }
    await db.open();
    await db.execute(SCHEMA);
    if (Capacitor.getPlatform() === "web") {
      await sqlite.saveToStore(DB_NAME);
    }
  })();
  return initPromise;
}

async function persist() {
  if (Capacitor.getPlatform() === "web") {
    await sqlite.saveToStore(DB_NAME);
  }
}

function requireDb(): SQLiteDBConnection {
  if (!db) throw new Error("Database not initialized. Call initDb() first.");
  return db;
}

export async function getAllClients(): Promise<Client[]> {
  const res = await requireDb().query("SELECT * FROM clients ORDER BY fullName COLLATE NOCASE ASC;");
  return (res.values as Client[]) || [];
}

export async function getClientsByNextDate(iso: string): Promise<Client[]> {
  const res = await requireDb().query(
    "SELECT * FROM clients WHERE nextExpectedDate = ? ORDER BY smsSentForNextDate ASC, fullName ASC;",
    [iso]
  );
  return (res.values as Client[]) || [];
}

export async function addClient(
  input: Omit<Client, "id" | "nextExpectedDate" | "cyclesCompleted" | "smsSentForNextDate">
): Promise<number> {
  const nextExpectedDate = input.lastServiceDate
    ? addFrequency(input.lastServiceDate, input.frequency)
    : "";
  const res = await requireDb().run(
    `INSERT INTO clients (fullName, phone, status, frequency, lastServiceDate, nextExpectedDate, cyclesCompleted, notes, smsSentForNextDate)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?, 0);`,
    [input.fullName, input.phone, input.status, input.frequency, input.lastServiceDate, nextExpectedDate, input.notes || ""]
  );
  await persist();
  return res.changes?.lastId ?? -1;
}

export async function updateClient(client: Client): Promise<void> {
  // Recalculate next expected date whenever lastServiceDate or frequency changes.
  const nextExpectedDate = client.lastServiceDate
    ? addFrequency(client.lastServiceDate, client.frequency)
    : "";
  await requireDb().run(
    `UPDATE clients SET fullName=?, phone=?, status=?, frequency=?, lastServiceDate=?, nextExpectedDate=?, notes=? WHERE id=?;`,
    [client.fullName, client.phone, client.status, client.frequency, client.lastServiceDate, nextExpectedDate, client.notes || "", client.id]
  );
  await persist();
}

export async function deleteClient(id: number): Promise<void> {
  await requireDb().run("DELETE FROM clients WHERE id=?;", [id]);
  await persist();
}

/** Core "Mark as Done" flow described in the spec. */
export async function markClientDone(id: number): Promise<void> {
  const res = await requireDb().query("SELECT * FROM clients WHERE id=?;", [id]);
  const client = (res.values as Client[])?.[0];
  if (!client) return;
  const today = todayIso();
  const nextExpectedDate = addFrequency(today, client.frequency);
  await requireDb().run(
    `UPDATE clients SET lastServiceDate=?, nextExpectedDate=?, cyclesCompleted=?, status="returning", smsSentForNextDate=0 WHERE id=?;`,
    [today, nextExpectedDate, client.cyclesCompleted + 1, id]
  );
  await persist();
}

export async function markSmsSent(id: number): Promise<void> {
  await requireDb().run("UPDATE clients SET smsSentForNextDate=1 WHERE id=?;", [id]);
  await persist();
}

export async function bulkImportClients(
  clients: Omit<Client, "id" | "nextExpectedDate" | "cyclesCompleted" | "smsSentForNextDate">[]
): Promise<number> {
  let count = 0;
  for (const c of clients) {
    await addClient(c);
    count++;
  }
  return count;
}

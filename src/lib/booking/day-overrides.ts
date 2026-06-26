import type { Db, ObjectId } from "mongodb";
import { MongoServerError, ObjectId as ObjectIdCtor } from "mongodb";

import { formatSalonDisplayDate, getEpicaSlotStartsForDate } from "@/lib/booking/salon-availability";

export const DAY_OVERRIDES_COLLECTION = "salon_day_overrides";

export type DayOverrideKind = "open" | "closed";

export type SalonDayOverrideDoc = {
  _id: ObjectId;
  dateKey: string;
  kind: DayOverrideKind;
  /** null = horario del día de la semana; [] = cerrado explícito */
  slots: string[] | null;
  notes?: string | null;
  displayDate: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
};

const INDEXES_VERSION = 1;
let indexesApplied = 0;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function monthRangeKeys(year: number, month: number) {
  const lastDay = new Date(year, month, 0).getDate();
  return {
    from: `${year}-${pad2(month)}-01`,
    to: `${year}-${pad2(month)}-${pad2(lastDay)}`,
  };
}

function parseSlots(raw: unknown): string[] | null | undefined {
  if (raw === undefined) return undefined;
  if (raw === null) return null;
  if (!Array.isArray(raw)) return undefined;
  const slots = raw
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter((v) => /^\d{2}:\d{2}$/.test(v));
  return slots;
}

export async function ensureDayOverrideIndexes(db: Db) {
  if (indexesApplied >= INDEXES_VERSION) return;
  const col = db.collection(DAY_OVERRIDES_COLLECTION);
  await col.createIndex({ dateKey: 1 }, { name: "do_dateKey", unique: true });
  indexesApplied = INDEXES_VERSION;
}

export async function getDayOverrideForDateKey(db: Db, dateKey: string): Promise<SalonDayOverrideDoc | null> {
  await ensureDayOverrideIndexes(db);
  return db.collection<SalonDayOverrideDoc>(DAY_OVERRIDES_COLLECTION).findOne({ dateKey });
}

export async function listDayOverridesForMonth(
  db: Db,
  year: number,
  monthIndex: number,
): Promise<Map<string, SalonDayOverrideDoc>> {
  await ensureDayOverrideIndexes(db);
  const { from, to } = monthRangeKeys(year, monthIndex + 1);
  const rows = await db
    .collection<SalonDayOverrideDoc>(DAY_OVERRIDES_COLLECTION)
    .find({ dateKey: { $gte: from, $lte: to } })
    .sort({ dateKey: 1 })
    .toArray();
  return new Map(rows.map((row) => [row.dateKey, row]));
}

export async function listDayOverridesInMonth(
  db: Db,
  year: number,
  month: number,
): Promise<SalonDayOverrideDoc[]> {
  await ensureDayOverrideIndexes(db);
  const { from, to } = monthRangeKeys(year, month);
  return db
    .collection<SalonDayOverrideDoc>(DAY_OVERRIDES_COLLECTION)
    .find({ dateKey: { $gte: from, $lte: to } })
    .sort({ dateKey: 1 })
    .toArray();
}

export type UpsertDayOverrideOpenInput = {
  dateKey: string;
  slots?: string[] | null;
  notes?: string | null;
};

export async function upsertDayOverrideOpen(
  db: Db,
  input: UpsertDayOverrideOpenInput,
): Promise<{ ok: true; id: string } | { error: string; code?: string }> {
  const dateKey = input.dateKey.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return { error: "Fecha inválida.", code: "INVALID_DATE" };
  }

  const slots = input.slots === undefined ? null : parseSlots(input.slots);
  if (slots === undefined) {
    return { error: "Horarios inválidos.", code: "INVALID_SLOTS" };
  }
  if (slots !== null && slots.length === 0) {
    return { error: "Indicá al menos un horario o dejá el horario habitual.", code: "EMPTY_SLOTS" };
  }

  const effectiveSlots = slots ?? getEpicaSlotStartsForDate(dateKey);
  if (effectiveSlots.length === 0) {
    return {
      error: "Este día no tiene horario habitual (ej. domingo). No se puede abrir con la plantilla semanal.",
      code: "NO_WEEKDAY_SLOTS",
    };
  }

  await ensureDayOverrideIndexes(db);
  const now = new Date();
  const createdBy = (process.env.PANEL_TURNOS_CREATED_BY ?? "panel").trim() || "panel";
  const notes = input.notes?.trim() ? String(input.notes).trim().slice(0, 500) : null;

  const setFields = {
    dateKey,
    kind: "open" as const,
    slots,
    notes,
    displayDate: formatSalonDisplayDate(dateKey),
    updatedAt: now,
    createdBy,
  };

  try {
    const col = db.collection<Omit<SalonDayOverrideDoc, "_id">>(DAY_OVERRIDES_COLLECTION);
    const existing = await col.findOne({ dateKey });
    if (existing) {
      await col.updateOne({ dateKey }, { $set: setFields });
      return { ok: true, id: (existing as SalonDayOverrideDoc)._id.toHexString() };
    }
    const r = await col.insertOne({
      ...setFields,
      createdAt: now,
    });
    return { ok: true, id: r.insertedId.toHexString() };
  } catch (e) {
    if (e instanceof MongoServerError && e.code === 11000) {
      return { error: "Ya existe una excepción para esa fecha.", code: "DUPLICATE" };
    }
    throw e;
  }
}

export async function deleteDayOverrideByHexId(db: Db, hexId: string): Promise<boolean> {
  try {
    const _id = new ObjectIdCtor(hexId);
    const r = await db.collection(DAY_OVERRIDES_COLLECTION).deleteOne({ _id });
    return r.deletedCount === 1;
  } catch {
    return false;
  }
}

export function serializeDayOverride(doc: SalonDayOverrideDoc) {
  return {
    id: doc._id.toHexString(),
    dateKey: doc.dateKey,
    kind: doc.kind,
    slots: doc.slots,
    notes: doc.notes ?? null,
    displayDate: doc.displayDate,
  };
}

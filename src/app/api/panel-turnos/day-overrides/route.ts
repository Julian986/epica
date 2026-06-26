import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  deleteDayOverrideByHexId,
  listDayOverridesInMonth,
  serializeDayOverride,
  upsertDayOverrideOpen,
} from "@/lib/booking/day-overrides";
import { getEpicaSlotStartsForDate } from "@/lib/booking/salon-availability";
import { getDb } from "@/lib/mongodb";
import { verifyPanelCookie } from "@/lib/panel-turnos-auth";

export const dynamic = "force-dynamic";

function parseYearMonth(url: URL): { year: number; month: number } | null {
  const year = Number(url.searchParams.get("year"));
  const month = Number(url.searchParams.get("month"));
  if (!Number.isFinite(year) || year < 2000 || year > 2100) return null;
  if (!Number.isFinite(month) || month < 1 || month > 12) return null;
  return { year, month };
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  if (!verifyPanelCookie(cookieStore.get("panel_turnos_auth")?.value)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const parsed = parseYearMonth(new URL(request.url));
  if (!parsed) {
    return NextResponse.json({ error: "Año o mes inválido." }, { status: 400 });
  }

  try {
    const db = await getDb();
    const rows = await listDayOverridesInMonth(db, parsed.year, parsed.month);
    return NextResponse.json({
      overrides: rows.map(serializeDayOverride),
    });
  } catch (e) {
    console.error("[panel-turnos day-overrides GET]", e);
    return NextResponse.json({ error: "No se pudieron cargar los días." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (!verifyPanelCookie(cookieStore.get("panel_turnos_auth")?.value)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  const dateKey = typeof b.dateKey === "string" ? b.dateKey.trim() : "";
  const notes = b.notes == null ? null : typeof b.notes === "string" ? b.notes : null;
  const useWeekdaySlots = b.useWeekdaySlots !== false;
  const slots = useWeekdaySlots ? null : b.slots;

  if (!dateKey) {
    return NextResponse.json({ error: "Falta la fecha." }, { status: 400 });
  }

  try {
    const db = await getDb();
    const result = await upsertDayOverrideOpen(db, {
      dateKey,
      slots: useWeekdaySlots ? null : (slots as string[] | null),
      notes,
    });
    if ("error" in result) {
      return NextResponse.json({ error: result.error, code: result.code }, { status: 400 });
    }
    const weekdaySlots = getEpicaSlotStartsForDate(dateKey);
    return NextResponse.json(
      {
        ok: true,
        id: result.id,
        weekdaySlots,
      },
      { status: 201 },
    );
  } catch (e) {
    console.error("[panel-turnos day-overrides POST]", e);
    return NextResponse.json({ error: "No se pudo abrir el día." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  if (!verifyPanelCookie(cookieStore.get("panel_turnos_auth")?.value)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id")?.trim() ?? "";
  if (!id) {
    return NextResponse.json({ error: "Falta el id." }, { status: 400 });
  }

  try {
    const db = await getDb();
    const ok = await deleteDayOverrideByHexId(db, id);
    if (!ok) {
      return NextResponse.json({ error: "Día no encontrado." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[panel-turnos day-overrides DELETE]", e);
    return NextResponse.json({ error: "No se pudo cerrar el día." }, { status: 500 });
  }
}

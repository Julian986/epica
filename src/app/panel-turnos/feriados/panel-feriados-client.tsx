"use client";

import { CalendarOff, ChevronLeft, ChevronRight, Sun } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  panelBackBtn,
  panelCard,
  panelContainer,
  panelLabel,
  panelPage,
  panelPrimaryBtn,
} from "@/components/panel/panel-ui";
import { trackPanelClick } from "@/lib/analytics/track";
import { listArgentinaPublicHolidaysInMonth } from "@/lib/booking/argentina-holidays";
import { getEpicaSlotStartsForDate, formatSalonDisplayDate } from "@/lib/booking/salon-availability";
import { panelMonthTitle } from "@/lib/booking/panel-month-grid";

type DayOverrideRow = {
  id: string;
  dateKey: string;
  kind: "open" | "closed";
  slots: string[] | null;
  notes: string | null;
  displayDate: string;
};

export function PanelFeriadosClient() {
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [overrides, setOverrides] = useState<DayOverrideRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyDateKey, setBusyDateKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const holidays = useMemo(
    () => listArgentinaPublicHolidaysInMonth(year, month - 1),
    [year, month],
  );

  const overrideByDate = useMemo(() => {
    const map = new Map<string, DayOverrideRow>();
    for (const row of overrides) {
      if (row.kind === "open") map.set(row.dateKey, row);
    }
    return map;
  }, [overrides]);

  const loadOverrides = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/panel-turnos/day-overrides?year=${year}&month=${month}`, {
        credentials: "same-origin",
      });
      const data = (await res.json()) as { overrides?: DayOverrideRow[]; error?: string };
      if (!res.ok) {
        setError(data.error ?? "No se pudieron cargar los días.");
        setOverrides([]);
        return;
      }
      setOverrides(data.overrides ?? []);
    } catch {
      setError("Error de red. Probá de nuevo.");
      setOverrides([]);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    void loadOverrides();
  }, [loadOverrides]);

  function prevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
      return;
    }
    setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
      return;
    }
    setMonth((m) => m + 1);
  }

  async function openHoliday(dateKey: string) {
    setBusyDateKey(dateKey);
    setError(null);
    try {
      const res = await fetch("/api/panel-turnos/day-overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ dateKey, useWeekdaySlots: true }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "No se pudo abrir el día.");
        return;
      }
      trackPanelClick("abrir_feriado", dateKey);
      await loadOverrides();
    } catch {
      setError("Error de red. Probá de nuevo.");
    } finally {
      setBusyDateKey(null);
    }
  }

  async function closeHoliday(id: string, dateKey: string) {
    if (!window.confirm("¿Cerrar este día en la web? Volverá al estado de feriado (sin reservas).")) return;
    setBusyDateKey(dateKey);
    setError(null);
    try {
      const res = await fetch(`/api/panel-turnos/day-overrides?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "No se pudo cerrar el día.");
        return;
      }
      trackPanelClick("cerrar_feriado", dateKey);
      await loadOverrides();
    } catch {
      setError("Error de red. Probá de nuevo.");
    } finally {
      setBusyDateKey(null);
    }
  }

  return (
    <div className={panelPage}>
      <div className={`${panelContainer} pt-6`}>
        <header className="mb-6 flex items-center gap-3">
          <Link href="/panel-turnos" className={panelBackBtn} aria-label="Volver al panel">
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </Link>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-800">
              <Sun className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h1 className="font-heading text-[20px] font-bold leading-tight text-gray-900">Feriados</h1>
              <p className="text-[12px] text-gray-500">Abrí el día cuando trabajes</p>
            </div>
          </div>
        </header>

        <section className={`space-y-4 ${panelCard} p-4`}>
          <p className="text-[13px] leading-relaxed text-gray-600">
            Los feriados nacionales están <strong className="font-semibold text-gray-800">cerrados en la web</strong>{" "}
            por defecto. Si vas a trabajar, abrí el día y se habilitan los turnos habituales de ese día de la semana.
          </p>

          <div className="relative flex items-center justify-center px-10">
            <button
              type="button"
              onClick={prevMonth}
              className="absolute left-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-center text-[15px] font-semibold capitalize tracking-tight text-gray-900">
              {panelMonthTitle(year, month)}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="absolute right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>
          ) : null}

          {loading ? (
            <p className="py-8 text-center text-[14px] text-gray-500">Cargando…</p>
          ) : holidays.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <CalendarOff className="h-8 w-8 text-gray-300" strokeWidth={1.8} />
              <p className="text-[14px] text-gray-500">No hay feriados nacionales en este mes.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {holidays.map((dateKey) => {
                const open = overrideByDate.get(dateKey);
                const weekdaySlots = getEpicaSlotStartsForDate(dateKey);
                const slotsLabel = weekdaySlots.length > 0 ? weekdaySlots.join(" · ") : "sin horario habitual";
                const busy = busyDateKey === dateKey;

                return (
                  <li
                    key={dateKey}
                    className="rounded-2xl border border-gray-200 bg-gray-50/80 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold text-gray-900">
                          {formatSalonDisplayDate(dateKey)}
                        </p>
                        <p className="mt-0.5 text-[12px] text-gray-500">
                          Horario si abrís: {slotsLabel}
                        </p>
                        {open ? (
                          <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                            Abierto en la web
                          </span>
                        ) : (
                          <span className="mt-2 inline-flex rounded-full bg-gray-200 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700">
                            Cerrado (feriado)
                          </span>
                        )}
                      </div>
                      <div className="shrink-0">
                        {open ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void closeHoliday(open.id, dateKey)}
                            className="cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-2 text-[12px] font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-60"
                          >
                            {busy ? "…" : "Cerrar"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={busy || weekdaySlots.length === 0}
                            onClick={() => void openHoliday(dateKey)}
                            className={panelPrimaryBtn.replace("w-full", "w-auto px-4 py-2 text-[12px]")}
                          >
                            {busy ? "…" : "Abrir día"}
                          </button>
                        )}
                      </div>
                    </div>
                    {weekdaySlots.length === 0 ? (
                      <p className="mt-2 text-[11px] text-amber-700">
                        Este feriado cae un día sin turnos (ej. domingo). Contactá a soporte si necesitás horario especial.
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}

          <p className={panelLabel}>
            Tip: si no trabajás un feriado, no hace falta hacer nada — ya queda cerrado.
          </p>
        </section>
      </div>
    </div>
  );
}

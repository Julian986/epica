import {
  SALON_TREATMENTS,
  TREATMENT_CATEGORIES,
  type TreatmentCategory,
} from "@/lib/treatments/catalog";
import { isArgentinaPublicHoliday } from "@/lib/booking/argentina-holidays";

export type SalonTreatmentOption = {
  id: string;
  name: string;
  subtitle: string;
  category: TreatmentCategory;
};

export const SALON_TREATMENT_CATEGORIES: TreatmentCategory[] = [...TREATMENT_CATEGORIES];

export const SALON_TREATMENT_OPTIONS: SalonTreatmentOption[] = SALON_TREATMENTS.map((t) => ({
  id: t.id,
  name: t.name,
  subtitle: t.subtitle,
  category: t.category,
}));

/**
 * Último minuto del día en que puede *terminar* un servicio (ART).
 * Con turno a las 17:00 y lacio ~3 h provisional, el fin cae ~20:00.
 */
export const SALON_LAST_SERVICE_END_MINUTES = 20 * 60 + 30;

/** Inicios fijos de turno (Yoe, may 2026). */
const EPICA_SLOTS_TUE_WED_THU = ["10:00", "13:30"] as const;
const EPICA_SLOTS_MON_FRI = ["10:00", "13:30", "17:00"] as const;

function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Agenda ÉPICA (ART), según Yoe:
 * - Mar, mié y jue: 10:00 y 13:30
 * - Lun y vie: 10:00, 13:30 y 17:00
 * - Dom y sáb: sin turnos por ahora
 */
const availableTimesByWeekday: Record<number, string[]> = {
  0: [],
  1: [...EPICA_SLOTS_MON_FRI],
  2: [...EPICA_SLOTS_TUE_WED_THU],
  3: [...EPICA_SLOTS_TUE_WED_THU],
  4: [...EPICA_SLOTS_TUE_WED_THU],
  5: [...EPICA_SLOTS_MON_FRI],
  6: [],
};

/** Quita inicios donde el servicio pasaría de `SALON_LAST_SERVICE_END_MINUTES`. */
export function filterSlotsServiceEndsOnOrBeforeClose(
  slots: string[],
  durationMinutes: number,
  lastServiceEndMinutes: number = SALON_LAST_SERVICE_END_MINUTES,
): string[] {
  return slots.filter((t) => hhmmToMinutes(t) + durationMinutes <= lastServiceEndMinutes);
}

/**
 * Excepciones manuales por fecha (prioridad sobre `availableTimesByWeekday`).
 * Vacío: las entradas previas no tenían origen documentado; sumar acá `yyyy-mm-dd` → horarios cuando haya agenda confirmada.
 *
 * Copia de respaldo (no activa):
 * - 2026-03-30: 09:00, 16:30, 18:15
 * - 2026-03-31: 10:00, 17:00, 18:00
 * - 2026-04-01: 08:00, 10:00, 11:00, 12:00, 17:00
 * - 2026-04-04: 09:00, 10:00, 11:00, 12:00
 * - 2026-04-07: 10:00, 11:00, 15:00, 16:00, 17:30, 18:30
 * - 2026-04-08: 08:00, 09:00, 10:00, 10:30, 15:00, 16:00
 * - 2026-04-09: 08:00, 09:00, 10:00
 * - 2026-04-10: 11:00, 15:00, 16:00, 17:30, 18:30
 * - 2026-04-11: 08:00, 09:00, 10:00, 11:00, 12:00, 13:00
 */
const availableTimesByDateOverride: Record<string, string[]> = {};

export const salonWeekdayLabels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export const salonMonthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function formatSalonDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getAvailableTimesForDate(value: string) {
  const date = parseDateKey(value);
  const today = startOfDay(new Date());

  if (startOfDay(date) < today) {
    return [];
  }
  if (isArgentinaPublicHoliday(value)) {
    return [];
  }

  const override = availableTimesByDateOverride[value];
  if (override) {
    return override;
  }

  return availableTimesByWeekday[date.getDay()] ?? [];
}

export type SalonCalendarItem = {
  value: string;
  dayNumber: number;
  weekday: string;
  isCurrentMonth: boolean;
  isAvailable: boolean;
};

export function buildSalonCalendarItems(year: number, monthIndex: number): SalonCalendarItem[] {
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const startWeekday = firstDayOfMonth.getDay();
  const gridStartDate = new Date(year, monthIndex, 1 - startWeekday);

  return Array.from({ length: 35 }, (_, index) => {
    const currentDate = new Date(gridStartDate);
    currentDate.setDate(gridStartDate.getDate() + index);

    const value = formatSalonDateKey(currentDate);

    return {
      value,
      dayNumber: currentDate.getDate(),
      weekday: salonWeekdayLabels[currentDate.getDay()],
      isCurrentMonth: currentDate.getMonth() === monthIndex,
      isAvailable: getAvailableTimesForDate(value).length > 0,
    };
  });
}

export function formatSalonDisplayDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "Elegí día";

  const date = new Date(year, month - 1, day);
  return `${salonWeekdayLabels[date.getDay()]}, ${day} ${salonMonthNames[month - 1].slice(0, 3).toLowerCase()}`;
}

/** Solo dígitos, para cruzar reservas con el mismo WhatsApp aunque el formato varíe. */
export function normalizePhoneDigits(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function isLikelyWhatsappNumber(raw: string): boolean {
  const digits = normalizePhoneDigits(raw);
  return digits.length >= 10 && digits.length <= 15;
}

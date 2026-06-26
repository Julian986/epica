"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  EpicaServicePickerSheet,
  resolveEpicaPickerStepForServiceIds,
  type EpicaPickerStep,
} from "@/components/booking/epica-service-picker-sheet";
import {
  SALON_TREATMENT_OPTIONS,
  buildSalonCalendarItems,
  formatSalonDisplayDate,
  getAvailableTimesForDate,
  salonMonthNames,
  salonWeekdayLabels,
} from "@/lib/booking/salon-availability";
import { isArgentinaPublicHoliday } from "@/lib/booking/argentina-holidays";
import {
  buildEpicaReferencePricing,
  serviceIdsNeedAbundantHairChoice,
  type AbundantHairChoice,
} from "@/lib/treatments/abundant-hair";
import {
  findSalonTreatmentById,
  isComplementarioTreatmentId,
  isLacioTreatmentId,
  normalizeEpicaServiceIds,
  primaryTreatmentIdFromServiceIds,
  type LacioVariantId,
} from "@/lib/treatments/catalog";

export type BookingPickerProps = {
  selectedTreatmentId: string;
  onTreatmentIdChange: (id: string) => void;
  selectedDate: string;
  onDateChange: (dateKey: string) => void;
  selectedTime: string;
  onTimeChange: (time: string) => void;
  /** Si se pasa, define qué horarios mostrar (ej. reserva pública con margen de 60 min en “hoy”). */
  resolveTimeSlots?: (dateKey: string) => string[];
  /**
   * Horarios ya resueltos en servidor (solapes, reglas). Solo aplica al `selectedDate` actual.
   * `undefined`: usar `resolveTimeSlots` / plantilla. `null`: cargando.
   */
  remoteTimeSlots?: string[] | null;
  /** `public`: reglas y textos de reserva web. `panel`: alta manual sin tope de “desde mañana”. */
  bookingContext?: "public" | "panel";
  bookingFocusRef?: React.RefObject<HTMLDivElement | null>;
  treatmentFirstHintVisible: boolean;
  onTreatmentFirstHintVisible: (visible: boolean) => void;
  selectedCountLabel?: string;
  selectedDurationLabel?: string;
  summaryTitle?: string;
  monthAvailabilityServiceIds?: string[];
  multiSelect?: boolean;
  selectedTreatmentIds?: string[];
  onToggleTreatmentId?: (id: string) => void;
  onClearTreatmentIds?: () => void;
  comboHintText?: string;
  comboDurationLabel?: string;
  comboAlertText?: string | null;
  /** Si viene de `/turnos?variant=sublime`, el modal abre directo en largo. */
  initialLacioVariant?: LacioVariantId;
  /** Lacio + complementario opcional (turnos públicos). */
  selectedServiceIds?: string[];
  onServiceIdsChange?: (ids: string[]) => void;
  abundantHair?: AbundantHairChoice;
  onAbundantHairChange?: (choice: AbundantHairChoice) => void;
  /** En wizard /turnos: solo calendario o solo horarios. */
  wizardSection?: "date" | "time";
};

export function BookingPicker({
  selectedTreatmentId,
  onTreatmentIdChange,
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange,
  resolveTimeSlots,
  remoteTimeSlots,
  bookingContext = "public",
  bookingFocusRef,
  treatmentFirstHintVisible,
  onTreatmentFirstHintVisible,
  selectedCountLabel,
  selectedDurationLabel,
  summaryTitle,
  monthAvailabilityServiceIds = [],
  multiSelect = false,
  selectedTreatmentIds = [],
  onToggleTreatmentId,
  onClearTreatmentIds,
  comboHintText,
  comboDurationLabel,
  comboAlertText,
  initialLacioVariant,
  selectedServiceIds = [],
  onServiceIdsChange,
  abundantHair = "unknown",
  onAbundantHairChange,
  wizardSection,
}: BookingPickerProps) {
  const isLight = true;
  const epicaBundle = Boolean(onServiceIdsChange);
  const effectiveServiceIds = epicaBundle
    ? selectedServiceIds
    : selectedTreatmentId
      ? [selectedTreatmentId]
      : [];
  const [visibleMonthDate, setVisibleMonthDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  /** `undefined`: sin servicio o sin datos; `null`: cargando; objeto: hay al menos un hueco ese día para el servicio. */
  const [monthAvailability, setMonthAvailability] = useState<Record<string, boolean> | null | undefined>(undefined);
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [pickerStep, setPickerStep] = useState<EpicaPickerStep>("root");
  const [pendingLacioVariant, setPendingLacioVariant] = useState<LacioVariantId | null>(null);
  /** Selección en curso dentro del modal (feedback inmediato antes de confirmar). */
  const [draftServiceIds, setDraftServiceIds] = useState<string[]>([]);
  const [draftAbundantHair, setDraftAbundantHair] = useState<AbundantHairChoice>("unknown");

  const setDraft = (ids: string[]) => {
    setDraftServiceIds(normalizeEpicaServiceIds(ids));
  };

  const referencePricingSummary = useMemo(() => {
    if (effectiveServiceIds.length === 0) return null;
    return buildEpicaReferencePricing(effectiveServiceIds, abundantHair);
  }, [effectiveServiceIds, abundantHair]);

  const hasServiceSelection = effectiveServiceIds.length > 0;
  const summaryTreatments = useMemo(
    () =>
      effectiveServiceIds.flatMap((id) => {
        const opt = SALON_TREATMENT_OPTIONS.find((o) => o.id === id);
        return opt ? [opt] : [];
      }),
    [effectiveServiceIds],
  );
  const selectedTreatment = summaryTreatments[0];
  const selectedTreatmentDetail = useMemo(
    () => findSalonTreatmentById(primaryTreatmentIdFromServiceIds(effectiveServiceIds)),
    [effectiveServiceIds],
  );
  const calendarItems = useMemo(
    () => buildSalonCalendarItems(visibleMonthDate.getFullYear(), visibleMonthDate.getMonth()),
    [visibleMonthDate],
  );
  const visibleMonthLabel = `${salonMonthNames[visibleMonthDate.getMonth()]} ${visibleMonthDate.getFullYear()}`;

  useEffect(() => {
    const availIds = monthAvailabilityServiceIds.length > 0 ? monthAvailabilityServiceIds : effectiveServiceIds;
    const primaryId = primaryTreatmentIdFromServiceIds(availIds);
    if (!primaryId.trim() && availIds.length === 0) {
      setMonthAvailability(undefined);
      return;
    }
    let cancelled = false;
    const ac = new AbortController();
    setMonthAvailability(null);
    const y = visibleMonthDate.getFullYear();
    const m = visibleMonthDate.getMonth();
    const q = new URLSearchParams({
      year: String(y),
      monthIndex: String(m),
      treatmentId: primaryId,
      scope: bookingContext === "panel" ? "panel" : "public",
    });
    if (availIds.length > 0) {
      q.set("serviceIds", availIds.join(","));
    }
    fetch(`/api/booking/month-availability?${q.toString()}`, {
      credentials: "same-origin",
      signal: ac.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<{ availability?: Record<string, boolean> }>;
      })
      .then((data) => {
        if (cancelled) return;
        const raw = data.availability;
        setMonthAvailability(typeof raw === "object" && raw !== null ? raw : undefined);
      })
      .catch(() => {
        if (!cancelled) setMonthAvailability(undefined);
      });
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [effectiveServiceIds, visibleMonthDate, bookingContext, monthAvailabilityServiceIds]);

  useEffect(() => {
    if (!selectedDate || !hasServiceSelection) return;
    if (monthAvailability === undefined || monthAvailability === null) return;
    if (monthAvailability[selectedDate] === false) {
      onDateChange("");
      onTimeChange("");
    }
  }, [monthAvailability, onDateChange, onTimeChange, selectedDate, hasServiceSelection]);

  const useRemoteSlots = remoteTimeSlots !== undefined;
  const slotsLoading = useRemoteSlots && selectedDate && remoteTimeSlots === null;
  const availableTimes = selectedDate
    ? useRemoteSlots
      ? remoteTimeSlots === null
        ? []
        : remoteTimeSlots
      : resolveTimeSlots
        ? resolveTimeSlots(selectedDate)
        : getAvailableTimesForDate(selectedDate)
    : [];
  const isSelectedDateHoliday = Boolean(selectedDate && isArgentinaPublicHoliday(selectedDate));

  const activeStep = !hasServiceSelection
    ? 1
    : !selectedDate
      ? 2
      : !selectedTime
        ? 3
        : 4;

  const applyServiceIds = (ids: string[]) => {
    onServiceIdsChange?.(ids);
    onTreatmentIdChange(primaryTreatmentIdFromServiceIds(ids));
  };

  const openTreatmentModal = () => {
    setDraft(effectiveServiceIds);
    setDraftAbundantHair(
      serviceIdsNeedAbundantHairChoice(effectiveServiceIds) ? abundantHair : "unknown",
    );
    if (effectiveServiceIds.length > 0) {
      const resolved = resolveEpicaPickerStepForServiceIds(effectiveServiceIds);
      setPickerStep(resolved.step);
      setPendingLacioVariant(resolved.lacioVariant);
    } else if (initialLacioVariant) {
      setPickerStep("lacio-length");
      setPendingLacioVariant(initialLacioVariant);
    } else {
      setPickerStep("root");
      setPendingLacioVariant(null);
    }
    setIsTreatmentModalOpen(true);
  };

  const closeTreatmentModal = () => {
    setIsTreatmentModalOpen(false);
    setPickerStep("root");
    setPendingLacioVariant(null);
    setDraftServiceIds([]);
    setDraftAbundantHair("unknown");
  };

  const commitDraft = () => {
    if (draftServiceIds.length === 0) return;
    const needsAbundant = serviceIdsNeedAbundantHairChoice(draftServiceIds);
    if (epicaBundle) {
      applyServiceIds(draftServiceIds);
      onAbundantHairChange?.(needsAbundant ? draftAbundantHair : "unknown");
    } else {
      onTreatmentIdChange(primaryTreatmentIdFromServiceIds(draftServiceIds));
    }
  };

  const handleSelectLacioLength = (lacioId: string) => {
    const comp = draftServiceIds.find(isComplementarioTreatmentId);
    setDraft(comp ? [lacioId, comp] : [lacioId]);
    setPickerStep("lacio-addon");
  };

  const handleToggleAddonComplementario = (complementarioId: string) => {
    const lacio = draftServiceIds.find(isLacioTreatmentId);
    if (!lacio) return;
    const current = draftServiceIds.find(isComplementarioTreatmentId);
    setDraft(current === complementarioId ? [lacio] : [lacio, complementarioId]);
  };

  const handleConfirmLacioSelection = () => {
    commitDraft();
    closeTreatmentModal();
  };

  const handleDraftSelectComplementarioOnly = (complementarioId: string) => {
    setDraft([complementarioId]);
    setPickerStep("complementarios");
  };

  const handleConfirmComplementarioOnly = () => {
    if (draftServiceIds.length === 0) return;
    commitDraft();
    closeTreatmentModal();
  };

  const selectTreatment = (treatmentId: string) => {
    onTreatmentIdChange(treatmentId);
    if (multiSelect && onToggleTreatmentId) {
      onToggleTreatmentId(treatmentId);
      return;
    }
    closeTreatmentModal();
  };

  const todayKey = (() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  })();

  return (
    <>
      {!wizardSection ? (
      <section className="space-y-2">
        <button
          type="button"
          onClick={openTreatmentModal}
          className={`flex w-full cursor-pointer items-center justify-between rounded-2xl border bg-white px-4 py-3 text-left transition-all ${
            activeStep === 1
              ? "border-[#B88E2F] shadow-[0_0_0_1px_rgba(184,142,47,0.22),0_0_22px_rgba(184,142,47,0.12)]"
              : "border-gray-200"
          }`}
        >
          <div>
            <p className="text-[11px] tracking-[0.14em] text-gray-500">Paso 1</p>
            <p className="mt-1 text-[14px] text-gray-900">
              {summaryTitle ??
                (summaryTreatments.length > 1
                  ? summaryTreatments.map((t) => t.name).join(" + ")
                  : selectedTreatment
                    ? selectedTreatment.name
                    : "Elegí servicio")}
            </p>
            {selectedCountLabel ? (
              <p className="mt-1 text-[11px] text-gray-500">{selectedCountLabel}</p>
            ) : selectedTreatment ? (
              <p className="mt-1 text-[11px] text-gray-500">
                {referencePricingSummary?.totalReferenceLabel
                  ? `Precio referencia ${referencePricingSummary.totalReferenceLabel}`
                  : selectedTreatmentDetail?.priceLabel
                    ? `${selectedTreatmentDetail.priceLabel} · ${selectedTreatment.subtitle}`
                    : selectedTreatment.subtitle}
              </p>
            ) : null}
            {selectedDurationLabel ? (
              <div className="mt-2 inline-flex items-center rounded-full border border-[#B88E2F]/55 bg-[#B88E2F]/12 px-2.5 py-1">
                <span className="text-[11px] font-semibold tracking-[0.02em] text-[#996515]">
                  {selectedDurationLabel}
                </span>
              </div>
            ) : null}
            {activeStep === 1 && (
              <div className="mt-2 flex items-center gap-2 text-[11px] text-[#B88E2F]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#B88E2F]" />
                <span>Comenzá seleccionando el servicio</span>
              </div>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" strokeWidth={1.8} />
        </button>

        <div
          className={`flex items-center justify-between rounded-2xl border bg-white px-4 py-3 transition-all ${
            activeStep === 2
              ? "border-[#B88E2F] shadow-[0_0_0_1px_rgba(184,142,47,0.22),0_0_22px_rgba(184,142,47,0.12)]"
              : "border-gray-200"
          }`}
        >
          <div>
            <p className="text-[11px] tracking-[0.14em] text-gray-500">Paso 2</p>
            <p className="mt-1 text-[14px] text-gray-900">
              {selectedDate ? formatSalonDisplayDate(selectedDate) : "Elegí día"}
            </p>
            {activeStep === 2 && (
              <div className="mt-2 flex items-center gap-2 text-[11px] text-[#B88E2F]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#B88E2F]" />
                <span>Ahora elegí una fecha disponible</span>
              </div>
            )}
          </div>
          <ChevronRight className="h-4 w-4 rotate-90 text-gray-400" strokeWidth={1.8} />
        </div>
      </section>
      ) : null}

      {(wizardSection === undefined || wizardSection === "date") && (
      <section
        className={
          isLight
            ? "mt-4 overflow-hidden rounded-[24px] border border-[var(--border-light)] bg-[var(--surface-card)] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
            : "mt-4 overflow-hidden rounded-[24px] border border-white/8 bg-[#e4c48f] p-3 text-[#2c241b] shadow-[0_12px_26px_rgba(0,0,0,0.36)]"
        }
      >
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              setVisibleMonthDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
            }
            className={`cursor-pointer rounded-lg p-2 ${
              isLight ? "text-[var(--text-primary)] hover:bg-[var(--surface-light)]" : "p-1 text-[#7f6a45] hover:bg-black/10"
            }`}
          >
            <ChevronLeft className={isLight ? "h-5 w-5" : "h-4 w-4"} strokeWidth={1.8} />
          </button>
          <h2
            className={`flex items-center gap-2 leading-none font-heading ${
              isLight ? "text-[20px] font-bold text-[var(--text-primary)]" : "text-[18px]"
            }`}
          >
            {visibleMonthLabel}
            {hasServiceSelection && monthAvailability === null ? (
              <span
                className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-[#7f6a45]/90"
                aria-hidden
              />
            ) : null}
          </h2>
          <button
            type="button"
            onClick={() =>
              setVisibleMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
            }
            className={`cursor-pointer rounded-lg p-2 ${
              isLight ? "text-[var(--text-primary)] hover:bg-[var(--surface-light)]" : "p-1 text-[#7f6a45] hover:bg-black/10"
            }`}
          >
            <ChevronRight className={isLight ? "h-5 w-5" : "h-4 w-4"} strokeWidth={1.8} />
          </button>
        </div>

        {treatmentFirstHintVisible ? (
          <p
            role="status"
            aria-live="polite"
            className={
              isLight
                ? "mb-3 rounded-xl border border-[var(--premium-gold)]/40 bg-[var(--premium-gold)]/10 px-4 py-3 text-center text-[16px] leading-snug text-[var(--text-primary)]"
                : "mb-2 rounded-xl border border-[#8a7548]/55 bg-[#fff9ec]/97 px-3 py-2.5 text-center text-[12px] leading-snug text-[#2c241b] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
            }
          >
            <span className="font-semibold">Primero elegí un servicio</span>
            <span> (paso 1) para poder elegir el día.</span>
          </p>
        ) : null}

        <div
          className="grid grid-cols-7 gap-y-2 text-center"
          aria-busy={Boolean(hasServiceSelection && monthAvailability === null)}
        >
          {salonWeekdayLabels.map((label) => (
            <div
              key={label}
              className={
                isLight
                  ? "text-[16px] font-semibold tracking-[0.04em] text-[var(--text-secondary)]"
                  : "text-[10px] tracking-[0.08em] text-[#7f7364]"
              }
            >
              {label}
            </div>
          ))}
          {calendarItems.map((day) => {
            const isSelected = day.value === selectedDate;
            const isToday = day.value === todayKey && day.isCurrentMonth;
            const monthAvailReady = monthAvailability !== undefined && monthAvailability !== null;
            const fullyBooked =
              Boolean(hasServiceSelection) &&
              monthAvailReady &&
              day.isCurrentMonth &&
              (day.isAvailable || monthAvailability[day.value] === true) &&
              monthAvailability[day.value] === false;
            const serverOpen =
              monthAvailReady && day.isCurrentMonth && monthAvailability[day.value] === true;
            const isDisabled = !day.isCurrentMonth || fullyBooked || (!day.isAvailable && !serverOpen);
            const daySelectable = day.isAvailable || serverOpen;

            const dayClass = isLight
              ? `mx-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border text-[16px] font-semibold transition-all disabled:cursor-not-allowed ${
                  isSelected
                    ? "border-[var(--premium-gold)] bg-[var(--premium-gold)] text-[var(--on-accent)] shadow-[0_4px_12px_rgba(228,202,105,0.35)]"
                    : fullyBooked
                      ? "border-[var(--border-light)] bg-[var(--surface-light)] text-[var(--text-secondary)] line-through"
                      : !day.isCurrentMonth
                        ? "border-transparent text-[var(--text-secondary)]/35"
                        : daySelectable
                          ? isToday
                            ? "border-[var(--premium-gold)]/50 bg-[var(--premium-gold)]/12 text-[var(--text-primary)]"
                            : "border-[var(--border-light)] bg-white text-[var(--text-primary)] hover:border-[var(--premium-gold)]/40"
                          : "border-transparent text-[var(--text-secondary)]/45"
                }`
              : `mx-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[12px] transition-colors disabled:cursor-not-allowed ${
                  isSelected
                    ? "bg-[#1a1a1a] text-[#c89b56] shadow-[0_6px_14px_rgba(0,0,0,0.25)]"
                    : fullyBooked
                      ? "bg-[#c9b89a]/55 text-[#5c4f3d] line-through decoration-[#6b5a45]"
                      : !day.isCurrentMonth
                        ? "text-[#cfbea8]/45"
                        : daySelectable
                          ? "bg-[#eed7ae] text-[#3b2f22]"
                          : "text-[#897a67]"
                }`;

            return (
              <button
                key={day.value}
                type="button"
                disabled={isDisabled}
                title={
                  fullyBooked
                    ? "Sin cupos para este servicio (ocupado o bloqueado)."
                    : !day.isAvailable && !serverOpen && day.isCurrentMonth
                      ? "Día no disponible (cerrado o feriado)."
                      : undefined
                }
                aria-label={
                  fullyBooked
                    ? `${day.dayNumber}, sin cupos`
                    : !day.isAvailable && !serverOpen && day.isCurrentMonth
                      ? `${day.dayNumber}, no disponible`
                      : undefined
                }
                onClick={() => {
                  if (!hasServiceSelection) {
                    onTreatmentFirstHintVisible(true);
                    return;
                  }
                  onDateChange(day.value);
                  onTimeChange("");
                  requestAnimationFrame(() => {
                    bookingFocusRef?.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  });
                }}
                className={dayClass}
              >
                {day.dayNumber}
              </button>
            );
          })}
        </div>
      </section>
      )}

      {(wizardSection === undefined || wizardSection === "time") && (
      <div ref={bookingFocusRef} className={wizardSection ? "" : "mt-4"}>
        <section>
          {!wizardSection ? (
          <div
            className={`flex items-center justify-between rounded-2xl border bg-white px-4 py-3 transition-all ${
              activeStep === 3
                ? "border-[#B88E2F] shadow-[0_0_0_1px_rgba(184,142,47,0.22),0_0_22px_rgba(184,142,47,0.12)]"
                : "border-gray-200"
            }`}
          >
            <div>
              <p className="text-[11px] tracking-[0.14em] text-gray-500">Paso 3</p>
              <p className="mt-1 text-[14px] text-gray-900">
                {selectedTime ? `Horario elegido: ${selectedTime}` : "Elegí horario"}
              </p>
              {activeStep === 3 && (
                <div className="mt-2 flex items-center gap-2 text-[11px] text-[var(--premium-gold)]/92">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--premium-gold)]" />
                  <span>Seleccioná un horario para continuar</span>
                </div>
              )}
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" strokeWidth={1.8} />
          </div>
          ) : null}

          <div className={`grid grid-cols-2 gap-3 ${wizardSection ? "" : "mt-4"}`}>
            {slotsLoading ? (
              <div
                className={`col-span-2 rounded-2xl border px-4 py-6 text-center text-[16px] ${
                  isLight
                    ? "border-[var(--border-light)] bg-[var(--surface-light)] text-[var(--text-secondary)]"
                    : "border-white/8 bg-[#171717] py-5 text-[13px] text-[var(--soft-gray)]/68"
                }`}
              >
                Cargando horarios…
              </div>
            ) : availableTimes.length > 0 ? (
              availableTimes.map((time) => {
                const isActive = time === selectedTime;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => onTimeChange(time)}
                    className={`h-12 cursor-pointer rounded-xl border text-[16px] font-semibold transition-colors ${
                      isActive
                        ? isLight
                          ? "border-[var(--premium-gold)] bg-[var(--premium-gold)] text-[var(--on-accent)] shadow-[0_4px_12px_rgba(228,202,105,0.35)]"
                          : "border-[var(--premium-gold)] bg-[rgba(206,120,50,0.14)] text-[var(--premium-gold)]"
                        : isLight
                          ? "border-[var(--border-light)] bg-white text-[var(--text-primary)] hover:border-[var(--premium-gold)]/40"
                          : "border-white/8 bg-[#151515] text-[var(--soft-gray)]"
                    }`}
                  >
                    {time}
                  </button>
                );
              })
            ) : (
              <div
                className={`col-span-2 rounded-2xl border px-4 py-5 text-center ${
                  selectedDate
                    ? isLight
                      ? "border-amber-200 bg-amber-50"
                      : "border-amber-500/35 bg-amber-950/20"
                    : isLight
                      ? "border-[var(--border-light)] bg-[var(--surface-light)]"
                      : bookingContext === "panel"
                        ? "border-white/8 bg-[#171717]"
                        : "border-[var(--premium-gold)]/35 bg-[rgba(206,120,50,0.14)]"
                }`}
              >
                {selectedDate ? (
                  <>
                    <p className={`text-[16px] font-medium ${isLight ? "text-amber-900" : "text-[13px] text-amber-100/95"}`}>
                      {isSelectedDateHoliday && (monthAvailability?.[selectedDate] !== true)
                        ? "Feriado (cerrado): no hay horarios disponibles para este día."
                        : "No hay horarios disponibles para este día."}
                    </p>
                    <p className={`mt-1 ${isLight ? "text-[16px] text-amber-800" : "text-[12px] text-amber-100/75"}`}>
                      {isSelectedDateHoliday && (monthAvailability?.[selectedDate] !== true)
                        ? "Elegí otra fecha habilitada para ver turnos disponibles."
                        : "Probá con otra fecha para ver turnos disponibles."}
                    </p>
                  </>
                ) : bookingContext === "panel" ? (
                  <p className={`${isLight ? "text-[16px] text-[var(--text-secondary)]" : "text-[13px] text-[var(--soft-gray)]/72"}`}>
                    Elegí una fecha para ver los horarios disponibles.
                  </p>
                ) : (
                  <>
                    <p className={`font-medium ${isLight ? "text-[16px] text-[var(--text-primary)]" : "text-[13px] text-[var(--premium-gold)]"}`}>
                      Los turnos web se reservan a partir de mañana (no el mismo día).
                    </p>
                    <p className={`mt-1 ${isLight ? "text-[16px] text-[var(--text-secondary)]" : "text-[12px] text-[var(--soft-gray)]/88"}`}>
                      Elegí una fecha desde mañana para ver horarios.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
      )}

      {!wizardSection && isTreatmentModalOpen ? (
        <EpicaServicePickerSheet
          step={pickerStep}
          pendingLacioVariant={pendingLacioVariant}
          selectedServiceIds={draftServiceIds}
          onStepChange={setPickerStep}
          onPendingLacioVariantChange={setPendingLacioVariant}
          onSelectLacioLength={handleSelectLacioLength}
          onToggleAddonComplementario={handleToggleAddonComplementario}
          onConfirmLacioSelection={handleConfirmLacioSelection}
          onDraftSelectComplementarioOnly={handleDraftSelectComplementarioOnly}
          onConfirmComplementarioOnly={handleConfirmComplementarioOnly}
          abundantHairChoice={draftAbundantHair}
          onAbundantHairChange={setDraftAbundantHair}
          onClose={closeTreatmentModal}
        />
      ) : null}
    </>
  );
}

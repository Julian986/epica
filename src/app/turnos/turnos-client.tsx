"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { BookingPicker } from "@/components/booking/booking-picker";
import {
  BookingStepEpicaServices,
  type BookingStepEpicaServicesHandle,
} from "@/components/booking/booking-step-epica-services";
import { BookingWizardShell } from "@/components/booking/booking-wizard-shell";
import { trackWizardContinue } from "@/lib/analytics/track";
import { event as gaEvent } from "@/lib/gtag";
import {
  SALON_TREATMENT_OPTIONS,
  formatSalonDisplayDate,
  isLikelyWhatsappNumber,
} from "@/lib/booking/salon-availability";
import { treatmentRequiresPublicDeposit } from "@/lib/reservations/public-deposit";
import { parseLacioVariantParam } from "@/components/booking/epica-service-picker-sheet";
import {
  buildReservationPricingSubtitle,
  serviceIdsIncludeLacio,
  serviceIdsNeedAbundantHairChoice,
  type AbundantHairChoice,
} from "@/lib/treatments/abundant-hair";
import {
  findSalonTreatmentById,
  normalizeEpicaServiceIds,
  primaryTreatmentIdFromServiceIds,
} from "@/lib/treatments/catalog";

type TurnosClientProps = {
  initialTreatment?: string;
  initialVariant?: string;
};

type MeReservationsResponse = {
  reservations?: Array<{
    customerName?: string;
    customerPhone?: string;
    startsAtIso?: string;
  }>;
};
const CUSTOMER_PROFILE_CACHE_KEY = "mp_customer_profile_cache";

export default function TurnosClient({ initialTreatment = "", initialVariant = "" }: TurnosClientProps) {
  const router = useRouter();
  const treatmentParam = (() => {
    try {
      return decodeURIComponent(initialTreatment.trim());
    } catch {
      return initialTreatment.trim();
    }
  })();
  const lacioVariantFromUrl = parseLacioVariantParam(initialVariant);
  const initialMatch = SALON_TREATMENT_OPTIONS.find(
    (option) => option.id === treatmentParam || option.name === treatmentParam,
  );

  const [wizardStep, setWizardStep] = useState(1);
  const [step1CanContinue, setStep1CanContinue] = useState(false);
  const [step1ContinueLabel, setStep1ContinueLabel] = useState("Continuar");
  const [step1ContinueHint, setStep1ContinueHint] = useState<string | null>(null);
  const [step1DraftSummary, setStep1DraftSummary] = useState<string | null>(null);
  const step1Ref = useRef<BookingStepEpicaServicesHandle>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    initialMatch ? normalizeEpicaServiceIds([initialMatch.id]) : [],
  );
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string>(
    initialMatch ? primaryTreatmentIdFromServiceIds([initialMatch.id]) : "",
  );
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [abundantHair, setAbundantHair] = useState<AbundantHairChoice>("unknown");
  const [treatmentFirstHintVisible, setTreatmentFirstHintVisible] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<"unknown" | "guest" | "authed">("unknown");
  const [sessionDisplayName, setSessionDisplayName] = useState<string | null>(null);
  /** Horarios con solapes resueltos en servidor; `undefined` = no aplica, `null` = cargando. */
  const [remoteSlots, setRemoteSlots] = useState<string[] | null | undefined>(undefined);
  const bookingFocusRef = useRef<HTMLDivElement | null>(null);
  const sessionBootstrappedRef = useRef(false);

  const selectedServices = useMemo(
    () =>
      selectedServiceIds.flatMap((id) => {
        const found = SALON_TREATMENT_OPTIONS.find((o) => o.id === id);
        return found ? [found] : [];
      }),
    [selectedServiceIds],
  );
  const selectedServicesSummary = useMemo(
    () => selectedServices.map((s) => s.name).join(" + "),
    [selectedServices],
  );
  const totalSelectedDurationMinutes = useMemo(
    () =>
      selectedServiceIds.reduce((acc, id) => {
        const t = findSalonTreatmentById(id);
        return acc + (t?.durationMinutes ?? 0);
      }, 0),
    [selectedServiceIds],
  );
  const selectedDurationLabel = useMemo(() => {
    if (selectedServiceIds.length === 0) return "";
    if (selectedServiceIds.some((id) => findSalonTreatmentById(id)?.durationLabel === "A confirmar")) {
      return "Duración a confirmar en salón";
    }
    const total = totalSelectedDurationMinutes;
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h > 0 && m > 0) return `Duración ${h} h ${m} min (provisional)`;
    if (h > 0) return `Duración ${h} h (provisional)`;
    return `Duración ${m} min (provisional)`;
  }, [selectedServiceIds, totalSelectedDurationMinutes]);

  const primaryService = selectedServices[0];
  const requiresDeposit = selectedServices.some((s) => treatmentRequiresPublicDeposit(s.id));

  const hasSlot = Boolean(selectedServices.length > 0 && selectedDate && selectedTime);
  const datosComplete = Boolean(
    customerName.trim().length >= 2 &&
      isLikelyWhatsappNumber(customerPhone) &&
      whatsappOptIn,
  );
  const showWhatsappInvalidHint =
    customerPhone.trim().length >= 8 && !isLikelyWhatsappNumber(customerPhone);
  const hasSessionProfile = sessionStatus === "authed" && customerName.trim().length >= 2 && isLikelyWhatsappNumber(customerPhone);
  const clearSelectedServices = useCallback(() => {
    setSelectedServiceIds([]);
    setSelectedTreatmentId("");
    setSelectedDate("");
    setSelectedTime("");
    setAbundantHair("unknown");
  }, []);

  const handleClearSelectedServices = useCallback(() => {
    if (selectedServiceIds.length >= 2 && !window.confirm("¿Quitar todos los servicios seleccionados?")) {
      return;
    }
    clearSelectedServices();
  }, [clearSelectedServices, selectedServiceIds.length]);

  const handleWizardBack = useCallback(() => {
    if (wizardStep <= 1) {
      router.push("/");
      return;
    }
    if (wizardStep === 5 && hasSessionProfile) {
      setWizardStep(3);
      return;
    }
    setWizardStep((s) => s - 1);
  }, [router, wizardStep, hasSessionProfile]);

  const handleWizardContinue = useCallback(() => {
    if (wizardStep === 1) {
      const result = step1Ref.current?.continue();
      if (result === "wizard-next") {
        setWizardStep(2);
      }
      return;
    }
    if (wizardStep === 2 && selectedDate) {
      setWizardStep(3);
      return;
    }
    if (wizardStep === 3 && selectedTime) {
      setWizardStep(hasSessionProfile ? 5 : 4);
      return;
    }
    if (wizardStep === 4 && datosComplete) {
      setWizardStep(5);
    }
  }, [
    wizardStep,
    selectedDate,
    selectedTime,
    hasSessionProfile,
    datosComplete,
  ]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOMER_PROFILE_CACHE_KEY);
      if (!raw) return;
      const cached = JSON.parse(raw) as { name?: string; phone?: string };
      const cachedName = String(cached.name ?? "").trim();
      const cachedPhone = String(cached.phone ?? "").trim();
      if (cachedName) {
        setSessionDisplayName(cachedName);
        if (customerName.trim().length < 2) setCustomerName(cachedName);
        setSessionStatus("authed");
      }
      if (cachedPhone && !isLikelyWhatsappNumber(customerPhone)) {
        setCustomerPhone(cachedPhone);
      }
    } catch {
      // ignore invalid local cache
    }
  }, []);

  useEffect(() => {
    if (sessionBootstrappedRef.current) return;
    sessionBootstrappedRef.current = true;
    let cancelled = false;
    let retryTimer: number | null = null;
    const applyProfileFromReservations = (rows: MeReservationsResponse["reservations"]) => {
      const list = Array.isArray(rows) ? rows : [];
      const latest = [...list]
        .sort((a, b) => String(b.startsAtIso ?? "").localeCompare(String(a.startsAtIso ?? "")))[0];
      if (latest?.customerName && customerName.trim().length < 2) {
        setCustomerName(latest.customerName.trim());
      }
      if (latest?.customerPhone && !isLikelyWhatsappNumber(customerPhone)) {
        setCustomerPhone(latest.customerPhone.trim());
      }
      const n = latest?.customerName?.trim();
      setSessionDisplayName(n && n.length >= 2 ? n : null);
      setSessionStatus("authed");
      try {
        localStorage.setItem(
          CUSTOMER_PROFILE_CACHE_KEY,
          JSON.stringify({
            name: latest?.customerName?.trim() ?? "",
            phone: latest?.customerPhone?.trim() ?? "",
          }),
        );
      } catch {
        // ignore localStorage failures
      }
    };

    const run = async (attempt: number) => {
      try {
        const res = await fetch("/api/me/reservations?source=turnos", {
          credentials: "same-origin",
          cache: "no-store",
        });
        if (cancelled) return;
        if (res.status === 401) {
          if (attempt < 5) {
            retryTimer = window.setTimeout(() => {
              if (!cancelled) void run(attempt + 1);
            }, 450);
            return;
          }
          setSessionStatus("guest");
          setSessionDisplayName(null);
          return;
        }
        if (!res.ok) {
          setSessionStatus("guest");
          setSessionDisplayName(null);
          return;
        }
        const data = (await res.json()) as MeReservationsResponse;
        applyProfileFromReservations(data.reservations);
      } catch {
        if (!cancelled) setSessionStatus("guest");
      }
    };

    (async () => {
      await run(1);
    })();
    return () => {
      cancelled = true;
      if (retryTimer) window.clearTimeout(retryTimer);
    };
  }, []);

  useEffect(() => {
    if (selectedServiceIds.length > 0) setTreatmentFirstHintVisible(false);
  }, [selectedServiceIds.length]);

  useEffect(() => {
    if (!treatmentFirstHintVisible) return;
    const t = window.setTimeout(() => setTreatmentFirstHintVisible(false), 4500);
    return () => window.clearTimeout(t);
  }, [treatmentFirstHintVisible]);

  useEffect(() => {
    if (!selectedDate || selectedServiceIds.length === 0) {
      setRemoteSlots(undefined);
      return;
    }
    let cancelled = false;
    setRemoteSlots(null);
    const q = new URLSearchParams({
      dateKey: selectedDate,
      treatmentId: primaryTreatmentIdFromServiceIds(selectedServiceIds),
      serviceIds: selectedServiceIds.join(","),
      scope: "public",
    });
    fetch(`/api/booking/slots?${q.toString()}`)
      .then((res) => res.json())
      .then((data: { slots?: string[] }) => {
        if (!cancelled) {
          setRemoteSlots(Array.isArray(data.slots) ? data.slots : []);
        }
      })
      .catch(() => {
        if (!cancelled) setRemoteSlots([]);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDate, selectedServiceIds]);

  useEffect(() => {
    if (!selectedDate || !selectedTime || selectedServiceIds.length === 0) return;
    if (remoteSlots === undefined || remoteSlots === null) return;
    if (!remoteSlots.includes(selectedTime)) {
      setSelectedTime("");
    }
  }, [selectedDate, selectedTime, selectedServiceIds, remoteSlots]);

  const applyServiceIds = (ids: string[]) => {
    const normalized = normalizeEpicaServiceIds(ids);
    setSelectedServiceIds(normalized);
    setSelectedTreatmentId(primaryTreatmentIdFromServiceIds(normalized));
    if (!serviceIdsIncludeLacio(normalized)) {
      setAbundantHair("unknown");
    }
    setSelectedTime("");
  };

  const handleMercadoPagoCheckout = async () => {
    if (!primaryService || selectedServices.length === 0 || !selectedDate || !selectedTime || !datosComplete) {
      return;
    }
    setConfirmError(null);
    setCheckoutLoading(true);
    try {
      const comboSubtitle =
        selectedServices.length > 1
          ? selectedServices.map((s) => s.subtitle).join(" · ")
          : primaryService.subtitle;
      const pricingNote = buildReservationPricingSubtitle(selectedServiceIds, abundantHair);
      const subtitleMerged = pricingNote ? `${comboSubtitle} · ${pricingNote}` : comboSubtitle;
      const pendingBody = {
        treatmentId: primaryService.id,
        treatmentName: selectedServicesSummary,
        subtitle: subtitleMerged,
        category: primaryService.category,
        serviceIds: selectedServiceIds,
        ...(serviceIdsNeedAbundantHairChoice(selectedServiceIds) ? { abundantHair } : {}),
        dateKey: selectedDate,
        timeLocal: selectedTime,
        displayDate: formatSalonDisplayDate(selectedDate),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        whatsappOptIn,
      };
      const resPending = await fetch("/api/reservations/pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingBody),
      });
      const dataPending = (await resPending.json()) as {
        error?: string;
        id?: string;
        checkoutToken?: string;
        bookingMode?: "pending_payment" | "confirmed";
      };
      if (!resPending.ok) {
        setConfirmError(dataPending.error ?? "No se pudo reservar el turno.");
        return;
      }
      if (!dataPending.id) {
        setConfirmError("Respuesta inválida del servidor.");
        return;
      }

      if (dataPending.bookingMode === "confirmed") {
        gaEvent("reservation_confirmed_no_deposit", {
          treatment_id: primaryService.id,
          treatment_name: selectedServicesSummary,
          date_key: selectedDate,
          time_local: selectedTime,
        });
        const qs = new URLSearchParams({
          treatment: selectedServicesSummary,
          subtitle: subtitleMerged,
          date: formatSalonDisplayDate(selectedDate),
          time: selectedTime,
          name: customerName.trim(),
          phone: customerPhone.trim(),
          id: dataPending.id,
        });
        window.location.href = `/turnos/confirmado?${qs.toString()}`;
        return;
      }

      if (!dataPending.checkoutToken) {
        setConfirmError("Respuesta inválida del servidor.");
        return;
      }

      const resPref = await fetch("/api/mercadopago/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: dataPending.id,
          checkoutToken: dataPending.checkoutToken,
        }),
      });
      const dataPref = (await resPref.json()) as { error?: string; initPoint?: string };
      if (!resPref.ok) {
        setConfirmError(dataPref.error ?? "No se pudo iniciar Mercado Pago.");
        return;
      }
      if (!dataPref.initPoint) {
        setConfirmError("Mercado Pago no devolvió el enlace de pago.");
        return;
      }

      const snapshot = {
        treatment: selectedServicesSummary,
        subtitle: subtitleMerged,
        date: formatSalonDisplayDate(selectedDate),
        time: selectedTime,
        name: customerName.trim(),
        phone: customerPhone.trim(),
        id: dataPending.id,
      };
      sessionStorage.setItem("mp_turno_snapshot", JSON.stringify(snapshot));
      gaEvent("reservation_checkout_start", {
        treatment_id: primaryService.id,
        treatment_name: selectedServicesSummary,
        date_key: selectedDate,
        time_local: selectedTime,
      });
      window.location.href = dataPref.initPoint;
    } catch {
      setConfirmError("Sin conexión o error de red. Probá de nuevo.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const wizardContinueDisabled =
    (wizardStep === 1 && !step1CanContinue) ||
    (wizardStep === 2 && !selectedDate) ||
    (wizardStep === 3 && !selectedTime) ||
    (wizardStep === 4 && !datosComplete) ||
    (wizardStep === 5 && (!datosComplete || checkoutLoading));

  const wizardContinueLabel = (() => {
    if (wizardStep === 1) {
      return step1ContinueLabel;
    }
    if (wizardStep === 5) {
      if (checkoutLoading) return requiresDeposit ? "Preparando pago…" : "Confirmando…";
      return requiresDeposit ? "Pagar seña con Mercado Pago" : "Confirmar reserva";
    }
    return "Continuar";
  })();

  const onWizardContinue = () => {
    if (wizardStep === 5) {
      void handleMercadoPagoCheckout();
      return;
    }
    trackWizardContinue(wizardStep);
    handleWizardContinue();
  };

  const stepMeta = (() => {
    if (wizardStep === 1) return { title: "Reservar turno", subtitle: "Elegí tu servicio Épica" };
    if (wizardStep === 2) return { title: "Elegí tu fecha", subtitle: "Seleccioná un día disponible" };
    if (wizardStep === 3) {
      return {
        title: "Elegí tu horario",
        subtitle: selectedDate ? formatSalonDisplayDate(selectedDate) : "Horario disponible",
      };
    }
    if (wizardStep === 4) return { title: "Tus datos", subtitle: "Para confirmar y enviarte recordatorios" };
    return { title: "Confirmá tu turno", subtitle: "Revisá el resumen antes de continuar" };
  })();

  const summaryBar =
    wizardStep === 1 ? (
      <>
        <span className="min-w-0 flex-1 text-sm font-medium text-gray-700">
          {(step1DraftSummary ?? (selectedServiceIds.length > 0 ? selectedServicesSummary : null)) ? (
            <>
              {step1DraftSummary ?? selectedServicesSummary}
              {selectedDurationLabel && selectedServiceIds.length > 0 ? ` · ${selectedDurationLabel}` : ""}
            </>
          ) : (
            "Sin servicio elegido"
          )}
        </span>
        {(step1DraftSummary ?? (selectedServiceIds.length > 0 ? selectedServicesSummary : null)) ? (
          <button
            type="button"
            onClick={handleClearSelectedServices}
            aria-label="Limpiar selección"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
          </button>
        ) : null}
      </>
    ) : wizardStep === 2 ? (
      <>
        <span className="text-sm font-medium text-gray-700">
          {selectedServiceIds.length} servicio{selectedServiceIds.length === 1 ? "" : "s"}
          {selectedDate ? ` · ${formatSalonDisplayDate(selectedDate)}` : ""}
        </span>
        <div className="h-1.5 w-6 rounded-full bg-[#B88E2F]" />
      </>
    ) : wizardStep === 3 ? (
      <>
        <span className="text-sm font-medium text-gray-700">
          {formatSalonDisplayDate(selectedDate)}
          {selectedTime ? ` · ${selectedTime}` : ""}
        </span>
        <div className="h-1.5 w-6 rounded-full bg-[#B88E2F]" />
      </>
    ) : null;

  return (
    <BookingWizardShell
      onBack={handleWizardBack}
      title={stepMeta.title}
      subtitle={stepMeta.subtitle}
      summary={summaryBar}
      continueLabel={wizardContinueLabel}
      onContinue={onWizardContinue}
      continueDisabled={wizardContinueDisabled}
      continueHint={wizardStep === 1 ? step1ContinueHint : null}
      continueLoading={checkoutLoading && wizardStep === 5}
    >
      {sessionStatus === "authed" && sessionDisplayName && wizardStep === 1 ? (
        <p className="mb-6 text-center text-[16px] text-gray-600">
          Hola, <span className="font-semibold text-gray-900">{sessionDisplayName}</span>
        </p>
      ) : null}

      {wizardStep === 1 ? (
        <BookingStepEpicaServices
          ref={step1Ref}
          selectedServiceIds={selectedServiceIds}
          onServiceIdsChange={applyServiceIds}
          abundantHair={abundantHair}
          onAbundantHairChange={setAbundantHair}
          initialLacioVariant={lacioVariantFromUrl}
          onCanContinueChange={setStep1CanContinue}
          onContinueLabelChange={setStep1ContinueLabel}
          onContinueHintChange={setStep1ContinueHint}
          onDraftSummaryChange={setStep1DraftSummary}
        />
      ) : null}

      {wizardStep === 2 ? (
        <BookingPicker
          wizardSection="date"
          selectedTreatmentId={selectedTreatmentId}
          onTreatmentIdChange={setSelectedTreatmentId}
          selectedServiceIds={selectedServiceIds}
          onServiceIdsChange={applyServiceIds}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          selectedTime={selectedTime}
          onTimeChange={setSelectedTime}
          treatmentFirstHintVisible={false}
          onTreatmentFirstHintVisible={setTreatmentFirstHintVisible}
          monthAvailabilityServiceIds={selectedServiceIds}
          bookingFocusRef={bookingFocusRef}
        />
      ) : null}

      {wizardStep === 3 ? (
        <BookingPicker
          wizardSection="time"
          selectedTreatmentId={selectedTreatmentId}
          onTreatmentIdChange={setSelectedTreatmentId}
          selectedServiceIds={selectedServiceIds}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          selectedTime={selectedTime}
          onTimeChange={setSelectedTime}
          remoteTimeSlots={remoteSlots ?? null}
          treatmentFirstHintVisible={false}
          onTreatmentFirstHintVisible={setTreatmentFirstHintVisible}
          monthAvailabilityServiceIds={selectedServiceIds}
          bookingFocusRef={bookingFocusRef}
        />
      ) : null}

      {wizardStep === 4 && !hasSessionProfile ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="customerName" className="text-[16px] font-semibold text-gray-900">
              Nombre y apellido
            </label>
            <input
              id="customerName"
              name="customerName"
              autoComplete="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Como figura en tu DNI o preferís que te llamemos"
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-[16px] text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#B88E2F] focus:ring-2 focus:ring-[#B88E2F]/25"
            />
          </div>
          <div>
            <label htmlFor="customerPhone" className="text-[16px] font-semibold text-gray-900">
              WhatsApp
            </label>
            <input
              id="customerPhone"
              name="customerPhone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Ej: +54 9 11 2345-6789"
              aria-invalid={showWhatsappInvalidHint}
              className={`mt-2 w-full rounded-xl border bg-white px-4 py-3.5 text-[16px] text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#B88E2F] focus:ring-2 focus:ring-[#B88E2F]/25 ${
                showWhatsappInvalidHint ? "border-amber-400" : "border-gray-200"
              }`}
            />
            {showWhatsappInvalidHint ? (
              <p className="mt-2 text-[16px] text-amber-700">
                Revisá el número: entre 10 y 15 dígitos (podés usar +54, espacios o guiones).
              </p>
            ) : (
              <p className="mt-2 text-[16px] text-gray-500">Mismo número que usás en WhatsApp.</p>
            )}
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-gray-100 bg-[#F5F5F5] px-4 py-4">
            <input
              type="checkbox"
              checked={whatsappOptIn}
              onChange={(e) => setWhatsappOptIn(e.target.checked)}
              className="mt-1 h-5 w-5 accent-[#B88E2F]"
            />
            <span className="text-[16px] leading-snug text-gray-800">
              Acepto recibir recordatorios y avisos de mi turno por WhatsApp.
            </span>
          </label>
        </div>
      ) : null}

      {wizardStep === 5 ? (
        <div className="space-y-4">
          {hasSessionProfile ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[15px] text-emerald-800">
              Usaremos tus datos guardados para confirmar el turno.
            </p>
          ) : null}
          <div className="rounded-[24px] border border-gray-100 bg-[#F5F5F5] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <p className="text-sm font-semibold tracking-wide text-[#B88E2F] uppercase">Resumen del turno</p>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-sm text-gray-500">Servicio</dt>
                <dd className="text-lg font-semibold text-gray-900">{selectedServicesSummary}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Fecha</dt>
                <dd className="text-lg font-semibold text-gray-900">{formatSalonDisplayDate(selectedDate)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Horario</dt>
                <dd className="text-lg font-semibold text-gray-900">{selectedTime}</dd>
              </div>
              {selectedDurationLabel ? (
                <div>
                  <dt className="text-sm text-gray-500">Duración estimada</dt>
                  <dd className="text-lg font-semibold text-gray-900">{selectedDurationLabel}</dd>
                </div>
              ) : null}
              {hasSessionProfile ? (
                <div>
                  <dt className="text-sm text-gray-500">Contacto</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {customerName.trim()} · {customerPhone.trim()}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
          <p className="text-[16px] leading-relaxed text-gray-600">
            {requiresDeposit
              ? "El turno se confirma cuando Mercado Pago acredita la seña."
              : "Al confirmar, el turno queda agendado y te enviamos recordatorio por WhatsApp."}
          </p>
          {confirmError ? (
            <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-[16px] text-red-800">
              {confirmError}
            </p>
          ) : null}
        </div>
      ) : null}
    </BookingWizardShell>
  );
}

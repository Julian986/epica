"use client";

import { useRef } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import {
  ABUNDANT_HAIR_OPTIONS,
  ABUNDANT_HAIR_SURCHARGE_LABEL,
  RETOQUE_ABUNDANT_HAIR_SURCHARGE_LABEL,
  buildEpicaReferencePricing,
  type AbundantHairChoice,
} from "@/lib/treatments/abundant-hair";
import {
  HAIR_LENGTH_OPTIONS,
  LACIO_VARIANT_OPTIONS,
  SALON_TREATMENTS,
  findLacioTreatment,
  findSalonTreatmentById,
  isComplementarioTreatmentId,
  isLacioTreatmentId,
  isRetoqueTreatmentId,
  type LacioVariantId,
} from "@/lib/treatments/catalog";

export type EpicaPickerStep = "root" | "lacio-length" | "lacio-addon" | "complementarios";

type EpicaServicePickerSheetProps = {
  /** `inline`: wizard /turnos (tema claro). `sheet`: modal oscuro. */
  variant?: "sheet" | "inline";
  step: EpicaPickerStep;
  pendingLacioVariant: LacioVariantId | null;
  selectedServiceIds: string[];
  onStepChange: (step: EpicaPickerStep) => void;
  onPendingLacioVariantChange: (variant: LacioVariantId | null) => void;
  onSelectLacioLength: (lacioId: string) => void;
  onToggleAddonComplementario: (complementarioId: string) => void;
  onConfirmLacioSelection: () => void;
  onDraftSelectComplementarioOnly: (complementarioId: string) => void;
  onConfirmComplementarioOnly: () => void;
  abundantHairChoice: AbundantHairChoice;
  onAbundantHairChange: (choice: AbundantHairChoice) => void;
  abundantHairAnswered?: boolean;
  onClose: () => void;
};

const COMPLEMENTARIOS = SALON_TREATMENTS.filter((t) => t.category === "Complementarios");

export function EpicaServicePickerSheet({
  variant = "sheet",
  step,
  pendingLacioVariant,
  selectedServiceIds,
  onStepChange,
  onPendingLacioVariantChange,
  onSelectLacioLength,
  onToggleAddonComplementario,
  onConfirmLacioSelection,
  onDraftSelectComplementarioOnly,
  onConfirmComplementarioOnly,
  abundantHairChoice,
  onAbundantHairChange,
  abundantHairAnswered = true,
  onClose,
}: EpicaServicePickerSheetProps) {
  const lacioComplementariosRef = useRef<HTMLDivElement>(null);
  const inline = variant === "inline";
  const light = inline;

  const handleLacioAbundantHairChoice = (choice: AbundantHairChoice) => {
    onAbundantHairChange(choice);
    if (step === "lacio-addon") {
      requestAnimationFrame(() => {
        lacioComplementariosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };
  const lacioVariantMeta = pendingLacioVariant
    ? LACIO_VARIANT_OPTIONS.find((v) => v.id === pendingLacioVariant)
    : null;

  const selectedLacioId = selectedServiceIds.find(isLacioTreatmentId);
  const selectedLacio = selectedLacioId ? findSalonTreatmentById(selectedLacioId) : undefined;
  const selectedAddonId = selectedServiceIds.find(isComplementarioTreatmentId);
  const selectedComplementarioOnlyId = selectedServiceIds.find(isComplementarioTreatmentId);
  const referencePricing =
    selectedLacioId != null
      ? buildEpicaReferencePricing(selectedServiceIds, abundantHairChoice)
      : step === "complementarios" &&
          selectedComplementarioOnlyId &&
          isRetoqueTreatmentId(selectedComplementarioOnlyId)
        ? buildEpicaReferencePricing([selectedComplementarioOnlyId], abundantHairChoice)
        : null;
  const complementarioRetoqueSelected =
    step === "complementarios" &&
    Boolean(selectedComplementarioOnlyId && isRetoqueTreatmentId(selectedComplementarioOnlyId));

  const handleBack = () => {
    if (step === "lacio-addon") {
      onStepChange("lacio-length");
      return;
    }
    if (step === "lacio-length" || step === "complementarios") {
      onPendingLacioVariantChange(null);
      onStepChange("root");
    }
  };

  const title =
    step === "root"
      ? "Elegí servicio"
      : step === "lacio-length" && lacioVariantMeta
        ? lacioVariantMeta.name
        : step === "lacio-addon"
          ? "Tu lacio"
          : "Complementarios";

  const optionCard = (selected: boolean) =>
    light
      ? `w-full cursor-pointer rounded-[24px] border px-4 py-4 text-left shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-colors ${
          selected
            ? "border-[#B88E2F]/50 bg-[#B88E2F]/8 ring-2 ring-[#B88E2F]/20"
            : "border-gray-100 bg-white hover:bg-gray-50"
        }`
      : `w-full cursor-pointer rounded-2xl border px-4 py-4 text-left transition-colors ${
          selected
            ? "border-[var(--premium-gold)] bg-[rgba(228,202,105,0.1)]"
            : "border-white/8 bg-[#1c1c1c] hover:bg-[#222]"
        }`;

  const inner = (
    <>
        {light ? (
          <div className="mb-4 flex items-center gap-3">
            {step !== "root" ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50"
                aria-label="Volver"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={1.8} />
              </button>
            ) : null}
            <h2
              className={`min-w-0 flex-1 font-heading font-bold leading-[1.2] text-gray-900 ${
                step === "lacio-addon" ? "text-[22px]" : "text-[28px]"
              } ${step === "lacio-length" ? "line-clamp-2" : ""}`}
            >
              {title}
            </h2>
          </div>
        ) : (
          <div className="shrink-0 px-4 pt-3">
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-white/12" />
            <div className="mb-3 grid grid-cols-[2.25rem_1fr_auto] items-center gap-x-2">
              {step !== "root" ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="cursor-pointer rounded-lg p-1 text-[var(--soft-gray)]/75 hover:bg-white/5"
                  aria-label="Volver"
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={1.8} />
                </button>
              ) : (
                <span className="h-9 w-9" aria-hidden />
              )}
              <h2
                className={`min-w-0 px-0.5 text-center font-heading leading-[1.2] ${
                  step === "lacio-addon" ? "text-[22px]" : "text-[26px]"
                } ${step === "lacio-length" ? "line-clamp-2" : ""}`}
              >
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 cursor-pointer rounded-lg px-2 py-1 text-[13px] text-[var(--soft-gray)]/75 hover:bg-white/5"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        <div className={`min-h-0 flex-1 ${inline ? "" : "overflow-y-auto overscroll-contain px-4 pb-2"}`}>
        {step === "root" ? (
          <div className="space-y-2 pb-2">
            <Link
              href="/tratamientos?familia=capilares&servicio=alisado"
              className={`mb-1 flex w-full items-center justify-center rounded-xl border px-3 py-2.5 text-[12px] leading-snug ${
                light
                  ? "border-[#B88E2F]/25 bg-[#B88E2F]/8 text-[#B88E2F]"
                  : "border-[var(--premium-gold)]/20 bg-[rgba(228,202,105,0.06)] text-[var(--premium-gold)]"
              }`}
            >
              ✨ ALISADO PREMIUM ÉPICA
            </Link>

            {LACIO_VARIANT_OPTIONS.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => onPendingLacioVariantChange(variant.id)}
                className={optionCard(pendingLacioVariant === variant.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-[22px] leading-tight font-heading ${light ? "text-gray-900" : "text-[var(--soft-gray)]"}`}>
                    {variant.name}
                  </p>
                  <span
                    className={`shrink-0 text-[16px] font-semibold ${light ? "text-[#B88E2F]" : "text-[var(--premium-gold)]"}`}
                  >
                    desde {variant.priceFromLabel}
                  </span>
                </div>
                {/* Descripción oculta: el paso 1 debe ser rápido (nombre + precio). Detalle en /tratamientos. */}
                {/* <p className={`mt-1 line-clamp-2 text-[12px] ${light ? "text-gray-500" : "text-[var(--soft-gray)]/58"}`}>
                  {variant.description}
                </p> */}
              </button>
            ))}

            <button
              type="button"
              onClick={() => onStepChange("complementarios")}
              className={optionCard(false)}
            >
              <p className={`text-[22px] leading-tight font-heading ${light ? "text-gray-900" : "text-[var(--soft-gray)]"}`}>
                Complementarios
              </p>
              {/* <p className={`mt-1 text-[12px] ${light ? "text-gray-500" : "text-[var(--soft-gray)]/58"}`}>
                Botox, retoque, laminado o lifting
              </p> */}
            </button>
          </div>
        ) : null}

        {step === "lacio-length" && pendingLacioVariant ? (
          <div className="space-y-2 pb-2">
            {/* {lacioVariantMeta ? (
              <p className="mb-1 px-1 text-[11px] leading-relaxed text-[var(--soft-gray)]/65">
                {lacioVariantMeta.description}
              </p>
            ) : null} */}

            {HAIR_LENGTH_OPTIONS.map((length) => {
              const treatment = findLacioTreatment(pendingLacioVariant, length.id);
              if (!treatment) return null;
              const isSelected = treatment.id === selectedLacioId;

              return (
                <button
                  key={length.id}
                  type="button"
                  onClick={() => onSelectLacioLength(treatment.id)}
                  className={optionCard(isSelected)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className={`text-[20px] leading-tight font-heading ${light ? "text-gray-900" : "text-[var(--soft-gray)]"}`}>
                        {length.label}
                      </p>
                      <p className={`mt-0.5 text-[12px] ${light ? "text-gray-500" : "text-[var(--soft-gray)]/58"}`}>
                        {length.hint}
                      </p>
                    </div>
                    <p className={`shrink-0 text-[17px] font-semibold ${light ? "text-[#B88E2F]" : "text-[var(--premium-gold)]"}`}>
                      {treatment.priceLabel}
                    </p>
                  </div>
                </button>
              );
            })}

            <p className="px-1 pt-1 text-center text-[10px] text-[var(--soft-gray)]/50">
              Cabello abundante: {ABUNDANT_HAIR_SURCHARGE_LABEL} · Duración a confirmar en salón
            </p>
          </div>
        ) : null}

        {step === "lacio-addon" && selectedLacio ? (
          <div className="space-y-4 pb-2">
            <div
              className={`rounded-[24px] border px-5 py-4 ${
                light
                  ? "border-[#B88E2F]/35 bg-[#B88E2F]/8"
                  : "border-[var(--premium-gold)]/35 bg-[rgba(228,202,105,0.08)]"
              }`}
            >
              <p className={`text-[13px] font-medium tracking-[0.06em] uppercase ${light ? "text-gray-500" : "text-[var(--soft-gray)]/55"}`}>
                Tu elección
              </p>
              <p className={`mt-2 text-[22px] leading-tight font-heading ${light ? "text-gray-900" : "text-[var(--soft-gray)]"}`}>
                {selectedLacio.name}
              </p>
              <p className={`mt-1 text-[18px] font-semibold ${light ? "text-[#B88E2F]" : "text-[var(--premium-gold)]"}`}>
                {referencePricing?.totalReferenceLabel
                  ? referencePricing.totalReferenceLabel
                  : selectedLacio.priceLabel}
              </p>
            </div>

            <div>
              <p className={`text-[18px] font-semibold leading-snug ${light ? "text-gray-900" : "text-[var(--soft-gray)]"}`}>
                ¿Tenés mucho cabello?
              </p>
              <p className={`mt-1 text-[15px] ${light ? "text-gray-600" : "text-[var(--soft-gray)]/70"}`}>
                Si aplica, en salón puede sumarse {ABUNDANT_HAIR_SURCHARGE_LABEL}.
              </p>
              <div className={`mt-3 grid gap-2 ${light ? "grid-cols-2" : "grid-cols-3 gap-1.5"}`}>
                {ABUNDANT_HAIR_OPTIONS.map((opt) => {
                  const isActive =
                    abundantHairAnswered && abundantHairChoice === opt.id;
                  const isConsulta = opt.id === "unknown";
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => handleLacioAbundantHairChoice(opt.id)}
                      className={`flex cursor-pointer items-center justify-center rounded-2xl border px-3 text-center transition-all duration-150 ${
                        light ? "min-h-[52px] text-[16px] font-semibold" : "flex-col px-1.5 py-2"
                      } ${
                        isActive
                          ? light
                            ? "border-[#B88E2F] bg-[#B88E2F]/12 text-gray-900"
                            : "border-[var(--premium-gold)] bg-[rgba(228,202,105,0.12)]"
                          : light
                            ? "border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
                            : "border-white/8 bg-[#1c1c1c] hover:bg-[#222]"
                      } ${isConsulta && light ? "col-span-2 min-h-[44px] text-[14px] font-medium" : ""}`}
                    >
                      <span className={light ? "" : "text-[12px] font-medium text-[var(--soft-gray)]"}>
                        {opt.id === "unknown" ? "No estoy segura" : opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {light && !abundantHairAnswered ? (
                <p className="mt-3 text-center text-[15px] text-[#B88E2F]">
                  Elegí una opción para continuar
                </p>
              ) : null}
            </div>

            <div
              ref={lacioComplementariosRef}
              className={`scroll-mt-6 border-t pt-4 ${light ? "border-gray-100" : "border-white/8"}`}
            >
              <p className={`text-[17px] font-semibold ${light ? "text-gray-900" : "text-[var(--soft-gray)]"}`}>
                ¿Sumar un complementario?
              </p>
              <p className={`mt-1 text-[15px] ${light ? "text-gray-600" : "text-[var(--soft-gray)]/70"}`}>
                Es opcional. Si no elegís ninguno, seguís solo con tu lacio.
              </p>
              <div className="mt-3 space-y-2">
                {COMPLEMENTARIOS.map((treatment) => {
                  const isSelected = treatment.id === selectedAddonId;
                  const shortName = treatment.name.replace(/ Épica$/, "");

                  return (
                    <button
                      key={treatment.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => onToggleAddonComplementario(treatment.id)}
                      className={`w-full cursor-pointer rounded-[24px] border px-4 py-4 text-left transition-all duration-150 ${
                        isSelected
                          ? light
                            ? "border-[#B88E2F]/50 bg-[#B88E2F]/8 ring-2 ring-[#B88E2F]/20"
                            : "border-[var(--premium-gold)] bg-[rgba(228,202,105,0.14)] shadow-[0_0_0_1px_rgba(228,202,105,0.35)]"
                          : light
                            ? "border-gray-100 bg-white hover:bg-gray-50"
                            : "border-white/8 bg-[#1c1c1c] hover:bg-[#222]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className={`text-[18px] leading-tight font-heading ${light ? "text-gray-900" : "text-[var(--soft-gray)]"}`}>
                          {shortName}
                        </p>
                        <p className={`shrink-0 text-[16px] font-semibold ${light ? "text-[#B88E2F]" : "text-[var(--premium-gold)]"}`}>
                          {treatment.priceLabel}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {light && selectedAddonId ? (
                <button
                  type="button"
                  onClick={() => onToggleAddonComplementario(selectedAddonId)}
                  className="mt-3 flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-gray-200 text-[15px] text-gray-600"
                >
                  Quitar complementario
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {step === "complementarios" ? (
          <div className="space-y-2 pb-2">
            <p className={`mb-1 px-1 text-[11px] ${light ? "text-gray-500" : "text-[var(--soft-gray)]/65"}`}>
              Reservá solo un complementario, sin lacio.
            </p>
            {COMPLEMENTARIOS.map((treatment) => {
              const isSelected = treatment.id === selectedComplementarioOnlyId;

              return (
                <button
                  key={treatment.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onDraftSelectComplementarioOnly(treatment.id)}
                  className={`w-full cursor-pointer rounded-2xl border px-4 py-3 text-left transition-all duration-150 ${
                    isSelected
                      ? light
                        ? "border-[#B88E2F]/50 bg-[#B88E2F]/8 ring-2 ring-[#B88E2F]/20"
                        : "border-[var(--premium-gold)] bg-[rgba(228,202,105,0.14)] shadow-[0_0_0_1px_rgba(228,202,105,0.35)]"
                      : light
                        ? "border-gray-100 bg-white hover:bg-gray-50"
                        : "border-white/8 bg-[#1c1c1c] hover:bg-[#222]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-2">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                          isSelected
                            ? light
                              ? "border-[#B88E2F] bg-[#B88E2F] text-white"
                              : "border-[var(--premium-gold)] bg-[var(--premium-gold)] text-black"
                            : light
                              ? "border-gray-300 bg-transparent text-transparent"
                              : "border-white/25 bg-transparent text-transparent"
                        }`}
                        aria-hidden
                      >
                        ✓
                      </span>
                      <p className={`text-[20px] leading-tight font-heading ${light ? "text-gray-900" : "text-[var(--soft-gray)]"}`}>
                        {treatment.name}
                      </p>
                    </div>
                    <p className={`shrink-0 text-[16px] font-semibold ${light ? "text-[#B88E2F]" : "text-[var(--premium-gold)]"}`}>
                      {treatment.priceLabel}
                    </p>
                  </div>
                  {/* <p className={`mt-1 pl-7 text-[12px] ${light ? "text-gray-500" : "text-[var(--soft-gray)]/58"}`}>
                    {treatment.subtitle}
                  </p> */}
                </button>
              );
            })}

            {complementarioRetoqueSelected ? (
              <div
                className={`mt-2 rounded-2xl border px-3 py-2.5 ${
                  light ? "border-gray-100 bg-[#F5F5F5]" : "border-white/8 bg-[#1a1a1a]"
                }`}
              >
                {referencePricing?.totalReferenceLabel ? (
                  <p className={`mb-2 text-[11px] ${light ? "text-[#B88E2F]" : "text-[var(--premium-gold)]"}`}>
                    Precio referencia {referencePricing.totalReferenceLabel}
                  </p>
                ) : null}
                <p className="text-[12px] font-medium text-[var(--soft-gray)]">
                  ¿Tenés mucho cabello en la zona del crecimiento?
                </p>
                <p className="mt-0.5 text-[10px] text-[var(--soft-gray)]/55">
                  Puede sumarse {RETOQUE_ABUNDANT_HAIR_SURCHARGE_LABEL} al retoque.
                </p>
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  {ABUNDANT_HAIR_OPTIONS.map((opt) => {
                    const isActive = abundantHairChoice === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => onAbundantHairChange(opt.id)}
                        className={`flex cursor-pointer flex-col items-center rounded-xl border px-1.5 py-2 text-center transition-all duration-150 ${
                          isActive
                            ? "border-[var(--premium-gold)] bg-[rgba(228,202,105,0.12)]"
                            : "border-white/8 bg-[#1c1c1c] hover:bg-[#222]"
                        }`}
                      >
                        <span className="text-[12px] font-medium text-[var(--soft-gray)]">{opt.label}</span>
                        <span className="mt-0.5 text-[9px] leading-tight text-[var(--soft-gray)]/50">
                          {opt.id === "yes" ? "+$5k" : opt.id === "no" ? "Base" : "Consulta"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
        </div>

        {step === "lacio-addon" && selectedLacio && !light ? (
          <div className="shrink-0 border-t border-white/8 bg-[#161616] px-4 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onConfirmLacioSelection}
              className="flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-[var(--premium-gold)] text-[15px] font-semibold text-[var(--on-accent)] shadow-[0_8px_22px_rgba(206,120,50,0.28)]"
            >
              {selectedAddonId ? "Continuar con lacio + complementario" : "Continuar solo con lacio"}
            </button>
            {selectedAddonId ? (
              <button
                type="button"
                onClick={() => onToggleAddonComplementario(selectedAddonId)}
                className="mt-2 flex h-10 w-full cursor-pointer items-center justify-center rounded-xl border border-white/10 text-[13px] text-[var(--soft-gray)]/75"
              >
                Quitar complementario
              </button>
            ) : null}
          </div>
        ) : null}

        {step === "complementarios" && !light ? (
          <div className="shrink-0 border-t border-white/8 bg-[#161616] px-4 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              disabled={!selectedComplementarioOnlyId}
              onClick={onConfirmComplementarioOnly}
              className={`flex h-12 w-full items-center justify-center rounded-full text-[15px] font-semibold transition ${
                selectedComplementarioOnlyId
                  ? "cursor-pointer rounded-xl bg-[var(--premium-gold)] text-[var(--on-accent)] shadow-[0_8px_22px_rgba(206,120,50,0.28)]"
                  : "cursor-not-allowed rounded-xl bg-[#2a2a2a] text-white/40"
              }`}
            >
              Continuar
            </button>
            {!selectedComplementarioOnlyId ? (
              <p className="mt-1.5 text-center text-[11px] text-[var(--soft-gray)]/55">
                Elegí un servicio para continuar
              </p>
            ) : null}
          </div>
        ) : null}

    </>
  );

  if (inline) {
    return <div className="w-full space-y-2">{inner}</div>;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/60 backdrop-blur-[3px]">
      <button
        type="button"
        aria-label="Cerrar selector de servicio"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-transparent"
      />
      <div className="relative flex max-h-[min(88dvh,780px)] w-full flex-col rounded-t-[32px] border-t border-white/8 bg-[#161616] shadow-[0_-18px_40px_rgba(0,0,0,0.45)]">
        {inner}
      </div>
    </div>
  );
}

export function resolveEpicaPickerStepForServiceIds(serviceIds: string[]): {
  step: EpicaPickerStep;
  lacioVariant: LacioVariantId | null;
} {
  const lacioId = serviceIds.find(isLacioTreatmentId);
  const lacio = lacioId ? findSalonTreatmentById(lacioId) : undefined;
  if (lacio?.lacioVariant) {
    return { step: "lacio-addon", lacioVariant: lacio.lacioVariant };
  }
  const compOnly = serviceIds.length === 1 && isComplementarioTreatmentId(serviceIds[0] ?? "");
  if (compOnly) {
    return { step: "complementarios", lacioVariant: null };
  }
  return { step: "root", lacioVariant: null };
}

export function parseLacioVariantParam(value: string): LacioVariantId | undefined {
  const v = value.trim();
  if (v === "sublime" || v === "sublime-ritual" || v === "sublime-total") return v;
  return undefined;
}

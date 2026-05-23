"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import {
  ABUNDANT_HAIR_OPTIONS,
  ABUNDANT_HAIR_SURCHARGE_LABEL,
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
  type LacioVariantId,
} from "@/lib/treatments/catalog";

export type EpicaPickerStep = "root" | "lacio-length" | "lacio-addon" | "complementarios";

type EpicaServicePickerSheetProps = {
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
  onClose: () => void;
};

const COMPLEMENTARIOS = SALON_TREATMENTS.filter((t) => t.category === "Complementarios");

export function EpicaServicePickerSheet({
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
  onClose,
}: EpicaServicePickerSheetProps) {
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
      : null;

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
          ? "¿Agregar complementario?"
          : "Complementarios";

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/60 backdrop-blur-[3px]">
      <button
        type="button"
        aria-label="Cerrar selector de servicio"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-transparent"
      />

      <div className="relative flex max-h-[min(88dvh,780px)] w-full flex-col rounded-t-[32px] border-t border-white/8 bg-[#161616] shadow-[0_-18px_40px_rgba(0,0,0,0.45)]">
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

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-2">
        {step === "root" ? (
          <div className="space-y-2 pb-2">
            <Link
              href="/tratamientos?familia=capilares&servicio=alisado"
              className="mb-1 flex w-full items-center justify-center rounded-xl border border-[var(--premium-gold)]/20 bg-[rgba(228,202,105,0.06)] px-3 py-2.5 text-[12px] leading-snug text-[var(--premium-gold)]"
            >
              ✨ ALISADO PREMIUM ÉPICA
            </Link>

            {LACIO_VARIANT_OPTIONS.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => {
                  onPendingLacioVariantChange(variant.id);
                  onStepChange("lacio-length");
                }}
                className="w-full cursor-pointer rounded-2xl border border-white/8 bg-[#1c1c1c] px-4 py-4 text-left transition-colors hover:bg-[#222]"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[18px] leading-tight font-heading text-[var(--soft-gray)]">{variant.name}</p>
                  <span className="shrink-0 text-[12px] text-[var(--premium-gold)]">
                    desde {variant.priceFromLabel}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-[12px] text-[var(--soft-gray)]/58">{variant.description}</p>
              </button>
            ))}

            <button
              type="button"
              onClick={() => onStepChange("complementarios")}
              className="w-full cursor-pointer rounded-2xl border border-white/8 bg-[#1c1c1c] px-4 py-4 text-left transition-colors hover:bg-[#222]"
            >
              <p className="text-[18px] leading-tight font-heading text-[var(--soft-gray)]">Complementarios</p>
              <p className="mt-1 text-[12px] text-[var(--soft-gray)]/58">
                Solo Botox capilar o lifting de cejas
              </p>
            </button>
          </div>
        ) : null}

        {step === "lacio-length" && pendingLacioVariant ? (
          <div className="space-y-2 pb-2">
            {lacioVariantMeta ? (
              <p className="mb-1 px-1 text-[11px] leading-relaxed text-[var(--soft-gray)]/65">
                {lacioVariantMeta.description}
              </p>
            ) : null}

            {HAIR_LENGTH_OPTIONS.map((length) => {
              const treatment = findLacioTreatment(pendingLacioVariant, length.id);
              if (!treatment) return null;
              const isSelected = treatment.id === selectedLacioId;

              return (
                <button
                  key={length.id}
                  type="button"
                  onClick={() => onSelectLacioLength(treatment.id)}
                  className={`w-full cursor-pointer rounded-2xl border px-4 py-3.5 text-left transition-colors ${
                    isSelected
                      ? "border-[var(--premium-gold)] bg-[rgba(228,202,105,0.1)]"
                      : "border-white/8 bg-[#1c1c1c] hover:bg-[#222]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[17px] leading-tight font-heading text-[var(--soft-gray)]">
                        {length.label}
                      </p>
                      <p className="mt-0.5 text-[12px] text-[var(--soft-gray)]/58">{length.hint}</p>
                    </div>
                    <p className="shrink-0 text-[15px] font-medium text-[var(--premium-gold)]">
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
          <div className="space-y-2.5 pb-2">
            <div className="rounded-2xl border border-[var(--premium-gold)]/35 bg-[rgba(228,202,105,0.08)] px-3.5 py-2.5">
              <p className="text-[11px] tracking-[0.1em] text-[var(--soft-gray)]/55 uppercase">Tu lacio</p>
              <p className="mt-1 text-[16px] leading-tight font-heading text-[var(--soft-gray)]">
                {selectedLacio.name}
              </p>
              <p className="mt-0.5 text-[12px] text-[var(--premium-gold)]">
                {referencePricing?.totalReferenceLabel
                  ? `Precio referencia ${referencePricing.totalReferenceLabel}`
                  : selectedLacio.priceLabel}
              </p>
              {referencePricing?.abundantHairNote ? (
                <p className="mt-1 text-[10px] leading-snug text-[var(--soft-gray)]/60">
                  {referencePricing.abundantHairNote}
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-white/8 bg-[#1a1a1a] px-3 py-2.5">
              <p className="text-[12px] font-medium text-[var(--soft-gray)]">
                ¿Considerás que tenés cabello abundante?
              </p>
              <p className="mt-0.5 text-[10px] text-[var(--soft-gray)]/55">
                En salón puede sumarse {ABUNDANT_HAIR_SURCHARGE_LABEL} al lacio.
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
                        {opt.id === "yes" ? "+$10k" : opt.id === "no" ? "Base" : "Consulta"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="px-0.5 text-[11px] leading-snug text-[var(--soft-gray)]/70">
              Complementario opcional en la misma visita:
            </p>

            {COMPLEMENTARIOS.map((treatment) => {
              const isSelected = treatment.id === selectedAddonId;

              return (
                <button
                  key={treatment.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onToggleAddonComplementario(treatment.id)}
                  className={`w-full cursor-pointer rounded-2xl border px-3.5 py-2.5 text-left transition-all duration-150 ${
                    isSelected
                      ? "border-[var(--premium-gold)] bg-[rgba(228,202,105,0.14)] shadow-[0_0_0_1px_rgba(228,202,105,0.35)]"
                      : "border-white/8 bg-[#1c1c1c] hover:bg-[#222]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-2">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                          isSelected
                            ? "border-[var(--premium-gold)] bg-[var(--premium-gold)] text-black"
                            : "border-white/25 bg-transparent text-transparent"
                        }`}
                        aria-hidden
                      >
                        ✓
                      </span>
                      <p className="text-[14px] leading-tight font-heading text-[var(--soft-gray)]">
                        {treatment.name}
                      </p>
                    </div>
                    <p className="shrink-0 text-[12px] text-[var(--premium-gold)]">{treatment.priceLabel}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}

        {step === "complementarios" ? (
          <div className="space-y-2 pb-2">
            <p className="mb-1 px-1 text-[11px] text-[var(--soft-gray)]/65">
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
                      ? "border-[var(--premium-gold)] bg-[rgba(228,202,105,0.14)] shadow-[0_0_0_1px_rgba(228,202,105,0.35)]"
                      : "border-white/8 bg-[#1c1c1c] hover:bg-[#222]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-2">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                          isSelected
                            ? "border-[var(--premium-gold)] bg-[var(--premium-gold)] text-black"
                            : "border-white/25 bg-transparent text-transparent"
                        }`}
                        aria-hidden
                      >
                        ✓
                      </span>
                      <p className="text-[16px] leading-tight font-heading text-[var(--soft-gray)]">
                        {treatment.name}
                      </p>
                    </div>
                    <p className="shrink-0 text-[13px] text-[var(--premium-gold)]">{treatment.priceLabel}</p>
                  </div>
                  <p className="mt-1 pl-7 text-[12px] text-[var(--soft-gray)]/58">{treatment.subtitle}</p>
                </button>
              );
            })}
          </div>
        ) : null}
        </div>

        {step === "lacio-addon" && selectedLacio ? (
          <div className="shrink-0 border-t border-white/8 bg-[#161616] px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onConfirmLacioSelection}
              className="flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-[var(--premium-gold)] text-[14px] font-semibold text-black shadow-[0_8px_22px_rgba(206,120,50,0.28)]"
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

        {step === "complementarios" ? (
          <div className="shrink-0 border-t border-white/8 bg-[#161616] px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              disabled={!selectedComplementarioOnlyId}
              onClick={onConfirmComplementarioOnly}
              className={`flex h-11 w-full items-center justify-center rounded-xl text-[14px] font-semibold transition ${
                selectedComplementarioOnlyId
                  ? "cursor-pointer bg-[var(--premium-gold)] text-black shadow-[0_8px_22px_rgba(206,120,50,0.28)]"
                  : "cursor-not-allowed bg-[#2a2a2a] text-white/40"
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

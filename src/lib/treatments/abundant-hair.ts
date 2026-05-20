import {
  ABUNDANT_HAIR_SURCHARGE_LABEL,
  findSalonTreatmentById,
  isComplementarioTreatmentId,
  isLacioTreatmentId,
} from "@/lib/treatments/catalog";

export { ABUNDANT_HAIR_SURCHARGE_LABEL } from "@/lib/treatments/catalog";

export const ABUNDANT_HAIR_SURCHARGE_ARS = 10_000;

export type AbundantHairChoice = "no" | "yes" | "unknown";

export const ABUNDANT_HAIR_OPTIONS: {
  id: AbundantHairChoice;
  label: string;
  hint: string;
}[] = [
  { id: "no", label: "No", hint: "Precio según largo elegido" },
  { id: "yes", label: "Sí", hint: `Sumá ${ABUNDANT_HAIR_SURCHARGE_LABEL} al lacio` },
  { id: "unknown", label: "No estoy segura", hint: "Lo evaluamos en consulta" },
];

export function parseAbundantHairChoice(value: unknown): AbundantHairChoice | undefined {
  const v = String(value ?? "").trim();
  if (v === "no" || v === "yes" || v === "unknown") return v;
  return undefined;
}

export function serviceIdsIncludeLacio(serviceIds: string[]): boolean {
  return serviceIds.some(isLacioTreatmentId);
}

export function isValidEpicaServiceCombo(ids: string[]): boolean {
  if (ids.length > 2) return false;
  const lacios = ids.filter(isLacioTreatmentId);
  const comps = ids.filter(isComplementarioTreatmentId);
  if (lacios.length > 1 || comps.length > 1) return false;
  return lacios.length + comps.length === ids.length;
}

export function parsePriceLabelArs(label: string): number | null {
  const digits = label.replace(/\D/g, "");
  if (!digits) return null;
  const n = Number.parseInt(digits, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function formatPriceLabelArs(amount: number): string {
  return `$${amount.toLocaleString("es-AR")}`;
}

export type EpicaReferencePricing = {
  lacioBaseLabel: string | null;
  surchargeLabel: string | null;
  complementarioLabel: string | null;
  totalReferenceLabel: string | null;
  abundantHairNote: string | null;
};

export function buildEpicaReferencePricing(
  serviceIds: string[],
  abundantHair: AbundantHairChoice,
): EpicaReferencePricing {
  const lacioId = serviceIds.find(isLacioTreatmentId);
  const compId = serviceIds.find(isComplementarioTreatmentId);
  const lacio = lacioId ? findSalonTreatmentById(lacioId) : undefined;
  const comp = compId ? findSalonTreatmentById(compId) : undefined;

  const lacioBaseLabel = lacio?.priceLabel ?? null;
  const complementarioLabel = comp?.priceLabel ?? null;
  const surchargeLabel = abundantHair === "yes" ? ABUNDANT_HAIR_SURCHARGE_LABEL : null;

  let total: number | null = null;
  if (lacio) {
    const base = parsePriceLabelArs(lacio.priceLabel);
    if (base != null) {
      total = base + (abundantHair === "yes" ? ABUNDANT_HAIR_SURCHARGE_ARS : 0);
    }
  }
  if (comp) {
    const compAmount = parsePriceLabelArs(comp.priceLabel);
    if (compAmount != null) {
      total = (total ?? 0) + compAmount;
    }
  }

  const totalReferenceLabel = total != null ? formatPriceLabelArs(total) : null;

  let abundantHairNote: string | null = null;
  if (lacioId) {
    if (abundantHair === "yes") {
      abundantHairNote = "Incluye recargo por cabello abundante (referencia).";
    } else if (abundantHair === "unknown") {
      abundantHairNote = "Cabello abundante: a confirmar en consulta (+ $10.000 si aplica).";
    }
  }

  return {
    lacioBaseLabel,
    surchargeLabel,
    complementarioLabel,
    totalReferenceLabel,
    abundantHairNote,
  };
}

export function buildReservationPricingSubtitle(
  serviceIds: string[],
  abundantHair: AbundantHairChoice | undefined,
): string | null {
  if (!serviceIdsIncludeLacio(serviceIds)) return null;
  const choice = abundantHair ?? "unknown";
  const p = buildEpicaReferencePricing(serviceIds, choice);
  const parts: string[] = [];
  if (p.totalReferenceLabel) parts.push(`Precio referencia ${p.totalReferenceLabel}`);
  if (p.abundantHairNote) parts.push(p.abundantHairNote);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function abundantHairLabelForPanel(choice: AbundantHairChoice | undefined): string | null {
  if (!choice) return null;
  if (choice === "yes") return "Cabello abundante: sí (+ $10.000 ref.)";
  if (choice === "no") return "Cabello abundante: no";
  return "Cabello abundante: a confirmar en salón";
}

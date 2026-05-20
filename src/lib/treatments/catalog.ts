/** Categorías para filtrar en la app de turnos y en la lista de servicios. */
export const TREATMENT_CATEGORIES = ["Lacio", "Complementarios"] as const;

export type TreatmentCategory = (typeof TREATMENT_CATEGORIES)[number];

export type LacioVariantId = "sublime" | "sublime-ritual" | "sublime-total";
export type HairLengthId = "corto" | "medio" | "largo";

/** Duración provisional hasta confirmación del salón (afecta grilla de turnos). */
const PROVISIONAL_LACIO_MINUTES = 180;
const PROVISIONAL_BOTOX_MINUTES = 60;
const PROVISIONAL_CEJAS_MINUTES = 45;

export const HAIR_LENGTH_OPTIONS: {
  id: HairLengthId;
  label: string;
  hint: string;
}[] = [
  { id: "corto", label: "Corto", hint: "Hasta hombros" },
  { id: "medio", label: "Medio", hint: "Hasta media espalda" },
  { id: "largo", label: "Largo", hint: "Por debajo de la espalda" },
];

export const LACIO_VARIANT_OPTIONS: {
  id: LacioVariantId;
  name: string;
  description: string;
  benefits: string[];
  priceFromLabel: string;
}[] = [
  {
    id: "sublime",
    name: "Lacio Sublime",
    description:
      "Lacio premium sin formol que deja el cabello lacio, brillante y disciplinado sin dañar la fibra capilar.",
    benefits: ["Efecto lacio natural", "Eliminación de frizz", "Más brillo y manejabilidad"],
    priceFromLabel: "$110.000",
  },
  {
    id: "sublime-ritual",
    name: "Lacio Sublime + Ritual",
    description:
      "Incluye ritual de tratamiento intensivo que potencia el lacio, nutre en profundidad y deja el cabello aún más suave y sedoso con brillo extremo.",
    benefits: ["Lacio impecable por más tiempo", "Nutrición profunda", "Cabello visiblemente más sano"],
    priceFromLabel: "$135.000",
  },
  {
    id: "sublime-total",
    name: "Lacio Sublime Total",
    description:
      "La experiencia completa: lacio premium + ritual intensivo + sellado final para un resultado superior y duradero.",
    benefits: ["Lacio perfecto y duradero", "Máximo brillo y suavidad", "Cabello 100% transformado"],
    priceFromLabel: "$160.000",
  },
];

export type SalonTreatment = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  category: TreatmentCategory;
  durationLabel: string;
  /** Provisional si `durationLabel` es "A confirmar". */
  durationMinutes: number;
  imageUrl: string;
  priceLabel: string;
  lacioVariant?: LacioVariantId;
  hairLength?: HairLengthId;
};

const LACIO_PRICES: Record<LacioVariantId, Record<HairLengthId, string>> = {
  sublime: { corto: "$110.000", medio: "$120.000", largo: "$130.000" },
  "sublime-ritual": { corto: "$135.000", medio: "$145.000", largo: "$155.000" },
  "sublime-total": { corto: "$160.000", medio: "$170.000", largo: "$180.000" },
};

const LACIO_VARIANT_NAMES: Record<LacioVariantId, string> = {
  sublime: "Lacio Sublime",
  "sublime-ritual": "Lacio Sublime + Ritual",
  "sublime-total": "Lacio Sublime Total",
};

function buildLacioTreatment(variant: LacioVariantId, length: HairLengthId): SalonTreatment {
  const lengthOpt = HAIR_LENGTH_OPTIONS.find((x) => x.id === length)!;
  const variantName = LACIO_VARIANT_NAMES[variant];
  const price = LACIO_PRICES[variant][length];
  const id = `lacio-${variant}-${length}`;

  return {
    id,
    name: `${variantName} — ${lengthOpt.label}`,
    subtitle: `${lengthOpt.hint} · ${price}`,
    description: LACIO_VARIANT_OPTIONS.find((v) => v.id === variant)!.description,
    category: "Lacio",
    durationLabel: "A confirmar",
    durationMinutes: PROVISIONAL_LACIO_MINUTES,
    imageUrl: "/servicios_epica.jpeg",
    priceLabel: price,
    lacioVariant: variant,
    hairLength: length,
  };
}

const LACIO_TREATMENTS: SalonTreatment[] = LACIO_VARIANT_OPTIONS.flatMap((variant) =>
  HAIR_LENGTH_OPTIONS.map((length) => buildLacioTreatment(variant.id, length.id)),
);

/** Servicios oficiales ÉPICA — Experiencia Premium. */
export const SALON_TREATMENTS: SalonTreatment[] = [
  ...LACIO_TREATMENTS,
  {
    id: "botox-capilar-epica",
    name: "Botox Capilar Épica",
    subtitle: "Nutrición profunda · $70.000",
    description:
      "Tratamiento intensivo que repara, hidrata y devuelve vida al cabello. Brillo, suavidad y control de frizz.",
    category: "Complementarios",
    durationLabel: "A confirmar",
    durationMinutes: PROVISIONAL_BOTOX_MINUTES,
    imageUrl: "/servicios_epica.jpeg",
    priceLabel: "$70.000",
  },
  {
    id: "lifting-laminado-cejas-epica",
    name: "Lifting & Laminado de Cejas Épica",
    subtitle: "Diseño y fijación · $35.000",
    description:
      "Diseño y fijación de cejas para lograr un efecto prolijo, natural y duradero. Realza la mirada.",
    category: "Complementarios",
    durationLabel: "A confirmar",
    durationMinutes: PROVISIONAL_CEJAS_MINUTES,
    imageUrl: "/servicios_epica.jpeg",
    priceLabel: "$35.000",
  },
];

export const ABUNDANT_HAIR_SURCHARGE_LABEL = "+ $10.000";

export function findSalonTreatmentByName(name: string): SalonTreatment | undefined {
  const t = name.trim();
  return SALON_TREATMENTS.find((x) => x.name === t);
}

export function findSalonTreatmentById(id: string): SalonTreatment | undefined {
  return SALON_TREATMENTS.find((x) => x.id === id);
}

export function findLacioTreatment(variant: LacioVariantId, length: HairLengthId): SalonTreatment | undefined {
  return SALON_TREATMENTS.find((x) => x.lacioVariant === variant && x.hairLength === length);
}

export function listLacioTreatmentsByVariant(variant: LacioVariantId): SalonTreatment[] {
  return SALON_TREATMENTS.filter((x) => x.lacioVariant === variant);
}

export function isLacioTreatmentId(id: string): boolean {
  return id.startsWith("lacio-");
}

export function isComplementarioTreatmentId(id: string): boolean {
  return findSalonTreatmentById(id)?.category === "Complementarios";
}

/** Máximo 1 lacio + 1 complementario, en ese orden. */
export function normalizeEpicaServiceIds(ids: string[]): string[] {
  const lacio = ids.find(isLacioTreatmentId);
  const comp = ids.find(isComplementarioTreatmentId);
  const out: string[] = [];
  if (lacio) out.push(lacio);
  if (comp) out.push(comp);
  return out;
}

export function primaryTreatmentIdFromServiceIds(ids: string[]): string {
  return ids.find(isLacioTreatmentId) ?? ids[0] ?? "";
}

/** Duración mostrada en el panel; si es reserva antigua, devuelve un texto genérico. */
export function panelDurationLabel(treatmentName: string, category: string): string {
  const byName = findSalonTreatmentByName(treatmentName);
  if (byName) return byName.durationLabel;
  if (category === "Lacio" || category === "Complementarios") return "A confirmar";
  return "Consultar";
}

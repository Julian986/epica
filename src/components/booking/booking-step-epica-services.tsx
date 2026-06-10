"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";

import {
  EpicaServicePickerSheet,
  resolveEpicaPickerStepForServiceIds,
  type EpicaPickerStep,
} from "@/components/booking/epica-service-picker-sheet";
import {
  findSalonTreatmentById,
  isComplementarioTreatmentId,
  isLacioTreatmentId,
  normalizeEpicaServiceIds,
  type LacioVariantId,
} from "@/lib/treatments/catalog";
import {
  serviceIdsNeedAbundantHairChoice,
  type AbundantHairChoice,
} from "@/lib/treatments/abundant-hair";

export type BookingStepEpicaServicesHandle = {
  canContinue: () => boolean;
  /** `substep`: avanza dentro del paso 1. `wizard-next`: confirma y pasa al paso 2. */
  continue: () => "substep" | "wizard-next" | false;
};

export type BookingStepEpicaServicesProps = {
  selectedServiceIds: string[];
  onServiceIdsChange: (ids: string[]) => void;
  abundantHair: AbundantHairChoice;
  onAbundantHairChange: (choice: AbundantHairChoice) => void;
  initialLacioVariant?: LacioVariantId;
  onCanContinueChange?: (canContinue: boolean) => void;
  onContinueLabelChange?: (label: string) => void;
  onContinueHintChange?: (hint: string | null) => void;
  onDraftSummaryChange?: (summary: string | null) => void;
};

function draftServicesSummary(ids: string[]): string | null {
  if (ids.length === 0) return null;
  const names = ids.map((id) => findSalonTreatmentById(id)?.name).filter(Boolean);
  return names.length > 0 ? names.join(" + ") : null;
}

function canCompleteStep1(
  step: EpicaPickerStep,
  draftServiceIds: string[],
  pendingLacioVariant: LacioVariantId | null,
  abundantHairAnswered: boolean,
): boolean {
  if (step === "root") return pendingLacioVariant !== null;
  if (step === "lacio-length") return draftServiceIds.some(isLacioTreatmentId);
  if (step === "lacio-addon") {
    return draftServiceIds.some(isLacioTreatmentId) && abundantHairAnswered;
  }
  if (step === "complementarios") return draftServiceIds.some(isComplementarioTreatmentId);
  return false;
}

function continueLabelForStep(
  step: EpicaPickerStep,
  draftServiceIds: string[],
  abundantHairAnswered: boolean,
): { label: string; hint: string | null } {
  if (step === "lacio-addon" && !abundantHairAnswered) {
    return { label: "Continuar", hint: "Elegí una opción sobre cabello abundante" };
  }
  if (step === "lacio-addon") {
    const addon = draftServiceIds.find(isComplementarioTreatmentId);
    const addonName = addon ? findSalonTreatmentById(addon)?.name : null;
    if (addonName) {
      const short = addonName.replace(/ Épica$/, "");
      return { label: `Continuar con lacio + ${short}`, hint: null };
    }
    return { label: "Continuar solo con lacio", hint: null };
  }
  if (step === "complementarios") {
    return { label: "Continuar", hint: null };
  }
  return { label: "Continuar", hint: null };
}

export const BookingStepEpicaServices = forwardRef<
  BookingStepEpicaServicesHandle,
  BookingStepEpicaServicesProps
>(function BookingStepEpicaServices(
  {
    selectedServiceIds,
    onServiceIdsChange,
    abundantHair,
    onAbundantHairChange,
    initialLacioVariant,
    onCanContinueChange,
    onContinueLabelChange,
    onContinueHintChange,
    onDraftSummaryChange,
  },
  ref,
) {
  const [pickerStep, setPickerStep] = useState<EpicaPickerStep>("root");
  const [pendingLacioVariant, setPendingLacioVariant] = useState<LacioVariantId | null>(null);
  const [draftServiceIds, setDraftServiceIds] = useState<string[]>(selectedServiceIds);
  const [draftAbundantHair, setDraftAbundantHair] = useState<AbundantHairChoice>(abundantHair);
  const [abundantHairAnswered, setAbundantHairAnswered] = useState(
    () => abundantHair !== "unknown" || !serviceIdsNeedAbundantHairChoice(selectedServiceIds),
  );

  useEffect(() => {
    if (selectedServiceIds.length > 0) {
      const resolved = resolveEpicaPickerStepForServiceIds(selectedServiceIds);
      setPickerStep(resolved.step);
      setPendingLacioVariant(resolved.lacioVariant);
      setDraftServiceIds(selectedServiceIds);
      setAbundantHairAnswered(
        abundantHair !== "unknown" || !serviceIdsNeedAbundantHairChoice(selectedServiceIds),
      );
    } else if (initialLacioVariant) {
      setPickerStep("lacio-length");
      setPendingLacioVariant(initialLacioVariant);
      setAbundantHairAnswered(false);
    }
  }, [initialLacioVariant, selectedServiceIds, abundantHair]);

  const commitDraft = useCallback(() => {
    if (draftServiceIds.length === 0) return;
    const normalized = normalizeEpicaServiceIds(draftServiceIds);
    onServiceIdsChange(normalized);
    if (serviceIdsNeedAbundantHairChoice(normalized)) {
      onAbundantHairChange(draftAbundantHair);
    } else {
      onAbundantHairChange("unknown");
    }
  }, [draftAbundantHair, draftServiceIds, onAbundantHairChange, onServiceIdsChange]);

  const handleAbundantHairChange = (choice: AbundantHairChoice) => {
    setDraftAbundantHair(choice);
    setAbundantHairAnswered(true);
  };

  const handleSelectLacioLength = (lacioId: string) => {
    setDraftServiceIds([lacioId]);
    setAbundantHairAnswered(false);
    setDraftAbundantHair("unknown");
  };

  const handleToggleAddonComplementario = (complementarioId: string) => {
    const lacio = draftServiceIds.find(isLacioTreatmentId);
    if (!lacio) return;
    const current = draftServiceIds.find(isComplementarioTreatmentId);
    setDraftServiceIds(current === complementarioId ? [lacio] : [lacio, complementarioId]);
  };

  const handleDraftSelectComplementarioOnly = (complementarioId: string) => {
    setDraftServiceIds([complementarioId]);
  };

  const handleContinue = (): "substep" | "wizard-next" | false => {
    if (!canCompleteStep1(pickerStep, draftServiceIds, pendingLacioVariant, abundantHairAnswered)) {
      return false;
    }
    if (pickerStep === "root" && pendingLacioVariant) {
      setPickerStep("lacio-length");
      return "substep";
    }
    if (pickerStep === "lacio-length") {
      setPickerStep("lacio-addon");
      return "substep";
    }
    if (pickerStep === "lacio-addon" || pickerStep === "complementarios") {
      commitDraft();
      return "wizard-next";
    }
    return false;
  };

  useImperativeHandle(ref, () => ({
    canContinue: () =>
      canCompleteStep1(pickerStep, draftServiceIds, pendingLacioVariant, abundantHairAnswered),
    continue: handleContinue,
  }));

  useEffect(() => {
    const can = canCompleteStep1(pickerStep, draftServiceIds, pendingLacioVariant, abundantHairAnswered);
    onCanContinueChange?.(can);
    const { label, hint } = continueLabelForStep(pickerStep, draftServiceIds, abundantHairAnswered);
    onContinueLabelChange?.(label);
    onContinueHintChange?.(can ? null : hint);
    onDraftSummaryChange?.(draftServicesSummary(draftServiceIds));
  }, [
    pickerStep,
    draftServiceIds,
    pendingLacioVariant,
    abundantHairAnswered,
    onCanContinueChange,
    onContinueLabelChange,
    onContinueHintChange,
    onDraftSummaryChange,
  ]);

  return (
    <EpicaServicePickerSheet
      variant="inline"
      step={pickerStep}
      pendingLacioVariant={pendingLacioVariant}
      selectedServiceIds={draftServiceIds}
      onStepChange={setPickerStep}
      onPendingLacioVariantChange={setPendingLacioVariant}
      onSelectLacioLength={handleSelectLacioLength}
      onToggleAddonComplementario={handleToggleAddonComplementario}
      onConfirmLacioSelection={() => {}}
      onDraftSelectComplementarioOnly={handleDraftSelectComplementarioOnly}
      onConfirmComplementarioOnly={() => {}}
      abundantHairChoice={draftAbundantHair}
      onAbundantHairChange={handleAbundantHairChange}
      abundantHairAnswered={abundantHairAnswered}
      onClose={() => {}}
    />
  );
});

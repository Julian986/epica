import { event } from "@/lib/gtag";

/** Acciones del panel (/panel-turnos). Sin datos personales de clientas. */
export function trackPanelClick(
  action: string,
  label?: string,
  extra?: Record<string, unknown>,
): void {
  event(action, {
    event_category: "panel",
    ...(label !== undefined ? { event_label: label } : {}),
    ...extra,
  });
}

export function trackNavClick(label: string): void {
  event("nav_click", { event_category: "navigation", event_label: label });
}

export function trackWizardContinue(step: number): void {
  event("wizard_continue", { event_category: "booking", event_label: `step_${step}` });
}

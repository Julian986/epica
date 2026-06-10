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

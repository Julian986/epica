import { TreatmentGuidePage } from "@/components/guides/treatment-guide-page";
import { YOE_GUIDE_MIRADA, YOE_PROTOCOLO_PREPARACION_MIRADA } from "@/lib/content/yoe-guides";

export default function ExperienciaMiradaGuidePage() {
  return (
    <TreatmentGuidePage
      content={YOE_GUIDE_MIRADA}
      prepContent={YOE_PROTOCOLO_PREPARACION_MIRADA}
      backHref="/tratamientos?familia=mirada"
      cta={{ href: "/turnos?treatment=laminado-cejas-epica", label: "Reservar laminado — $20.000" }}
      secondaryCta={{ href: "/turnos?treatment=lifting-pestanas-epica", label: "Reservar lifting — $25.000" }}
    />
  );
}

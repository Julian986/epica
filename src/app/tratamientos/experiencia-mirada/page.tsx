import { TreatmentGuidePage } from "@/components/guides/treatment-guide-page";
import { YOE_GUIDE_MIRADA, YOE_PROTOCOLO_PREPARACION_MIRADA } from "@/lib/content/yoe-guides";

export default function ExperienciaMiradaGuidePage() {
  return (
    <TreatmentGuidePage
      content={YOE_GUIDE_MIRADA}
      prepContent={YOE_PROTOCOLO_PREPARACION_MIRADA}
      backHref="/tratamientos?familia=mirada"
      reserveHref="/turnos?treatment=lifting-laminado-cejas-epica"
    />
  );
}

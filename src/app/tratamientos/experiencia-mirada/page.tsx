import { TreatmentGuidePage } from "@/components/guides/treatment-guide-page";
import { YOE_GUIDE_MIRADA } from "@/lib/content/yoe-guides";

export default function ExperienciaMiradaGuidePage() {
  return (
    <TreatmentGuidePage
      content={YOE_GUIDE_MIRADA}
      reserveHref="/turnos?treatment=lifting-laminado-cejas-epica"
    />
  );
}

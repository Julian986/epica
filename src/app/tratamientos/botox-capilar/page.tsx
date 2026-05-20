import { TreatmentGuidePage } from "@/components/guides/treatment-guide-page";
import { YOE_GUIDE_BOTOX } from "@/lib/content/yoe-guides";

export default function BotoxCapilarGuidePage() {
  return (
    <TreatmentGuidePage
      content={YOE_GUIDE_BOTOX}
      reserveHref="/turnos?treatment=botox-capilar-epica"
    />
  );
}

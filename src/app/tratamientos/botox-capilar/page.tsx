import { TreatmentGuidePage } from "@/components/guides/treatment-guide-page";
import { YOE_GUIDE_BOTOX, YOE_PROTOCOLO_PREPARACION_CAPILAR } from "@/lib/content/yoe-guides";

export default function BotoxCapilarGuidePage() {
  return (
    <TreatmentGuidePage
      content={YOE_GUIDE_BOTOX}
      prepContent={YOE_PROTOCOLO_PREPARACION_CAPILAR}
      backHref="/tratamientos?familia=capilares&servicio=botox"
      reserveHref="/turnos?treatment=botox-capilar-epica"
    />
  );
}

import { TreatmentGuidePage } from "@/components/guides/treatment-guide-page";
import {
  YOE_GUIDE_RETOQUE_RAICES,
  YOE_PROTOCOLO_PREPARACION_CAPILAR,
} from "@/lib/content/yoe-guides";

export default function RetoqueRaicesGuidePage() {
  return (
    <TreatmentGuidePage
      content={YOE_GUIDE_RETOQUE_RAICES}
      prepContent={YOE_PROTOCOLO_PREPARACION_CAPILAR}
      backHref="/tratamientos?familia=capilares&servicio=retoque"
      cta={{ href: "/contacto", label: "Consultar retoque de raíces" }}
    />
  );
}

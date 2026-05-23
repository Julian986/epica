import { TreatmentGuidePage } from "@/components/guides/treatment-guide-page";
import { YOE_GUIDE_HIDRONUTRITIVO } from "@/lib/content/yoe-guides";

export default function HidronutritivoGuidePage() {
  return (
    <TreatmentGuidePage
      content={YOE_GUIDE_HIDRONUTRITIVO}
      backHref="/tratamientos?familia=capilares&servicio=hidronutritivo"
      cta={{ href: "/contacto", label: "Consultar y reservar" }}
    />
  );
}

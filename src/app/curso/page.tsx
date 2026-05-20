import { TreatmentGuidePage } from "@/components/guides/treatment-guide-page";
import { YOE_GUIDE_CURSO } from "@/lib/content/yoe-guides";
import { CURSO_WHATSAPP_INQUIRY_URL } from "@/lib/epica-contact";

export default function CursoPage() {
  return (
    <TreatmentGuidePage
      content={YOE_GUIDE_CURSO}
      backHref="/"
      backLabel="Inicio"
      cta={{
        href: CURSO_WHATSAPP_INQUIRY_URL,
        label: "Consultar por WhatsApp",
        external: true,
      }}
    />
  );
}

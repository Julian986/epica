import { redirect } from "next/navigation";

export default function AlisadoGuideRedirectPage() {
  redirect("/tratamientos?familia=capilares&servicio=alisado");
}

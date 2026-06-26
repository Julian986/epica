import { cookies } from "next/headers";

import { verifyPanelCookie } from "@/lib/panel-turnos-auth";

import { PanelLogin } from "../panel-login";
import { PanelFeriadosClient } from "./panel-feriados-client";

export default async function PanelFeriadosPage() {
  const cookieStore = await cookies();
  if (!verifyPanelCookie(cookieStore.get("panel_turnos_auth")?.value)) {
    return <PanelLogin />;
  }

  return <PanelFeriadosClient />;
}

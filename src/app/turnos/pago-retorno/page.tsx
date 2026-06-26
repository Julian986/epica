"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Snapshot = {
  treatment?: string;
  subtitle?: string;
  date?: string;
  time?: string;
  name?: string;
  phone?: string;
  id?: string;
};

function PagoRetornoContent() {
  const searchParams = useSearchParams();
  const estado = searchParams.get("estado") ?? "";
  const [snap, setSnap] = useState<Snapshot | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("mp_turno_snapshot");
      if (raw) setSnap(JSON.parse(raw) as Snapshot);
    } catch {
      setSnap(null);
    }
  }, []);

  const title =
    estado === "success"
      ? "Pago recibido"
      : estado === "failure"
        ? "Pago no completado"
        : estado === "pending"
          ? "Pago pendiente"
          : "Volviste de Mercado Pago";

  const body =
    estado === "success"
      ? "Si Mercado Pago acreditó el pago, tu turno quedará confirmado en breve. La confirmación la procesa el sistema automáticamente (no depende de esta pantalla)."
      : estado === "failure"
        ? "No se completó el cobro. Podés volver a Turnos, elegir el mismo horario si sigue libre, e intentar de nuevo."
        : estado === "pending"
          ? "El pago puede estar en revisión. Cuando Mercado Pago lo apruebe, tu turno se confirmará solo."
          : "Esta pantalla es solo informativa. El estado real del pago lo confirma Mercado Pago por notificación al servidor.";

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="mx-auto w-full max-w-md px-5 pt-10 pb-28">
        <header className="mb-6 text-center">
          <h1 className="font-heading text-4xl font-bold leading-tight text-gray-900">{title}</h1>
          <p className="mt-4 text-[16px] leading-relaxed text-gray-600">{body}</p>
        </header>

        {snap?.treatment ? (
          <section className="mb-6 rounded-[24px] border border-gray-100 bg-white px-5 py-5 text-[15px] text-gray-700 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <p className="font-heading text-[22px] font-semibold text-gray-900">{snap.treatment}</p>
            {snap.date ? (
              <p className="mt-1 text-gray-600">
                {snap.date}
                {snap.time ? ` · ${snap.time} hs` : ""}
              </p>
            ) : null}
            {snap.id ? (
              <p className="mt-3 text-[13px] tracking-[0.04em] text-gray-500">
                Referencia reserva: <span className="font-mono text-gray-700">{snap.id}</span>
              </p>
            ) : null}
          </section>
        ) : null}

        <div className="flex flex-col gap-3">
          <Link
            href="/turnos"
            className="flex h-12 items-center justify-center rounded-full bg-[#B88E2F] text-[16px] font-semibold text-white shadow-lg"
          >
            Volver a Turnos
          </Link>
          <Link href="/" className="block text-center text-[15px] font-medium text-[#B88E2F]">
            Ir al inicio
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function PagoRetornoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-gray-500">
          Cargando…
        </div>
      }
    >
      <PagoRetornoContent />
    </Suspense>
  );
}

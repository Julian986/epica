"use client";

import { Wind } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function PromotionsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="mx-auto w-full max-w-md px-5 pt-10 pb-28">
        <header className="mb-6 text-center">
          <h1 className="font-heading text-5xl font-bold tracking-tight text-gray-900">Promociones</h1>
          <p className="mt-2 text-[16px] text-gray-600">Carta de servicios y precios de referencia</p>
        </header>

        <p className="mb-5 text-center text-[15px] leading-relaxed text-gray-600">
          Los valores pueden ajustarse según diagnóstico de largo, cantidad y estado del cabello.
        </p>

        <div className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <Image
            src="/servicios_epica.jpeg"
            alt="Servicios Épica — Lacio Sublime, complementarios y precios"
            width={900}
            height={1200}
            className="h-auto w-full"
            priority
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link
            href="/tratamientos"
            className="flex h-12 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white text-[14px] font-medium text-gray-800 shadow-sm"
          >
            <Wind className="h-4 w-4 text-[#B88E2F]" strokeWidth={1.8} />
            Ver detalle
          </Link>
          <Link
            href="/turnos"
            className="flex h-12 items-center justify-center rounded-full bg-[#B88E2F] text-[14px] font-semibold text-white shadow-md"
          >
            Reservar turno
          </Link>
        </div>
      </main>
    </div>
  );
}

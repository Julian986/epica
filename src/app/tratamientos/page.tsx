"use client";

import { ChevronRight, Droplets, Eye, Wind } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";

import { YoeGuideBody } from "@/components/guides/yoe-guide-body";
import { YoePrepSection } from "@/components/guides/yoe-prep-section";
import {
  CAPILAR_SERVICES,
  CURSO_PATH,
  TREATMENT_FAMILIES,
  YOE_GUIDE_ALISADO,
  YOE_GUIDE_BOTOX,
  YOE_GUIDE_HIDRONUTRITIVO,
  YOE_GUIDE_MIRADA,
  YOE_GUIDE_RETOQUE_RAICES,
  YOE_PROTOCOLO_PREPARACION_CAPILAR,
  YOE_PROTOCOLO_PREPARACION_MIRADA,
  parseCapilarServiceParam,
  parseTreatmentFamilyParam,
  type CapilarServiceId,
  type TreatmentFamilyId,
} from "@/lib/content/yoe-guides";
import {
  LACIO_VARIANT_OPTIONS,
  ABUNDANT_HAIR_SURCHARGE_LABEL,
  RETOQUE_ABUNDANT_HAIR_SURCHARGE_LABEL,
  findSalonTreatmentById,
  listLacioTreatmentsByVariant,
  type LacioVariantId,
} from "@/lib/treatments/catalog";

const pillClass = (active: boolean) =>
  `shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
    active ? "bg-[#B88E2F] text-white shadow-sm" : "bg-[#F5F5F5] text-gray-600 hover:bg-gray-100"
  }`;

const subPillClass = (active: boolean) =>
  `shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
    active ? "bg-[#B88E2F] text-white shadow-sm" : "bg-[#F5F5F5] text-gray-600 hover:bg-gray-100"
  }`;

function ReserveButton({ href, label = "Reservar turno" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="flex h-[52px] w-full items-center justify-center rounded-full bg-[#B88E2F] text-[16px] font-semibold text-white shadow-lg transition active:scale-[0.98]"
    >
      {label}
    </Link>
  );
}

function GuidePanel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[24px] border border-gray-100 bg-white px-5 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
      {children}
    </div>
  );
}

function ServiceIconArea({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-24 items-center justify-center overflow-hidden bg-[#F5F5F5]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(184,142,47,0.15),transparent_50%)]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function TreatmentsPageContent() {
  const searchParams = useSearchParams();
  const [family, setFamily] = useState<TreatmentFamilyId>("capilares");
  const [capilarService, setCapilarService] = useState<CapilarServiceId>("alisado");

  useEffect(() => {
    if (searchParams.get("guia") === "alisado") {
      setFamily("capilares");
      setCapilarService("alisado");
      return;
    }
    setFamily(parseTreatmentFamilyParam(searchParams.get("familia")));
    setCapilarService(parseCapilarServiceParam(searchParams.get("servicio")));
  }, [searchParams]);

  const botoxTreatment = findSalonTreatmentById("botox-capilar-epica");
  const retoqueTreatment = findSalonTreatmentById("retoque-raices-epica");
  const laminadoTreatment = findSalonTreatmentById("laminado-cejas-epica");
  const liftingTreatment = findSalonTreatmentById("lifting-pestanas-epica");

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="mx-auto w-full max-w-md px-5 pt-10 pb-28">
        <header className="mb-6 text-center">
          <h1 className="font-heading text-5xl font-bold tracking-tight text-gray-900">Servicios</h1>
          <p className="mt-2 text-[15px] font-medium tracking-wide text-[#B88E2F] uppercase">
            Épica · Experiencia Premium
          </p>
        </header>

        <p className="mb-4 text-center text-[13px] leading-snug text-gray-500">
          Precios orientativos; el valor final se confirma en salón según diagnóstico.
        </p>

        <section className="mb-3 flex items-center gap-2 overflow-x-auto pb-1">
          {TREATMENT_FAMILIES.map((item) => (
            <button key={item.id} type="button" onClick={() => setFamily(item.id)} className={pillClass(family === item.id)}>
              {item.label}
            </button>
          ))}
        </section>

        {family === "capilares" ? (
          <section className="mb-4 flex items-center gap-1.5 overflow-x-auto pb-1">
            {CAPILAR_SERVICES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCapilarService(item.id)}
                className={subPillClass(capilarService === item.id)}
              >
                {item.label}
              </button>
            ))}
          </section>
        ) : null}

        {family === "capilares" && capilarService === "alisado" ? (
          <section className="space-y-4 pb-2">
            <GuidePanel>
              <YoeGuideBody content={YOE_GUIDE_ALISADO} />
              <YoePrepSection content={YOE_PROTOCOLO_PREPARACION_CAPILAR} />
            </GuidePanel>

            <div className="space-y-3">
              <p className="text-center text-[13px] text-gray-500">
                Cabello abundante en alisado: {ABUNDANT_HAIR_SURCHARGE_LABEL}
              </p>
              <p className="text-center text-[13px] font-semibold tracking-wide text-gray-500 uppercase">
                Paquetes de alisado
              </p>
              {LACIO_VARIANT_OPTIONS.map((variant) => {
                const lengths = listLacioTreatmentsByVariant(variant.id as LacioVariantId);

                return (
                  <article
                    key={variant.id}
                    className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
                  >
                    <ServiceIconArea>
                      <Wind className="h-7 w-7 text-[#B88E2F]" strokeWidth={1.9} />
                    </ServiceIconArea>

                    <div className="px-5 pb-5">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="text-[20px] leading-tight font-semibold text-gray-900">{variant.name}</h2>
                        <p className="shrink-0 text-[13px] font-semibold text-[#B88E2F]">desde {variant.priceFromLabel}</p>
                      </div>
                      <p className="mt-1 text-[14px] leading-relaxed text-gray-600">{variant.description}</p>
                      <ul className="mt-2 space-y-0.5 text-[13px] text-gray-500">
                        {variant.benefits.map((b) => (
                          <li key={b}>· {b}</li>
                        ))}
                      </ul>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {lengths.map((t) => (
                          <div
                            key={t.id}
                            className="rounded-xl border border-gray-100 bg-[#F5F5F5] px-2 py-2 text-center"
                          >
                            <p className="text-[12px] font-medium text-gray-800">
                              {t.hairLength === "corto" ? "Corto" : t.hairLength === "medio" ? "Medio" : "Largo"}
                            </p>
                            <p className="mt-0.5 text-[11px] font-semibold text-[#B88E2F]">{t.priceLabel}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3">
                        <Link
                          href={`/turnos?variant=${variant.id}`}
                          className="flex h-10 w-full items-center justify-center rounded-full bg-[#B88E2F] text-[14px] font-semibold text-white"
                        >
                          Reservar
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="space-y-3">
              <ReserveButton href="/turnos" />
              <Link
                href={CURSO_PATH}
                className="flex h-11 w-full items-center justify-center rounded-full border border-gray-200 bg-white text-[14px] font-medium text-gray-800"
              >
                ✨ CURSO PREMIUM DE ALISADO BRASILERO – ÉPICA
              </Link>
            </div>
          </section>
        ) : null}

        {family === "capilares" && capilarService === "botox" ? (
          <section className="space-y-4 pb-2">
            <GuidePanel>
              <YoeGuideBody content={YOE_GUIDE_BOTOX} />
              <YoePrepSection content={YOE_PROTOCOLO_PREPARACION_CAPILAR} />
            </GuidePanel>

            {botoxTreatment ? (
              <article className="flex overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <div className="relative flex w-24 shrink-0 items-center justify-center bg-[#F5F5F5]">
                  <Droplets className="h-7 w-7 text-[#B88E2F]" strokeWidth={1.9} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-4">
                  <h2 className="text-[18px] leading-tight font-semibold text-gray-900">{botoxTreatment.name}</h2>
                  <p className="mt-1 text-[14px] font-semibold text-[#B88E2F]">{botoxTreatment.priceLabel}</p>
                  <p className="mt-1 text-[13px] text-gray-500">Duración: {botoxTreatment.durationLabel}</p>
                </div>
              </article>
            ) : null}

            <ReserveButton href="/turnos?treatment=botox-capilar-epica" />
          </section>
        ) : null}

        {family === "capilares" && capilarService === "hidronutritivo" ? (
          <section className="space-y-4 pb-2">
            <GuidePanel>
              <YoeGuideBody content={YOE_GUIDE_HIDRONUTRITIVO} />
            </GuidePanel>
            <ReserveButton href="/contacto" label="Consultar y reservar" />
          </section>
        ) : null}

        {family === "capilares" && capilarService === "retoque" ? (
          <section className="space-y-4 pb-2">
            <GuidePanel>
              <YoeGuideBody content={YOE_GUIDE_RETOQUE_RAICES} />
              <YoePrepSection content={YOE_PROTOCOLO_PREPARACION_CAPILAR} />
            </GuidePanel>

            {retoqueTreatment ? (
              <article className="flex overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <div className="relative flex w-24 shrink-0 items-center justify-center bg-[#F5F5F5]">
                  <Wind className="h-7 w-7 text-[#B88E2F]" strokeWidth={1.9} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-4">
                  <h2 className="text-[18px] leading-tight font-semibold text-gray-900">{retoqueTreatment.name}</h2>
                  <p className="mt-1 text-[14px] font-semibold text-[#B88E2F]">{retoqueTreatment.priceLabel}</p>
                  <p className="mt-1 text-[13px] text-gray-500">Duración: {retoqueTreatment.durationLabel}</p>
                </div>
              </article>
            ) : null}

            <p className="text-center text-[13px] text-gray-500">
              Mucho cabello en retoque: {RETOQUE_ABUNDANT_HAIR_SURCHARGE_LABEL}
            </p>
            <ReserveButton href="/turnos?treatment=retoque-raices-epica" />
            <p className="text-center text-[14px] leading-relaxed text-gray-500">
              Al reservar un turno también podés elegirlo en{" "}
              <span className="font-medium text-gray-700">Complementarios</span>.
            </p>
          </section>
        ) : null}

        {family === "mirada" ? (
          <section className="space-y-4 pb-2">
            <GuidePanel>
              <YoePrepSection content={YOE_PROTOCOLO_PREPARACION_MIRADA} />
              <div className="mt-6 border-t border-gray-100 pt-6">
                <YoeGuideBody content={YOE_GUIDE_MIRADA} />
              </div>
            </GuidePanel>

            {[laminadoTreatment, liftingTreatment].map((service) =>
              service ? (
                <article
                  key={service.id}
                  className="flex overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
                >
                  <div className="relative flex w-24 shrink-0 items-center justify-center bg-[#F5F5F5]">
                    <Eye className="h-7 w-7 text-[#B88E2F]" strokeWidth={1.9} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 px-4 py-4">
                    <div>
                      <h2 className="text-[18px] leading-tight font-semibold text-gray-900">{service.name}</h2>
                      <p className="mt-1 text-[14px] font-semibold text-[#B88E2F]">{service.priceLabel}</p>
                      <p className="mt-1 text-[13px] leading-snug text-gray-500">{service.description}</p>
                    </div>
                    <Link
                      href={`/turnos?treatment=${encodeURIComponent(service.id)}`}
                      className="flex h-9 w-full items-center justify-center rounded-full bg-[#B88E2F] text-[14px] font-semibold text-white"
                    >
                      Reservar
                    </Link>
                  </div>
                </article>
              ) : null,
            )}

            <Link
              href="/tratamientos/experiencia-mirada"
              className="flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white py-3 text-[14px] font-medium text-gray-700"
            >
              Ver guía en pantalla completa
              <ChevronRight className="h-4 w-4 text-[#B88E2F]" strokeWidth={1.8} />
            </Link>
          </section>
        ) : null}
      </main>
    </div>
  );
}

export default function TreatmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-gray-500">
          Cargando…
        </div>
      }
    >
      <TreatmentsPageContent />
    </Suspense>
  );
}

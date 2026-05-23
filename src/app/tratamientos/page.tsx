"use client";

import {
  CalendarDays,
  ChevronRight,
  Droplets,
  Eye,
  Home as HomeIcon,
  Percent,
  Sparkles,
  User,
  Wind,
} from "lucide-react";
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
  findSalonTreatmentById,
  listLacioTreatmentsByVariant,
  type LacioVariantId,
} from "@/lib/treatments/catalog";

const pillClass = (active: boolean) =>
  `shrink-0 rounded-full px-3.5 py-1.5 text-[13px] transition-colors ${
    active ? "bg-[#2a2a2a] text-[var(--soft-gray)]" : "bg-transparent text-[var(--soft-gray)]/70"
  }`;

const subPillClass = (active: boolean) =>
  `shrink-0 rounded-full px-3 py-1.5 text-[12px] transition-colors ${
    active ? "bg-[#2a2a2a] text-[var(--soft-gray)]" : "bg-transparent text-[var(--soft-gray)]/65"
  }`;

function ReserveButton({ href, label = "Reservar turno" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="flex h-[52px] w-full items-center justify-center rounded-full bg-gradient-to-r from-[var(--accent-orange)] to-[var(--premium-gold)] text-[15px] font-medium tracking-[0.06em] text-white shadow-[0_12px_28px_rgba(0,0,0,0.4)]"
    >
      {label}
    </Link>
  );
}

function GuidePanel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#161616]/80 px-4 py-5 shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
      {children}
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
  const miradaTreatment = findSalonTreatmentById("lifting-laminado-cejas-epica");

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <main className="mx-auto w-full max-w-md px-4 pt-6 pb-24">
        <header className="mb-4 text-center">
          <h1 className="text-[34px] leading-none font-heading">Servicios</h1>
          <p className="mt-2 text-[11px] tracking-[0.14em] text-[var(--premium-gold)]/90 uppercase">
            Épica · Experiencia Premium
          </p>
        </header>

        <p className="mb-3 text-center text-[11px] leading-relaxed text-[var(--soft-gray)]/85">
          Los precios pueden ajustarse según diagnóstico de largo, cantidad y estado del cabello.
          Cabello abundante: + $10.000 en alisados.
        </p>

        <section className="mb-2 flex items-center gap-2 overflow-x-auto pb-1">
          {TREATMENT_FAMILIES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFamily(item.id)}
              className={pillClass(family === item.id)}
            >
              {item.label}
            </button>
          ))}
        </section>

        {family === "capilares" ? (
          <section className="mb-3 flex items-center gap-1.5 overflow-x-auto pb-1">
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
              <p className="text-center text-[12px] tracking-[0.08em] text-[var(--soft-gray)]/75 uppercase">
                Paquetes de alisado
              </p>
              {LACIO_VARIANT_OPTIONS.map((variant) => {
                const lengths = listLacioTreatmentsByVariant(variant.id as LacioVariantId);

                return (
                  <article
                    key={variant.id}
                    className="overflow-hidden rounded-2xl border border-white/8 bg-[#1a1a1a] shadow-[0_8px_22px_rgba(0,0,0,0.45)]"
                  >
                    <div className="relative h-24 overflow-hidden bg-[#141414]">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(228,202,105,0.22),transparent_46%),linear-gradient(135deg,#191919_0%,#131313_58%,#0f0f0f_100%)]" />
                      <div className="relative z-10 flex h-full items-center justify-center">
                        <Wind className="h-7 w-7 text-[var(--premium-gold)]" strokeWidth={1.9} />
                      </div>
                    </div>

                    <div className="px-4 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="text-[20px] leading-tight font-heading">{variant.name}</h2>
                        <p className="shrink-0 text-[12px] text-[var(--premium-gold)]">
                          desde {variant.priceFromLabel}
                        </p>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-[var(--soft-gray)]/80">
                        {variant.description}
                      </p>
                      <ul className="mt-2 space-y-0.5 text-[10px] text-[var(--soft-gray)]/70">
                        {variant.benefits.map((b) => (
                          <li key={b}>· {b}</li>
                        ))}
                      </ul>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {lengths.map((t) => (
                          <div
                            key={t.id}
                            className="rounded-xl border border-white/6 bg-[#141414] px-2 py-2 text-center"
                          >
                            <p className="text-[11px] font-medium text-white/90">
                              {t.hairLength === "corto"
                                ? "Corto"
                                : t.hairLength === "medio"
                                  ? "Medio"
                                  : "Largo"}
                            </p>
                            <p className="mt-0.5 text-[10px] text-[var(--premium-gold)]">{t.priceLabel}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3">
                        <Link
                          href={`/turnos?variant=${variant.id}`}
                          className="flex h-9 w-full items-center justify-center rounded-full bg-gradient-to-r from-[var(--accent-orange)] to-[var(--premium-gold)] text-[14px] font-medium text-white"
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
                className="flex h-11 w-full items-center justify-center rounded-full border border-white/10 bg-[#1a1a1a] text-[13px] font-medium text-[var(--soft-gray)]"
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
              <article className="flex overflow-hidden rounded-2xl border border-white/8 bg-[#1a1a1a] shadow-[0_8px_22px_rgba(0,0,0,0.45)]">
                <div className="relative w-24 shrink-0 overflow-hidden bg-[#141414]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(228,202,105,0.22),transparent_46%)]" />
                  <div className="relative z-10 flex h-full items-center justify-center">
                    <Droplets className="h-7 w-7 text-[var(--premium-gold)]" strokeWidth={1.9} />
                  </div>
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center px-3 py-3">
                  <h2 className="text-[17px] leading-tight font-heading">{botoxTreatment.name}</h2>
                  <p className="mt-1 text-[12px] text-[var(--premium-gold)]">{botoxTreatment.priceLabel}</p>
                  <p className="mt-1 text-[10px] text-[var(--soft-gray)]/65">
                    Duración: {botoxTreatment.durationLabel}
                  </p>
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
              <article className="flex overflow-hidden rounded-2xl border border-white/8 bg-[#1a1a1a] shadow-[0_8px_22px_rgba(0,0,0,0.45)]">
                <div className="relative w-24 shrink-0 overflow-hidden bg-[#141414]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(228,202,105,0.22),transparent_46%)]" />
                  <div className="relative z-10 flex h-full items-center justify-center">
                    <Wind className="h-7 w-7 text-[var(--premium-gold)]" strokeWidth={1.9} />
                  </div>
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center px-3 py-3">
                  <h2 className="text-[17px] leading-tight font-heading">{retoqueTreatment.name}</h2>
                  <p className="mt-1 text-[12px] text-[var(--premium-gold)]">{retoqueTreatment.priceLabel}</p>
                  <p className="mt-1 text-[10px] text-[var(--soft-gray)]/65">
                    Duración: {retoqueTreatment.durationLabel}
                  </p>
                </div>
              </article>
            ) : null}

            <ReserveButton href="/turnos?treatment=retoque-raices-epica" />
            <p className="text-center text-[11px] leading-relaxed text-[var(--soft-gray)]/65">
              Al reservar un turno también podés elegirlo en{" "}
              <span className="text-[var(--soft-gray)]/85">Complementarios</span>.
            </p>
          </section>
        ) : null}

        {family === "mirada" ? (
          <section className="space-y-4 pb-2">
            <GuidePanel>
              <YoePrepSection content={YOE_PROTOCOLO_PREPARACION_MIRADA} />
              <div className="mt-6 border-t border-white/[0.06] pt-6">
                <YoeGuideBody content={YOE_GUIDE_MIRADA} />
              </div>
            </GuidePanel>

            {miradaTreatment ? (
              <article className="flex overflow-hidden rounded-2xl border border-white/8 bg-[#1a1a1a] shadow-[0_8px_22px_rgba(0,0,0,0.45)]">
                <div className="relative w-24 shrink-0 overflow-hidden bg-[#141414]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(228,202,105,0.22),transparent_46%)]" />
                  <div className="relative z-10 flex h-full items-center justify-center">
                    <Eye className="h-7 w-7 text-[var(--premium-gold)]" strokeWidth={1.9} />
                  </div>
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center px-3 py-3">
                  <h2 className="text-[17px] leading-tight font-heading">{miradaTreatment.name}</h2>
                  <p className="mt-1 text-[12px] text-[var(--premium-gold)]">{miradaTreatment.priceLabel}</p>
                  <p className="mt-1 text-[10px] leading-snug text-[var(--soft-gray)]/65">
                    Incluye laminado de cejas y lifting de pestañas según diagnóstico.
                  </p>
                </div>
              </article>
            ) : null}

            <ReserveButton href="/turnos?treatment=lifting-laminado-cejas-epica" />

            <Link
              href="/tratamientos/experiencia-mirada"
              className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-[#1a1a1a] py-3 text-[13px] text-[var(--soft-gray)]"
            >
              Ver guía en pantalla completa
              <ChevronRight className="h-4 w-4 text-[var(--premium-gold)]/80" strokeWidth={1.8} />
            </Link>
          </section>
        ) : null}
      </main>

      <nav className="fixed right-0 bottom-0 left-0 z-30">
        <div className="flex w-full items-center justify-between border-t border-white/8 bg-black/60 px-4 py-2.5 backdrop-blur-[16px]">
          <Link href="/" className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <HomeIcon className="h-5 w-5 text-[var(--soft-gray)]/90" strokeWidth={1.9} />
            <span className="text-[9px] tracking-[0.12em] text-[var(--soft-gray)]/80">Inicio</span>
          </Link>
          <Link href="/tratamientos" className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <Sparkles className="h-5 w-5 text-[var(--premium-gold)]" strokeWidth={1.8} />
            <span className="text-[9px] tracking-[0.12em] text-[var(--premium-gold)]">Tratamientos</span>
          </Link>
          <Link href="/turnos" className="flex min-w-0 flex-1 flex-col items-center gap-1 text-[var(--soft-gray)]/80">
            <CalendarDays className="h-5 w-5 text-[var(--soft-gray)]/90" strokeWidth={1.8} />
            <span className="text-[9px] tracking-[0.12em]">Turnos</span>
          </Link>
          <Link href="/promociones" className="flex min-w-0 flex-1 flex-col items-center gap-1 text-[var(--soft-gray)]/80">
            <Percent className="h-5 w-5 text-[var(--soft-gray)]/90" strokeWidth={1.8} />
            <span className="text-[9px] tracking-[0.12em]">Promos</span>
          </Link>
          <Link href="/perfil" className="flex min-w-0 flex-1 flex-col items-center gap-1 text-[var(--soft-gray)]/80">
            <User className="h-5 w-5 text-[var(--soft-gray)]/90" strokeWidth={1.8} />
            <span className="text-[9px] tracking-[0.12em]">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default function TreatmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#111111] text-[var(--soft-gray)]/60">
          Cargando…
        </div>
      }
    >
      <TreatmentsPageContent />
    </Suspense>
  );
}

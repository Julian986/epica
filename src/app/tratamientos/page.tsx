"use client";

import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  Droplets,
  Home as HomeIcon,
  Percent,
  Sparkles,
  User,
  Wind,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { YoeGuideBody } from "@/components/guides/yoe-guide-body";
import { CURSO_PATH, TREATMENT_GUIDE_PATHS, YOE_GUIDE_ALISADO } from "@/lib/content/yoe-guides";
import {
  LACIO_VARIANT_OPTIONS,
  SALON_TREATMENTS,
  TREATMENT_CATEGORIES,
  listLacioTreatmentsByVariant,
  type LacioVariantId,
  type TreatmentCategory,
} from "@/lib/treatments/catalog";

type LacioView = "servicios" | "guia";

const lacioSubTabClass = (active: boolean) =>
  `flex flex-1 items-center justify-center rounded-full py-2 text-[13px] transition-colors ${
    active ? "bg-[#2a2a2a] text-[var(--soft-gray)]" : "bg-transparent text-[var(--soft-gray)]/65"
  }`;

function CategoryIcon({ category }: { category: TreatmentCategory }) {
  const cls = "h-7 w-7 text-[var(--premium-gold)]";
  if (category === "Lacio") return <Wind className={cls} strokeWidth={1.9} />;
  return <Droplets className={cls} strokeWidth={1.9} />;
}

function TreatmentsPageContent() {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<TreatmentCategory>("Lacio");
  const [lacioView, setLacioView] = useState<LacioView>("servicios");

  useEffect(() => {
    if (searchParams.get("guia") === "alisado") {
      setActiveCategory("Lacio");
      setLacioView("guia");
    }
  }, [searchParams]);

  const complementarios = useMemo(
    () => SALON_TREATMENTS.filter((service) => service.category === "Complementarios"),
    [],
  );

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
          Cabello abundante: + $10.000 en servicios Lacio.
        </p>

        <section className="mb-2 flex items-center gap-2 overflow-x-auto pb-1">
          {TREATMENT_CATEGORIES.map((category) => {
            const isActive = category === activeCategory;

            return (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  if (category === "Lacio") setLacioView("servicios");
                }}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors ${
                  isActive
                    ? "bg-[#2a2a2a] text-[var(--soft-gray)]"
                    : "bg-transparent text-[var(--soft-gray)]/70"
                }`}
              >
                {category}
              </button>
            );
          })}
        </section>

        {activeCategory === "Lacio" ? (
          <section className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => setLacioView("servicios")}
              className={lacioSubTabClass(lacioView === "servicios")}
            >
              Servicios
            </button>
            <button
              type="button"
              onClick={() => setLacioView("guia")}
              className={`${lacioSubTabClass(lacioView === "guia")} gap-1.5`}
            >
              <BookOpen className="h-3.5 w-3.5 shrink-0" strokeWidth={1.9} />
              Guía alisado
            </button>
          </section>
        ) : null}

        {activeCategory === "Lacio" && lacioView === "guia" ? (
          <section className="pb-2">
            <YoeGuideBody content={YOE_GUIDE_ALISADO} />
            <div className="mt-8 space-y-3">
              <Link
                href="/turnos"
                className="flex h-[52px] w-full items-center justify-center rounded-full bg-gradient-to-r from-[var(--accent-orange)] to-[var(--premium-gold)] text-[15px] font-medium tracking-[0.06em] text-white shadow-[0_12px_28px_rgba(0,0,0,0.4)]"
              >
                Reservar turno
              </Link>
              <Link
                href={CURSO_PATH}
                className="flex h-11 w-full items-center justify-center rounded-full border border-white/10 bg-[#1a1a1a] text-[13px] font-medium text-[var(--soft-gray)]"
              >
                ✨ CURSO PREMIUM DE ALISADO BRASILERO – ÉPICA
              </Link>
            </div>
          </section>
        ) : null}

        {activeCategory === "Lacio" && lacioView === "servicios" ? (
          <section className="space-y-3">
            {LACIO_VARIANT_OPTIONS.map((variant) => {
              const lengths = listLacioTreatmentsByVariant(variant.id as LacioVariantId);

              return (
                <article
                  key={variant.id}
                  className="overflow-hidden rounded-2xl border border-white/8 bg-[#1a1a1a] shadow-[0_8px_22px_rgba(0,0,0,0.45)]"
                >
                  <div className="relative h-28 overflow-hidden bg-[#141414]">
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
          </section>
        ) : null}

        {activeCategory === "Complementarios" ? (
          <section className="grid grid-cols-1 gap-3">
            <Link
              href={TREATMENT_GUIDE_PATHS.hidronutritivo}
              className="flex items-center gap-3 rounded-2xl border border-white/8 bg-[#1a1a1a] px-4 py-3 transition-colors hover:bg-[#1f1f1f]"
            >
              <p className="min-w-0 flex-1 text-[14px] leading-tight font-heading text-[var(--soft-gray)]">
                ✨ TRATAMIENTO HIDRONUTRITIVO ÉPICA
              </p>
              <ChevronRight className="h-5 w-5 shrink-0 text-[var(--premium-gold)]/80" strokeWidth={1.8} />
            </Link>

            {complementarios.map((service) => {
              const guideHref =
                service.id === "botox-capilar-epica"
                  ? TREATMENT_GUIDE_PATHS.botox
                  : service.id === "lifting-laminado-cejas-epica"
                    ? TREATMENT_GUIDE_PATHS.mirada
                    : null;

              return (
              <article
                key={service.id}
                className="flex overflow-hidden rounded-2xl border border-white/8 bg-[#1a1a1a] shadow-[0_8px_22px_rgba(0,0,0,0.45)]"
              >
                <div className="relative w-28 shrink-0 overflow-hidden bg-[#141414]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(228,202,105,0.22),transparent_46%),linear-gradient(135deg,#191919_0%,#131313_58%,#0f0f0f_100%)]" />
                  <div className="relative z-10 flex h-full items-center justify-center">
                    <CategoryIcon category={service.category} />
                  </div>
                </div>

                <div className="flex min-w-0 flex-1 flex-col px-3 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-[17px] leading-tight font-heading">{service.name}</h2>
                    <p className="shrink-0 text-[12px] text-[var(--premium-gold)]">{service.priceLabel}</p>
                  </div>
                  <p className="mt-1 line-clamp-3 text-[11px] leading-tight text-[var(--soft-gray)]/80">
                    {service.description}
                  </p>
                  <p className="mt-1 text-[10px] tracking-[0.08em] text-[var(--soft-gray)]/65">
                    Duración: {service.durationLabel}
                  </p>

                  <div className="mt-auto flex flex-col gap-2 pt-2">
                    {guideHref ? (
                      <Link
                        href={guideHref}
                        className="flex h-8 w-full items-center justify-center rounded-full border border-white/10 bg-[#141414] text-[13px] font-medium text-[var(--soft-gray)]"
                      >
                        {service.id === "botox-capilar-epica"
                          ? "✨ BOTOX CAPILAR BRASILERO ÉPICA"
                          : "✨ LAMINADO DE CEJAS ÉPICA"}
                      </Link>
                    ) : null}
                    <Link
                      href={`/turnos?treatment=${encodeURIComponent(service.id)}`}
                      className="flex h-8 w-full items-center justify-center rounded-full bg-gradient-to-r from-[var(--accent-orange)] to-[var(--premium-gold)] text-[14px] font-medium text-white"
                    >
                      Reservar
                    </Link>
                  </div>
                </div>
              </article>
              );
            })}
          </section>
        ) : null}
      </main>

      <nav className="fixed right-0 bottom-0 left-0 z-30">
        <div className="flex w-full items-center justify-between border-t border-white/8 bg-black/60 px-4 py-2.5 backdrop-blur-[16px]">
          <Link href="/" className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <HomeIcon className="h-5 w-5 text-[var(--soft-gray)]/90" strokeWidth={1.9} />
            <span className="text-[9px] tracking-[0.12em] text-[var(--soft-gray)]/80">
              Inicio
            </span>
          </Link>
          <Link href="/tratamientos" className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <Sparkles className="h-5 w-5 text-[var(--premium-gold)]" strokeWidth={1.8} />
            <span className="text-[9px] tracking-[0.12em] text-[var(--premium-gold)]">
              Tratamientos
            </span>
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

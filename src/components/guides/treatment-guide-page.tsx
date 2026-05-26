"use client";

import { CalendarDays, ChevronLeft, Home as HomeIcon, Percent, Sparkles, User } from "lucide-react";
import Link from "next/link";

import { YoeGuideBody } from "@/components/guides/yoe-guide-body";
import { YoePrepSection } from "@/components/guides/yoe-prep-section";

export type GuidePageCta = {
  href: string;
  label: string;
  external?: boolean;
};

type TreatmentGuidePageProps = {
  content: string;
  /** Protocolo de preparación (alisado, botox, retoque o mirada). */
  prepContent?: string;
  backHref?: string;
  backLabel?: string;
  /** @deprecated Usar `cta` */
  reserveHref?: string;
  cta?: GuidePageCta;
  secondaryCta?: GuidePageCta;
};

export function TreatmentGuidePage({
  content,
  prepContent,
  backHref = "/tratamientos",
  backLabel = "Servicios",
  reserveHref,
  cta,
  secondaryCta,
}: TreatmentGuidePageProps) {
  const primaryCta: GuidePageCta | undefined =
    cta ?? (reserveHref ? { href: reserveHref, label: "Reservar turno" } : undefined);

  const renderCta = (action: GuidePageCta, className?: string) =>
    action.external ? (
      <a
        href={action.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {action.label}
      </a>
    ) : (
      <Link href={action.href} className={className}>
        {action.label}
      </Link>
    );

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <main className="mx-auto w-full max-w-md px-4 pt-5 pb-32">
        <header className="mb-6">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 rounded-lg py-1 pr-2 text-[13px] text-[var(--soft-gray)]/80 transition-colors hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.8} />
            {backLabel}
          </Link>
        </header>

        <div className="rounded-2xl border border-white/[0.06] bg-[#161616]/80 px-4 py-5 shadow-[0_12px_32px_rgba(0,0,0,0.35)] sm:px-5 sm:py-6">
          <YoeGuideBody content={content} />
          {prepContent ? <YoePrepSection content={prepContent} /> : null}
        </div>

        {primaryCta || secondaryCta ? (
          <div className="mt-8 space-y-3">
            {primaryCta
              ? renderCta(
                  primaryCta,
                  "flex h-[52px] w-full items-center justify-center rounded-full bg-gradient-to-r from-[var(--accent-orange)] to-[var(--premium-gold)] text-[15px] font-medium tracking-[0.06em] text-white shadow-[0_12px_28px_rgba(0,0,0,0.4)]",
                )
              : null}
            {secondaryCta
              ? renderCta(
                  secondaryCta,
                  "flex h-11 w-full items-center justify-center rounded-full border border-white/10 bg-[#1a1a1a] text-[14px] font-medium text-[var(--soft-gray)]",
                )
              : null}
          </div>
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
          <Link
            href="/turnos"
            className="flex min-w-0 flex-1 flex-col items-center gap-1 text-[var(--soft-gray)]/80"
          >
            <CalendarDays className="h-5 w-5 text-[var(--soft-gray)]/90" strokeWidth={1.8} />
            <span className="text-[9px] tracking-[0.12em]">Turnos</span>
          </Link>
          <Link
            href="/promociones"
            className="flex min-w-0 flex-1 flex-col items-center gap-1 text-[var(--soft-gray)]/80"
          >
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

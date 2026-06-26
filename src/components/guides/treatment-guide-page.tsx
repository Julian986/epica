"use client";

import { ChevronLeft } from "lucide-react";
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
      <a href={action.href} target="_blank" rel="noopener noreferrer" className={className}>
        {action.label}
      </a>
    ) : (
      <Link href={action.href} className={className}>
        {action.label}
      </Link>
    );

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="mx-auto w-full max-w-md px-5 pt-8 pb-28">
        <header className="mb-6">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 rounded-lg py-1 pr-2 text-[15px] text-gray-600 transition-colors hover:text-gray-900"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
            {backLabel}
          </Link>
        </header>

        <div className="rounded-[24px] border border-gray-100 bg-white px-5 py-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <YoeGuideBody content={content} />
          {prepContent ? <YoePrepSection content={prepContent} /> : null}
        </div>

        {primaryCta || secondaryCta ? (
          <div className="mt-8 space-y-3">
            {primaryCta
              ? renderCta(
                  primaryCta,
                  "flex h-[52px] w-full items-center justify-center rounded-full bg-[#B88E2F] text-[16px] font-semibold text-white shadow-lg transition active:scale-[0.98]",
                )
              : null}
            {secondaryCta
              ? renderCta(
                  secondaryCta,
                  "flex h-11 w-full items-center justify-center rounded-full border border-gray-200 bg-white text-[15px] font-medium text-gray-800",
                )
              : null}
          </div>
        ) : null}
      </main>
    </div>
  );
}

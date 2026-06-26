"use client";

import { Check, ChevronDown, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import {
  CURSO_BANNER_FRASES,
  CURSO_CTA_FOOTER,
  CURSO_DIFERENCIALES,
  CURSO_HERO_ALT,
  CURSO_HERO_IMAGE,
  CURSO_HISTORIA_PARAGRAPHS,
  CURSO_HISTORIA_QUOTE,
  CURSO_INCLUYE,
  CURSO_INFO_PRACTICA,
  CURSO_INFO_PRACTICA_NOTA,
  CURSO_MODULOS,
  CURSO_PRECIO_CUOTAS,
  CURSO_PRECIO_LANZAMIENTO,
} from "@/lib/content/curso-content";
import { CURSO_WHATSAPP_INQUIRY_URL } from "@/lib/epica-contact";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="font-heading text-2xl font-bold text-[#B88E2F]">{children}</h2>
      <div className="mt-2 h-px w-full bg-[#B88E2F]/35" />
    </div>
  );
}

function ModuloAccordion({
  title,
  topics,
  defaultOpen = false,
}: {
  title: string;
  topics: readonly string[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 bg-gray-900 px-4 py-3.5 text-left"
        aria-expanded={open}
      >
        <span className="text-[14px] font-semibold leading-snug text-white">{title}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-white/80 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>
      {open ? (
        <ul className="space-y-2 px-4 py-4">
          {topics.map((topic) => (
            <li key={topic} className="flex gap-2 text-[14px] leading-snug text-gray-600">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-sm bg-gray-800" aria-hidden />
              {topic}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function CursoPageClient() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="mx-auto w-full max-w-md px-5 pt-8 pb-48">
        <header className="mb-6">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-1 rounded-lg py-1 pr-2 text-[15px] text-gray-600 transition-colors hover:text-gray-900"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
            Inicio
          </Link>
          <h1 className="sr-only">Curso Premium de Alisado Brasileño — Épica</h1>
        </header>

        <section className="mb-8 overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
          <Image
            src={CURSO_HERO_IMAGE}
            alt={CURSO_HERO_ALT}
            width={900}
            height={1200}
            className="h-auto w-full"
            priority
          />
        </section>

        <section className="mb-10">
          <SectionTitle>Mi historia</SectionTitle>
          <div className="space-y-4 text-[15px] leading-relaxed text-gray-700">
            {CURSO_HISTORIA_PARAGRAPHS.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
          <blockquote className="mt-6 rounded-2xl border border-[#B88E2F]/40 bg-[#B88E2F]/5 px-5 py-4 text-center text-[15px] italic leading-relaxed text-gray-800">
            &ldquo;{CURSO_HISTORIA_QUOTE}&rdquo;
          </blockquote>
        </section>

        <section className="mb-10">
          <SectionTitle>¿Por qué este curso es diferente?</SectionTitle>
          <ul className="space-y-3">
            {CURSO_DIFERENCIALES.map((item) => (
              <li key={item} className="flex gap-3 text-[15px] leading-snug text-gray-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#B88E2F]/12">
                  <Check className="h-3.5 w-3.5 text-[#996515]" strokeWidth={2.5} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10">
          <SectionTitle>Qué vas a aprender</SectionTitle>
          <div className="space-y-3">
            {CURSO_MODULOS.map((mod, i) => (
              <ModuloAccordion key={mod.id} title={mod.title} topics={mod.topics} defaultOpen={i === 0} />
            ))}
          </div>
        </section>

        <section className="mb-10">
          <SectionTitle>Qué incluye</SectionTitle>
          <ul className="space-y-3">
            {CURSO_INCLUYE.map((item) => (
              <li key={item} className="flex gap-3 text-[15px] leading-snug text-gray-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-sm bg-gray-800" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10">
          <SectionTitle>Info práctica</SectionTitle>
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <div className="grid grid-cols-[minmax(5.5rem,auto)_1fr] bg-gray-900 text-[13px] font-semibold uppercase tracking-wide text-white">
              <div className="border-r border-gray-700 px-3 py-2.5">Campo</div>
              <div className="px-3 py-2.5">Detalle</div>
            </div>
            {CURSO_INFO_PRACTICA.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-[minmax(5.5rem,auto)_1fr] text-[14px] ${
                  i % 2 === 0 ? "bg-[#F5F5F5]" : "bg-white"
                }`}
              >
                <div className="border-r border-gray-200 px-3 py-3 font-semibold text-gray-900">{row.label}</div>
                <div className="px-3 py-3 text-gray-700">{row.value}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-gray-500">{CURSO_INFO_PRACTICA_NOTA}</p>
        </section>

        <section className="mb-10 rounded-2xl bg-[#B88E2F] px-5 py-6 text-center text-white shadow-lg">
          {CURSO_BANNER_FRASES.map((line) => (
            <p key={line} className="text-[16px] font-medium leading-relaxed">
              {line}
            </p>
          ))}
        </section>

        <section className="mb-10">
          <SectionTitle>Inversión</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-[#B88E2F]/50 bg-white px-4 py-5 text-center shadow-sm">
              <p className="text-[12px] font-semibold tracking-wide text-[#B88E2F] uppercase">
                {CURSO_PRECIO_LANZAMIENTO.title}
              </p>
              <p className="mt-2 font-heading text-2xl font-bold text-gray-900">{CURSO_PRECIO_LANZAMIENTO.main}</p>
              <p className="mt-2 text-[12px] leading-relaxed text-gray-500">{CURSO_PRECIO_LANZAMIENTO.detail}</p>
            </div>
            <div className="rounded-2xl border-2 border-[#B88E2F]/50 bg-white px-4 py-5 text-center shadow-sm">
              <p className="text-[12px] font-semibold tracking-wide text-[#B88E2F] uppercase">
                {CURSO_PRECIO_CUOTAS.title}
              </p>
              <p className="mt-2 font-heading text-2xl font-bold text-gray-900">{CURSO_PRECIO_CUOTAS.main}</p>
              <p className="mt-2 text-[12px] text-gray-500">{CURSO_PRECIO_CUOTAS.detail}</p>
            </div>
          </div>
        </section>

        <section className="pb-4 text-center">
          <p className="text-[17px] font-semibold text-gray-900">{CURSO_CTA_FOOTER.heading}</p>
          <p className="mt-2 text-[15px] text-gray-600">{CURSO_CTA_FOOTER.sub}</p>
          <p className="mt-2 text-[14px] font-medium text-[#B88E2F]">{CURSO_CTA_FOOTER.handle}</p>
        </section>
      </main>

      <div className="fixed bottom-20 left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-5">
        <a
          href={CURSO_WHATSAPP_INQUIRY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-14 w-full items-center justify-center rounded-full bg-[#B88E2F] text-[16px] font-semibold text-white shadow-lg transition active:scale-[0.98]"
        >
          Consultar por WhatsApp
        </a>
      </div>
    </div>
  );
}

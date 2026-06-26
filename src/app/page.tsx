"use client";

import { BrandLogo } from "@/components/brand-logo";
import {
  EPICA_BRAND_NAME_UPPER,
  EPICA_BRAND_SUBTITLE,
  EPICA_BRAND_TAGLINE,
  EPICA_HOME_INTRO,
} from "@/lib/epica-brand";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

let hasShownHomeSplash = false;

const SPLASH_MAX_MS = 900;
const SPLASH_MIN_VISIBLE_MS = 360;
const SPLASH_AFTER_LOAD_MS = 90;

function SplashScreen({ onLogoReady }: { onLogoReady: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white text-gray-900">
      <div className="flex w-full max-w-md flex-col items-center px-6">
        <div className="mb-8 text-center">
          <div className="inline-flex flex-col items-center gap-2">
            <BrandLogo
              size="splash"
              fetchPriority="high"
              decoding="sync"
              onLoad={onLogoReady}
              onError={onLogoReady}
            />
            <div className="text-center text-2xl font-medium leading-tight tracking-[0.1em] font-heading">
              <span className="block">{EPICA_BRAND_NAME_UPPER}</span>
            </div>
            <div className="text-xs tracking-[0.22em] text-[#B88E2F]">{EPICA_BRAND_TAGLINE}</div>
          </div>
        </div>
        <p className="max-w-xs text-center text-sm leading-relaxed text-gray-600">{EPICA_HOME_INTRO}</p>
      </div>
    </div>
  );
}

const secondaryBtn =
  "flex h-[52px] items-center justify-center rounded-full border border-gray-200 bg-white px-6 text-[15px] font-medium tracking-[0.06em] text-gray-800 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition active:scale-[0.98]";

const cursoHighlightBtn =
  "flex h-[52px] items-center justify-center rounded-full border-2 border-[#B88E2F] bg-[#B88E2F]/10 px-6 text-[15px] font-semibold tracking-[0.06em] text-[#996515] shadow-[0_4px_20px_rgba(184,142,47,0.15)] transition active:scale-[0.98]";

function HomeContent() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-gray-900">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: [
            "radial-gradient(ellipse 120% 70% at 50% -15%, rgba(184,142,47,0.12), transparent 52%)",
            "radial-gradient(ellipse 80% 55% at 100% 40%, rgba(206,120,50,0.06), transparent 45%)",
            "linear-gradient(to bottom, #fafafa 0%, #ffffff 38%, #ffffff 100%)",
          ].join(","),
        }}
      />

      <main className="relative z-20 mx-auto min-h-screen w-full max-w-md px-5 pt-20 pb-28">
        <header className="flex justify-center">
          <div className="inline-flex flex-col items-center gap-1 text-center">
            <BrandLogo size="header" />
            <div className="text-center text-[20px] font-medium leading-tight tracking-[0.1em] text-gray-900 font-heading">
              <span className="block">{EPICA_BRAND_NAME_UPPER}</span>
            </div>
            <div className="text-[11px] tracking-[0.2em] text-[#B88E2F]">{EPICA_BRAND_TAGLINE}</div>
            <div className="text-[10px] tracking-[0.14em] text-gray-500">{EPICA_BRAND_SUBTITLE}</div>
          </div>
        </header>

        <div className="mt-10 space-y-4 md:mt-14">
          <section className="pb-1">
            <h1 className="sr-only">{EPICA_BRAND_NAME_UPPER}</h1>
            <div className="mx-auto flex w-[84%] flex-col gap-3">
              <Link
                href="/turnos"
                className="flex h-[52px] items-center justify-center rounded-full bg-[#B88E2F] px-6 text-[16px] font-semibold tracking-[0.06em] text-white shadow-lg transition active:scale-[0.98]"
              >
                Reservar turno
              </Link>
              <Link href="/tratamientos" className={secondaryBtn}>
                Tratamientos
              </Link>
              <Link href="/curso" className={cursoHighlightBtn}>
                Curso de alisado
              </Link>
              <Link href="/promociones" className={secondaryBtn}>
                Promociones
              </Link>
            </div>
          </section>

          <section className="mx-auto w-[84%] space-y-3">
            <Link href="/contacto" className={`${secondaryBtn} w-full`}>
              Contacto
            </Link>
          </section>

          <section className="mx-auto w-[84%]">
            <div className="mb-3 text-[10px] tracking-[0.24em] text-gray-500">DESTACADO</div>
            <div className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
              <div className="text-[10px] tracking-[0.24em] text-[#B88E2F]">LACIO SUBLIME</div>
              <h2 className="mt-2 text-lg leading-tight text-gray-900 font-heading">Alisado premium sin formol</h2>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                Conocé la técnica Épica y reservá tu turno online.
              </p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <Link
                  href="/tratamientos?familia=capilares&servicio=alisado"
                  className="flex h-10 items-center justify-center rounded-full border border-gray-200 bg-[#F5F5F5] px-4 text-[12px] font-medium tracking-[0.04em] text-gray-700"
                >
                  Conocé más
                </Link>
                <Link
                  href="/turnos"
                  className="flex h-10 items-center justify-center rounded-full bg-[#B88E2F] px-5 text-[12px] font-semibold tracking-[0.04em] text-white"
                >
                  Reservar
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(!hasShownHomeSplash);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissedRef = useRef(false);
  const openedAtRef = useRef(0);

  const dismissSplash = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    if (maxTimerRef.current !== null) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
    hasShownHomeSplash = true;
    setShowSplash(false);
  }, []);

  useLayoutEffect(() => {
    if (hasShownHomeSplash || !showSplash) return;
    openedAtRef.current = Date.now();
  }, [showSplash]);

  useEffect(() => {
    if (hasShownHomeSplash) {
      setShowSplash(false);
      return;
    }
    if (!showSplash) return;
    maxTimerRef.current = setTimeout(dismissSplash, SPLASH_MAX_MS);
    return () => {
      if (maxTimerRef.current !== null) {
        clearTimeout(maxTimerRef.current);
        maxTimerRef.current = null;
      }
    };
  }, [showSplash, dismissSplash]);

  const handleSplashLogoReady = useCallback(() => {
    const elapsed = Date.now() - openedAtRef.current;
    const wait = Math.max(SPLASH_AFTER_LOAD_MS, SPLASH_MIN_VISIBLE_MS - elapsed);
    window.setTimeout(dismissSplash, wait);
  }, [dismissSplash]);

  if (showSplash) {
    return <SplashScreen onLogoReady={handleSplashLogoReady} />;
  }

  return <HomeContent />;
}

"use client";

import { BrandLogo } from "@/components/brand-logo";
import { useRef, useState } from "react";

type LumiTip = {
  id: string;
  titleLines: string[];
  content: string;
  imageUrl: string;
};

const tips: LumiTip[] = [
  {
    id: "tip-limpieza",
    titleLines: ["Cada cuanto hacerse", "una limpieza facial profesional?"],
    content:
      "Para cuidar y mantener tu piel sana y luminosa, es recomendable realizar una limpieza facial profesional cada 30 a 45 dias. Este habito ayuda a eliminar impurezas, puntos negros y a mantener el equilibrio de la piel.",
    imageUrl:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "tip-laser",
    titleLines: ["Durante tratamientos laser", "evita la exposicion solar directa"],
    content:
      "Durante tratamientos laser es importante evitar exposicion solar directa y usar protector solar de amplio espectro. Esto reduce irritacion y mejora los resultados de cada sesion.",
    imageUrl:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "tip-protector",
    titleLines: ["El protector solar es", "el mejor tratamiento antiage"],
    content:
      "Usar protector solar todos los dias es clave para prevenir manchas y envejecimiento prematuro. Reaplicalo cada 2 a 3 horas, incluso en dias nublados.",
    imageUrl:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1400&q=80",
  },
];

export default function TipsDeLumiPage() {
  const [activeTip, setActiveTip] = useState(0);
  const currentTip = tips[activeTip];
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleSwipe = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const deltaX = touchEndX.current - touchStartX.current;
    const threshold = 40;
    if (Math.abs(deltaX) < threshold) return;
    if (deltaX < 0) {
      setActiveTip((prev) => (prev + 1) % tips.length);
    } else {
      setActiveTip((prev) => (prev - 1 + tips.length) % tips.length);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="mx-auto w-full max-w-md px-5 pt-10 pb-28">
        <header className="mb-4 text-center">
          <BrandLogo size="page" className="mx-auto mb-2" />
          <div
            className="mx-auto h-[1px] w-36"
            style={{
              backgroundImage: "linear-gradient(to right, transparent, #B88E2F, transparent)",
            }}
          />
          <h1 className="mt-3 font-heading text-4xl font-bold leading-tight text-gray-900">Tips Épica</h1>
        </header>

        <article
          className="overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0]?.clientX ?? null;
            touchEndX.current = null;
          }}
          onTouchMove={(e) => {
            touchEndX.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={handleSwipe}
        >
          <div className="relative h-[320px] w-full">
            <img
              src={currentTip.imageUrl}
              alt={currentTip.titleLines.join(" ")}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <div className="absolute right-0 bottom-0 left-0 px-5 pb-5">
              <h2 className="font-heading text-[24px] leading-[1.14] text-white">
                <span className="mr-1 text-[#B88E2F]">✦</span>
                {currentTip.titleLines[0]}
                <br />
                {currentTip.titleLines[1]}
              </h2>
            </div>
          </div>

          <div className="px-5 py-5">
            <p className="text-[15px] leading-[1.72] text-gray-600">{currentTip.content}</p>
          </div>
        </article>

        <div className="mt-4 flex items-center justify-center gap-2">
          {tips.map((tip, index) => (
            <button
              key={tip.id}
              onClick={() => setActiveTip(index)}
              aria-label={`Ver ${tip.id}`}
              className={`h-2 w-2 rounded-full transition-colors ${
                activeTip === index ? "bg-[#B88E2F]" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

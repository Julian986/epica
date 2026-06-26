"use client";

import { Instagram, MapPin } from "lucide-react";
import Link from "next/link";

import {
  EPICA_ADDRESS_LINE,
  EPICA_ADDRESS_MAPS_EMBED_URL,
  EPICA_ADDRESS_MAPS_SEARCH_URL,
  EPICA_INSTAGRAM_HANDLE,
  EPICA_INSTAGRAM_URL,
  EPICA_WHATSAPP_DISPLAY,
  EPICA_WHATSAPP_URL,
} from "@/lib/epica-brand";

function WhatsappIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="currentColor"
        d="M12 3.1c-4.9 0-8.9 3.9-8.9 8.8 0 1.6.4 3.1 1.3 4.4L3 21l4.9-1.3c1.3.7 2.7 1.1 4.1 1.1 4.9 0 8.9-3.9 8.9-8.8C20.9 7 16.9 3.1 12 3.1zm0 15.7c-1.3 0-2.5-.3-3.6-.9l-.3-.2-2.9.8.8-2.8-.2-.3c-.8-1.1-1.2-2.4-1.2-3.8C4.6 8 7.9 4.8 12 4.8s7.4 3.2 7.4 7.2-3.3 7.2-7.4 7.2zm4-5.2c-.2-.1-1.1-.6-1.2-.6-.2-.1-.3-.1-.5.1-.1.2-.6.7-.7.8-.1.1-.3.2-.5.1-.2-.1-.8-.3-1.5-.9-.6-.5-1-1.2-1.1-1.4-.1-.2 0-.3.1-.4.1-.1.2-.2.3-.4.1-.1.1-.2.2-.4.1-.1 0-.3 0-.4 0-.1-.5-1.2-.7-1.6-.2-.5-.4-.4-.5-.4h-.4c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9 0 1.1.8 2.1.9 2.3.1.2 1.6 2.4 3.8 3.3.5.2.9.3 1.2.4.5.2 1 .2 1.3.1.4-.1 1.1-.4 1.3-.9.2-.5.2-1 .2-1.1-.1-.1-.2-.2-.4-.3z"
      />
    </svg>
  );
}

type ContactItem = {
  label: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href?: string;
};

const contactItems: ContactItem[] = [
  { label: "Dirección", description: EPICA_ADDRESS_LINE, icon: MapPin },
  { label: "WhatsApp", description: EPICA_WHATSAPP_DISPLAY, icon: WhatsappIcon, href: EPICA_WHATSAPP_URL },
  { label: "Instagram", description: EPICA_INSTAGRAM_HANDLE, icon: Instagram, href: EPICA_INSTAGRAM_URL },
];

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="mx-auto w-full max-w-md px-5 pt-10 pb-28">
        <header className="mb-6">
          <h1 className="font-heading text-5xl font-bold tracking-tight text-gray-900">Contacto</h1>
          <p className="mt-2 text-lg text-gray-600">WhatsApp, ubicación e Instagram</p>
        </header>

        <section className="mb-4 rounded-[24px] border border-gray-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <div className="divide-y divide-gray-100">
            {contactItems.map((item) => {
              const Icon = item.icon;
              const content = (
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F5F5]">
                      <Icon
                        className={`text-[#B88E2F] ${item.label === "WhatsApp" ? "h-6 w-6" : "h-5 w-5"}`}
                        strokeWidth={1.7}
                      />
                    </div>
                    <div>
                      <p className="text-[17px] font-semibold text-gray-900">{item.label}</p>
                      <p className="mt-0.5 text-[15px] text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  {item.href ? <span className="text-gray-300">›</span> : null}
                </div>
              );

              if (item.href) {
                return (
                  <Link key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="block">
                    {content}
                  </Link>
                );
              }
              return <div key={item.label}>{content}</div>;
            })}
          </div>
        </section>

        <section className="rounded-[24px] border border-gray-100 bg-[#F5F5F5] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <p className="text-sm font-semibold tracking-wide text-[#B88E2F] uppercase">Ubicación en mapa</p>
          <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <iframe
              src={EPICA_ADDRESS_MAPS_EMBED_URL}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-48 w-full border-0"
              allowFullScreen
            />
          </div>
          <Link
            href={EPICA_ADDRESS_MAPS_SEARCH_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-[15px] font-medium text-[#B88E2F]"
          >
            Ver mapa en Google Maps
          </Link>
        </section>
      </main>
    </div>
  );
}

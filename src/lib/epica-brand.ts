/** Identidad Épica Peluquería — fuente única para la app pública y panel. */

export const EPICA_BRAND_NAME = "Épica Peluqueria";
export const EPICA_BRAND_NAME_UPPER = "ÉPICA PELUQUERIA";
export const EPICA_BRAND_TAGLINE = "Experiencia Premium";
export const EPICA_BRAND_SUBTITLE = "Lacio · Tratamientos · Formación";

export const EPICA_LOGO_SRC = "/epica_peluqueria.webp";
export const EPICA_HERO_IMAGE_SRC = EPICA_LOGO_SRC;

/** Dígitos internacionales para wa.me (sin + ni espacios). */
export const EPICA_WHATSAPP_WA_ID = "5492233410763";

export const EPICA_WHATSAPP_DISPLAY = "+54 9 223 341-0763";

export const EPICA_WHATSAPP_URL = `https://wa.me/${EPICA_WHATSAPP_WA_ID}`;

export function epicaWhatsAppInquiryUrl(message: string): string {
  return `${EPICA_WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}

export const EPICA_INSTAGRAM_URL = "https://www.instagram.com/epica.peluqueria/";
export const EPICA_INSTAGRAM_HANDLE = "@epica.peluqueria";

export const EPICA_ADDRESS_LINE = "Italia 3899 · Mar del Plata";
export const EPICA_ADDRESS_MAPS_QUERY = "Italia+3899,+Mar+del+Plata,+Buenos+Aires,+Argentina";
export const EPICA_ADDRESS_MAPS_SEARCH_URL = `https://www.google.com/maps/search/?api=1&query=${EPICA_ADDRESS_MAPS_QUERY}`;
export const EPICA_ADDRESS_MAPS_EMBED_URL = `https://www.google.com/maps?q=${EPICA_ADDRESS_MAPS_QUERY}&z=16&output=embed`;

export const EPICA_HOME_INTRO =
  "Alisado premium, tratamientos capilares y experiencia profesional en Mar del Plata.";

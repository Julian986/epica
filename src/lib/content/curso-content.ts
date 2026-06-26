/** Contenido del curso — transcrito de material enviado por Yoe (may 2026). */

export const CURSO_HERO_IMAGE = "/curso/sumar_imagen.jpeg";

export const CURSO_HERO_ALT =
  "Curso presencial de alisado sin formol — Épica Peluquería, Mar del Plata";

export const CURSO_HISTORIA_PARAGRAPHS = [
  "Durante 11 años trabajé bajo dependencia, en un trabajo donde pensé que me iba a jubilar. Era estable, sí — pero no me permitía estar con mi hijo. Y eso, para mí, lo era todo.",
  "Hace más de 4 años me dedico al alisado. En este camino probé un montón de productos, técnicas y herramientas — algunos funcionaban a medias, otros prometían y no cumplían. Hasta que encontré EL producto, las técnicas y las herramientas eficaces que marcan la diferencia.",
  "Soy mamá full time, 24/7. Y esta profesión es la que me permite vivir, mantener mi casa y, sobre todo, estar presente para mi hijo. No lo cuento desde la victimización — lo cuento desde el orgullo. Porque este oficio me dio independencia, libertad y la posibilidad de construir algo propio.",
  "Por eso quiero compartir lo que aprendí. Esta capacitación es una experiencia de empoderamiento: una salida laboral rápida, real y con un sinfín de puertas que se abren. Lo que a mí me costó años de prueba y error, vos lo vas a aprender en dos días — sin secretos, con todo mi acompañamiento.",
] as const;

export const CURSO_HISTORIA_QUOTE =
  "Lo que a mí me llevó años descubrir, te lo enseño sin guardarme nada. Eso es lo que hace diferente a esta capacitación.";

export const CURSO_DIFERENCIALES = [
  "Aprendés con EL producto y las herramientas que realmente funcionan — no a prueba y error",
  "Técnica libre de formol — priorizamos la salud del cabello",
  "Una capacitación SIN SECRETOS — te enseño todo lo que sé",
  "Apoyo y seguimiento por grupo de WhatsApp durante 2 meses",
  "Práctica real con modelos — no solo teoría",
  "Salida laboral rápida — empezás a trabajar enseguida",
  "Una profesión que te da independencia y libertad",
] as const;

export type CursoModulo = {
  id: string;
  title: string;
  topics: readonly string[];
};

export const CURSO_MODULOS: readonly CursoModulo[] = [
  {
    id: "modulo-1",
    title: "Módulo 1 — El Cabello: Estructura, Diagnóstico y Química",
    topics: [
      "Cómo está formado el cabello: estructura y capas",
      "Tipos de cabello y de cuero cabelludo",
      "Diagnóstico capilar: porosidad, elasticidad y resistencia",
      "Qué es el pH y por qué es clave entenderlo",
      "Cómo elegir el producto según el diagnóstico",
      "Los ácidos del alisado: glioxílico, láctico, tánico y más",
      "Cómo evaluar marcas y trabajar con seguridad",
    ],
  },
  {
    id: "modulo-2",
    title: "Módulo 2 — Técnica Trifásica: Producto · Láser · Nano",
    topics: [
      "El paso a paso completo en orden cronológico",
      "Aplicación del producto y reposo correcto",
      "El Láser Photon: cada color y su función",
      "La nanotecnología capilar y cómo potencia el resultado",
      "Brushing profesional y sectorización técnica",
      "Las pasadas de plancha: temperatura y criterio",
      "Errores comunes y cómo evitarlos",
    ],
  },
  {
    id: "modulo-3",
    title: "Módulo 3 — Mesas de Trabajo, Práctica y Experiencia",
    topics: [
      "Organización de las 3 mesas de trabajo",
      "Práctica completa en modelos reales",
      "Cómo recibir y asesorar a la clienta",
      "Speech profesional de cierre y post-cuidados",
      "La importancia del secado y mantenimiento",
      "Factores que determinan el resultado",
    ],
  },
  {
    id: "modulo-4",
    title: "Módulo 4 — Marketing: Cómo Diferenciarte del Resto",
    topics: [
      "Cómo conseguir más clientas nuevas",
      "Cómo valorizar tu trabajo y cobrar lo que vale",
      "Cómo fidelizar a tus clientas",
      "Presencia en redes: fotos, contenido y posicionamiento",
      "Cómo comunicar tu servicio como algo premium",
    ],
  },
] as const;

export const CURSO_INCLUYE = [
  "Kit de inicio para que arranques con todo lo necesario",
  "Material de estudio completo — todos los módulos en PDF",
  "Certificado de finalización del curso",
  "Prácticas con modelos reales durante la capacitación",
  "Venta prioritaria de productos y herramientas con descuentos exclusivos",
  "Seguimiento durante 2 meses por WhatsApp en grupo exclusivo de alumnas",
] as const;

export const CURSO_INFO_PRACTICA = [
  { label: "Fechas", value: "Sábado 15 y domingo 16 de agosto" },
  { label: "Horario", value: "9 a 15 hs aprox." },
  { label: "Lugar", value: "Italia esq. Formosa, MDP" },
  { label: "Nivel", value: "Todos los niveles" },
] as const;

export const CURSO_INFO_PRACTICA_NOTA =
  "Cupos limitados · La dirección exacta se confirma al momento de la inscripción.";

export const CURSO_BANNER_FRASES = [
  "Este puede ser el momento que lo cambie todo.",
  "Tu independencia, tu tiempo, tu vida — empiezan con una decisión.",
] as const;

export const CURSO_PRECIO_LANZAMIENTO = {
  title: "Precio de lanzamiento",
  main: "2 pagos de $150.000",
  detail: "Total: $300.000 · Efectivo o transferencia · 1.er pago en junio/julio reserva tu lugar",
} as const;

export const CURSO_PRECIO_CUOTAS = {
  title: "En cuotas con tarjeta",
  main: "6 cuotas de $73.000",
  detail: "Vía Mercado Pago",
} as const;

export const CURSO_CTA_FOOTER = {
  heading: "¿Lista para llevar tu técnica al siguiente nivel?",
  sub: "Escribinos por WhatsApp o DM para reservar tu lugar",
  handle: "@epica.peluqueria · Mar del Plata",
} as const;

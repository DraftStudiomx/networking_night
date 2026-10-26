// Single source of truth for event facts and site copy.
// Items still marked "por definir" in PLANEACION.md stay out of here until confirmed.

export const EVENT = {
  name: "Networking Night",
  tagline: "Save the date",
  couple: ["Pioneros", "Metamorfosis"] as const,
  premise:
    "El primer capítulo de BNI en México y el capítulo más joven de León se dan el sí.",
  // 28 Nov 2026, 4:00 pm in León (UTC-6, no DST in Guanajuato)
  startsAt: "2026-11-28T16:00:00-06:00",
  dateLabel: { day: "Sábado", date: "28 Nov", time: "4:00 pm", dress: "Formal" },
  dateLong: "Sábado 28 de noviembre de 2026",
  venue: {
    name: "Salón Callejón Arroyo",
    address: "Valle del Arroyo 217, Santa Gertrudis, 37547 León de los Aldama, Gto.",
    city: "León, Guanajuato",
    // Maps search URL: opens the Maps app on phones and Google Maps on desktop
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=Sal%C3%B3n%20Callej%C3%B3n%20Arroyo%2C%20Valle%20del%20Arroyo%20217%2C%20Santa%20Gertrudis%2C%2037547%20Le%C3%B3n%2C%20Gto.",
  },
  priceMXN: 600,
  maxTicketsPerOrder: 10,
  // OXXO vouchers are offered up to this moment; card sales stay open through the event day
  oxxoUntil: "2026-11-26T23:59:59-06:00",
  oxxoHoldHours: 24,
  contactEmail: "boletos@networking.draftstudio.mx",
} as const;

export const CHAPTERS = {
  pioneros: {
    name: "Pioneros",
    line: "El primer capítulo de BNI en México.",
    directory:
      "https://bnimexico.com/es-MX/chapterdetail?chapterId=92GOJr%2FdTHOKWhsvUG58dw%3D%3D&name=BNI+Pioneros+Le%C3%B3n",
  },
  metamorfosis: {
    name: "Metamorfosis",
    line: "El capítulo más joven de León.",
    directory: "https://metamorfosis.draftstudio.mx/",
  },
} as const;

export const MEMBERSHIP = {
  miembro: "Miembro de BNI",
  invitado: "Invitado",
} as const;
export type Membership = keyof typeof MEMBERSHIP;

/** One-line description shown on tickets and lists, e.g. "BNI Pioneros" or "Invitado". */
export const memberLine = (m: Membership, chapter?: string | null) =>
  m === "miembro" ? `BNI ${(chapter ?? "").replace(/^\s*bni\s+/i, "").trim()}`.trim() : "Invitado";

// Timeline rows ("hileras"), oldest first. Metamorfosis shows "Hoy" instead of a year
// until the team decides whether to print it (see radar in PLANEACION.md).
export const TIMELINE = [
  {
    when: "1985",
    title: "Nace BNI",
    text: "El Dr. Ivan Misner funda en California la red de referencias de negocio que hoy es la más grande del mundo.",
  },
  {
    when: "2006",
    title: "BNI llega a México",
    text: "Con un leonés al frente, BNI arranca en el país y nace Pioneros, el primer capítulo de México.",
  },
  {
    when: "20 años",
    title: "Una red nacional",
    text: "249 capítulos, más de 8,000 empresarios y más de 435 mil referencias entregadas en México.",
  },
  {
    when: "Hoy",
    title: "Llega Metamorfosis",
    text: "El capítulo más joven de León se une a la familia con la misma filosofía: Ganar Dando.",
  },
  {
    when: "28 · 11",
    title: "La boda",
    text: "Pioneros y Metamorfosis celebran su unión en Networking Night.",
  },
] as const;

// The fake-wedding premise: each wedding ritual and its networking counterpart.
export const WEDDING_VOWS = [
  ["Los novios", "Pioneros y Metamorfosis"],
  ["Los anillos", "Una alianza entre capítulos"],
  ["Los votos", "Referencias de negocio"],
  ["Los invitados", "Comunidad BNI e invitados"],
  ["El brindis", "Por 20 años haciendo negocios"],
] as const;

export const INCLUDES = [
  { title: "Taquiza de guisados", text: "La cena de la boda, para todos los invitados." },
  { title: "Mesa de postres", text: "El dulce final de la noche." },
  { title: "Brindis", text: "Para todos los invitados." },
  { title: "DJ", text: "Cinco horas de música." },
  { title: "Barra fría", text: "Refrescos, agua mineral y hielo durante seis horas." },
  { title: "Reconocimientos", text: "A los miembros destacados de los capítulos." },
] as const;

export const FAQ = [
  {
    q: "¿Qué incluye mi boleto?",
    a: "Taquiza de guisados, mesa de postres, brindis, DJ, barra fría con refrescos y agua mineral, y la entrega de reconocimientos. Además, el salón cuenta con valet parking. Habrá más sorpresas que anunciaremos pronto.",
  },
  {
    q: "¿Es una boda de verdad?",
    a: "No: es una boda de negocios. Pioneros y Metamorfosis celebran su unión con todo el protocolo de una boda (invitación, mesa de novios, brindis y etiqueta formal), pero aquí los votos son referencias y los invitados, empresarios.",
  },
  {
    q: "¿Cuántos boletos puedo comprar?",
    a: "Hasta 10 por compra. Te pediremos el nombre de cada asistente para que cada boleto tenga dueño.",
  },
  {
    q: "¿Cómo puedo pagar?",
    a: "Con tarjeta de crédito o débito, o en efectivo en OXXO. La ficha de OXXO vence en 24 horas y solo se ofrece hasta el jueves 26 de noviembre; después puedes comprar con tarjeta hasta el día del evento.",
  },
  {
    q: "¿Cómo recibo mi boleto?",
    a: "Al confirmarse tu pago te llega un correo con tu boleto en PDF y un enlace para verlo en tu celular. En la entrada escaneamos el código QR.",
  },
  {
    q: "¿Qué pasa si no puedo asistir?",
    a: "Los boletos no son reembolsables, pero sí transferibles: desde el enlace de tu compra puedes cambiar el nombre del asistente y el nuevo invitado recibe su boleto.",
  },
  {
    q: "¿Hay estacionamiento?",
    a: "Sí, el salón cuenta con valet parking incluido.",
  },
  {
    q: "¿Cuál es el código de vestimenta?",
    a: "Formal, como para una boda.",
  },
  {
    q: "¿Necesito ser miembro de BNI?",
    a: "No. Los miembros de BNI y sus invitados son bienvenidos; es una gran oportunidad para conocer a la comunidad.",
  },
] as const;

// Closing time is still undecided; calendars block six hours, matching the bar service.
export const EVENT_HOURS = 6;

const utcStamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Prefilled "add event" page in Google Calendar (Android, Gmail users). */
export function googleCalendarUrl() {
  const start = new Date(EVENT.startsAt);
  const end = new Date(start.getTime() + EVENT_HOURS * 3_600_000);
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: "Networking Night · Pioneros & Metamorfosis",
    dates: `${utcStamp(start)}/${utcStamp(end)}`,
    location: `${EVENT.venue.name}, ${EVENT.venue.address}`,
    details: `Save the date. Etiqueta formal.\nCómo llegar: ${EVENT.venue.mapUrl}`,
    ctz: "America/Mexico_City",
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

export function oxxoAvailable(now = new Date()) {
  return now.getTime() <= new Date(EVENT.oxxoUntil).getTime();
}

export const formatMXN = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);

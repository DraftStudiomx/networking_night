import { EVENT, EVENT_HOURS } from "@/lib/event";

// Serves an .ics file: iPhone opens it straight in Calendar; Outlook and desktop apps import it.
export function GET() {
  const start = new Date(EVENT.startsAt);
  const end = new Date(start.getTime() + EVENT_HOURS * 3_600_000);
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (t: string) => t.replace(/[,;\\]/g, (m) => `\\${m}`);

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Networking Night//ES",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:networking-night-2026@networking.draftstudio.mx",
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc("Networking Night · Pioneros & Metamorfosis")}`,
    `LOCATION:${esc(`${EVENT.venue.name}, ${EVENT.venue.address}`)}`,
    `DESCRIPTION:${esc(`Save the date. Etiqueta formal. ${EVENT.venue.mapUrl}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="networking-night.ics"',
    },
  });
}

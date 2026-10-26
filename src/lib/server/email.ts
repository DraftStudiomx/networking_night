import "server-only";
import { Resend } from "resend";
import { EVENT, formatMXN } from "../event";
import { config, need } from "./config";

let client: Resend | null = null;
const resend = () => (client ??= new Resend(need(config.resendKey, "El correo")));

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

// Table-based layout: email clients ignore most modern CSS.
function shell(inner: string) {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#E9E7E1;padding:24px 12px;font-family:Georgia,serif;color:#141414">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
<table role="presentation" width="100%" style="max-width:520px;background:#F6F5F1;border:2px solid #141414;outline:1px solid #141414;outline-offset:-8px" cellspacing="0" cellpadding="0">
<tr><td align="center" style="padding:40px 28px 8px">
<div style="font:600 11px Arial,sans-serif;letter-spacing:5px;text-transform:uppercase">Save the date</div>
<div style="font:400 34px/1.05 Georgia,serif;letter-spacing:4px;text-transform:uppercase;margin-top:12px">Networking<br>Night</div>
<div style="font:600 11px Arial,sans-serif;letter-spacing:3px;text-transform:uppercase;margin-top:12px">Pioneros <span style="color:#C8102E">&amp;</span> Metamorfosis</div>
</td></tr>
${inner}
<tr><td align="center" style="padding:24px 28px 32px;border-top:1px dashed #141414;font:13px/1.5 Arial,sans-serif;color:#5E5F62">
${EVENT.dateLong} · 4:00 pm<br>${EVENT.venue.name}, ${EVENT.venue.city}<br>
<a href="${EVENT.venue.mapUrl}" style="color:#141414">Cómo llegar</a> · Valet parking incluido · Etiqueta formal<br><br>
¿Dudas? Escríbenos a <a href="mailto:${EVENT.contactEmail}" style="color:#141414">${EVENT.contactEmail}</a>
</td></tr></table></td></tr></table></body></html>`;
}

const button = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:#C8102E;color:#fff;font:600 13px Arial,sans-serif;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:16px 26px;border-radius:2px">${label}</a>`;

export async function sendOrderConfirmed(o: {
  to: string;
  buyerName: string;
  orderUrl: string;
  tickets: { attendeeName: string; code: string }[];
  totalMXN: number;
  pdf: Buffer;
}) {
  const rows = o.tickets
    .map(
      (t, i) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid #141414;font:16px Georgia,serif">${i + 1}. ${esc(t.attendeeName)}</td><td align="right" style="padding:10px 0;border-bottom:1px solid #141414;font:600 12px Arial,sans-serif;letter-spacing:2px">${t.code}</td></tr>`,
    )
    .join("");
  const html = shell(`
<tr><td style="padding:24px 28px 8px;font:16px/1.6 Arial,sans-serif">
<p style="margin:0 0 12px">Hola, ${esc(o.buyerName.split(" ")[0])}:</p>
<p style="margin:0 0 16px">Tu pago está confirmado. Aquí van tus boletos en PDF; cada uno tiene su propio código QR para la entrada.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #141414">${rows}</table>
<p style="margin:12px 0 0;color:#5E5F62">Total pagado: ${formatMXN(o.totalMXN)}</p>
</td></tr>
<tr><td align="center" style="padding:20px 28px 28px">${button(o.orderUrl, "Ver mis boletos")}
<p style="margin:14px 0 0;font:13px/1.5 Arial,sans-serif;color:#5E5F62">Desde ese enlace puedes cambiar el nombre de un invitado si ya no puede asistir.</p></td></tr>`);

  return resend().emails.send({
    from: config.emailFrom,
    to: o.to,
    subject: o.tickets.length > 1 ? `Tus ${o.tickets.length} boletos · Networking Night` : "Tu boleto · Networking Night",
    html,
    attachments: [{ filename: "boletos-networking-night.pdf", content: o.pdf }],
  });
}

export type Reminder = {
  to: string;
  name: string;
  /** the buyer's order page, or the attendee's own ticket page */
  url: string;
  tickets: { attendeeName: string; code: string }[];
};

/** Pre-event reminder. Built here and sent in one batch call by the reminders cron. */
export function reminderEmail(r: Reminder) {
  const many = r.tickets.length > 1;
  const rows = r.tickets
    .map(
      (t) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid #141414;font:16px Georgia,serif">${esc(t.attendeeName)}</td><td align="right" style="padding:10px 0;border-bottom:1px solid #141414;font:600 12px Arial,sans-serif;letter-spacing:2px">${t.code}</td></tr>`,
    )
    .join("");
  const html = shell(`
<tr><td style="padding:24px 28px 8px;font:16px/1.6 Arial,sans-serif">
<p style="margin:0 0 12px">Hola, ${esc(r.name.split(" ")[0])}:</p>
<p style="margin:0 0 16px">Ya casi. Este <strong>${EVENT.dateLong.toLowerCase()}</strong> Pioneros y Metamorfosis se dan el sí, y ${many ? "ustedes están" : "tú estás"} en la lista.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #141414">${rows}</table>
<p style="margin:18px 0 6px;font:600 11px Arial,sans-serif;letter-spacing:3px;text-transform:uppercase">Para la entrada</p>
<p style="margin:0">Llega a partir de las ${EVENT.dateLabel.time}, con etiqueta formal. En la puerta escaneamos el código QR de cada boleto, desde el celular o impreso.${
    many ? " Cada invitado necesita el suyo: compárteselo desde tu enlace o lleguen juntos." : ""
  }</p>
</td></tr>
<tr><td align="center" style="padding:20px 28px 28px">${button(r.url, many ? "Ver mis boletos" : "Ver mi boleto")}</td></tr>`);

  return {
    from: config.emailFrom,
    to: r.to,
    subject: "Nos vemos el sábado · Networking Night",
    html,
  };
}

export const sendReminders = (list: Reminder[]) => resend().batch.send(list.map(reminderEmail));

export async function sendTicketToAttendee(o: {
  to: string;
  attendeeName: string;
  fromName: string;
  ticketUrl: string;
  code: string;
  pdf: Buffer;
  transferred?: boolean;
}) {
  const html = shell(`
<tr><td style="padding:24px 28px 8px;font:16px/1.6 Arial,sans-serif">
<p style="margin:0 0 12px">Hola, ${esc(o.attendeeName.split(" ")[0])}:</p>
<p style="margin:0">${esc(o.fromName)} ${o.transferred ? "te transfirió" : "te invita con"} un boleto para Networking Night. Te esperamos en la boda.</p>
<p style="margin:16px 0 0;font:600 12px Arial,sans-serif;letter-spacing:2px">Código ${o.code}</p>
</td></tr>
<tr><td align="center" style="padding:20px 28px 28px">${button(o.ticketUrl, "Ver mi boleto")}</td></tr>`);

  return resend().emails.send({
    from: config.emailFrom,
    to: o.to,
    subject: "Tu boleto · Networking Night",
    html,
    attachments: [{ filename: `boleto-${o.code}.pdf`, content: o.pdf }],
  });
}

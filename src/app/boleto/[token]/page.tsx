import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { SiteHeader } from "@/components/SiteHeader";
import { Ticket } from "@/components/Ticket";
import { AddToCalendar } from "@/components/AddToCalendar";
import { EVENT, memberLine } from "@/lib/event";
import { ticketByToken } from "@/lib/server/orders";
import { ticketUrl } from "@/lib/server/tokens";
import { NotConfiguredError } from "@/lib/server/config";
import s from "../../pages.module.css";
import l from "../../landing.module.css";

export const metadata: Metadata = { title: "Mi boleto · Networking Night", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Boleto({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let found: Awaited<ReturnType<typeof ticketByToken>>;
  try {
    found = await ticketByToken(token);
  } catch (e) {
    if (e instanceof NotConfiguredError) notFound();
    throw e;
  }
  if (!found) notFound();
  const { ticket, total, current } = found;
  const usable = current && ticket.status === "valid";

  const qr = usable
    ? await QRCode.toString(ticketUrl(ticket.code, ticket.version), {
        type: "svg",
        margin: 0,
        errorCorrectionLevel: "M",
        color: { dark: "#141414", light: "#F6F5F1" },
      })
    : null;

  return (
    <>
      <SiteHeader />
      <main>
        <Ticket as="section" medallion tear className={s.panel} aria-label="Boleto">
          <h1 className={l.title}>
            <span className={`${l.std} tr`}>Networking Night</span>
            <span className={`${l.nn} display tr`}>
              <span>Save the</span>
              <span className={l.night}>Date</span>
            </span>
          </h1>
          <p className={`${l.couple} tr`}>
            Pioneros <em>&amp;</em> Metamorfosis
          </p>
          <p className={`${l.anniv} tr`}>{EVENT.anniversary}</p>

          {usable ? (
            <>
              <p className={s.attendee}>{ticket.attendee_name}</p>
              <p className={s.meta}>
                {memberLine(ticket.attendee_membership, ticket.attendee_chapter)}
              </p>
              <div className={s.qr} role="img" aria-label={`Código QR del boleto ${ticket.code}`} dangerouslySetInnerHTML={{ __html: qr! }} />
              <p className={`${s.code} tr`} style={{ marginTop: 10 }}>
                {ticket.code}
              </p>
            </>
          ) : (
            <>
              <p className={s.statusPending}>{current ? "Boleto no activo" : "Boleto transferido"}</p>
              <p className={s.text}>
                {current
                  ? "Este boleto aún no está pagado o fue cancelado."
                  : "Este código ya no es válido porque el boleto se transfirió a otra persona."}
              </p>
            </>
          )}

          <dl className={l.cells} style={{ marginTop: 24 }}>
            <div>
              <dt className="label tr muted">{EVENT.dateLabel.day}</dt>
              <dd className="display">{EVENT.dateLabel.date}</dd>
            </div>
            <div>
              <dt className="label tr muted">Recepción</dt>
              <dd className="display">{EVENT.dateLabel.time}</dd>
            </div>
            <div>
              <dt className="label tr muted">Etiqueta</dt>
              <dd className="display">{EVENT.dateLabel.dress}</dd>
            </div>
          </dl>
          <p className={l.venue}>
            <span className="tr">{EVENT.venue.name}</span>
            <span className="tr muted">{EVENT.venue.city}</span>
          </p>

          <div className={l.stub} data-stub style={{ paddingInline: 0, width: "100%" }}>
            <p className="label tr muted">
              Boleto {ticket.position} de {total} · Admite una persona
            </p>
            <div className={l.actions}>
              <a href={EVENT.venue.mapUrl} target="_blank" rel="noopener" className="btn tr">
                Cómo llegar
              </a>
              <AddToCalendar />
            </div>
          </div>
        </Ticket>
      </main>
    </>
  );
}

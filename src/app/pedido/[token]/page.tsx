import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Ticket } from "@/components/Ticket";
import { formatMXN, memberLine } from "@/lib/event";
import { orderByToken } from "@/lib/server/orders";
import { ticketToken } from "@/lib/server/tokens";
import { NotConfiguredError } from "@/lib/server/config";
import { TransferButton } from "./TransferButton";
import s from "../../pages.module.css";

export const metadata: Metadata = { title: "Mis boletos · Networking Night", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Pedido({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let data: Awaited<ReturnType<typeof orderByToken>>;
  try {
    data = await orderByToken(token);
  } catch (e) {
    if (e instanceof NotConfiguredError) notFound();
    throw e;
  }
  if (!data) notFound();
  const { order, tickets } = data;
  const paid = order.status === "paid";

  return (
    <>
      <SiteHeader />
      <main>
        <Ticket as="section" medallion className={s.panel}>
          <h1 className={`${s.title} display tr`}>Mis boletos</h1>
          <p className={s.text}>
            Pedido de {order.buyer_name} · {order.quantity} {order.quantity === 1 ? "boleto" : "boletos"} ·{" "}
            {formatMXN(order.total_mxn)}
          </p>

          {!paid && (
            <p className={s.statusPending}>
              {order.status === "pending" ? "Pago pendiente" : "Pedido vencido"}
            </p>
          )}
          {!paid && order.status === "pending" && (
            <p className={s.text}>
              Si pagaste en OXXO, el pago puede tardar unas horas en confirmarse. Te enviaremos los boletos por correo.
            </p>
          )}

          <ol className={s.list}>
            {tickets.map((t) => (
              <li key={t.id} className={s.item}>
                <div className={s.itemHead}>
                  <span className={s.itemName}>
                    {t.position}. {t.attendee_name}
                  </span>
                  <span className={s.code}>{t.code}</span>
                </div>
                <p className={s.meta}>
                  {memberLine(t.attendee_membership, t.attendee_chapter)}
                  {t.checked_in_at && " · Ya ingresó"}
                </p>
                {paid && t.status === "valid" && (
                  <div className={s.itemActions}>
                    <a className="btn tr" href={`/boleto/${ticketToken(t.code, t.version)}`}>
                      Ver boleto
                    </a>
                    <a className="btn tr" href={`/api/pedido/${token}/pdf?boleto=${t.id}`}>
                      PDF
                    </a>
                    {!t.checked_in_at && <TransferButton orderToken={token} ticketId={t.id} current={t.attendee_name} />}
                  </div>
                )}
              </li>
            ))}
          </ol>

          {paid && (
            <div className={s.actions}>
              <a className="btn btn--primary" href={`/api/pedido/${token}/pdf`}>
                <span className="tr">Descargar todos (PDF)</span>
              </a>
            </div>
          )}
        </Ticket>
      </main>
      <SiteFooter />
    </>
  );
}

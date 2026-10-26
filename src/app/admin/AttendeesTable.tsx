"use client";

import { useMemo, useState, useTransition } from "react";
import type { AdminTicket } from "@/lib/server/admin";
import { resendOrderEmail } from "./actions";
import s from "../ops.module.css";

const FILTERS = {
  todos: { label: "Todos", fn: () => true },
  pagados: { label: "Pagados", fn: (t: AdminTicket) => t.orderStatus === "paid" },
  pendientes: { label: "Pago pendiente", fn: (t: AdminTicket) => t.orderStatus === "pending" },
  dentro: { label: "Ya ingresaron", fn: (t: AdminTicket) => !!t.checkedInAt },
  faltan: { label: "No han llegado", fn: (t: AdminTicket) => t.orderStatus === "paid" && !t.checkedInAt },
  correo: { label: "Correo pendiente", fn: (t: AdminTicket) => t.orderStatus === "paid" && t.email === "pending" },
} as const;
type Filter = keyof typeof FILTERS;

const STATUS: Record<AdminTicket["orderStatus"], string> = {
  paid: "Pagado",
  pending: "Pendiente",
  expired: "Vencido",
  canceled: "Cancelado",
};

const fold = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const hour = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-MX", { timeZone: "America/Mexico_City", hour: "numeric", minute: "2-digit" });

function Resend({ orderId, disabled }: { orderId: string; disabled?: boolean }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <button
      type="button"
      className={s.linkBtn}
      disabled={pending || disabled}
      onClick={() =>
        start(async () => {
          const r = await resendOrderEmail(orderId);
          setMsg(r.ok ? "Enviado" : (r.error ?? "Error"));
        })
      }
    >
      {pending ? "Enviando…" : (msg ?? "Reenviar correo")}
    </button>
  );
}

export function AttendeesTable({ tickets, demo }: { tickets: AdminTicket[]; demo?: boolean }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("pagados");

  const rows = useMemo(() => {
    const term = fold(q.trim());
    return tickets.filter(
      (t) =>
        FILTERS[filter].fn(t) &&
        (!term || [t.attendee, t.buyer, t.code, t.chapter ?? "", t.buyerEmail].some((v) => fold(v).includes(term))),
    );
  }, [tickets, q, filter]);

  return (
    <>
      <div className={s.tools}>
        <label className={s.search}>
          <span className="visually-hidden">Buscar</span>
          <input
            type="search"
            placeholder="Buscar por nombre, código, capítulo o correo"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <div className={s.chips} role="group" aria-label="Filtrar">
          {(Object.keys(FILTERS) as Filter[]).map((k) => (
            <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}>
              {FILTERS[k].label} <span className="num">{tickets.filter(FILTERS[k].fn).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th scope="col">Asistente</th>
              <th scope="col">Código</th>
              <th scope="col">Membresía</th>
              <th scope="col">Comprador</th>
              <th scope="col">Pago</th>
              <th scope="col">Entrada</th>
              <th scope="col">
                <span className="visually-hidden">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id}>
                <td className={s.strong}>{t.attendee}</td>
                <td className={s.code}>{t.code}</td>
                <td>{t.member}</td>
                <td>
                  {t.buyer}
                  <span className={s.sub}>{t.buyerEmail}</span>
                </td>
                <td>
                  <span className={s.pill} data-tone={t.orderStatus}>
                    {STATUS[t.orderStatus]}
                  </span>
                  {t.method && <span className={s.sub}>{t.method === "card" ? "Tarjeta" : t.method === "oxxo" ? "OXXO" : "Manual"}</span>}
                  {t.orderStatus === "paid" && t.email === "pending" && (
                    <span className={s.mailPending} title={t.emailError ?? "Aún no se envía"}>
                      Correo pendiente
                    </span>
                  )}
                </td>
                <td>{t.checkedInAt ? <span className={s.in}>Entró {hour(t.checkedInAt)}</span> : <span className={s.muted}>—</span>}</td>
                <td>{t.orderStatus === "paid" && t.position === 1 && <Resend orderId={t.orderId} disabled={demo} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className={s.empty}>No hay asistentes con ese filtro.</p>}
      </div>
    </>
  );
}

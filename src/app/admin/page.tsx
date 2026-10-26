import type { Metadata } from "next";
import { OpsBar } from "@/components/OpsBar";
import { requireStaff } from "@/lib/server/auth";
import { loadDashboard, type Dashboard } from "@/lib/server/admin";
import { demoDashboard } from "@/lib/server/demo";
import { formatMXN } from "@/lib/event";
import { AttendeesTable } from "./AttendeesTable";
import { ManualOrderForm } from "./ManualOrderForm";
import { SalesToggle } from "./SalesToggle";
import s from "../ops.module.css";

export const metadata: Metadata = { title: "Panel · Networking Night", robots: { index: false } };
export const dynamic = "force-dynamic";

const time = (iso: string) =>
  new Date(iso).toLocaleString("es-MX", { timeZone: "America/Mexico_City", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export default async function Admin({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  // ?demo=1 renders sample data in development only, to review the layout without a database
  const demo = process.env.NODE_ENV !== "production" && (await searchParams).demo === "1";
  const user = demo ? { email: "demo@draftstudio.mx", role: "admin" as const } : await requireStaff("admin", "/admin");
  const d: Dashboard = demo ? demoDashboard() : await loadDashboard();
  const { stats } = d;

  return (
    <>
      <OpsBar email={user.email} role={user.role} active="admin" />
      <main className={s.page}>
        <div className={s.head}>
          <h1 className={`${s.h1} display`}>Panel</h1>
          <SalesToggle open={d.salesOpen} disabled={demo} />
        </div>

        <dl aria-label="Resumen" className={s.stats}>
          <div>
            <dt className="tr">Boletos vendidos</dt>
            <dd className="display num">{stats.sold}</dd>
            <small>de 200 lugares de mobiliario</small>
          </div>
          <div>
            <dt className="tr">Ingresos</dt>
            <dd className="display num">{formatMXN(stats.gross)}</dd>
            <small>≈ {formatMXN(stats.net)} netos de comisión</small>
          </div>
          <div>
            <dt className="tr">OXXO pendientes</dt>
            <dd className="display num">{stats.pendingOxxo}</dd>
            <small>boletos por pagar</small>
          </div>
          <div>
            <dt className="tr">Ya ingresaron</dt>
            <dd className="display num">{stats.checkedIn}</dd>
            <small>de {stats.sold}</small>
          </div>
        </dl>

        {stats.emailPending > 0 && (
          <p className={s.alert} role="status">
            {stats.emailPending === 1 ? "1 compra no ha recibido" : `${stats.emailPending} compras no han recibido`} el correo
            con sus boletos. Se reintenta solo cada mañana; para mandarlo ya, filtra por «Correo pendiente» y usa
            «Reenviar correo». Sus boletos funcionan igual en la entrada.
          </p>
        )}

        <div className={s.columns}>
          <section className={s.panel} aria-labelledby="desglose-t">
            <h2 id="desglose-t" className={`${s.h2} tr`}>Asistentes por capítulo</h2>
            <table className={s.breakdown}>
              <tbody>
                {d.chapters.map((c) => (
                  <tr key={c.label}>
                    <th scope="row">BNI {c.label}</th>
                    <td className="num">{c.count}</td>
                  </tr>
                ))}
                <tr className={s.breakdownGuests}>
                  <th scope="row">Invitados (no miembros)</th>
                  <td className="num">{stats.guests}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">Total</th>
                  <td className="num">{stats.sold}</td>
                </tr>
              </tfoot>
            </table>
          </section>

          <section className={s.panel} aria-labelledby="dup-t">
            <h2 id="dup-t" className={`${s.h2} tr`}>
              Boletos repetidos <span className={s.count}>{d.duplicates.length}</span>
            </h2>
            {d.duplicates.length === 0 ? (
              <p className={s.empty}>Nadie ha intentado entrar dos veces con el mismo boleto.</p>
            ) : (
              <ol className={s.dupes}>
                {d.duplicates.map((x, i) => (
                  <li key={i}>
                    <p className={s.dupeName}>
                      {x.ticket?.attendee ?? "Boleto desconocido"} <span className={s.code}>{x.ticket?.code}</span>
                    </p>
                    <p className={s.muted}>
                      Comprado por {x.ticket?.buyer ?? "—"} · {x.ticket?.buyerPhone ?? ""}
                    </p>
                    <p className={s.dupeTimes}>
                      Entró {x.ticket?.checkedInAt ? time(x.ticket.checkedInAt) : "—"} ({x.ticket?.checkedInBy ?? "—"}) · Intento
                      repetido {time(x.at)} ({x.by})
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <section className={s.panel} aria-labelledby="asist-t">
          <div className={s.panelHead}>
            <h2 id="asist-t" className={`${s.h2} tr`}>Asistentes</h2>
            <a href="/api/admin/export" className="btn tr">
              Exportar a Excel
            </a>
          </div>
          <AttendeesTable tickets={d.tickets} demo={demo} />
        </section>

        <section className={s.panel} aria-labelledby="manual-t">
          <h2 id="manual-t" className={`${s.h2} tr`}>Alta manual</h2>
          <p className={s.muted}>Último recurso: cortesías o pagos fuera del sitio. Los boletos se emiten como pagados.</p>
          <ManualOrderForm disabled={demo} />
        </section>
      </main>
    </>
  );
}

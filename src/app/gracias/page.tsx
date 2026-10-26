import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Ticket } from "@/components/Ticket";
import { Rings } from "@/components/Marks";
import s from "../pages.module.css";

export const metadata: Metadata = { title: "¡Gracias! · Networking Night" };

export default async function Gracias({ searchParams }: { searchParams: Promise<{ pedido?: string }> }) {
  const { pedido } = await searchParams;
  return (
    <>
      <SiteHeader />
      <main>
        <Ticket as="section" medallion className={s.panel}>
          <h1 className={`${s.title} display tr`}>¡Gracias!</h1>
          <Rings className={s.rings} />
          <p className={s.lead}>Recibimos tu pedido.</p>
          <p className={s.text}>
            Si pagaste con tarjeta, en unos minutos te llega un correo con tus boletos en PDF. Si elegiste OXXO,
            tienes 24 horas para pagar la ficha; al confirmarse el pago te enviamos los boletos.
          </p>
          <div className={s.actions}>
            {pedido && (
              <Link href={`/pedido/${pedido}`} className="btn btn--primary">
                <span className="tr">Ver mis boletos</span>
              </Link>
            )}
            <Link href="/" className="btn tr">
              Volver al inicio
            </Link>
          </div>
        </Ticket>
      </main>
      <SiteFooter />
    </>
  );
}

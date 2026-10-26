import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Ticket } from "@/components/Ticket";
import { EVENT } from "@/lib/event";
import s from "../pages.module.css";

export const metadata: Metadata = { title: "Aviso de privacidad · Networking Night" };

export default function Aviso() {
  return (
    <>
      <SiteHeader />
      <main>
        <Ticket as="article" className={s.panel}>
          <h1 className={`${s.title} display tr`} style={{ fontSize: "clamp(30px, 7vw, 52px)" }}>
            Aviso de privacidad
          </h1>
          <div className={s.prose}>
            <p>
              Ernesto Vázquez Lara, con domicilio en León, Guanajuato, es responsable del tratamiento de los datos
              personales que nos proporcionas al comprar boletos para Networking Night, conforme a la Ley Federal de
              Protección de Datos Personales en Posesión de los Particulares.
            </p>

            <h2>Datos que recabamos</h2>
            <ul>
              <li>Del comprador: nombre, correo, WhatsApp y, si es miembro de BNI, su capítulo.</li>
              <li>De cada invitado: nombre, si es miembro de BNI (y su capítulo) y, si se proporciona, correo.</li>
              <li>No recabamos datos de tarjetas: el pago lo procesa directamente Stripe.</li>
            </ul>

            <h2>Para qué los usamos</h2>
            <ul>
              <li>Emitir, enviar y validar tus boletos, y controlar el acceso el día del evento.</li>
              <li>Enviarte información y recordatorios del evento.</li>
              <li>Generar estadísticas internas de asistencia de los capítulos organizadores.</li>
            </ul>

            <h2>Con quién los compartimos</h2>
            <p>
              Solo con los organizadores del evento de los capítulos BNI Pioneros y BNI Metamorfosis, y con los
              proveedores que nos ayudan a operar el sitio (procesamiento de pagos, envío de correo y alojamiento). No
              vendemos tus datos.
            </p>

            <h2>Tus derechos</h2>
            <p>
              Puedes acceder, rectificar, cancelar u oponerte al uso de tus datos (derechos ARCO), o revocar tu
              consentimiento, escribiendo a <a href={`mailto:${EVENT.contactEmail}`}>{EVENT.contactEmail}</a>.
              Te responderemos en un plazo máximo de 20 días hábiles.
            </p>

            <h2>Cambios</h2>
            <p>Cualquier cambio a este aviso se publicará en esta página.</p>
            <p>Última actualización: 25 de octubre de 2026.</p>
          </div>
        </Ticket>
      </main>
      <SiteFooter />
    </>
  );
}

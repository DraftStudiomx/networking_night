import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Ticket } from "@/components/Ticket";
import { Countdown } from "@/components/Countdown";
import { ChapterLogo, Rings } from "@/components/Marks";
import { SiteFooter } from "@/components/SiteFooter";
import { RevealText } from "@/components/RevealText";
import { Timeline } from "@/components/Timeline";
import { Vows } from "@/components/Vows";
import { Intro } from "@/components/Intro";
import { AddToCalendar } from "@/components/AddToCalendar";
import { CHAPTERS, EVENT, FAQ, INCLUDES, TIMELINE, WEDDING_VOWS, formatMXN } from "@/lib/event";
import s from "./landing.module.css";

function BuyButton({ className = "" }: { className?: string }) {
  return (
    <Link href="/comprar" className={`btn btn--primary ${className}`}>
      <Rings className="btn__rings" mono="#fff" />
      <span className="tr">Aparta tu lugar</span>
      <span className="btn__price num">{formatMXN(EVENT.priceMXN)}</span>
    </Link>
  );
}

function Divider() {
  return (
    <div className={s.divider} aria-hidden="true">
      <Rings className={s.dividerRings} />
    </div>
  );
}

export default function Home() {
  const { dateLabel, venue } = EVENT;

  return (
    <>
      <Intro />
      <SiteHeader />

      <main>
        {/* ---------- hero: the invitation as a ticket ---------- */}
        <Ticket as="section" medallion tear className={`${s.hero} ticket--draw`} aria-label="Invitación">
          <div className={s.body}>
            <h1 className={s.title}>
              <span className={`${s.std} tr`}>Save the date</span>
              <span className={`${s.nn} display tr`}>
                <RevealText text="Networking" delay={250} />
                <RevealText text="Night" delay={750} step={70} className={s.night} />
              </span>
            </h1>
            <p className={`${s.couple} tr`}>
              Pioneros <em>&amp;</em> Metamorfosis
            </p>
            <p className={s.lede}>{EVENT.premise}</p>

            <Divider />

            <dl className={s.cells}>
              <div>
                <dt className="label tr muted">{dateLabel.day}</dt>
                <dd className="display">{dateLabel.date}</dd>
              </div>
              <div>
                <dt className="label tr muted">Recepción</dt>
                <dd className="display">{dateLabel.time}</dd>
              </div>
              <div>
                <dt className="label tr muted">Etiqueta</dt>
                <dd className="display">{dateLabel.dress}</dd>
              </div>
            </dl>
            <p className={s.venue}>
              <span className="tr">{venue.name}</span>
              <span className="tr muted">{venue.city}</span>
            </p>

            <Countdown to={EVENT.startsAt} className={s.count} />
          </div>

          <div className={s.stub} data-stub>
            <p className="label tr muted">Admite · una · persona</p>
            <div className={s.actions}>
              <BuyButton />
              <a href="#recepcion" className="btn tr">
                Ver detalles
              </a>
            </div>
          </div>
        </Ticket>

        {/* ---------- la boda (fake wedding premise) ---------- */}
        <Ticket as="section" id="boda" className={s.section} aria-labelledby="boda-t">
          <h2 id="boda-t" className={`${s.h2} display tr`}>¿Una boda?</h2>
          <p className={s.giftsLead}>
            <span className="display">Sí. Una boda de negocios.</span>
          </p>
          <p className={s.sectionNote}>
            Pioneros y Metamorfosis celebran su unión con todo el protocolo de una boda: invitación, mesa de novios,
            brindis y etiqueta formal. Lo único distinto es lo que se promete.
          </p>
          <table className={s.vowsTable}>
            <caption className="visually-hidden">Cómo se traduce cada tradición de boda en Networking Night</caption>
            <thead>
              <tr>
                <th scope="col" className="label tr muted">En una boda</th>
                <th scope="col" className="label tr muted">En esta boda</th>
              </tr>
            </thead>
            <tbody>
              {WEDDING_VOWS.map(([wedding, here]) => (
                <tr key={wedding}>
                  <th scope="row">{wedding}</th>
                  <td>{here}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Ticket>

        {/* ---------- los novios ---------- */}
        <Ticket as="section" id="novios" className={s.section} aria-labelledby="novios-t">
          <h2 id="novios-t" className={`${s.h2} display tr`}>Los novios</h2>
          <div className={s.couplePair}>
            {(["pioneros", "metamorfosis"] as const).map((k) => (
              <article key={k} className={s.partner}>
                <ChapterLogo name={CHAPTERS[k].name.toUpperCase()} />
                <p className={s.partnerLine}>{CHAPTERS[k].line}</p>
                <a href={CHAPTERS[k].directory} target="_blank" rel="noopener" className={`${s.textLink} tr`}>
                  Conoce a sus miembros
                </a>
              </article>
            ))}
            <div className={s.vows}>
              <Vows />
            </div>
          </div>
          <p className={s.sectionNote}>
            Veinte años de trayectoria y la energía de lo nuevo, unidos por la misma filosofía: <em>Ganar Dando</em>.
          </p>
        </Ticket>

        {/* ---------- nuestra historia ---------- */}
        <Ticket as="section" id="historia" className={s.section} aria-labelledby="historia-t">
          <h2 id="historia-t" className={`${s.h2} display tr`}>Nuestra historia</h2>
          <Timeline rows={TIMELINE} />
        </Ticket>

        {/* ---------- la recepción ---------- */}
        <Ticket as="section" id="recepcion" className={s.section} aria-labelledby="recepcion-t">
          <h2 id="recepcion-t" className={`${s.h2} display tr`}>La recepción</h2>
          <div className={s.reception}>
            <dl className={s.facts}>
              <div>
                <dt className="label tr muted">Cuándo</dt>
                <dd>{EVENT.dateLong}, 4:00 pm</dd>
              </div>
              <div>
                <dt className="label tr muted">Dónde</dt>
                <dd>
                  {venue.name}
                  <br />
                  <span className="muted">{venue.address}</span>
                </dd>
              </div>
              <div>
                <dt className="label tr muted">Etiqueta</dt>
                <dd>Formal de boda</dd>
              </div>
              <div>
                <dt className="label tr muted">Estacionamiento</dt>
                <dd>Valet parking incluido</dd>
              </div>
            </dl>
            <div className={s.receptionActions}>
              <a href={venue.mapUrl} target="_blank" rel="noopener" className="btn tr">
                Cómo llegar
              </a>
              <AddToCalendar />
            </div>
          </div>

          <h3 className={`${s.h3center} tr`}>Tu boleto incluye</h3>
          <ul className={s.includes}>
            {INCLUDES.map((it) => (
              <li key={it.title}>
                <strong>{it.title}</strong>
                <span className="muted">{it.text}</span>
              </li>
            ))}
          </ul>
          <p className={s.sectionNote}>Y más sorpresas que anunciaremos pronto.</p>
        </Ticket>

        {/* ---------- mesa de regalos ---------- */}
        <Ticket as="section" id="regalos" className={`${s.section} ${s.gifts}`} aria-labelledby="regalos-t">
          <h2 id="regalos-t" className={`${s.h2} display tr`}>Mesa de regalos</h2>
          <p className={s.giftsLead}>
            En esta boda no hay lista de regalos.
            <br />
            <span className="display">El mejor regalo es una referencia.</span>
          </p>
          <p className={s.sectionNote}>
            Tu presencia ya es un regalo. Trae tus tarjetas de presentación y ven dispuesto a conectar: cada nueva
            relación de negocio es un brindis por los novios.
          </p>
        </Ticket>

        {/* ---------- boletos ---------- */}
        <Ticket as="section" tear medallion id="boletos" className={s.rsvp} aria-labelledby="boletos-t">
          <div className={s.body}>
            <h2 id="boletos-t" className={`${s.h2} display tr`}>R.S.V.P.</h2>
            <p className={`${s.price} display num`}>{formatMXN(EVENT.priceMXN)}</p>
            <p className="label tr muted">por persona</p>
            <ul className={s.terms}>
              <li>Hasta {EVENT.maxTicketsPerOrder} boletos por compra, con el nombre de cada invitado.</li>
              <li>Tarjeta u OXXO (OXXO hasta el jueves 26 de noviembre).</li>
              <li>No reembolsable. Transferible a otra persona.</li>
            </ul>
          </div>
          <div className={s.stub} data-stub>
            <p className="label tr muted">Admite · una · persona</p>
            <div className={s.actionsSolo}>
              <BuyButton />
            </div>
          </div>
        </Ticket>

        {/* ---------- preguntas ---------- */}
        <Ticket as="section" id="preguntas" className={s.section} aria-labelledby="preguntas-t">
          <h2 id="preguntas-t" className={`${s.h2} display tr`}>Preguntas</h2>
          <div className={s.faq}>
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>
                  <span>{f.q}</span>
                  <Rings className={s.faqMark} />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </Ticket>
      </main>

      <SiteFooter />
    </>
  );
}

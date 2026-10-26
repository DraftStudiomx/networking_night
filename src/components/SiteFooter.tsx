import Link from "next/link";
import { EVENT } from "@/lib/event";
import { Monogram } from "./Marks";
import s from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={s.foot}>
      <Monogram className={s.mono} />
      <p className={`${s.name} tr`}>Networking Night · Pioneros &amp; Metamorfosis</p>
      <p className={s.contact}>
        ¿Dudas? Escríbenos a <a href={`mailto:${EVENT.contactEmail}`}>{EVENT.contactEmail}</a>
      </p>
      <nav className={s.links} aria-label="Legal">
        <Link href="/aviso-de-privacidad">Aviso de privacidad</Link>
      </nav>
    </footer>
  );
}

import Link from "next/link";
import { Ticket } from "@/components/Ticket";
import { Monogram } from "@/components/Marks";
import s from "./ops.module.css";

export default function NotFound() {
  return (
    <main className={s.loginWrap}>
      <Ticket as="section" medallion className={s.login} aria-labelledby="nf-t">
        <Monogram className={s.loginMono} />
        <h1 id="nf-t" className={`${s.loginTitle} display tr`}>
          Esta página no existe
        </h1>
        <p className={s.muted}>Revisa el enlace o vuelve al inicio.</p>
        <Link href="/" className="btn btn--primary">
          Ir al inicio
        </Link>
      </Ticket>
    </main>
  );
}

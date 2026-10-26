import Link from "next/link";
import { Monogram } from "./Marks";
import s from "@/app/ops.module.css";

/** Top bar for the organizer screens. */
export function OpsBar({ email, role, active }: { email: string; role: "admin" | "staff"; active: "admin" | "staff" }) {
  return (
    <header className={s.bar}>
      <Link href={role === "admin" ? "/admin" : "/staff"} className={s.barBrand}>
        <Monogram className={s.barMono} />
        <span className="tr">Networking Night</span>
      </Link>
      <nav className={s.barNav} aria-label="Organizadores">
        {role === "admin" && (
          <Link href="/admin" aria-current={active === "admin" ? "page" : undefined} className="tr">
            Panel
          </Link>
        )}
        <Link href="/staff" aria-current={active === "staff" ? "page" : undefined} className="tr">
          Escáner
        </Link>
      </nav>
      <form action="/salir" method="post" className={s.barUser}>
        <span className={s.barEmail}>{email}</span>
        <button type="submit" className="tr">
          Salir
        </button>
      </form>
    </header>
  );
}

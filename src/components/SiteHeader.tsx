"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Ticket } from "./Ticket";
import { BniWordmark, Monogram } from "./Marks";
import s from "./SiteHeader.module.css";

const LINKS = [
  { href: "/#boda", label: "¿Una boda?" },
  { href: "/#novios", label: "Los novios" },
  { href: "/#historia", label: "Nuestra historia" },
  { href: "/#recepcion", label: "La recepción" },
  { href: "/#regalos", label: "Mesa de regalos" },
  { href: "/#preguntas", label: "Preguntas" },
  { href: "/comprar", label: "Boletos" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <Ticket as="header" radius={12} className={s.bar}>
      <Link href="/" className={s.seal} aria-label="Inicio">
        <Monogram className={s.mono} />
      </Link>
      <Link href="/" className={s.brand}>
        <BniWordmark className={s.wordmark} />
        <span className={`${s.chapters} tr`}>Pioneros &amp; Metamorfosis</span>
      </Link>
      <button
        type="button"
        className={s.menu}
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="visually-hidden">{open ? "Cerrar menú" : "Abrir menú"}</span>
        <span className={s.burger} data-open={open} aria-hidden="true" />
      </button>
      <nav id="site-menu" className={s.nav} data-open={open} aria-label="Secciones">
        <ul>
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="tr" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </Ticket>
  );
}

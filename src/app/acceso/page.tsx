import type { Metadata } from "next";
import { Ticket } from "@/components/Ticket";
import { Monogram } from "@/components/Marks";
import { LoginForm } from "./LoginForm";
import s from "../ops.module.css";

export const metadata: Metadata = { title: "Acceso · Networking Night", robots: { index: false } };

export default async function Acceso({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/admin";
  return (
    <main className={s.loginWrap}>
      <Ticket as="section" medallion className={s.login} aria-labelledby="acceso-t">
        <Monogram className={s.loginMono} />
        <h1 id="acceso-t" className={`${s.loginTitle} display tr`}>
          Organizadores
        </h1>
        <p className={s.muted}>Te enviamos un enlace a tu correo para entrar, sin contraseña.</p>
        {error && (
          <p className={s.alert} role="alert">
            El enlace venció o ya se usó. Pide uno nuevo.
          </p>
        )}
        <LoginForm next={safeNext} />
      </Ticket>
    </main>
  );
}

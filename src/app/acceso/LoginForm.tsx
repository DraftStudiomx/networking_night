"use client";

import { useActionState } from "react";
import { sendMagicLink, type LoginState } from "./actions";
import s from "../ops.module.css";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendMagicLink, {});

  if (state.ok) {
    return (
      <p className={s.notice} role="status">
        Si tu correo está en la lista de organizadores, te llegará un enlace para entrar en unos segundos.
      </p>
    );
  }

  return (
    <form action={action} className={s.loginForm}>
      <input type="hidden" name="next" value={next} />
      <label className={s.field}>
        <span className="tr">Correo</span>
        <input name="email" type="email" required autoComplete="email" inputMode="email" />
      </label>
      {state.error && (
        <p className={s.error} role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" className="btn btn--primary" disabled={pending}>
        <span className="tr">{pending ? "Enviando…" : "Enviarme el enlace"}</span>
      </button>
    </form>
  );
}

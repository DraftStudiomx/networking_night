"use client";

import { useEffect } from "react";
import { Ticket } from "@/components/Ticket";
import { Monogram } from "@/components/Marks";
import { EVENT } from "@/lib/event";
import s from "./ops.module.css";

// A tab left open across a deploy asks for code files that no longer exist. One silent
// reload fetches the new ones; the session flag stops a loop if the error is something else.
const STALE = /ChunkLoadError|Loading (CSS )?chunk|dynamically imported module|Failed to fetch/i;
const FLAG = "nn-reloaded";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
    try {
      if (STALE.test(`${error.name} ${error.message}`) && !sessionStorage.getItem(FLAG)) {
        sessionStorage.setItem(FLAG, "1");
        window.location.reload();
      }
    } catch {}
  }, [error]);

  return (
    <main className={s.loginWrap}>
      <Ticket as="section" medallion className={s.login} aria-labelledby="error-t">
        <Monogram className={s.loginMono} />
        <h1 id="error-t" className={`${s.loginTitle} display tr`}>
          Algo se atoró
        </h1>
        <p className={s.muted}>
          La página no cargó bien. Vuelve a intentarlo; si sigue igual, recárgala o escríbenos a {EVENT.contactEmail}.
        </p>
        <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
          Recargar la página
        </button>
        <button type="button" className="btn" onClick={reset}>
          Volver a intentar
        </button>
      </Ticket>
    </main>
  );
}

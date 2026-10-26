"use client";

import { useEffect, useState } from "react";
import { Monogram } from "@/components/Marks";
import s from "../../ops.module.css";

const safe = (next: string | null) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "/admin");

/**
 * Where the emailed link lands. The session tokens arrive in the URL fragment (implicit
 * flow), which only the browser can read, so this page hands them to the server to set
 * the session cookie. Older links that arrive with ?code= are exchanged the same way.
 */
export default function AuthCallback() {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const hash = new URLSearchParams(url.hash.slice(1));
    const next = safe(url.searchParams.get("next"));
    const body = hash.get("access_token")
      ? { access_token: hash.get("access_token"), refresh_token: hash.get("refresh_token") }
      : url.searchParams.get("code")
        ? { code: url.searchParams.get("code") }
        : null;

    if (!body) {
      window.location.replace(`/acceso?error=1&next=${encodeURIComponent(next)}`);
      return;
    }
    fetch("/api/auth/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then((r) => {
        if (!r.ok) throw new Error();
        window.location.replace(next);
      })
      .catch(() => {
        setFailed(true);
        window.location.replace(`/acceso?error=1&next=${encodeURIComponent(next)}`);
      });
  }, []);

  return (
    <main className={s.loginWrap}>
      <div className={s.login} style={{ background: "var(--ground)", border: "1px solid var(--ink)" }}>
        <Monogram className={s.loginMono} />
        <p className={s.muted} role="status">
          {failed ? "No pudimos validar el enlace." : "Entrando al panel…"}
        </p>
      </div>
    </main>
  );
}

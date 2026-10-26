"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import type { Membership } from "@/lib/event";
import s from "./transfer.module.css";

/** Native <dialog>: transferring a ticket is destructive (voids the old QR), so focus is protected. */
export function TransferButton({ orderToken, ticketId, current }: { orderToken: string; ticketId: string; current: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const router = useRouter();
  const [f, setF] = useState({ attendeeName: "", attendeeEmail: "", attendeeMembership: "" as Membership | "", attendeeChapter: "" });
  const [state, setState] = useState<{ busy?: boolean; error?: string }>({});

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setState({ busy: true });
    const res = await fetch("/api/pedido/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderToken, ticketId, attendee: f }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setState({ error: data.error ?? "No pudimos transferir el boleto." });
    ref.current?.close();
    router.refresh();
  }

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((v) => ({ ...v, [k]: e.target.value }));

  return (
    <>
      <button type="button" className="btn tr" onClick={() => ref.current?.showModal()}>
        Transferir
      </button>
      <dialog ref={ref} className={s.dialog} aria-labelledby={`${id}-t`}>
        <form onSubmit={send} className={s.form}>
          <h2 id={`${id}-t`} className="display tr">Transferir boleto</h2>
          <p className={s.note}>
            El boleto de <strong>{current}</strong> pasará a otra persona y su código QR actual dejará de funcionar.
          </p>
          <label>
            <span className="tr">Nombre del nuevo invitado</span>
            <input required value={f.attendeeName} onChange={set("attendeeName")} autoComplete="off" />
          </label>
          <label>
            <span className="tr">Correo (le enviamos su boleto)</span>
            <input type="email" value={f.attendeeEmail} onChange={set("attendeeEmail")} autoComplete="off" />
          </label>
          <fieldset>
            <legend className="tr">¿Es miembro de BNI?</legend>
            <div className={s.options}>
              {(["miembro", "invitado"] as const).map((m) => (
                <label key={m}>
                  <input type="radio" name={`${id}-m`} checked={f.attendeeMembership === m} onChange={() => setF((v) => ({ ...v, attendeeMembership: m }))} />
                  <span>{m === "miembro" ? "Es miembro" : "No es miembro"}</span>
                </label>
              ))}
            </div>
          </fieldset>
          {f.attendeeMembership === "miembro" && (
            <label>
              <span className="tr">¿De qué capítulo?</span>
              <input value={f.attendeeChapter} onChange={set("attendeeChapter")} />
            </label>
          )}
          {state.error && (
            <p className={s.error} role="alert">
              {state.error}
            </p>
          )}
          <div className={s.actions}>
            <button type="button" className="btn tr" onClick={() => ref.current?.close()}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary" disabled={state.busy}>
              <span className="tr">{state.busy ? "Transfiriendo…" : "Transferir"}</span>
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

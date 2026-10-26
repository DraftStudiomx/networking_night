"use client";

import { useActionState, useState } from "react";
import { createManualOrder, type ManualState } from "./actions";
import s from "../ops.module.css";

export function ManualOrderForm({ disabled }: { disabled?: boolean }) {
  const [state, action, pending] = useActionState<ManualState, FormData>(createManualOrder, {});
  const [member, setMember] = useState("invitado");

  return (
    <form action={action} className={s.manual}>
      <label className={s.field}>
        <span className="tr">Nombre</span>
        <input name="buyerName" required />
      </label>
      <label className={s.field}>
        <span className="tr">Correo</span>
        <input name="buyerEmail" type="email" required />
      </label>
      <label className={s.field}>
        <span className="tr">WhatsApp</span>
        <input name="buyerPhone" type="tel" />
      </label>
      <label className={s.field}>
        <span className="tr">Boletos</span>
        <input name="quantity" type="number" min={1} max={10} defaultValue={1} required />
      </label>
      <label className={s.field}>
        <span className="tr">Membresía</span>
        <select name="membership" value={member} onChange={(e) => setMember(e.target.value)}>
          <option value="invitado">No es miembro</option>
          <option value="miembro">Miembro de BNI</option>
        </select>
      </label>
      {member === "miembro" && (
        <label className={s.field}>
          <span className="tr">Capítulo</span>
          <input name="chapter" required />
        </label>
      )}
      <label className={s.field}>
        <span className="tr">Motivo</span>
        <select name="reason" defaultValue="efectivo">
          <option value="efectivo">Pagó en efectivo</option>
          <option value="transferencia">Pagó por transferencia</option>
          <option value="cortesia">Cortesía ($0)</option>
        </select>
      </label>
      <label className={s.checkRow}>
        <input type="checkbox" name="sendEmail" defaultChecked />
        <span>Enviar los boletos por correo</span>
      </label>
      {state.error && (
        <p className={s.error} role="alert">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className={s.notice} role="status">
          {state.ok}
        </p>
      )}
      <button type="submit" className="btn btn--primary" disabled={pending || disabled}>
        <span className="tr">{pending ? "Creando…" : "Emitir boletos"}</span>
      </button>
    </form>
  );
}

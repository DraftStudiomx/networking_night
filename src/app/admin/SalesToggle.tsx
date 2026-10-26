"use client";

import { useTransition } from "react";
import { setSalesOpen } from "./actions";
import s from "../ops.module.css";

export function SalesToggle({ open, disabled }: { open: boolean; disabled?: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div className={s.toggle}>
      <span className={s.toggleState} data-open={open}>
        Venta {open ? "abierta" : "cerrada"}
      </span>
      <button
        type="button"
        className="btn tr"
        disabled={pending || disabled}
        onClick={() => {
          if (open && !confirm("¿Cerrar la venta? Nadie podrá comprar boletos hasta que la vuelvas a abrir.")) return;
          start(() => setSalesOpen(!open));
        }}
      >
        {pending ? "Guardando…" : open ? "Cerrar venta" : "Abrir venta"}
      </button>
    </div>
  );
}

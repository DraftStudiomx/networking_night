"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Ticket } from "@/components/Ticket";
import { Rings } from "@/components/Marks";
import { EVENT, formatMXN, type Membership } from "@/lib/event";
import { formatPhone, orderSchema } from "@/lib/schema";
import s from "./comprar.module.css";

type Attendee = {
  attendeeName: string;
  attendeeEmail: string;
  attendeeMembership: Membership | "";
  attendeeChapter: string;
};
const blankAttendee = (): Attendee => ({
  attendeeName: "",
  attendeeEmail: "",
  attendeeMembership: "",
  attendeeChapter: "",
});
type Errors = Record<string, string>;

function Field({
  label,
  name,
  error,
  optional,
  ...input
}: { label: string; name: string; error?: string; optional?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className={s.field} data-invalid={!!error || undefined}>
      <label htmlFor={id} className="tr">
        {label}
        {optional ? (
          <span className={s.optional}> (opcional)</span>
        ) : (
          <span className={s.req} aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        name={name}
        required={!optional}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-e` : undefined}
        {...input}
      />
      {error && (
        <p id={`${id}-e`} className={s.error}>
          {error}
        </p>
      )}
    </div>
  );
}

function MembershipPicker({
  legend,
  value,
  onChange,
  error,
  name,
  labels,
}: {
  legend: string;
  value: Membership | "";
  onChange: (m: Membership) => void;
  error?: string;
  name: string;
  labels: Record<Membership, string>;
}) {
  return (
    <fieldset className={s.choice} data-invalid={!!error || undefined}>
      <legend className="tr">
        {legend}
        <span className={s.req} aria-hidden="true">
          *
        </span>
      </legend>
      <div className={s.options}>
        {(["miembro", "invitado"] as const).map((m) => (
          <label key={m} className={s.option}>
            <input type="radio" name={name} value={m} checked={value === m} onChange={() => onChange(m)} />
            <span>{labels[m]}</span>
          </label>
        ))}
      </div>
      {error && <p className={s.error}>{error}</p>}
    </fieldset>
  );
}

export function BuyForm({ oxxo, canceled }: { oxxo: boolean; canceled: boolean }) {
  const [buyer, setBuyer] = useState({
    buyerName: "",
    buyerEmail: "",
    buyerPhone: "",
    buyerMembership: "" as Membership | "",
    buyerChapter: "",
  });
  const [buyerAttends, setBuyerAttends] = useState(true);
  const [guests, setGuests] = useState<Attendee[]>([]);
  const [privacy, setPrivacy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<{ kind: "idle" | "sending" | "error"; msg?: string }>({
    kind: canceled ? "error" : "idle",
    msg: canceled ? "El pago se canceló. Tus datos siguen aquí por si quieres intentarlo de nuevo." : undefined,
  });

  // attendee 1 mirrors the buyer while "yo asistiré" is on
  const self: Attendee = {
    attendeeName: buyer.buyerName,
    attendeeEmail: buyer.buyerEmail,
    attendeeMembership: buyer.buyerMembership,
    attendeeChapter: buyer.buyerChapter,
  };
  const attendees = buyerAttends ? [self, ...guests] : guests;
  const qty = attendees.length;
  const max = EVENT.maxTicketsPerOrder;

  const setQty = (n: number) => {
    const target = Math.min(max, Math.max(1, n)) - (buyerAttends ? 1 : 0);
    setGuests((g) => (target > g.length ? [...g, ...Array.from({ length: target - g.length }, blankAttendee)] : g.slice(0, Math.max(0, target))));
  };
  const toggleSelf = (on: boolean) => {
    setBuyerAttends(on);
    // keep the ticket count the same when the buyer steps out or back in
    setGuests((g) => (on ? g.slice(0, -1) : [...g, blankAttendee()]));
  };

  // Checks one field when the visitor leaves it, so mistakes show before submitting.
  const check = (path: string, override?: Partial<typeof buyer>) => {
    const parsed = orderSchema.safeParse({ ...buyer, ...override, attendees, privacy });
    const issue = parsed.success ? undefined : parsed.error.issues.find((x) => x.path.join(".") === path);
    setErrors(({ [path]: _, ...rest }) => (issue ? { ...rest, [path]: issue.message } : rest));
  };
  // emails are trimmed and lower-cased once typed
  const tidyEmail = (v: string) => v.trim().toLowerCase();

  const b = (k: keyof typeof buyer) => ({
    name: k,
    value: buyer[k],
    error: errors[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setBuyer((v) => ({ ...v, [k]: e.target.value })),
    onBlur: () => {
      if (k === "buyerEmail") {
        const v = tidyEmail(buyer.buyerEmail);
        setBuyer((x) => ({ ...x, buyerEmail: v }));
        return check(k, { buyerEmail: v });
      }
      check(k);
    },
  });
  const g = (i: number, k: keyof Attendee) => {
    const path = `attendees.${i + (buyerAttends ? 1 : 0)}.${k}`;
    const set = (v: string) => setGuests((list) => list.map((a, j) => (j === i ? { ...a, [k]: v } : a)));
    return {
      name: `${k}-${i}`,
      value: guests[i][k],
      error: errors[path],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(e.target.value),
      onBlur: () => {
        if (k === "attendeeEmail") set(tidyEmail(guests[i].attendeeEmail));
        check(path);
      },
    };
  };

  // WhatsApp shows as "477 123 4567" while typing; a +52 being typed is left alone until complete
  const onPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const d = raw.replace(/\D/g, "");
    const typingCode = d.length > 10 && d.length < 12 && d.startsWith("52");
    setBuyer((v) => ({ ...v, buyerPhone: typingCode ? raw : formatPhone(raw) }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...buyer, attendees, privacy };
    const parsed = orderSchema.safeParse(payload);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) next[issue.path.join(".")] ??= issue.message;
      if (qty === 0) next.qty = "Agrega al menos un boleto.";
      setErrors(next);
      setStatus({ kind: "error", msg: "Revisa los datos marcados." });
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[data-invalid] input")?.focus());
      return;
    }
    setErrors({});
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "No pudimos iniciar el pago.");
      window.location.href = data.url;
    } catch (err) {
      setStatus({ kind: "error", msg: err instanceof Error ? err.message : "No pudimos iniciar el pago." });
    }
  }

  return (
    <Ticket as="form" medallion tear className={s.form} onSubmit={submit} noValidate aria-labelledby="comprar-t">
      <div className={s.body}>
        <h1 id="comprar-t" className={`${s.title} display tr`}>
          R.S.V.P.
        </h1>
        <p className={s.lede}>
          {EVENT.dateLong}, 4:00 pm
          <br />
          {formatMXN(EVENT.priceMXN)} por persona
        </p>

        <section className={s.block} aria-labelledby="qty-t">
          <h2 id="qty-t" className={`${s.h2} tr`}>
            ¿Cuántos boletos?
          </h2>
          <div className={s.stepper}>
            <button type="button" onClick={() => setQty(qty - 1)} disabled={qty <= 1} aria-label="Quitar un boleto">
              −
            </button>
            <output className="display num" aria-live="polite">
              {qty}
            </output>
            <button type="button" onClick={() => setQty(qty + 1)} disabled={qty >= max} aria-label="Agregar un boleto">
              +
            </button>
          </div>
          <p className={s.hint}>Hasta {max} por compra.</p>
        </section>

        <section className={s.block} aria-labelledby="buyer-t">
          <h2 id="buyer-t" className={`${s.h2} tr`}>
            Tus datos
          </h2>
          <p className={s.hint}>
            Los campos con <span className={s.req}>*</span> son obligatorios.
          </p>
          <div className={`${s.grid} ${s.gridLead}`}>
            <Field label="Nombre completo" autoComplete="name" placeholder="Nombre y apellido" {...b("buyerName")} />
            <Field
              label="Correo"
              type="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="tucorreo@ejemplo.com"
              {...b("buyerEmail")}
            />
            <Field
              label="WhatsApp"
              type="tel"
              autoComplete="tel-national"
              inputMode="numeric"
              placeholder="477 123 4567"
              {...b("buyerPhone")}
              onChange={onPhone}
            />
          </div>
          <MembershipPicker
            legend="¿Eres miembro de BNI?"
            name="buyerMembership"
            value={buyer.buyerMembership}
            error={errors.buyerMembership}
            onChange={(m) => setBuyer((v) => ({ ...v, buyerMembership: m }))}
            labels={{ miembro: "Soy miembro", invitado: "No soy miembro" }}
          />
          {buyer.buyerMembership === "miembro" && (
            <div className={s.chapter}>
              <Field label="¿De qué capítulo?" autoComplete="off" placeholder="Ej. Pioneros" {...b("buyerChapter")} />
            </div>
          )}
        </section>

        <section className={s.block} aria-labelledby="guests-t">
          <h2 id="guests-t" className={`${s.h2} tr`}>
            Invitados
          </h2>
          <p className={s.hint}>Cada boleto lleva el nombre de quien asiste.</p>
          <label className={s.check}>
            <input type="checkbox" checked={buyerAttends} onChange={(e) => toggleSelf(e.target.checked)} />
            <span>Yo asistiré (boleto 1 a mi nombre)</span>
          </label>

          <ol className={s.guests}>
            {guests.map((_, i) => {
              const n = i + 1 + (buyerAttends ? 1 : 0);
              return (
                <li key={i} className={s.guest}>
                  <p className={`${s.guestN} display`}>Boleto {n}</p>
                  <div className={s.grid}>
                    <Field label="Nombre del invitado" placeholder="Nombre y apellido" {...g(i, "attendeeName")} />
                    <Field
                      label="Correo del invitado"
                      type="email"
                      inputMode="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      optional
                      placeholder="Para enviarle su boleto"
                      {...g(i, "attendeeEmail")}
                    />
                  </div>
                  <MembershipPicker
                    legend="¿Es miembro de BNI?"
                    name={`m-${i}`}
                    value={guests[i].attendeeMembership}
                    error={errors[`attendees.${n - 1}.attendeeMembership`]}
                    onChange={(m) => setGuests((list) => list.map((a, j) => (j === i ? { ...a, attendeeMembership: m } : a)))}
                    labels={{ miembro: "Es miembro", invitado: "No es miembro" }}
                  />
                  {guests[i].attendeeMembership === "miembro" && (
                    <div className={s.chapter}>
                      <Field label="¿De qué capítulo?" autoComplete="off" placeholder="Ej. Metamorfosis" {...g(i, "attendeeChapter")} />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
          {qty < max && (
            <button type="button" className={`btn tr ${s.add}`} onClick={() => setQty(qty + 1)}>
              Agregar invitado
            </button>
          )}
        </section>
      </div>

      <div className={s.stub} data-stub>
        <dl className={s.total}>
          <div>
            <dt className="label tr muted">Boletos</dt>
            <dd className="display num">{qty}</dd>
          </div>
          <div>
            <dt className="label tr muted">Total</dt>
            <dd className="display num">{formatMXN(qty * EVENT.priceMXN)}</dd>
          </div>
        </dl>

        <p className={s.pay}>
          {oxxo
            ? "Pagas con tarjeta o en efectivo en OXXO (la ficha vence en 24 horas)."
            : "Pago con tarjeta de crédito o débito."}{" "}
          No reembolsable; transferible a otra persona.
        </p>

        <label className={s.check} data-invalid={!!errors.privacy || undefined}>
          <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} />
          <span>
            Acepto el <Link href="/aviso-de-privacidad" target="_blank">aviso de privacidad</Link>.
          </span>
        </label>
        {errors.privacy && <p className={s.error}>{errors.privacy}</p>}

        {status.kind === "error" && status.msg && (
          <p className={s.alert} role="alert">
            {status.msg}
          </p>
        )}

        <button type="submit" className={`btn btn--primary ${s.submit}`} disabled={status.kind === "sending"}>
          <Rings className="btn__rings" mono="#fff" />
          <span className="tr">{status.kind === "sending" ? "Abriendo pago…" : "Ir a pagar"}</span>
          <span className="btn__price num">{formatMXN(qty * EVENT.priceMXN)}</span>
        </button>
        <p className={s.secure}>El pago se procesa de forma segura con Stripe.</p>
      </div>
    </Ticket>
  );
}

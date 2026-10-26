"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type QrScannerType from "qr-scanner";
import s from "../ops.module.css";

type Ticket = { code: string; attendee: string; member: string; buyer: string; position: number; total: number };
type Result =
  | { result: "valid"; ticket: Ticket }
  | { result: "duplicate"; ticket: Ticket; firstAt?: string; firstBy?: string | null }
  | { result: "invalid" | "unpaid" | "superseded"; message: string; ticket?: Ticket }
  | { result: "error"; message: string };

type Found = { id: string; code: string; attendee: string; member: string; checkedInAt: string | null };

const TITLES: Record<Result["result"], string> = {
  valid: "Puede pasar",
  duplicate: "Ya ingresó",
  invalid: "Boleto no válido",
  unpaid: "Sin pago",
  superseded: "Boleto transferido",
  error: "Error",
};

const hour = (iso?: string) =>
  iso ? new Date(iso).toLocaleTimeString("es-MX", { timeZone: "America/Mexico_City", hour: "numeric", minute: "2-digit" }) : "";

export function Scanner() {
  const video = useRef<HTMLVideoElement>(null);
  const scanner = useRef<QrScannerType | null>(null);
  const busy = useRef(false);
  // the QR currently in front of the camera and when it was last read
  const seen = useRef<{ raw: string; at: number } | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [cam, setCam] = useState<"off" | "starting" | "on" | "denied">("off");
  const [res, setRes] = useState<Result | null>(null);
  // bumps per scan so the result card replays its entrance even for identical results
  const [stamp, setStamp] = useState(0);
  const [q, setQ] = useState("");
  const [found, setFound] = useState<Found[]>([]);

  const submit = useCallback(async (raw: string, manual = false) => {
    // While one ticket is being checked, other reads are dropped without being remembered,
    // so a second ticket held up meanwhile is picked up as soon as the first one finishes.
    if (busy.current) return;
    if (!manual) {
      // The camera reads the same QR several times per second for as long as it stays in
      // frame. Only a new code, or the same code shown again after leaving the frame for
      // 2.5 s, counts as a new scan, however long the server takes to answer.
      const now = Date.now();
      const prev = seen.current;
      seen.current = { raw, at: now };
      if (prev && prev.raw === raw && now - prev.at < 2500) return;
    }
    busy.current = true;
    try {
      const r = await fetch("/api/staff/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw, manual }),
      });
      const data = await r.json();
      const out: Result = r.ok ? data : { result: "error", message: data.error ?? "No se pudo validar." };
      setRes(out);
      setStamp((n) => n + 1);
      navigator.vibrate?.(out.result === "valid" ? 80 : [180, 80, 180]);
      if (manual) requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
    } catch {
      setRes({ result: "error", message: "Sin conexión. Intenta de nuevo." });
    } finally {
      busy.current = false;
    }
  }, []);

  async function startCamera() {
    if (!video.current) return;
    setCam("starting");
    scanner.current?.destroy(); // never two scanners feeding the same screen
    const QrScanner = (await import("qr-scanner")).default;
    scanner.current = new QrScanner(video.current, (r) => submit(r.data), {
      preferredCamera: "environment",
      maxScansPerSecond: 6,
      returnDetailedScanResult: true,
    });
    try {
      await scanner.current.start();
      setCam("on");
    } catch {
      setCam("denied");
    }
  }

  useEffect(() => () => scanner.current?.destroy(), []);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return setFound([]);
    const id = setTimeout(async () => {
      const r = await fetch(`/api/staff/search?q=${encodeURIComponent(term)}`);
      if (r.ok) setFound((await r.json()).results);
    }, 250);
    return () => clearTimeout(id);
  }, [q]);

  const ticket = res && "ticket" in res ? res.ticket : undefined;

  return (
    <>
      <div className={s.camera}>
        <video ref={video} muted playsInline />
        {cam === "on" ? (
          <>
            <span className={s.reticle} aria-hidden="true" />
            <p className={s.cameraHint}>Buscando un código QR… Acércalo al recuadro.</p>
          </>
        ) : (
          <div className={s.cameraIdle}>
            {cam === "denied" ? (
              <p>No pudimos usar la cámara. Revisa el permiso del navegador o usa la búsqueda de abajo.</p>
            ) : (
              <p>Apunta la cámara al código QR del boleto.</p>
            )}
            <button type="button" className="btn btn--primary" onClick={startCamera} disabled={cam === "starting"}>
              <span className="tr">{cam === "starting" ? "Abriendo…" : "Activar cámara"}</span>
            </button>
          </div>
        )}
      </div>

      <div aria-live="assertive" ref={resultRef}>
        {res && (
          <div className={s.result} data-tone={res.result} key={stamp}>
            <p className={s.resultTitle}>{TITLES[res.result]}</p>
            {ticket && <p className={s.resultName}>{ticket.attendee}</p>}
            {ticket && (
              <p className={s.resultMeta}>
                {ticket.member} · Boleto {ticket.position} de {ticket.total} · {ticket.code}
                <br />
                Comprado por {ticket.buyer}
              </p>
            )}
            {res.result === "duplicate" && (
              <p className={s.resultMeta}>
                Entró a las {hour(res.firstAt)}
                {res.firstBy ? ` (registró ${res.firstBy})` : ""}. Los organizadores ya tienen el aviso.
              </p>
            )}
            {"message" in res && <p className={s.resultMeta}>{res.message}</p>}
          </div>
        )}
      </div>

      <section className={`${s.panel} ${s.lookup}`} aria-labelledby="lookup-t">
        <h2 id="lookup-t" className={`${s.h2} tr`}>Buscar boleto</h2>
        <label className={s.search}>
          <span className="visually-hidden">Nombre o código</span>
          <input type="search" placeholder="Nombre o código (NN-…)" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        {found.length > 0 && (
          <ul className={s.lookupList}>
            {found.map((f) => (
              <li key={f.id}>
                <div>
                  <strong>{f.attendee}</strong>
                  <span className={s.sub}>
                    {f.member} · {f.code}
                    {f.checkedInAt && ` · entró ${hour(f.checkedInAt)}`}
                  </span>
                </div>
                <button type="button" className="btn tr" onClick={() => submit(f.code, true)}>
                  Registrar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

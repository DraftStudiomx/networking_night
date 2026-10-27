import { readFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { ImageResponse } from "next/og";
import { EVENT, INCLUDES } from "@/lib/event";

export const runtime = "nodejs";

// Development-only: the WhatsApp invitation image. ?f=chat (1080×1350) or ?f=estado (1080×1920).
const C = { page: "#E9E7E1", ground: "#F6F5F1", ink: "#141414", red: "#C8102E", muted: "#5E5F62" };
const SITE = "networking.draftstudio.mx";

export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 });
  const status = new URL(req.url).searchParams.get("f") === "estado";
  const W = 1080;
  const H = status ? 1920 : 1350;
  const TEAR = status ? 1420 : 1000;
  // breathing room between the image edge and the ticket's outer rule
  const OUT = 62;

  const font = (f: string) => readFile(path.join(process.cwd(), "src/fonts", f));
  const [forum, josefin, josefinBold] = await Promise.all([
    font("forum-latin-400-normal.woff"),
    font("josefin-sans-latin-400-normal.woff"),
    font("josefin-sans-latin-600-normal.woff"),
  ]);
  const qr = await QRCode.toDataURL(`https://${SITE}`, {
    margin: 0,
    width: 600,
    errorCorrectionLevel: "M",
    color: { dark: C.ink, light: C.ground },
  });

  // ticket outline with concave corners and side notches at the tear line
  const ticket = (i: number, r: number) => {
    const [l, t, rt, b] = [i, i, W - i, H - i];
    return `M${l + r},${t} H${rt - r} A${r},${r} 0 0 0 ${rt},${t + r} V${b - r} A${r},${r} 0 0 0 ${rt - r},${b} H${l + r} A${r},${r} 0 0 0 ${l},${b - r} V${t + r} A${r},${r} 0 0 0 ${l + r},${t} Z`;
  };
  const label = { fontFamily: "Josefin", fontWeight: 600, textTransform: "uppercase" } as const;

  const cell = (k: string, v: string, first?: boolean) => (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "22px 0 18px",
        borderLeft: first ? "none" : `2px solid ${C.ink}`,
      }}
    >
      <div style={{ ...label, fontSize: 18, letterSpacing: 5, color: C.muted }}>{k}</div>
      <div style={{ fontFamily: "Forum", fontSize: 44, marginTop: 8 }}>{v}</div>
    </div>
  );

  const price = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <div style={{ ...label, fontSize: 20, letterSpacing: 6, color: C.muted }}>Boletos</div>
      <div style={{ display: "flex", alignItems: "flex-end", marginTop: 8 }}>
        <div style={{ fontFamily: "Forum", fontSize: status ? 116 : 92, lineHeight: 1 }}>$600</div>
        <div style={{ ...label, fontSize: 19, letterSpacing: 4, color: C.muted, marginLeft: 16, marginBottom: 12 }}>
          por persona
        </div>
      </div>
      <div
        style={{
          display: "flex",
          marginTop: status ? 30 : 20,
          padding: "15px 26px",
          background: C.red,
          color: "#fff",
          ...label,
          fontSize: 22,
          letterSpacing: 6,
        }}
      >
        Aparta tu lugar
      </div>
      <div style={{ fontFamily: "Josefin", fontWeight: 600, fontSize: 25, letterSpacing: 1, marginTop: 14 }}>{SITE}</div>
    </div>
  );

  return new ImageResponse(
    (
      <div style={{ width: W, height: H, display: "flex", position: "relative", background: C.page, color: C.ink }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", top: 0, left: 0 }}>
          <path d={ticket(OUT, 46)} fill={C.ground} stroke={C.ink} strokeWidth={3} />
          <path d={ticket(OUT + 22, 40)} fill="none" stroke={C.ink} strokeWidth={1.2} />
          <line x1={OUT + 46} y1={TEAR} x2={W - OUT - 46} y2={TEAR} stroke={C.ink} strokeWidth={2} strokeDasharray="3 12" />
          <path d={`M${OUT} ${TEAR - 26} A26 26 0 0 1 ${OUT} ${TEAR + 26}`} fill={C.page} stroke={C.ink} strokeWidth={3} />
          <path d={`M${W - OUT} ${TEAR - 26} A26 26 0 0 0 ${W - OUT} ${TEAR + 26}`} fill={C.page} stroke={C.ink} strokeWidth={3} />
          {/* medallion: the rings sitting on the top edge, clear of both rules */}
          <rect x={W / 2 - 66} y={OUT - 4} width={132} height={30} fill={C.ground} />
          <circle cx={W / 2 - 14} cy={OUT + 10} r={20} fill="none" stroke={C.ink} strokeWidth={3.5} />
          <circle cx={W / 2 + 14} cy={OUT + 10} r={20} fill="none" stroke={C.red} strokeWidth={3.5} />
        </svg>

        {/* invitation */}
        <div
          style={{
            position: "absolute",
            top: status ? 190 : 150,
            left: 130,
            right: 130,
            height: TEAR - (status ? 240 : 186),
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <svg width={120} height={50} viewBox="120 165 885 366">
              <g fill={C.red}>
                <path
                  fillRule="evenodd"
                  d="M125 170H330C400 170 430 212 430 263C430 300 410 326 375 338C420 351 448 386 448 430C448 487 408 526 330 526H125ZM233 251V309H290C310 309 322 297 322 280C322 263 310 251 290 251ZM233 386V446H300C325 446 338 432 338 416C338 400 325 386 300 386Z"
                />
                <path d="M486 170H596L737 350V170H845V526H745L594 333V526H486Z" />
                <path d="M891 170H1000L891 279Z" />
                <path d="M1000 212V526H891V321Z" />
              </g>
            </svg>
            {/* the event name is the small line; the big title is the invitation itself */}
            <div style={{ ...label, fontSize: status ? 38 : 32, letterSpacing: 14, color: C.red, marginTop: status ? 40 : 26 }}>
              Networking Night
            </div>
            <div style={{ fontFamily: "Forum", fontSize: status ? 104 : 90, letterSpacing: 10, lineHeight: 1, marginTop: status ? 30 : 20 }}>
              SAVE THE
            </div>
            <div style={{ fontFamily: "Forum", fontSize: status ? 186 : 150, letterSpacing: 12, lineHeight: 0.95 }}>DATE</div>
            <div style={{ display: "flex", ...label, fontSize: 25, letterSpacing: 8, marginTop: status ? 30 : 22 }}>
              <span>Pioneros</span>
              <span style={{ color: C.red, margin: "0 16px" }}>&amp;</span>
              <span>Metamorfosis</span>
            </div>
            <div
              style={{
                fontFamily: "Forum",
                fontSize: status ? 42 : 36,
                lineHeight: 1.3,
                textAlign: "center",
                maxWidth: 760,
                marginTop: status ? 50 : 30,
              }}
            >
              {EVENT.premise}
            </div>
            {/* the anniversary the wedding celebrates: BNI arrived in Mexico in 2006 */}
            <div style={{ display: "flex", alignItems: "center", marginTop: status ? 40 : 24 }}>
              <div style={{ width: 36, height: 2, background: C.red }} />
              <div style={{ ...label, fontSize: status ? 26 : 24, letterSpacing: 4, color: C.red, margin: "0 18px", whiteSpace: "nowrap" }}>
                Celebramos 20 años de BNI en México
              </div>
              <div style={{ width: 36, height: 2, background: C.red }} />
            </div>
            {status && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 44 }}>
                <div style={{ ...label, fontSize: 19, letterSpacing: 7, color: C.muted }}>Tu boleto incluye</div>
                <div
                  style={{
                    fontFamily: "Forum",
                    fontSize: 34,
                    lineHeight: 1.45,
                    textAlign: "center",
                    maxWidth: 820,
                    marginTop: 16,
                  }}
                >
                  {/* non-breaking spaces keep each item on one line */}
                  {[...INCLUDES.map((i) => i.title), "Valet parking"].map((t) => t.replace(/ /g, " ")).join("  ·  ")}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <div style={{ display: "flex", width: "100%", borderTop: `2px solid ${C.ink}`, borderBottom: `2px solid ${C.ink}` }}>
              {cell("Sábado", "28 NOV", true)}
              {cell("Recepción", "4:00 PM")}
              {cell("Etiqueta", "FORMAL")}
            </div>
            <div style={{ ...label, fontSize: 24, letterSpacing: 8, marginTop: 26 }}>{EVENT.venue.name}</div>
            <div style={{ ...label, fontSize: 18, letterSpacing: 6, color: C.muted, marginTop: 10 }}>León, Guanajuato</div>
          </div>
        </div>

        {/* stub */}
        <div
          style={{
            position: "absolute",
            top: TEAR + 34,
            left: 150,
            right: 150,
            bottom: status ? 110 : 96,
            display: "flex",
            alignItems: "center",
          }}
        >
          {price}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginLeft: "auto" }}>
            <img src={qr} width={status ? 250 : 186} height={status ? 250 : 186} alt="" />
            <div style={{ ...label, fontSize: 16, letterSpacing: 4, color: C.muted, marginTop: 14 }}>Escanea y compra</div>
          </div>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [
        { name: "Forum", data: forum, weight: 400, style: "normal" },
        { name: "Josefin", data: josefin, weight: 400, style: "normal" },
        { name: "Josefin", data: josefinBold, weight: 600, style: "normal" },
      ],
    },
  );
}

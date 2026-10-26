import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { EVENT } from "@/lib/event";

// Preview card shown when the site link is shared (WhatsApp, Facebook, iMessage, X).
export const alt = "Networking Night · Save the Date — Pioneros & Metamorfosis, sábado 28 de noviembre, León";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const C = { page: "#E9E7E1", ground: "#F6F5F1", ink: "#141414", red: "#C8102E", muted: "#5E5F62" };

// Ticket outline with concave corners, inset `i` from the canvas edge.
const ticket = (i: number, r: number) => {
  const [l, t, rt, b] = [i, i, size.width - i, size.height - i];
  return `M${l + r},${t} H${rt - r} A${r},${r} 0 0 0 ${rt},${t + r} V${b - r} A${r},${r} 0 0 0 ${rt - r},${b} H${l + r} A${r},${r} 0 0 0 ${l},${b - r} V${t + r} A${r},${r} 0 0 0 ${l + r},${t} Z`;
};

export default async function OpengraphImage() {
  const font = (f: string) => readFile(path.join(process.cwd(), "src/fonts", f));
  const [forum, josefin, josefinBold] = await Promise.all([
    font("forum-latin-400-normal.woff"),
    font("josefin-sans-latin-400-normal.woff"),
    font("josefin-sans-latin-600-normal.woff"),
  ]);

  const label = { fontFamily: "Josefin", fontWeight: 600, letterSpacing: 6 } as const;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: C.page, position: "relative" }}>
        <svg width={size.width} height={size.height} style={{ position: "absolute", top: 0, left: 0 }}>
          <path d={ticket(36, 34)} fill={C.ground} stroke={C.ink} strokeWidth={2} />
          <path d={ticket(52, 30)} fill="none" stroke={C.ink} strokeWidth={0.8} />
        </svg>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            color: C.ink,
          }}
        >
          <svg width={90} height={54} viewBox="0 0 30 18">
            <circle cx="10.5" cy="9" r="7" fill="none" stroke={C.ink} strokeWidth="1.2" />
            <circle cx="19.5" cy="9" r="7" fill="none" stroke={C.red} strokeWidth="1.2" />
          </svg>

          <div style={{ ...label, fontSize: 22, color: C.red, marginTop: 22 }}>SAVE THE DATE</div>

          <div style={{ fontFamily: "Forum", fontSize: 128, lineHeight: 1, marginTop: 14 }}>Networking Night</div>

          <div style={{ display: "flex", fontFamily: "Forum", fontSize: 46, marginTop: 18 }}>
            <span>Pioneros</span>
            <span style={{ color: C.red, margin: "0 18px" }}>&amp;</span>
            <span>Metamorfosis</span>
          </div>

          <div style={{ width: 120, height: 1, background: C.ink, marginTop: 30, marginBottom: 28 }} />

          <div style={{ ...label, fontSize: 21, color: C.muted, letterSpacing: 4 }}>
            {`SÁBADO 28 NOV 2026 · 4:00 PM · ${EVENT.venue.name.toUpperCase()}, LEÓN`}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Forum", data: forum, weight: 400, style: "normal" },
        { name: "Josefin", data: josefin, weight: 400, style: "normal" },
        { name: "Josefin", data: josefinBold, weight: 600, style: "normal" },
      ],
    },
  );
}

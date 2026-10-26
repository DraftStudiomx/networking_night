import "server-only";
import path from "node:path";
import QRCode from "qrcode";
import { Document, Font, G, Image, Page, Path, Circle, Line, Svg, Text, View, renderToBuffer, StyleSheet } from "@react-pdf/renderer";
import { EVENT, memberLine, type Membership } from "../event";
import { ticketUrl } from "./tokens";

const fontDir = path.join(process.cwd(), "src", "fonts");
Font.register({ family: "Forum", src: path.join(fontDir, "forum-latin-400-normal.woff") });
Font.register({
  family: "Josefin",
  fonts: [
    { src: path.join(fontDir, "josefin-sans-latin-400-normal.woff"), fontWeight: 400 },
    { src: path.join(fontDir, "josefin-sans-latin-600-normal.woff"), fontWeight: 600 },
  ],
});
Font.registerHyphenationCallback((w) => [w]);

const INK = "#141414";
const RED = "#C8102E";
const GROUND = "#F6F5F1";
const MUTED = "#5E5F62";

const PAGE = "#E9E7E1";

// Ticket geometry (points). The ticket sits on a page-coloured margin so its frame
// never touches the edge of the PDF viewer.
const W = 300;
const H = 560;
const R = 22;
const TEAR = 452;
const M = 24;
const PW = W + M * 2;
const PH = H + M * 2;

const outline = (o: number, r: number) =>
  `M${o + r},${o} H${W - o - r} A${r},${r} 0 0 0 ${W - o},${o + r} V${H - o - r} A${r},${r} 0 0 0 ${W - o - r},${H - o} H${o + r} A${r},${r} 0 0 0 ${o},${H - o - r} V${o + r} A${r},${r} 0 0 0 ${o + r},${o} Z`;

const st = StyleSheet.create({
  page: { width: PW, height: PH, backgroundColor: PAGE, fontFamily: "Josefin", color: INK },
  frame: { position: "absolute", top: 0, left: 0 },
  ticket: { position: "absolute", top: M, left: M, width: W, height: H },
  body: { position: "absolute", top: 34, left: 24, right: 24, alignItems: "center" },
  std: { fontSize: 7, fontWeight: 600, letterSpacing: 3.2, textTransform: "uppercase" },
  nn: { fontFamily: "Forum", fontSize: 25, letterSpacing: 2, marginTop: 8 },
  night: { fontFamily: "Forum", fontSize: 37, letterSpacing: 2, marginTop: -4 },
  couple: { fontSize: 7, fontWeight: 600, letterSpacing: 1.8, marginTop: 6, textTransform: "uppercase" },
  name: { fontFamily: "Forum", fontSize: 18, marginTop: 14, textAlign: "center" },
  member: { fontSize: 7, letterSpacing: 1.6, color: MUTED, marginTop: 3, textTransform: "uppercase" },
  qr: { width: 132, height: 132, marginTop: 12 },
  code: { fontSize: 9, fontWeight: 600, letterSpacing: 2.4, marginTop: 4 },
  cells: { flexDirection: "row", width: "100%", marginTop: 14, borderTopWidth: 0.75, borderBottomWidth: 0.75, borderColor: INK },
  cell: { flex: 1, alignItems: "center", paddingVertical: 6 },
  cellSep: { borderLeftWidth: 0.75, borderColor: INK },
  cellLabel: { fontSize: 5.5, fontWeight: 600, letterSpacing: 1.4, color: MUTED, textTransform: "uppercase" },
  cellValue: { fontFamily: "Forum", fontSize: 12, marginTop: 3, textTransform: "uppercase" },
  venue: { fontSize: 7, fontWeight: 600, letterSpacing: 1.6, marginTop: 8, textTransform: "uppercase" },
  stub: { position: "absolute", top: TEAR + 16, left: 24, right: 24, alignItems: "center" },
  admit: { fontSize: 6.5, fontWeight: 600, letterSpacing: 2.6, color: MUTED, textTransform: "uppercase" },
  pos: { fontFamily: "Forum", fontSize: 16, marginTop: 8 },
  fine: { fontSize: 6, color: MUTED, marginTop: 6, textAlign: "center" },
});

export type PdfTicket = {
  code: string;
  version: number;
  position: number;
  total: number;
  attendeeName: string;
  membership: Membership;
  chapter?: string | null;
};

function TicketPage({ t, qr }: { t: PdfTicket; qr: string }) {
  return (
    <Page size={[PW, PH]} style={st.page}>
      <Svg style={st.frame} width={PW} height={PH} viewBox={`0 0 ${PW} ${PH}`}>
        <G transform={`translate(${M} ${M})`}>
          <Path d={outline(1, R)} stroke={INK} strokeWidth={1.6} fill={GROUND} />
          <Path d={outline(6, R - 2)} stroke={INK} strokeWidth={0.6} fill="none" />
          <Path d={`M${W / 2 - 24} 0 H${W / 2 + 24} V9 H${W / 2 - 24} Z`} fill={GROUND} />
          <Circle cx={W / 2 - 4} cy={4} r={6.5} stroke={INK} strokeWidth={1.2} fill="none" />
          <Circle cx={W / 2 + 4} cy={4} r={6.5} stroke={RED} strokeWidth={1.2} fill="none" />
          <Line x1={16} y1={TEAR} x2={W - 16} y2={TEAR} stroke={INK} strokeWidth={0.8} strokeDasharray="1.5 4" />
          <Path d={`M0 ${TEAR - 8} A8 8 0 0 1 0 ${TEAR + 8}`} stroke={INK} strokeWidth={1.6} fill={PAGE} />
          <Path d={`M${W} ${TEAR - 8} A8 8 0 0 0 ${W} ${TEAR + 8}`} stroke={INK} strokeWidth={1.6} fill={PAGE} />
        </G>
      </Svg>

      <View style={st.ticket}>
        <View style={st.body}>
          <Text style={st.std}>Save the date</Text>
          <Text style={st.nn}>NETWORKING</Text>
          <Text style={st.night}>NIGHT</Text>
          <Text style={st.couple}>
            Pioneros <Text style={{ color: RED }}>&amp;</Text> Metamorfosis
          </Text>
          <Text style={st.name}>{t.attendeeName}</Text>
          <Text style={st.member}>{memberLine(t.membership, t.chapter)}</Text>
          <Image style={st.qr} src={qr} />
          <Text style={st.code}>{t.code}</Text>
          <View style={st.cells}>
            <View style={st.cell}>
              <Text style={st.cellLabel}>{EVENT.dateLabel.day}</Text>
              <Text style={st.cellValue}>{EVENT.dateLabel.date}</Text>
            </View>
            <View style={[st.cell, st.cellSep]}>
              <Text style={st.cellLabel}>Recepción</Text>
              <Text style={st.cellValue}>{EVENT.dateLabel.time}</Text>
            </View>
            <View style={[st.cell, st.cellSep]}>
              <Text style={st.cellLabel}>Etiqueta</Text>
              <Text style={st.cellValue}>{EVENT.dateLabel.dress}</Text>
            </View>
          </View>
          <Text style={st.venue}>{EVENT.venue.name}</Text>
        </View>

        <View style={st.stub}>
          <Text style={st.admit}>Admite · una · persona</Text>
          <Text style={st.pos}>
            Boleto {t.position} de {t.total}
          </Text>
          <Text style={st.fine}>No reembolsable · Transferible desde el enlace de tu compra</Text>
        </View>
      </View>
    </Page>
  );
}

export async function ticketsPdf(tickets: PdfTicket[]) {
  const qrs = await Promise.all(
    tickets.map((t) =>
      QRCode.toDataURL(ticketUrl(t.code, t.version), {
        margin: 0,
        width: 600,
        errorCorrectionLevel: "M",
        color: { dark: INK, light: GROUND },
      }),
    ),
  );
  return renderToBuffer(
    <Document title="Boletos · Networking Night" author="Networking Night">
      {tickets.map((t, i) => (
        <TicketPage key={t.code} t={t} qr={qrs[i]} />
      ))}
    </Document>,
  );
}

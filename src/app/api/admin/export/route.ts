import { currentStaff } from "@/lib/server/auth";
import { loadDashboard } from "@/lib/server/admin";

const STATUS = { paid: "Pagado", pending: "Pendiente", expired: "Vencido", canceled: "Cancelado" } as const;

// CSV with a BOM so Excel opens accents correctly.
export async function GET() {
  const user = await currentStaff();
  if (!user || user.role !== "admin") return new Response("No autorizado", { status: 401 });

  const { tickets } = await loadDashboard();
  const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString("es-MX", { timeZone: "America/Mexico_City" }) : "";

  const rows = [
    ["Código", "Asistente", "Correo asistente", "Miembro BNI", "Capítulo", "Comprador", "Correo comprador", "WhatsApp", "Pago", "Método", "Ingresó", "Escaneado por"],
    ...tickets.map((t) => [
      t.code,
      t.attendee,
      t.attendeeEmail,
      t.membership === "miembro" ? "Sí" : "No",
      t.chapter,
      t.buyer,
      t.buyerEmail,
      t.buyerPhone,
      STATUS[t.orderStatus],
      t.method ?? "",
      fmt(t.checkedInAt),
      t.checkedInBy ?? "",
    ]),
  ];
  const csv = "﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="asistentes-networking-night.csv"`,
    },
  });
}

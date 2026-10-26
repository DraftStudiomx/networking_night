import { orderByToken } from "@/lib/server/orders";
import { ticketsPdf } from "@/lib/server/pdf";
import { toPdfTicket } from "@/lib/server/fulfill";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await orderByToken(token);
  if (!data || data.order.status !== "paid") return new Response("No encontrado", { status: 404 });

  const only = new URL(req.url).searchParams.get("boleto");
  const list = data.tickets.filter((t) => t.status === "valid" && (!only || t.id === only));
  if (list.length === 0) return new Response("No encontrado", { status: 404 });

  const pdf = await ticketsPdf(list.map((t) => toPdfTicket(t, data.tickets.length)));
  const name = list.length === 1 ? `boleto-${list[0].code}.pdf` : "boletos-networking-night.pdf";
  return new Response(new Uint8Array(pdf), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${name}"` },
  });
}

import { ticketsPdf } from "@/lib/server/pdf";
import { sendOrderConfirmed } from "@/lib/server/email";

export const runtime = "nodejs";

// Development-only: sends the real ticket email (sample data + PDF) to ?to=<address>.
export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 });
  const to = new URL(req.url).searchParams.get("to");
  if (!to) return new Response("Falta ?to=", { status: 400 });

  const tickets = [
    { code: "NN-4F7K9Q", version: 1, position: 1, total: 2, attendeeName: "Invitado de ejemplo", membership: "miembro" as const, chapter: "Pioneros" },
    { code: "NN-8HXR2M", version: 1, position: 2, total: 2, attendeeName: "María Fernanda López", membership: "invitado" as const },
  ];
  try {
    const res = await sendOrderConfirmed({
      to,
      buyerName: "Invitado de ejemplo",
      orderUrl: "http://localhost:3000/pedido/ejemplo",
      tickets: tickets.map((t) => ({ attendeeName: t.attendeeName, code: t.code })),
      totalMXN: 1200,
      pdf: await ticketsPdf(tickets),
    });
    return Response.json(res);
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

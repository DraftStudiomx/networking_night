import { ticketsPdf } from "@/lib/server/pdf";

export const runtime = "nodejs";

// Development-only preview of the ticket PDF with sample data.
export async function GET() {
  if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 });
  const pdf = await ticketsPdf([
    { code: "NN-4F7K9Q", version: 1, position: 1, total: 2, attendeeName: "Invitado de ejemplo", membership: "miembro", chapter: "Pioneros" },
    { code: "NN-8HXR2M", version: 1, position: 2, total: 2, attendeeName: "María Fernanda López", membership: "invitado" },
  ]);
  return new Response(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf" } });
}

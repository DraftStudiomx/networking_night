import { NextResponse } from "next/server";
import { transferSchema } from "@/lib/schema";
import { db, type TicketRow } from "@/lib/server/db";
import { ticketsPdf } from "@/lib/server/pdf";
import { sendTicketToAttendee } from "@/lib/server/email";
import { toPdfTicket } from "@/lib/server/fulfill";
import { ticketUrl } from "@/lib/server/tokens";
import { NotConfiguredError } from "@/lib/server/config";

export async function POST(req: Request) {
  const parsed = transferSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Revisa los datos." }, { status: 400 });
  }
  const { orderToken, ticketId, attendee: a } = parsed.data;

  try {
    const { data: order } = await db()
      .from("orders")
      .select("id, buyer_name, status, quantity")
      .eq("access_token", orderToken)
      .maybeSingle();
    if (!order || order.status !== "paid") return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });

    const { data: found } = await db().from("tickets").select("*").eq("id", ticketId).eq("order_id", order.id).maybeSingle();
    const ticket = found as TicketRow | null;
    if (!ticket || ticket.status !== "valid") return NextResponse.json({ error: "Boleto no encontrado." }, { status: 404 });
    if (ticket.checked_in_at) return NextResponse.json({ error: "Este boleto ya se usó en la entrada." }, { status: 409 });

    const member = a.attendeeMembership === "miembro";
    const { data: updated, error } = await db()
      .from("tickets")
      .update({
        version: ticket.version + 1,
        attendee_name: a.attendeeName,
        attendee_email: a.attendeeEmail ? a.attendeeEmail.toLowerCase() : null,
        attendee_membership: a.attendeeMembership,
        attendee_chapter: member ? a.attendeeChapter : null,
      })
      .eq("id", ticket.id)
      .eq("version", ticket.version) // guards against two transfers racing
      .select("*")
      .single();
    if (error || !updated) return NextResponse.json({ error: "No pudimos transferir el boleto." }, { status: 409 });

    await db().from("transfers").insert({
      ticket_id: ticket.id,
      from_name: ticket.attendee_name,
      to_name: a.attendeeName,
      to_email: a.attendeeEmail || null,
    });

    const t = updated as TicketRow;
    if (t.attendee_email) {
      const pdf = await ticketsPdf([toPdfTicket(t, order.quantity)]);
      await sendTicketToAttendee({
        to: t.attendee_email,
        attendeeName: t.attendee_name,
        fromName: order.buyer_name,
        ticketUrl: ticketUrl(t.code, t.version),
        code: t.code,
        pdf,
        transferred: true,
      }).catch((e) => console.error("transfer email failed", e));
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof NotConfiguredError) return NextResponse.json({ error: err.message }, { status: 503 });
    console.error("transfer failed", err);
    return NextResponse.json({ error: "No pudimos transferir el boleto." }, { status: 500 });
  }
}

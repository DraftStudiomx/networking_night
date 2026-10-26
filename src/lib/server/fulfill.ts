import "server-only";
import { db, type TicketRow } from "./db";
import { ticketsPdf, type PdfTicket } from "./pdf";
import { sendOrderConfirmed, sendTicketToAttendee } from "./email";
import { orderUrl, ticketUrl } from "./tokens";

export const toPdfTicket = (t: TicketRow, total: number): PdfTicket => ({
  code: t.code,
  version: t.version,
  position: t.position,
  total,
  attendeeName: t.attendee_name,
  membership: t.attendee_membership,
  chapter: t.attendee_chapter,
});

/**
 * Marks an order paid, validates its tickets and emails them. Idempotent: Stripe can
 * deliver the same event more than once, so a second call for a paid order does nothing.
 */
export async function fulfillOrder(orderId: string, paymentIntent: string | null, method: string | null) {
  const { data: order } = await db()
    .from("orders")
    .update({ status: "paid", paid_at: new Date().toISOString(), stripe_payment_intent: paymentIntent, payment_method: method })
    .eq("id", orderId)
    .neq("status", "paid")
    .select("id, access_token, buyer_name, buyer_email, total_mxn")
    .maybeSingle();
  if (!order) return; // already fulfilled

  const { data: tickets } = await db()
    .from("tickets")
    .update({ status: "valid" })
    .eq("order_id", orderId)
    .select("*")
    .order("position");
  const list = (tickets ?? []) as TicketRow[];

  // The tickets are already valid at this point. A mail failure must not fail the webhook
  // (the order would never be retried, since it is now paid); the panel can resend it.
  try {
    const pdf = await ticketsPdf(list.map((t) => toPdfTicket(t, list.length)));
    await sendOrderConfirmed({
      to: order.buyer_email,
      buyerName: order.buyer_name,
      orderUrl: orderUrl(order.access_token),
      tickets: list.map((t) => ({ attendeeName: t.attendee_name, code: t.code })),
      totalMXN: order.total_mxn,
      pdf,
    });

    // guests with their own email get their own ticket
    for (const t of list) {
      if (!t.attendee_email || t.attendee_email === order.buyer_email) continue;
      const single = await ticketsPdf([toPdfTicket(t, list.length)]);
      await sendTicketToAttendee({
        to: t.attendee_email,
        attendeeName: t.attendee_name,
        fromName: order.buyer_name,
        ticketUrl: ticketUrl(t.code, t.version),
        code: t.code,
        pdf: single,
      });
    }
  } catch (e) {
    console.error(`order ${orderId} paid but email failed; resend from /admin`, e);
  }
}

export async function expireOrder(orderId: string) {
  await db().from("orders").update({ status: "expired" }).eq("id", orderId).eq("status", "pending");
  await db().from("tickets").update({ status: "void" }).eq("order_id", orderId).eq("status", "pending");
}

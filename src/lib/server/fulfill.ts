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
 * Emails the buyer every valid ticket of a paid order (PDF attached) and records the
 * outcome on the order, so the panel shows "Correo pendiente" and the daily job retries.
 * Throws when the email could not be sent.
 */
export async function sendOrderEmail(orderId: string) {
  try {
    const { data: order } = await db()
      .from("orders")
      .select("access_token, buyer_name, buyer_email, total_mxn")
      .eq("id", orderId)
      .single();
    const { data } = await db().from("tickets").select("*").eq("order_id", orderId).eq("status", "valid").order("position");
    const list = (data ?? []) as TicketRow[];
    if (!order || list.length === 0) throw new Error("Pedido sin boletos válidos.");
    await sendOrderConfirmed({
      to: order.buyer_email,
      buyerName: order.buyer_name,
      orderUrl: orderUrl(order.access_token),
      tickets: list.map((t) => ({ attendeeName: t.attendee_name, code: t.code })),
      totalMXN: order.total_mxn,
      pdf: await ticketsPdf(list.map((t) => toPdfTicket(t, list.length))),
    });
    await markEmail(orderId, "sent");
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await markEmail(orderId, "failed", message);
    throw e;
  }
}

export const markEmail = (orderId: string, status: "sent" | "failed" | "skipped", error: string | null = null) =>
  db().from("orders").update({ email_status: status, email_error: error, email_at: new Date().toISOString() }).eq("id", orderId);

// Paid orders still owed their email: failed ones, and ones never attempted (a crash
// between payment and email) once they are a few minutes old.
const RETRY_AFTER_MS = 15 * 60_000;

/** Daily retry for ticket emails that didn't go out. Stops early once Resend is at its limit. */
export async function retryPendingEmails(limit = 30) {
  const { data } = await db()
    .from("orders")
    .select("id")
    .eq("status", "paid")
    .or("email_status.is.null,email_status.eq.failed")
    .lt("paid_at", new Date(Date.now() - RETRY_AFTER_MS).toISOString())
    .order("paid_at")
    .limit(limit);
  let sent = 0;
  for (const { id } of data ?? []) {
    try {
      await sendOrderEmail(id);
      sent++;
    } catch (e) {
      console.error(`retry email for order ${id} failed`, e);
      if (/quota|limit|429/i.test(e instanceof Error ? e.message : "")) break;
    }
  }
  return { tried: data?.length ?? 0, sent };
}

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
    .select("id, buyer_name, buyer_email")
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
  // (the order would never be retried, since it is now paid): it is recorded on the order
  // and retried daily, and the panel can resend it.
  try {
    await sendOrderEmail(orderId);
  } catch (e) {
    console.error(`order ${orderId} paid but email failed; will retry`, e);
    return;
  }

  // guests with their own email get their own ticket; the buyer already has all of them
  for (const t of list) {
    if (!t.attendee_email || t.attendee_email === order.buyer_email) continue;
    try {
      await sendTicketToAttendee({
        to: t.attendee_email,
        attendeeName: t.attendee_name,
        fromName: order.buyer_name,
        ticketUrl: ticketUrl(t.code, t.version),
        code: t.code,
        pdf: await ticketsPdf([toPdfTicket(t, list.length)]),
      });
    } catch (e) {
      console.error(`order ${orderId}: guest email to ticket ${t.code} failed`, e);
    }
  }
}

export async function expireOrder(orderId: string) {
  await db().from("orders").update({ status: "expired" }).eq("id", orderId).eq("status", "pending");
  await db().from("tickets").update({ status: "void" }).eq("order_id", orderId).eq("status", "pending");
}

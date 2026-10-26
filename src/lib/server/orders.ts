import "server-only";
import { db, type OrderRow, type TicketRow } from "./db";
import { readTicketToken } from "./tokens";

export async function orderByToken(accessToken: string) {
  const { data: order } = await db()
    .from("orders")
    .select("id, access_token, buyer_name, buyer_email, quantity, total_mxn, status, payment_method, created_at")
    .eq("access_token", accessToken)
    .maybeSingle();
  if (!order) return null;
  const { data: tickets } = await db().from("tickets").select("*").eq("order_id", order.id).order("position");
  return { order: order as OrderRow, tickets: (tickets ?? []) as TicketRow[] };
}

/** Resolves a QR/link token to its ticket; null when forged, unknown or superseded by a transfer. */
export async function ticketByToken(token: string) {
  const parsed = readTicketToken(decodeURIComponent(token));
  if (!parsed) return null;
  const { data } = await db().from("tickets").select("*").eq("code", parsed.code).maybeSingle();
  const ticket = data as TicketRow | null;
  if (!ticket) return null;
  const { count } = await db().from("tickets").select("id", { count: "exact", head: true }).eq("order_id", ticket.order_id);
  return { ticket, total: count ?? 1, current: ticket.version === parsed.version };
}

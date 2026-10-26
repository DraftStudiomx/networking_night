import "server-only";
import { db, type TicketRow } from "./db";
import { readTicketToken } from "./tokens";
import { memberLine } from "../event";

export type ScanResult =
  | { result: "valid" | "duplicate"; ticket: TicketView; firstAt?: string; firstBy?: string | null }
  | { result: "invalid" | "unpaid" | "superseded"; message: string; ticket?: TicketView };

export type TicketView = {
  id: string;
  code: string;
  attendee: string;
  member: string;
  buyer: string;
  position: number;
  total: number;
};

/** Accepts the full QR URL, a bare token, or (manual entry) a short code. */
export function parseScan(raw: string): { code: string; version: number | null } | null {
  const text = raw.trim();
  const token = text.includes("/boleto/") ? decodeURIComponent(text.split("/boleto/")[1].split(/[?#]/)[0]) : text;
  const signed = readTicketToken(token);
  if (signed) return signed;
  const code = text.toUpperCase().replace(/\s/g, "");
  return /^NN-[2-9A-Z]{6}$/.test(code) ? { code, version: null } : null;
}

async function view(t: TicketRow): Promise<TicketView> {
  const [{ data: order }, { count }] = await Promise.all([
    db().from("orders").select("buyer_name").eq("id", t.order_id).single(),
    db().from("tickets").select("id", { count: "exact", head: true }).eq("order_id", t.order_id),
  ]);
  return {
    id: t.id,
    code: t.code,
    attendee: t.attendee_name,
    member: memberLine(t.attendee_membership, t.attendee_chapter),
    buyer: order?.buyer_name ?? "",
    position: t.position,
    total: count ?? 1,
  };
}

/**
 * Validates a ticket at the door and marks it as entered. The update only succeeds while
 * checked_in_at is still empty, so two scanners can never both admit the same ticket.
 * Every attempt is logged, including rejected ones.
 */
export async function checkIn(raw: string, by: string, opts: { allowCode?: boolean } = {}): Promise<ScanResult> {
  const log = (result: string, ticketId: string | null) =>
    db().from("scans").insert({ ticket_id: ticketId, raw: raw.slice(0, 500), result, scanned_by: by });

  const parsed = parseScan(raw);
  if (!parsed || (parsed.version === null && !opts.allowCode)) {
    await log("invalid", null);
    return { result: "invalid", message: "Este código no es un boleto de Networking Night." };
  }

  const { data } = await db().from("tickets").select("*").eq("code", parsed.code).maybeSingle();
  const ticket = data as TicketRow | null;
  if (!ticket) {
    await log("invalid", null);
    return { result: "invalid", message: "No encontramos este boleto." };
  }
  if (ticket.status !== "valid") {
    await log("unpaid", ticket.id);
    return { result: "unpaid", message: "Este boleto no está pagado o fue cancelado.", ticket: await view(ticket) };
  }
  if (parsed.version !== null && parsed.version !== ticket.version) {
    await log("invalid", ticket.id);
    return {
      result: "superseded",
      message: "Este QR es de antes de una transferencia. Pide el boleto actual.",
      ticket: await view(ticket),
    };
  }

  const { data: entered } = await db()
    .from("tickets")
    .update({ checked_in_at: new Date().toISOString(), checked_in_by: by })
    .eq("id", ticket.id)
    .is("checked_in_at", null)
    .select("*")
    .maybeSingle();

  if (entered) {
    await log("valid", ticket.id);
    return { result: "valid", ticket: await view(entered as TicketRow) };
  }

  const { data: again } = await db().from("tickets").select("checked_in_at, checked_in_by").eq("id", ticket.id).single();

  // The same scanner re-reading the QR it just admitted (still in front of the camera)
  // is not a second entry: show "puede pasar" again instead of a false alarm.
  const sinceEntry = again?.checked_in_at ? Date.now() - new Date(again.checked_in_at).getTime() : Infinity;
  if (again?.checked_in_by === by && sinceEntry < 20_000) {
    return { result: "valid", ticket: await view(ticket) };
  }

  await log("duplicate", ticket.id);
  return { result: "duplicate", ticket: await view(ticket), firstAt: again?.checked_in_at, firstBy: again?.checked_in_by };
}

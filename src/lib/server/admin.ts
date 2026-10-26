import "server-only";
import { db } from "./db";
import { memberLine, type Membership } from "../event";

export type AdminTicket = {
  id: string;
  code: string;
  position: number;
  attendee: string;
  attendeeEmail: string | null;
  membership: Membership;
  chapter: string | null;
  member: string;
  checkedInAt: string | null;
  checkedInBy: string | null;
  orderId: string;
  buyer: string;
  buyerEmail: string;
  buyerPhone: string;
  orderStatus: "pending" | "paid" | "expired" | "canceled";
  method: string | null;
  createdAt: string;
};

export type Duplicate = {
  at: string;
  by: string;
  ticket: AdminTicket | undefined;
};

// Stripe MX, IVA included. OXXO falls under "local methods". Estimates only.
const fee = (amount: number, method: string | null) => {
  if (method === "manual") return 0;
  const pct = method === "oxxo" ? 0.04 : 0.036;
  return (amount * pct + 3) * 1.16;
};

/** Groups free-text chapter names: "pioneros", "BNI Pioneros " and "Pioneros" count as one. */
export const chapterKey = (c: string | null) =>
  (c ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/^bni\s+/, "")
    .trim();

export async function loadDashboard() {
  const [{ data: orders }, { data: tickets }, { data: dupes }, { data: setting }] = await Promise.all([
    db()
      .from("orders")
      .select("id, buyer_name, buyer_email, buyer_phone, status, payment_method, total_mxn, quantity, created_at"),
    db()
      .from("tickets")
      .select(
        "id, order_id, code, position, attendee_name, attendee_email, attendee_membership, attendee_chapter, checked_in_at, checked_in_by, status",
      ),
    db().from("scans").select("ticket_id, scanned_by, created_at").eq("result", "duplicate").order("created_at", { ascending: false }),
    db().from("settings").select("value").eq("key", "sales_open").maybeSingle(),
  ]);

  const byOrder = new Map((orders ?? []).map((o) => [o.id, o]));
  const all: AdminTicket[] = (tickets ?? []).flatMap((t) => {
    const o = byOrder.get(t.order_id);
    if (!o || t.status === "void") return [];
    return [
      {
        id: t.id,
        code: t.code,
        position: t.position,
        attendee: t.attendee_name,
        attendeeEmail: t.attendee_email,
        membership: t.attendee_membership as Membership,
        chapter: t.attendee_chapter,
        member: memberLine(t.attendee_membership as Membership, t.attendee_chapter),
        checkedInAt: t.checked_in_at,
        checkedInBy: t.checked_in_by,
        orderId: o.id,
        buyer: o.buyer_name,
        buyerEmail: o.buyer_email,
        buyerPhone: o.buyer_phone,
        orderStatus: o.status,
        method: o.payment_method,
        createdAt: o.created_at,
      },
    ];
  });
  all.sort((a, b) => a.attendee.localeCompare(b.attendee, "es"));

  const paid = all.filter((t) => t.orderStatus === "paid");
  const paidOrders = (orders ?? []).filter((o) => o.status === "paid");
  const gross = paidOrders.reduce((n, o) => n + o.total_mxn, 0);
  const fees = paidOrders.reduce((n, o) => n + fee(o.total_mxn, o.payment_method), 0);

  // members grouped by chapter, most attendees first; guests as their own row
  const groups = new Map<string, { label: string; count: number }>();
  for (const t of paid.filter((t) => t.membership === "miembro")) {
    const key = chapterKey(t.chapter) || "sin capítulo";
    const g = groups.get(key) ?? { label: (t.chapter ?? "").replace(/^bni\s+/i, "").trim() || "Sin capítulo", count: 0 };
    g.count++;
    groups.set(key, g);
  }
  const chapters = [...groups.values()].sort((a, b) => b.count - a.count);

  const ticketById = new Map(all.map((t) => [t.id, t]));
  const duplicates: Duplicate[] = (dupes ?? []).map((d) => ({
    at: d.created_at,
    by: d.scanned_by,
    ticket: d.ticket_id ? ticketById.get(d.ticket_id) : undefined,
  }));

  return {
    tickets: all,
    stats: {
      sold: paid.length,
      orders: paidOrders.length,
      gross,
      net: Math.round(gross - fees),
      pendingOxxo: (orders ?? []).filter((o) => o.status === "pending").reduce((n, o) => n + o.quantity, 0),
      checkedIn: paid.filter((t) => t.checkedInAt).length,
      members: paid.filter((t) => t.membership === "miembro").length,
      guests: paid.filter((t) => t.membership === "invitado").length,
    },
    chapters,
    duplicates,
    salesOpen: setting?.value !== false,
  };
}

export type Dashboard = Awaited<ReturnType<typeof loadDashboard>>;

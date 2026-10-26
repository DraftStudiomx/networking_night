import "server-only";
import { EVENT } from "../event";
import { db } from "./db";
import { sendReminders, type Reminder } from "./email";
import { orderUrl, ticketUrl } from "./tokens";

// Resend's free plan allows 100 emails a day, purchases included, so each daily run
// sends at most this many and leaves room for that day's ticket emails.
const BATCH = Number(process.env.REMINDER_BATCH ?? 60);
const SENT_KEY = "reminders_sent";
// Reminders go out from 24 Nov (León time) until the event starts.
const OPENS = "2026-11-24T00:00:00-06:00";

type Row = {
  attendee_name: string;
  attendee_email: string | null;
  code: string;
  version: number;
  orders: { access_token: string; buyer_name: string; buyer_email: string; status: string };
};

/**
 * One reminder per address: guests who gave their own email get their ticket, the buyer
 * gets the rest of the order. Addresses already reminded are skipped.
 */
async function pending(): Promise<Reminder[]> {
  const { data, error } = await db()
    .from("tickets")
    .select("attendee_name, attendee_email, code, version, orders!inner(access_token, buyer_name, buyer_email, status)")
    .eq("status", "valid")
    .eq("orders.status", "paid")
    .order("created_at");
  if (error) throw error;

  const byEmail = new Map<string, Reminder>();
  for (const t of (data ?? []) as unknown as Row[]) {
    const buyer = t.orders.buyer_email.toLowerCase();
    const own = t.attendee_email?.toLowerCase();
    const guest = own && own !== buyer;
    const to = guest ? own : buyer;
    const r =
      byEmail.get(to) ??
      byEmail
        .set(to, {
          to,
          name: guest ? t.attendee_name : t.orders.buyer_name,
          url: guest ? ticketUrl(t.code, t.version) : orderUrl(t.orders.access_token),
          tickets: [],
        })
        .get(to)!;
    r.tickets.push({ attendeeName: t.attendee_name, code: t.code });
  }

  const sent = await sentList();
  return [...byEmail.values()].filter((r) => !sent[r.to]);
}

async function sentList(): Promise<Record<string, string>> {
  const { data } = await db().from("settings").select("value").eq("key", SENT_KEY).maybeSingle();
  return (data?.value as Record<string, string>) ?? {};
}

export async function sendReminderBatch(now = new Date()) {
  if (now < new Date(OPENS) || now >= new Date(EVENT.startsAt)) return { skipped: "fuera de fechas" };

  const batch = (await pending()).slice(0, BATCH);
  if (!batch.length) return { sent: 0, left: 0 };

  const { error } = await sendReminders(batch);
  if (error) throw new Error(error.message);

  // re-read so a run that overlaps another doesn't drop its marks
  const sent = await sentList();
  const at = now.toISOString();
  for (const r of batch) sent[r.to] = at;
  await db().from("settings").upsert({ key: SENT_KEY, value: sent });

  return { sent: batch.length, left: (await pending()).length };
}

import { sendReminderBatch } from "@/lib/server/reminders";

export const runtime = "nodejs";

// Vercel cron, once a day from 24 to 27 Nov: sends the next batch of pre-event reminders.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("No autorizado", { status: 401 });
  }
  try {
    // in development, ?now=2026-11-24T10:00:00-06:00 rehearses a run on another date
    const now = process.env.NODE_ENV === "production" ? null : new URL(req.url).searchParams.get("now");
    const result = await sendReminderBatch(now ? new Date(now) : undefined);
    console.log("reminders", result);
    return Response.json(result);
  } catch (e) {
    console.error("reminders failed", e);
    return new Response(`error: ${e instanceof Error ? e.message : String(e)}`, { status: 500 });
  }
}

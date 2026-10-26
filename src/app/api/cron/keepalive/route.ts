import { db } from "@/lib/server/db";
import { retryPendingEmails } from "@/lib/server/fulfill";

export const runtime = "nodejs";

// Daily Vercel cron (9:00 am León). One tiny query so the free Supabase project never hits
// its 7-day inactivity pause, then a retry of ticket emails that didn't go out (Resend's
// daily limit, a bad moment). It runs an hour before the reminders, which take the rest of
// the day's quota. Vercel signs cron calls with CRON_SECRET.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("No autorizado", { status: 401 });
  }
  const { error } = await db().from("settings").select("key").limit(1);
  if (error) return new Response(`error: ${error.message}`, { status: 500 });

  const emails = await retryPendingEmails();
  console.log("pending emails", emails);
  return Response.json({ ok: true, emails });
}

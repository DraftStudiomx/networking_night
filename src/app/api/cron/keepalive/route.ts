import { db } from "@/lib/server/db";

// Daily Vercel cron: one tiny query so the free Supabase project never hits its
// 7-day inactivity pause before the event. Vercel signs cron calls with CRON_SECRET.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("No autorizado", { status: 401 });
  }
  const { error } = await db().from("settings").select("key").limit(1);
  return error ? new Response(`error: ${error.message}`, { status: 500 }) : new Response("ok");
}

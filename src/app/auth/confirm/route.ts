import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { authClient } from "@/lib/server/auth";

// Email-link landing that works on any device: the link carries a one-time token hash,
// so it doesn't need the browser where the link was requested (unlike the code flow).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = (url.searchParams.get("type") ?? "email") as EmailOtpType;
  const next = url.searchParams.get("next") ?? "/admin";
  const dest = next.startsWith("/") && !next.startsWith("//") ? next : "/admin";

  if (tokenHash) {
    const { error } = await (await authClient()).auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL(dest, url.origin));
    console.error("email link verify failed", error.status, error.code, error.message);
  }
  return NextResponse.redirect(new URL(`/acceso?error=1&next=${encodeURIComponent(dest)}`, url.origin));
}

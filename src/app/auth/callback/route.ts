import { NextResponse } from "next/server";
import { authClient } from "@/lib/server/auth";

// Magic-link landing: trade the one-time code for a session cookie, then continue.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/admin";
  const dest = next.startsWith("/") && !next.startsWith("//") ? next : "/admin";

  if (code) {
    const { error } = await (await authClient()).auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(dest, url.origin));
  }
  return NextResponse.redirect(new URL(`/acceso?error=1&next=${encodeURIComponent(dest)}`, url.origin));
}

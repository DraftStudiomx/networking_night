import { NextResponse } from "next/server";
import { z } from "zod";
import { authClient } from "@/lib/server/auth";

const body = z.union([
  z.object({ access_token: z.string().min(10), refresh_token: z.string().min(5) }),
  z.object({ code: z.string().min(5) }),
]);

// Turns the tokens (or code) from an emailed sign-in link into the session cookie.
export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enlace inválido." }, { status: 400 });

  const auth = (await authClient()).auth;
  const { error } =
    "code" in parsed.data
      ? await auth.exchangeCodeForSession(parsed.data.code)
      : await auth.setSession(parsed.data);

  if (error) {
    console.error("session from link failed", error.status, error.code, error.message);
    return NextResponse.json({ error: "El enlace venció o ya se usó." }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}

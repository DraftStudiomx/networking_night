import { NextResponse } from "next/server";
import { currentStaff } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { memberLine, type Membership } from "@/lib/event";

// Manual lookup at the door, for a QR that won't read: by code or attendee name.
export async function GET(req: Request) {
  const user = await currentStaff();
  if (!user) return NextResponse.json({ error: "Sesión vencida. Vuelve a entrar." }, { status: 401 });

  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ results: [] });
  const term = q.replace(/[%_,()]/g, " ");

  const { data } = await db()
    .from("tickets")
    .select("id, code, attendee_name, attendee_membership, attendee_chapter, status, checked_in_at")
    .or(`code.ilike.%${term}%,attendee_name.ilike.%${term}%`)
    .eq("status", "valid")
    .order("attendee_name")
    .limit(15);

  return NextResponse.json({
    results: (data ?? []).map((t) => ({
      id: t.id,
      code: t.code,
      attendee: t.attendee_name,
      member: memberLine(t.attendee_membership as Membership, t.attendee_chapter),
      checkedInAt: t.checked_in_at,
    })),
  });
}

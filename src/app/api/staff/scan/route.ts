import { NextResponse } from "next/server";
import { z } from "zod";
import { currentStaff } from "@/lib/server/auth";
import { checkIn } from "@/lib/server/checkin";

const body = z.object({ raw: z.string().min(1).max(1000), manual: z.boolean().optional() });

export async function POST(req: Request) {
  const user = await currentStaff();
  if (!user) return NextResponse.json({ error: "Sesión vencida. Vuelve a entrar." }, { status: 401 });
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Lectura vacía." }, { status: 400 });
  return NextResponse.json(await checkIn(parsed.data.raw, user.email, { allowCode: parsed.data.manual }));
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { EVENT } from "@/lib/event";
import { orderAccessToken, ticketCode } from "@/lib/server/tokens";
import { markEmail, sendOrderEmail } from "@/lib/server/fulfill";

export async function setSalesOpen(open: boolean) {
  await requireStaff("admin", "/admin");
  await db().from("settings").upsert({ key: "sales_open", value: open });
  revalidatePath("/admin");
}

export async function resendOrderEmail(orderId: string): Promise<{ ok?: boolean; error?: string }> {
  await requireStaff("admin", "/admin");
  try {
    await sendOrderEmail(orderId);
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    revalidatePath("/admin");
    return { error: e instanceof Error ? e.message : "No se pudo reenviar." };
  }
}

const manualSchema = z.object({
  buyerName: z.string().trim().min(1, "Escribe el nombre."),
  buyerEmail: z.email("Revisa el correo."),
  buyerPhone: z.string().trim().max(20).optional(),
  membership: z.enum(["miembro", "invitado"]),
  chapter: z.string().trim().max(80).optional(),
  quantity: z.coerce.number().int().min(1).max(EVENT.maxTicketsPerOrder),
  reason: z.enum(["cortesia", "efectivo", "transferencia"]),
  sendEmail: z.boolean(),
});

export type ManualState = { ok?: string; error?: string };

/** Last-resort issue: courtesy or off-site payment. Tickets carry the buyer's name; transfer them afterwards. */
export async function createManualOrder(_: ManualState, form: FormData): Promise<ManualState> {
  const admin = await requireStaff("admin", "/admin");
  const parsed = manualSchema.safeParse({
    buyerName: form.get("buyerName"),
    buyerEmail: String(form.get("buyerEmail") ?? "").toLowerCase(),
    buyerPhone: form.get("buyerPhone") || undefined,
    membership: form.get("membership"),
    chapter: form.get("chapter") || undefined,
    quantity: form.get("quantity"),
    reason: form.get("reason"),
    sendEmail: form.get("sendEmail") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  const m = parsed.data;
  if (m.membership === "miembro" && !m.chapter) return { error: "Escribe el capítulo." };

  const price = m.reason === "cortesia" ? 0 : EVENT.priceMXN;
  const { data: order, error } = await db()
    .from("orders")
    .insert({
      access_token: orderAccessToken(),
      buyer_name: m.buyerName,
      buyer_email: m.buyerEmail,
      buyer_phone: m.buyerPhone ?? "",
      buyer_membership: m.membership,
      buyer_chapter: m.membership === "miembro" ? m.chapter : null,
      quantity: m.quantity,
      unit_price_mxn: price,
      total_mxn: price * m.quantity,
      status: "paid",
      payment_method: "manual",
      stripe_payment_intent: `manual:${m.reason}:${admin.email}`,
      privacy_accepted_at: new Date().toISOString(),
      paid_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error || !order) return { error: "No se pudo crear el pedido." };

  await db()
    .from("tickets")
    .insert(
      Array.from({ length: m.quantity }, (_, i) => ({
        order_id: order.id,
        position: i + 1,
        code: ticketCode(),
        attendee_name: m.buyerName,
        attendee_membership: m.membership,
        attendee_chapter: m.membership === "miembro" ? m.chapter : null,
        status: "valid",
      })),
    );

  let mailed = "";
  if (m.sendEmail) {
    try {
      await sendOrderEmail(order.id);
      mailed = " y se envió el correo";
    } catch {
      mailed = ", pero el correo no se pudo enviar (queda como pendiente)";
    }
  } else {
    await markEmail(order.id, "skipped");
  }
  revalidatePath("/admin");
  return { ok: `Se crearon ${m.quantity} ${m.quantity === 1 ? "boleto" : "boletos"}${mailed}.` };
}

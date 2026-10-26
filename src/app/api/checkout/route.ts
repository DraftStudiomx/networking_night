import { NextResponse } from "next/server";
import { orderSchema } from "@/lib/schema";
import { EVENT, oxxoAvailable } from "@/lib/event";
import { config, NotConfiguredError } from "@/lib/server/config";
import { db } from "@/lib/server/db";
import { stripe } from "@/lib/server/stripe";
import { orderAccessToken, ticketCode } from "@/lib/server/tokens";

export async function POST(req: Request) {
  const parsed = orderSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Revisa los datos marcados.", issues: parsed.error.issues }, { status: 400 });
  }
  const o = parsed.data;
  const qty = o.attendees.length;
  const chapter = (m: string, v?: string) => (m === "miembro" ? v || null : null);

  try {
    const { data: settings } = await db().from("settings").select("value").eq("key", "sales_open").maybeSingle();
    if (settings && settings.value === false) {
      return NextResponse.json({ error: "La venta de boletos está cerrada." }, { status: 409 });
    }

    const accessToken = orderAccessToken();
    const { data: order, error } = await db()
      .from("orders")
      .insert({
        access_token: accessToken,
        buyer_name: o.buyerName,
        buyer_email: o.buyerEmail.toLowerCase(),
        buyer_phone: o.buyerPhone,
        buyer_membership: o.buyerMembership,
        buyer_chapter: chapter(o.buyerMembership, o.buyerChapter),
        quantity: qty,
        unit_price_mxn: EVENT.priceMXN,
        total_mxn: EVENT.priceMXN * qty,
        privacy_accepted_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error || !order) throw error ?? new Error("order insert failed");

    const { error: tErr } = await db()
      .from("tickets")
      .insert(
        o.attendees.map((a, i) => ({
          order_id: order.id,
          position: i + 1,
          code: ticketCode(),
          attendee_name: a.attendeeName,
          attendee_email: a.attendeeEmail ? a.attendeeEmail.toLowerCase() : null,
          attendee_membership: a.attendeeMembership,
          attendee_chapter: chapter(a.attendeeMembership, a.attendeeChapter),
        })),
      );
    if (tErr) throw tErr;

    const withOxxo = oxxoAvailable();
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      locale: "es",
      customer_email: o.buyerEmail,
      client_reference_id: order.id,
      metadata: { order_id: order.id },
      // filters the methods enabled in the Stripe dashboard; OXXO must be turned on there too
      allowed_payment_method_types: withOxxo ? ["card", "oxxo"] : ["card"],
      ...(withOxxo && { payment_method_options: { oxxo: { expires_after_days: 1 } } }),
      line_items: [
        {
          quantity: qty,
          price_data: {
            currency: "mxn",
            unit_amount: EVENT.priceMXN * 100,
            product_data: {
              name: "Boleto · Networking Night",
              description: "Pioneros & Metamorfosis · Sábado 28 de noviembre de 2026 · Salón Callejón Arroyo, León",
            },
          },
        },
      ],
      success_url: `${config.siteUrl}/gracias?pedido=${accessToken}`,
      cancel_url: `${config.siteUrl}/comprar?cancelado=1`,
    });

    await db().from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof NotConfiguredError) {
      return NextResponse.json(
        { error: "La venta en línea abre muy pronto. Estamos terminando de configurar los pagos." },
        { status: 503 },
      );
    }
    console.error("checkout failed", err);
    return NextResponse.json({ error: "No pudimos iniciar el pago. Intenta de nuevo en un momento." }, { status: 500 });
  }
}

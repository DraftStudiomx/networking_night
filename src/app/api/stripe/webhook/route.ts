import type Stripe from "stripe";
import { config } from "@/lib/server/config";
import { stripe } from "@/lib/server/stripe";
import { expireOrder, fulfillOrder } from "@/lib/server/fulfill";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!config.stripeKey || !config.stripeWebhookSecret) return new Response("not configured", { status: 503 });

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), signature, config.stripeWebhookSecret);
  } catch {
    return new Response("bad signature", { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.order_id;
  if (!orderId) return new Response("ok");

  const intent = typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);
  const method = session.payment_method_types?.length === 1 ? session.payment_method_types[0] : null;

  switch (event.type) {
    // card payments arrive paid here; OXXO arrives unpaid and settles later
    case "checkout.session.completed":
      if (session.payment_status === "paid") await fulfillOrder(orderId, intent, method ?? "card");
      break;
    case "checkout.session.async_payment_succeeded":
      await fulfillOrder(orderId, intent, "oxxo");
      break;
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired":
      await expireOrder(orderId);
      break;
  }
  return new Response("ok");
}

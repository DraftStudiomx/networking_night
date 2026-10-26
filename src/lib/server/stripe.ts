import "server-only";
import Stripe from "stripe";
import { config, need } from "./config";

let client: Stripe | null = null;

export function stripe() {
  if (!client) client = new Stripe(need(config.stripeKey, "Stripe"));
  return client;
}

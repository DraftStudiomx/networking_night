import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config, need } from "./config";
import type { Membership } from "../event";

let client: SupabaseClient | null = null;

/** Service-role client: server only, bypasses RLS. */
export function db() {
  if (!client) {
    client = createClient(need(config.supabaseUrl, "Supabase"), need(config.supabaseServiceKey, "Supabase"), {
      auth: { persistSession: false },
    });
  }
  return client;
}

export type OrderRow = {
  id: string;
  access_token: string;
  buyer_name: string;
  buyer_email: string;
  quantity: number;
  total_mxn: number;
  status: "pending" | "paid" | "expired" | "canceled";
  payment_method: string | null;
  created_at: string;
};

export type TicketRow = {
  id: string;
  order_id: string;
  position: number;
  code: string;
  version: number;
  attendee_name: string;
  attendee_email: string | null;
  attendee_membership: Membership;
  attendee_chapter: string | null;
  status: "pending" | "valid" | "void";
  checked_in_at: string | null;
};

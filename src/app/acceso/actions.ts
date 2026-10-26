"use server";

import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { isAllowedEmail } from "@/lib/server/auth";
import { config, need, NotConfiguredError } from "@/lib/server/config";

// Implicit flow (not PKCE): the emailed link carries the session itself, so it works on
// whatever device opens it, not only in the browser that asked for it.
const linkSender = () =>
  createClient(need(config.supabaseUrl, "Supabase"), need(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "Supabase"), {
    auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false },
  });

export type LoginState = { ok?: boolean; error?: string };

export async function sendMagicLink(_: LoginState, form: FormData): Promise<LoginState> {
  const email = z.email().safeParse(String(form.get("email") ?? "").trim().toLowerCase());
  const next = String(form.get("next") ?? "/admin");
  if (!email.success) return { error: "Revisa tu correo." };

  try {
    // Same answer whether or not the address is on the list, so the form can't be used
    // to discover who the organizers are.
    if (!(await isAllowedEmail(email.data))) return { ok: true };
    const { error } = await linkSender().auth.signInWithOtp({
      email: email.data,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${config.siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      console.error("magic link failed", error.status, error.code, error.message);
      if (error.status === 429 || error.code === "over_email_send_rate_limit") {
        return { error: "Se alcanzó el límite de enlaces por hora. Espera unos minutos e intenta de nuevo." };
      }
      return { error: "No pudimos enviar el enlace. Intenta en un minuto." };
    }
    return { ok: true };
  } catch (e) {
    if (e instanceof NotConfiguredError) return { error: "El acceso todavía no está configurado." };
    throw e;
  }
}

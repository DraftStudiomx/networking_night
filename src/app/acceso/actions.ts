"use server";

import { z } from "zod";
import { authClient, isAllowedEmail } from "@/lib/server/auth";
import { config, NotConfiguredError } from "@/lib/server/config";

export type LoginState = { ok?: boolean; error?: string };

export async function sendMagicLink(_: LoginState, form: FormData): Promise<LoginState> {
  const email = z.email().safeParse(String(form.get("email") ?? "").trim().toLowerCase());
  const next = String(form.get("next") ?? "/admin");
  if (!email.success) return { error: "Revisa tu correo." };

  try {
    // Same answer whether or not the address is on the list, so the form can't be used
    // to discover who the organizers are.
    if (!(await isAllowedEmail(email.data))) return { ok: true };
    const { error } = await (await authClient()).auth.signInWithOtp({
      email: email.data,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${config.siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) return { error: "No pudimos enviar el enlace. Intenta en un minuto." };
    return { ok: true };
  } catch (e) {
    if (e instanceof NotConfiguredError) return { error: "El acceso todavía no está configurado." };
    throw e;
  }
}

import "server-only";

/** Reads a server env var; returns undefined when unset so callers can report "not configured". */
const env = (k: string) => process.env[k]?.trim() || undefined;

export const config = {
  siteUrl: env("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000",
  supabaseUrl: env("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseServiceKey: env("SUPABASE_SERVICE_ROLE_KEY"),
  stripeKey: env("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: env("STRIPE_WEBHOOK_SECRET"),
  resendKey: env("RESEND_API_KEY"),
  emailFrom: env("EMAIL_FROM") ?? "Networking Night <boletos@networking.draftstudio.mx>",
  ticketSecret: env("TICKET_SIGNING_SECRET"),
};

export class NotConfiguredError extends Error {
  constructor(what: string) {
    super(`${what} no está configurado todavía.`);
  }
}

export function need<T>(value: T | undefined, what: string): T {
  if (!value) throw new NotConfiguredError(what);
  return value;
}

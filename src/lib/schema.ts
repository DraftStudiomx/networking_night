import { z } from "zod";
import { EVENT } from "./event";

const required = (label: string) => z.string().trim().min(1, `Escribe ${label}.`);

/** Digits of a Mexican mobile, without the 52 country code, at most 10. */
export const phoneDigits = (v: string) => {
  const d = v.replace(/\D/g, "");
  // +52 477…, or the old mobile form +52 1 477…
  const local = d.length === 13 && d.startsWith("521") ? d.slice(3) : d.length === 12 && d.startsWith("52") ? d.slice(2) : d;
  return local.slice(0, 10);
};
/** "4771234567" → "477 123 4567", also for partial input while typing. */
export const formatPhone = (v: string) => {
  const d = phoneDigits(v);
  return [d.slice(0, 3), d.slice(3, 6), d.slice(6)].filter(Boolean).join(" ");
};

const membership = z.enum(["miembro", "invitado"], { message: "Elige una opción." });

/** BNI members must say which chapter they belong to. */
function withChapter<T extends z.ZodRawShape>(shape: T, prefix: "buyer" | "attendee") {
  return z.object(shape).refine(
    (v: Record<string, unknown>) => v[`${prefix}Membership`] !== "miembro" || !!String(v[`${prefix}Chapter`] ?? "").trim(),
    {
      path: [`${prefix}Chapter`],
      message: "Escribe el nombre del capítulo.",
      // run even when other fields fail, so every error shows on the first submit
      when: () => true,
    },
  );
}

export const attendeeSchema = withChapter(
  {
    attendeeName: required("el nombre del invitado"),
    attendeeEmail: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.union([z.literal(""), z.email("Revisa el correo; por ejemplo nombre@ejemplo.com.")]))
      .optional(),
    attendeeMembership: membership,
    attendeeChapter: z.string().trim().max(80).optional(),
  },
  "attendee",
);

export const orderSchema = withChapter(
  {
    buyerName: required("tu nombre"),
    buyerEmail: z.string().trim().toLowerCase().pipe(z.email("Revisa tu correo; por ejemplo nombre@ejemplo.com.")),
    // stored as "477 123 4567"; a pasted +52 / 52 country code is dropped
    buyerPhone: z
      .string()
      .transform(phoneDigits)
      .refine((d) => d.length === 10, "Escribe tu WhatsApp a 10 dígitos.")
      .transform(formatPhone),
    buyerMembership: membership,
    buyerChapter: z.string().trim().max(80).optional(),
    attendees: z.array(attendeeSchema).min(1).max(EVENT.maxTicketsPerOrder),
    privacy: z.literal(true, { message: "Necesitamos tu aceptación del aviso de privacidad." }),
  },
  "buyer",
);

export type OrderInput = z.infer<typeof orderSchema>;
export type AttendeeInput = z.infer<typeof attendeeSchema>;

export const transferSchema = z.object({
  orderToken: z.string().min(20),
  ticketId: z.uuid(),
  attendee: attendeeSchema,
});

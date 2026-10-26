import { z } from "zod";
import { EVENT } from "./event";

const required = (label: string) => z.string().trim().min(1, `Escribe ${label}.`);

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
    attendeeEmail: z.union([z.literal(""), z.email("Revisa el correo.")]).optional(),
    attendeeMembership: membership,
    attendeeChapter: z.string().trim().max(80).optional(),
  },
  "attendee",
);

export const orderSchema = withChapter(
  {
    buyerName: required("tu nombre"),
    buyerEmail: z.email("Revisa tu correo."),
    buyerPhone: z
      .string()
      .trim()
      .regex(/^[\d\s+()-]{10,20}$/, "Escribe un teléfono de 10 dígitos."),
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

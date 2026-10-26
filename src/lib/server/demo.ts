import "server-only";
import type { AdminTicket, Dashboard } from "./admin";
import { memberLine } from "../event";

// Synthetic data for reviewing the organizer screens in development (/admin?demo=1).
// Names are invented; nothing here reaches production.
const PEOPLE: [string, "miembro" | "invitado", string | null][] = [
  ["Ana Lucía Torres", "miembro", "Pioneros"],
  ["Roberto Gómez", "invitado", null],
  ["Mariana Pérez", "miembro", "Metamorfosis"],
  ["Jorge Ramírez", "miembro", "pioneros"],
  ["Daniela Ortiz", "invitado", null],
  ["Luis Hernández", "miembro", "BNI Milenio"],
  ["Sofía Castillo", "miembro", "Metamorfosis"],
  ["Carlos Mendoza", "invitado", null],
  ["Fernanda Ruiz", "miembro", "Pioneros"],
  ["Miguel Ángel Soto", "miembro", "Magia León"],
];

export function demoDashboard(): Dashboard {
  const now = Date.now();
  const tickets: AdminTicket[] = PEOPLE.map(([name, m, chapter], i) => ({
    id: `demo-${i}`,
    code: `NN-${"ABCDEFGHJK"[i]}7K9Q${i}`,
    position: 1,
    attendee: name,
    attendeeEmail: null,
    membership: m,
    chapter,
    member: memberLine(m, chapter),
    checkedInAt: i < 3 ? new Date(now - i * 600_000).toISOString() : null,
    checkedInBy: i < 3 ? "staff@draftstudio.mx" : null,
    orderId: `order-${i}`,
    buyer: name,
    buyerEmail: `${name.split(" ")[0].toLowerCase()}@ejemplo.com`,
    buyerPhone: "477 123 4567",
    orderStatus: i === 7 ? "pending" : "paid",
    method: i === 7 ? "oxxo" : i === 9 ? "manual" : "card",
    createdAt: new Date(now - i * 86_400_000).toISOString(),
  }));
  return {
    tickets,
    stats: { sold: 9, orders: 9, gross: 5400, net: 5143, pendingOxxo: 1, checkedIn: 3, members: 7, guests: 2 },
    chapters: [
      { label: "Pioneros", count: 3 },
      { label: "Metamorfosis", count: 2 },
      { label: "Milenio", count: 1 },
      { label: "Magia León", count: 1 },
    ],
    duplicates: [{ at: new Date(now - 120_000).toISOString(), by: "staff@draftstudio.mx", ticket: tickets[0] }],
    salesOpen: true,
  };
}

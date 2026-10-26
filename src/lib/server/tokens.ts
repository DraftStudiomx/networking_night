import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { config, need } from "./config";

// Unambiguous alphabet (no 0/O, 1/I/L) for codes people may read aloud at the door.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function ticketCode() {
  const bytes = randomBytes(6);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return `NN-${out.slice(0, 3)}${out.slice(3)}`;
}

export function orderAccessToken() {
  return randomBytes(24).toString("base64url");
}

const sign = (payload: string) =>
  createHmac("sha256", need(config.ticketSecret, "La firma de boletos"))
    .update(payload)
    .digest("base64url")
    .slice(0, 22);

/** QR token: code + version + signature. A transfer bumps the version and voids older QRs. */
export function ticketToken(code: string, version: number) {
  const payload = `${code}.${version}`;
  return `${payload}.${sign(payload)}`;
}

export function readTicketToken(token: string): { code: string; version: number } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [code, v, sig] = parts;
  const expected = sign(`${code}.${v}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const version = Number(v);
  return Number.isInteger(version) ? { code, version } : null;
}

export const ticketUrl = (code: string, version: number) => `${config.siteUrl}/boleto/${ticketToken(code, version)}`;
export const orderUrl = (accessToken: string) => `${config.siteUrl}/pedido/${accessToken}`;

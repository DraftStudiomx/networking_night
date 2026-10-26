import type { Metadata } from "next";
import { OpsBar } from "@/components/OpsBar";
import { requireStaff } from "@/lib/server/auth";
import { Scanner } from "./Scanner";
import s from "../ops.module.css";

export const metadata: Metadata = { title: "Escáner · Networking Night", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Staff({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  // ?demo=1 shows the screen in development without signing in (scans will fail)
  const demo = process.env.NODE_ENV !== "production" && (await searchParams).demo === "1";
  const user = demo ? { email: "demo@draftstudio.mx", role: "admin" as const } : await requireStaff("staff", "/staff");
  return (
    <>
      <OpsBar email={user.email} role={user.role} active="staff" />
      <main className={s.scanPage}>
        <Scanner />
      </main>
    </>
  );
}

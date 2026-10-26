import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { oxxoAvailable } from "@/lib/event";
import { BuyForm } from "./BuyForm";

export const metadata: Metadata = { title: "Boletos · Networking Night" };
// OXXO availability depends on today's date
export const dynamic = "force-dynamic";

export default async function Comprar({ searchParams }: { searchParams: Promise<{ cancelado?: string }> }) {
  const { cancelado } = await searchParams;
  return (
    <>
      <SiteHeader />
      <main>
        <BuyForm oxxo={oxxoAvailable()} canceled={cancelado === "1"} />
      </main>
      <SiteFooter />
    </>
  );
}

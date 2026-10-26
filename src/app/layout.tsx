import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const display = localFont({
  src: "../fonts/forum-latin-400-normal.woff2",
  variable: "--font-display",
  display: "swap",
});

const label = localFont({
  src: [
    { path: "../fonts/josefin-sans-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/josefin-sans-latin-600-normal.woff2", weight: "600" },
  ],
  variable: "--font-label",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://networking.draftstudio.mx";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Networking Night · Save the Date",
  description:
    "Pioneros y Metamorfosis se dan el sí. Sábado 28 de noviembre, 4:00 pm, Salón Callejón Arroyo, León. Boletos $600.",
  openGraph: {
    title: "Networking Night · Save the Date",
    description: "Pioneros & Metamorfosis · Sábado 28 de noviembre · Salón Callejón Arroyo, León.",
    locale: "es_MX",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#e9e7e1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-intro is set by the Intro component's inline script before hydration
    <html lang="es-MX" className={`${display.variable} ${label.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

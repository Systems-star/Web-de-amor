import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const requestedHost = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "";
  const productionHost = "galaxia-para-yeckis.jolly-perch-8014.chatgpt.site";
  const isLocalHost = /^(localhost|127\.0\.0\.1)(:\d{1,5})?$/.test(requestedHost);
  const host = requestedHost === productionHost || isLocalHost ? requestedHost : productionHost;
  const protocol = isLocalHost ? "http" : "https";
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title: "Para mi novia Yeckis ✦",
    description: "Una galaxia de amor creada especialmente para Yeckis.",
    openGraph: {
      title: "Para mi novia Yeckis",
      description: "Una galaxia de amor creada especialmente para ti.",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "Un corazón formado por estrellas para Yeckis" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Para mi novia Yeckis",
      description: "Una galaxia de amor creada especialmente para ti.",
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${sans.variable}`}>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Souk Digital — Marketplace Marocaine", template: "%s | Souk Digital" },
  description: "La première marketplace 100% marocaine. Artisanat, mode, beauté, électronique et plus — livraison partout au Maroc.",
  keywords: ["marketplace maroc", "artisanat marocain", "e-commerce maroc", "souk digital"],
  openGraph: {
    title: "Souk Digital",
    description: "La première marketplace 100% marocaine",
    locale: "fr_MA",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning className={`${cairo.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}

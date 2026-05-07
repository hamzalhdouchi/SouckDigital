import type { Metadata } from "next";
import "./globals.css";

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
  return children;
}

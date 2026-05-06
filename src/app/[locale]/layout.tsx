import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { routing, isRTL } from "@/i18n/routing";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import CartDrawer from "@/components/layout/cart-drawer";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "sonner";

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  return {
    title: isArabic ? "سوق الرقمي — متجر المغرب الإلكتروني" : "Souk Digital — Marketplace Marocaine",
    description: isArabic
      ? "أول متجر إلكتروني مغربي 100٪ — صناعة تقليدية، أزياء، جمال، إلكترونيات وأكثر"
      : "La première marketplace 100% marocaine — artisanat, mode, beauté, électronique et plus",
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();
  const dir = isRTL(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-souk-sand font-cairo antialiased">
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <Header locale={locale} />
            <main className="flex-1">{children}</main>
            <Footer locale={locale} />
            <MobileNav locale={locale} />
            <CartDrawer locale={locale} isAr={isRTL(locale)} />
            <Toaster richColors position="top-right" />
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

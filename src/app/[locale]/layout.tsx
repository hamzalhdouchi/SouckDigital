import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { routing, isRTL } from "@/i18n/routing";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthHydration } from "@/components/providers/auth-hydration";
import { Toaster } from "sonner";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

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
    <html lang={locale} dir={dir} suppressHydrationWarning className={cairo.variable}>
      <body className="min-h-screen flex flex-col bg-souk-sand font-cairo antialiased">
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <AuthHydration>
              {children}
            </AuthHydration>
            <Toaster richColors position="top-right" />
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

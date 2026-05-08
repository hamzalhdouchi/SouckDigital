import { Suspense } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import CartDrawer from "@/components/layout/cart-drawer";
import DashboardBanner from "@/components/modules/dashboard-banner";
import { isRTL } from "@/i18n/routing";

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function MainLayout({ children, params }: Props) {
  const { locale } = await params;
  const isAr = isRTL(locale);

  return (
    <>
      <DashboardBanner locale={locale} />
      <Suspense>
        <Header locale={locale} />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
      <MobileNav locale={locale} />
      <CartDrawer locale={locale} isAr={isAr} />
    </>
  );
}

import type { Metadata } from "next";
import { serverGet } from "@/lib/api/client";
import type { VendorDetailDto } from "@/lib/api/vendors";
import VendorStorefrontPage from "./vendor-content";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const vendor = await serverGet<VendorDetailDto>(`/vendors/${slug}`);
    const name = locale === "ar" ? (vendor.nameAr ?? vendor.name) : vendor.name;
    return {
      title: `${name} — Souk Digital`,
      description:
        locale === "ar"
          ? `تسوق منتجات ${name} من ${vendor.city} على Souk Digital`
          : `Découvrez les produits de ${name} à ${vendor.city} sur Souk Digital`,
    };
  } catch {
    return { title: "Vendeur — Souk Digital" };
  }
}

export default function Page() {
  return <VendorStorefrontPage />;
}

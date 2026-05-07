import type { Metadata } from "next";
import { serverGet } from "@/lib/api/client";
import type { CategoryResponse } from "@/lib/api/types";
import CategoryPage from "./category-content";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const category = await serverGet<CategoryResponse>(`/categories/${slug}`);
    const name = locale === "ar" ? (category.nameAr || category.name) : category.name;
    return {
      title: `${name} — Souk Digital`,
      description:
        locale === "ar"
          ? `تسوق أفضل منتجات ${name} من أصيل المغرب`
          : `Découvrez les meilleurs produits ${name} de l'artisanat marocain`,
    };
  } catch {
    return { title: "Catégorie — Souk Digital" };
  }
}

export default function Page() {
  return <CategoryPage />;
}

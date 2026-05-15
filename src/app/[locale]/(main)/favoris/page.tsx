"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Button from "@/components/ui/button";
import ProductCard from "@/components/modules/product-card";
import { useWishlist } from "@/lib/hooks/use-wishlist";
import { useAuthStore } from "@/lib/store/auth";

export default function FavorisPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isAr = locale === "ar";
  const isLoggedIn = !!useAuthStore((s) => s.token);
  const { data: items = [], isLoading } = useWishlist();

  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-black text-gray-900 mb-8">
          {isAr ? "المفضلة" : "Mes favoris"}
        </h1>
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 text-center">
          <div className="h-20 w-20 rounded-2xl bg-souk-sand flex items-center justify-center">
            <Heart size={40} className="text-gray-300" />
          </div>
          <p className="text-lg font-semibold text-gray-700">
            {isAr ? "سجّل الدخول لرؤية مفضلتك" : "Connectez-vous pour voir vos favoris"}
          </p>
          <Link href={`/${locale}/login`}>
            <Button>{isAr ? "تسجيل الدخول" : "Se connecter"}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-black text-gray-900 mb-2">
        {isAr ? "المفضلة" : "Mes favoris"}
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        {items.length} {isAr ? "منتج" : items.length === 1 ? "produit" : "produits"}
      </p>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 text-center">
          <div className="h-20 w-20 rounded-2xl bg-souk-sand flex items-center justify-center">
            <Heart size={40} className="text-gray-300" />
          </div>
          <p className="text-lg font-semibold text-gray-700">
            {isAr ? "قائمة المفضلة فارغة" : "Votre liste de favoris est vide"}
          </p>
          <p className="text-sm text-gray-400 max-w-xs">
            {isAr
              ? "احفظ المنتجات التي تعجبك بالضغط على أيقونة القلب"
              : "Enregistrez vos produits préférés en cliquant sur l'icône cœur"}
          </p>
          <Link href={`/${locale}`}>
            <Button>{isAr ? "استكشف المنتجات" : "Explorer les produits"}</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              slug={p.slug}
              name={isAr ? p.nameAr : p.name}
              price={Number(p.price)}
              originalPrice={p.originalPrice ? Number(p.originalPrice) : undefined}
              image={p.image ?? ""}
              rating={Number(p.rating)}
              reviewCount={p.reviewCount}
              vendor={p.vendor}
              badge={p.badge?.toLowerCase() as "artisan" | "sale" | "new" | "top" | "flash" | undefined}
              inStock={p.inStock}
              freeDelivery={p.freeDelivery}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}

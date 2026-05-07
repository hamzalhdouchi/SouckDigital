"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, MapPin, Star, MessageCircle, Heart, Package, Calendar, Award, Users } from "lucide-react";
import Button from "@/components/ui/button";
import ProductCard from "@/components/modules/product-card";
import { useVendor, useFollowVendor, useUnfollowVendor } from "@/lib/hooks/use-vendor";
import { vendorsApi } from "@/lib/api/vendors";
import { cn } from "@/lib/utils";

function VendorSkeleton() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="h-48 sm:h-64 bg-gray-200" />
      <div className="bg-white border-b border-gray-100 px-4 pb-6">
        <div className="flex gap-4 items-end -mt-10">
          <div className="h-20 w-20 rounded-2xl bg-gray-200 border-4 border-white shrink-0" />
          <div className="flex-1 pb-1">
            <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
            <div className="h-4 bg-gray-100 rounded w-64" />
          </div>
        </div>
      </div>
      <div className="px-4 py-6">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 h-20" />
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 h-32 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl aspect-[3/4]" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function VendorStorefrontPage() {
  const params = useParams();
  const locale = params.locale as string;
  const slug = params.slug as string;
  const isAr = locale === "ar";

  const [isFollowed, setIsFollowed] = useState(false);

  const { data: vendor, isLoading: vendorLoading } = useVendor(slug);
  const { data: productsPage, isLoading: productsLoading } = useQuery({
    queryKey: ["vendor-products", slug],
    queryFn: () => vendorsApi.getProducts(slug),
    enabled: !!slug,
  });

  const followMutation = useFollowVendor();
  const unfollowMutation = useUnfollowVendor();

  const handleFollow = () => {
    if (!vendor) return;
    if (isFollowed) {
      unfollowMutation.mutate(vendor.id, { onSuccess: () => setIsFollowed(false) });
    } else {
      followMutation.mutate(vendor.id, { onSuccess: () => setIsFollowed(true) });
    }
  };

  if (vendorLoading) return <VendorSkeleton />;
  if (!vendor) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
        <div>
          <p className="text-lg font-bold text-gray-900 mb-2">
            {isAr ? "البائع غير موجود" : "Vendeur introuvable"}
          </p>
          <Link href={`/${locale}/vendeurs`} className="text-sm text-souk-green-700 underline">
            {isAr ? "عودة للبائعين" : "Retour aux vendeurs"}
          </Link>
        </div>
      </div>
    );
  }

  const products = productsPage?.content ?? [];
  const memberYear = vendor.memberSince ? new Date(vendor.memberSince).getFullYear() : "—";
  const description = isAr ? (vendor.descriptionAr ?? vendor.description) : vendor.description;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Banner */}
      <div className="relative h-48 sm:h-64 bg-souk-green-900 overflow-hidden">
        {vendor.bannerUrl ? (
          <Image src={vendor.bannerUrl} alt={vendor.name} fill className="object-cover opacity-70" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-souk-green-900 to-souk-green-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
      </div>

      {/* Vendor header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 pb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end -mt-10 sm:-mt-12">
            {/* Avatar */}
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-souk-sand shrink-0">
              {vendor.avatarUrl ? (
                <Image src={vendor.avatarUrl} alt={vendor.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-black text-souk-green-800">
                  {vendor.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                  {isAr && vendor.nameAr ? vendor.nameAr : vendor.name}
                </h1>
                {vendor.verified && <CheckCircle size={18} className="text-souk-green-600" />}
                {vendor.artisan && (
                  <span className="inline-flex items-center gap-1 text-xs bg-souk-gold-100 text-souk-gold-700 border border-souk-gold-300 px-2 py-0.5 rounded-full font-semibold">
                    <Award size={11} />{isAr ? "حرفي معتمد" : "Artisan certifié"}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-souk-gold-500" />{vendor.city}
                </span>
                <span className="flex items-center gap-1">
                  <Package size={13} />{vendor.productCount} {isAr ? "منتج" : "produits"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={13} />{isAr ? `عضو منذ ${memberYear}` : `Membre depuis ${memberYear}`}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-2 sm:mt-0">
              <Button variant="outline" size="sm" leftIcon={<MessageCircle size={15} />}>
                {isAr ? "تواصل" : "Contacter"}
              </Button>
              <Button
                size="sm"
                leftIcon={<Heart size={15} className={isFollowed ? "fill-current" : ""} />}
                onClick={handleFollow}
                disabled={followMutation.isPending || unfollowMutation.isPending}
                className={cn(isFollowed && "bg-souk-terracotta-500 hover:bg-souk-terracotta-600 border-souk-terracotta-500")}
              >
                {isFollowed
                  ? (isAr ? "تمت المتابعة" : "Abonné")
                  : (isAr ? "متابعة" : "Suivre")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: isAr ? "المنتجات" : "Produits",   value: vendor.productCount },
            { label: isAr ? "التقييم" : "Note",         value: <div className="flex items-center gap-1 justify-center"><Star size={16} className="fill-souk-gold-500 text-souk-gold-500" />{vendor.rating.toFixed(1)}</div> },
            { label: isAr ? "التقييمات" : "Avis",       value: vendor.reviewCount },
            { label: isAr ? "المتابعون" : "Abonnés",    value: vendor.followerCount },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-xl sm:text-2xl font-black text-souk-green-800">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* About */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-8">
          <h2 className="font-bold text-gray-900 mb-3">
            {isAr ? "عن البائع" : "À propos du vendeur"}
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            {description ??
              (isAr
                ? `${vendor.nameAr ?? vendor.name} هو حرفي مغربي متخصص في الصناعة التقليدية.`
                : `${vendor.name} est un artisan marocain spécialisé dans l'artisanat traditionnel.`)}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {(isAr
              ? ["توصيل سريع", "دفع آمن", "قبول الإرجاع", "منتج أصيل"]
              : ["Livraison rapide", "Paiement sécurisé", "Retour accepté", "Produit authentique"]
            ).map((t) => (
              <span key={t} className="inline-flex items-center gap-1 text-xs bg-souk-green-50 text-souk-green-700 border border-souk-green-200 px-2.5 py-1 rounded-full font-medium">
                <CheckCircle size={11} />{t}
              </span>
            ))}
          </div>
        </div>

        {/* Products */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">
              <span className="border-b-4 border-souk-gold-500 pb-1">
                {isAr ? "منتجاته" : "Ses produits"}
              </span>
            </h2>
            <span className="text-sm text-gray-500">
              {vendor.productCount} {isAr ? "منتج" : "produits"}
            </span>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Package size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">{isAr ? "لا توجد منتجات بعد" : "Aucun produit pour l'instant"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  slug={p.slug}
                  name={isAr ? p.nameAr : p.name}
                  price={p.price}
                  originalPrice={p.originalPrice ?? undefined}
                  image={p.image ?? ""}
                  rating={p.rating}
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
      </div>
    </div>
  );
}

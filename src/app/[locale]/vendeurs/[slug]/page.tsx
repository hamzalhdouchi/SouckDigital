"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, MapPin, Star, MessageCircle, Heart, Package, Calendar, Award } from "lucide-react";
import Button from "@/components/ui/button";
import ProductCard from "@/components/modules/product-card";
import Rating from "@/components/ui/rating";
import { MOCK_VENDORS, MOCK_PRODUCTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function VendorStorefrontPage() {
  const params = useParams();
  const locale = params.locale as string;
  const slug = params.slug as string;
  const isAr = locale === "ar";

  const vendor = MOCK_VENDORS.find((v) => v.slug === slug) ?? MOCK_VENDORS[0];
  const products = MOCK_PRODUCTS.slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Banner */}
      <div className="relative h-48 sm:h-64 bg-souk-green-900 overflow-hidden">
        <Image src={vendor.banner} alt={vendor.name} fill className="object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
      </div>

      {/* Vendor header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 pb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end -mt-10 sm:-mt-12">
            {/* Avatar */}
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white shrink-0">
              <Image src={vendor.avatar} alt={vendor.name} fill className="object-cover" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900">{vendor.name}</h1>
                {vendor.verified && <CheckCircle size={18} className="text-souk-green-600" />}
                {vendor.artisan && (
                  <span className="inline-flex items-center gap-1 text-xs bg-souk-gold-100 text-souk-gold-700 border border-souk-gold-300 px-2 py-0.5 rounded-full font-semibold">
                    <Award size={11} />Artisan certifié
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-souk-gold-500" />{vendor.city}
                </span>
                <span className="flex items-center gap-1">
                  <Package size={13} />{vendor.productCount} produits
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={13} />Membre depuis 2023
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-2 sm:mt-0">
              <Button variant="outline" size="sm" leftIcon={<MessageCircle size={15} />}>
                {isAr ? "تواصل" : "Contacter"}
              </Button>
              <Button size="sm" leftIcon={<Heart size={15} />}>
                {isAr ? "متابعة" : "Suivre"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: isAr ? "المنتجات" : "Produits",    value: vendor.productCount },
            { label: isAr ? "التقييم" : "Note",         value: <div className="flex items-center gap-1"><Star size={16} className="fill-souk-gold-500 text-souk-gold-500" />{vendor.rating}</div> },
            { label: isAr ? "التقييمات" : "Avis",       value: vendor.reviewCount },
            { label: isAr ? "المتابعون" : "Abonnés",    value: "1.2K" },
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
            {isAr
              ? `${vendor.name} هو حرفي مغربي متخصص في الصناعة التقليدية. كل قطعة مصنوعة يدويًا بمواد طبيعية عالية الجودة، تجمع بين الموروث الثقافي والجودة المعاصرة.`
              : `${vendor.name} est un artisan marocain spécialisé dans l'artisanat traditionnel de qualité. Chaque pièce est façonnée à la main avec des matériaux naturels, alliant patrimoine culturel et excellence artisanale.`}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {["Livraison rapide", "Paiement sécurisé", "Retour accepté", "Produit authentique"].map((t) => (
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
            <span className="text-sm text-gray-500">{vendor.productCount} produits</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                slug={p.slug}
                name={isAr ? p.nameAr : p.name}
                price={p.price}
                originalPrice={p.originalPrice !== p.price ? p.originalPrice : undefined}
                image={p.image}
                rating={p.rating}
                reviewCount={p.reviewCount}
                vendor={p.vendor}
                badge={p.badge}
                inStock={p.inStock}
                freeDelivery={p.freeDelivery}
                locale={locale}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

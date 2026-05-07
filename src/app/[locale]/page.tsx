import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Zap, Award, ChevronRight, Gem, Star, Truck, Banknote, RotateCcw, ShieldCheck } from "lucide-react";
import ProductCard from "@/components/modules/product-card";
import CategoryCard from "@/components/modules/category-card";
import VendorCard from "@/components/modules/vendor-card";
import FlashTimer from "@/components/modules/flash-timer";
import Button from "@/components/ui/button";
import { getCategories, getProducts } from "@/lib/api/products";
import { getVendors } from "@/lib/api/vendors";
import type { CategoryResponse, ProductSummaryDto, VendorSummaryDto } from "@/lib/api/types";

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "homepage" });
  return {
    title: locale === "ar" ? "سوق الرقمي — الصفحة الرئيسية" : "Souk Digital — Accueil",
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;

  const [categoriesRes, productsRes, vendorsRes, flashRes] = await Promise.allSettled([
    getCategories(),
    getProducts({ page: 0, size: 8, sort: "newest" }),
    getVendors({ size: 4 }),
    getProducts({ page: 0, size: 4, sort: "newest" }),
  ]);

  const categories    = categoriesRes.status === "fulfilled" ? categoriesRes.value : [];
  const products      = productsRes.status   === "fulfilled" ? productsRes.value.content : [];
  const vendors       = vendorsRes.status    === "fulfilled" ? vendorsRes.value.content : [];
  const flashProducts = flashRes.status      === "fulfilled" ? flashRes.value.content : [];

  return (
    <div className="min-h-screen">
      <HeroSection locale={locale} />
      <CategorySection locale={locale} categories={categories} />
      <FlashSaleSection locale={locale} products={flashProducts} />
      <FeaturedProductsSection locale={locale} products={products} />
      <ArtisanSection locale={locale} />
      <VendorSection locale={locale} vendors={vendors} />
      <TrustSection locale={locale} />
    </div>
  );
}

/* ────────────── Hero ────────────── */
function HeroSection({ locale }: { locale: string }) {
  const t = useTranslations("homepage.hero");
  const isAr = locale === "ar";

  return (
    <section className="relative overflow-hidden bg-souk-green-900">
      <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-20 grid lg:grid-cols-2 gap-8 items-center">
        {/* Text */}
        <div className="text-white z-10 order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 bg-souk-gold-500/20 border border-souk-gold-500/40 rounded-full px-3 py-1 text-souk-gold-300 text-sm font-medium mb-6">
            <Gem size={13} className="text-souk-gold-400" />
            <span>Marketplace 100% Marocaine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-4 text-white">
            {isAr ? (
              <>الصناعة التقليدية المغربية<br /><span className="text-souk-gold-400">بين يديك</span></>
            ) : (
              <>L&apos;artisanat marocain<br /><span className="text-souk-gold-400">à portée de clic</span></>
            )}
          </h1>
          <p className="text-souk-green-300 text-lg mb-8 max-w-md">
            {isAr
              ? "اكتشف آلاف المنتجات الأصيلة المعتمدة، مع توصيل في كل أنحاء المغرب"
              : "Découvrez des milliers de produits authentiques certifiés, avec livraison partout au Maroc"}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={`/${locale}`}>
              <Button variant="gold" size="lg" rightIcon={<ArrowRight size={18} />}>
                {isAr ? "استكشف الآن" : "Explorer maintenant"}
              </Button>
            </Link>
            <Link href={`/${locale}/account/become-vendor`}>
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                {isAr ? "أنشئ متجرك" : "Ouvrir ma boutique"}
              </Button>
            </Link>
          </div>
          {/* Stats */}
          <div className="flex gap-8 mt-10 pt-8 border-t border-souk-green-700">
            {[
              { value: "50K+", label: isAr ? "منتج" : "Produits" },
              { value: "1K+",  label: isAr ? "بائع" : "Vendeurs" },
              { value: "99%",  label: isAr ? "رضا العملاء" : "Satisfaction client" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-black text-souk-gold-400">{s.value}</p>
                <p className="text-xs text-souk-green-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Hero image mosaic */}
        <div className="relative order-1 lg:order-2 h-64 sm:h-80 lg:h-auto">
          <div className="grid grid-cols-2 gap-3 h-full">
            <div className="grid grid-rows-2 gap-3">
              <div className="relative rounded-2xl overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1548516173-3cabfa4607e9?w=400&q=80" alt="Artisanat" fill className="object-cover" />
              </div>
              <div className="relative rounded-2xl overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&q=80" alt="Argan" fill className="object-cover" />
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden">
              <Image src="https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&q=80" alt="Tapis" fill className="object-cover" />
              <div className="absolute bottom-3 start-3 bg-white/95 backdrop-blur rounded-xl px-3 py-2 shadow-lg">
                <p className="text-xs font-semibold text-souk-green-800 flex items-center gap-1"><Star size={11} className="text-souk-gold-500 fill-souk-gold-500" />Artisanat certifié</p>
                <p className="text-xs text-gray-500">+500 artisans partenaires</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zellige decorative dots */}
      <div className="absolute top-0 end-0 w-64 h-64 opacity-5">
        <div className="grid grid-cols-8 gap-2 p-4">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="h-2 w-2 rounded-full bg-souk-gold-500" />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────── Categories ────────────── */
function CategorySection({ locale, categories }: {
  locale: string;
  categories: CategoryResponse[];
}) {
  const isAr = locale === "ar";
  if (categories.length === 0) return null;
  return (
    <section className="py-10 max-w-7xl mx-auto px-4">
      <SectionHeader
        title={isAr ? "فئاتنا" : "Nos Catégories"}
        viewAllHref={`/${locale}/recherche`}
        viewAllLabel={isAr ? "عرض الكل" : "Voir tout"}
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.id}
            slug={cat.slug}
            name={isAr ? cat.nameAr : cat.name}
            emoji={cat.emoji ?? undefined}
            image={cat.imageUrl ?? ""}
            locale={locale}
            size="md"
          />
        ))}
      </div>
    </section>
  );
}

/* ────────────── Flash Sales ────────────── */
function FlashSaleSection({ locale, products }: { locale: string; products: ProductSummaryDto[] }) {
  const isAr = locale === "ar";
  const endsAt = new Date(Date.now() + 4 * 3600000 + 27 * 60000 + 14000);
  if (products.length === 0) return null;

  return (
    <section className="py-6 bg-souk-green-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-white">
              <Zap size={20} className="text-souk-gold-400 fill-souk-gold-400" />
              <h2 className="text-xl font-bold">
                {isAr ? "تخفيضات مؤقتة" : "Ventes Flash"}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-souk-green-300 text-sm">
              <span>{isAr ? "ينتهي خلال" : "Se termine dans"}</span>
              <FlashTimer endsAt={endsAt} locale={locale} />
            </div>
          </div>
          <Link href={`/${locale}/promotions`} className="text-souk-gold-400 hover:text-souk-gold-300 text-sm font-medium flex items-center gap-1">
            {isAr ? "عرض الكل" : "Voir tout"}
            <ChevronRight size={16} className={isAr ? "rotate-180" : ""} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {products.map((p) => {
            const discount = p.originalPrice && p.originalPrice > p.price
              ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
              : null;
            return (
              <Link key={p.id} href={`/${locale}/products/${p.slug}`} className="group bg-souk-green-800 rounded-xl overflow-hidden hover:bg-souk-green-700 transition-colors">
                <div className="relative aspect-square overflow-hidden">
                  {p.image && (
                    <Image src={p.image} alt={isAr ? p.nameAr : p.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-souk-green-900/60 to-transparent" />
                  {discount && (
                    <div className="absolute top-2 start-2">
                      <span className="bg-souk-terracotta-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                        -{discount}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-white text-xs font-semibold line-clamp-2 leading-snug mb-2">
                    {isAr ? p.nameAr : p.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-souk-gold-400 font-bold text-sm">{p.price} MAD</span>
                    {p.originalPrice && p.originalPrice > p.price && (
                      <span className="text-souk-green-400 text-xs line-through">{p.originalPrice} MAD</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ────────────── Featured Products ────────────── */
function FeaturedProductsSection({ locale, products }: {
  locale: string;
  products: ProductSummaryDto[];
}) {
  const isAr = locale === "ar";
  if (products.length === 0) return null;
  return (
    <section className="py-10 max-w-7xl mx-auto px-4">
      <SectionHeader
        title={isAr ? "منتجات مميزة" : "Produits Vedettes"}
        viewAllHref={`/${locale}/recherche`}
        viewAllLabel={isAr ? "عرض الكل" : "Voir tout"}
      />
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
    </section>
  );
}

/* ────────────── Artisan Banner ────────────── */
function ArtisanSection({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  return (
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto relative rounded-3xl overflow-hidden bg-gradient-to-r from-souk-green-800 to-souk-green-700">
        <div className="relative z-10 px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white">
            <div className="flex items-center gap-2 mb-3">
              <Award size={20} className="text-souk-gold-400" />
              <span className="text-souk-gold-400 font-semibold text-sm uppercase tracking-wide">
                {isAr ? "معتمد" : "Label Officiel"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mb-2">
              {isAr ? "الصناعة التقليدية الأصيلة" : "Artisanat Authentique Marocain"}
            </h2>
            <p className="text-souk-green-300 max-w-lg">
              {isAr
                ? "منتجات معتمدة من المكتب الوطني للصناعة التقليدية المغربية"
                : "Produits certifiés par l'Office National de l'Artisanat Marocain — authentiques, éthiques, de qualité."}
            </p>
          </div>
          <Link href={`/${locale}/categories/artisanat`}>
            <Button variant="gold" size="lg" rightIcon={<ArrowRight size={18} />}>
              {isAr ? "اكتشف الصناعة التقليدية" : "Découvrir l'artisanat"}
            </Button>
          </Link>
        </div>
        {/* Decorative zellige pattern */}
        <div className="absolute end-0 top-0 bottom-0 w-48 opacity-10">
          <div className="grid grid-cols-6 gap-1 p-4 h-full content-center">
            {Array.from({ length: 60 }).map((_, i) => (
              <div key={i} className={`h-4 w-4 rounded-sm ${i % 3 === 0 ? "bg-souk-gold-400" : i % 3 === 1 ? "bg-souk-green-400" : "bg-white"}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────── Vendors ────────────── */
function VendorSection({ locale, vendors }: {
  locale: string;
  vendors: VendorSummaryDto[];
}) {
  const isAr = locale === "ar";
  if (vendors.length === 0) return null;
  return (
    <section className="py-10 max-w-7xl mx-auto px-4">
      <SectionHeader
        title={isAr ? "بائعون مميزون" : "Vendeurs Vedettes"}
        viewAllHref={`/${locale}/vendeurs`}
        viewAllLabel={isAr ? "عرض الكل" : "Voir tout"}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {vendors.map((v) => (
          <VendorCard
            key={v.id}
            slug={v.slug}
            name={v.name}
            city={v.city}
            rating={v.rating}
            reviewCount={v.reviewCount}
            productCount={v.productCount}
            artisan={v.artisan}
            verified={v.verified}
            avatar={v.avatarUrl ?? ""}
            banner={v.bannerUrl ?? ""}
            locale={locale}
          />
        ))}
      </div>
    </section>
  );
}

/* ────────────── Trust Badges ────────────── */
function TrustSection({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const badges = [
    { icon: Truck,       color: "text-souk-gold-600",   bg: "bg-souk-gold-100",   title: isAr ? "التوصيل في المغرب"    : "Livraison au Maroc",        sub: isAr ? "24-72 ساعة في المدن الكبرى" : "24h–72h dans les grandes villes" },
    { icon: Banknote,    color: "text-emerald-700",      bg: "bg-emerald-100",     title: isAr ? "الدفع عند الاستلام"   : "Paiement à la livraison",   sub: isAr ? "متاح في كل أنحاء المغرب"   : "Disponible partout au Maroc" },
    { icon: RotateCcw,   color: "text-sky-700",          bg: "bg-sky-100",         title: isAr ? "إرجاع سهل"            : "Retours faciles",           sub: isAr ? "30 يومًا لتغيير رأيك"      : "30 jours pour changer d'avis" },
    { icon: ShieldCheck, color: "text-souk-green-700",   bg: "bg-souk-green-100",  title: isAr ? "دفع آمن"              : "Paiement sécurisé",         sub: isAr ? "معتمد CMI وPCI DSS"         : "Certifié CMI & PCI DSS" },
  ];

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {badges.map(({ icon: Icon, color, bg, title, sub }) => (
          <div key={title} className="flex items-start gap-3 p-4 rounded-xl bg-souk-green-50 border border-souk-green-100">
            <div className={`p-2 rounded-xl ${bg} shrink-0`}>
              <Icon size={20} className={color} strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-bold text-sm text-souk-green-800">{title}</p>
              <p className="text-xs text-souk-green-600 mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ────────────── Shared ────────────── */
function SectionHeader({ title, viewAllHref, viewAllLabel }: { title: string; viewAllHref: string; viewAllLabel: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
        <span className="border-b-4 border-souk-gold-500 pb-1">{title}</span>
      </h2>
      <Link href={viewAllHref} className="flex items-center gap-1 text-souk-green-700 hover:text-souk-green-900 font-medium text-sm transition-colors">
        {viewAllLabel}
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}

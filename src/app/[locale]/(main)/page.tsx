import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Zap, Award, ChevronRight, Gem, Star, Truck, Banknote, RotateCcw, ShieldCheck, Search, BadgeCheck } from "lucide-react";
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
  const isAr = locale === "ar";

  const buyers = [
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&q=80",
  ];

  return (
    <section className="relative overflow-hidden bg-souk-green-900 min-h-[88vh] flex items-center">

      {/* Radial gold glow — bottom-start */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_0%_100%,rgba(184,134,11,0.13)_0%,transparent_60%)] pointer-events-none" />

      {/* Zellige checkerboard — top-end */}
      <div
        className="absolute top-0 end-0 w-[420px] h-[420px] opacity-[0.045] pointer-events-none"
        style={{ backgroundImage: "repeating-conic-gradient(#D4A017 0% 25%, transparent 0% 50%)", backgroundSize: "28px 28px" }}
      />

      {/* Soft vignette edge */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_50%,transparent_55%,rgba(0,0,0,0.35)_100%)] pointer-events-none" />

      <div className="relative w-full max-w-7xl mx-auto px-4 py-16 md:py-20 grid lg:grid-cols-[56%_44%] gap-10 items-center">

        {/* ── Left: Content ── */}
        <div className="text-white z-10 order-2 lg:order-1">

          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 bg-souk-gold-500/15 border border-souk-gold-500/30 rounded-full px-4 py-1.5 text-souk-gold-300 text-sm font-semibold mb-6 backdrop-blur-sm">
            <Gem size={13} className="text-souk-gold-400" />
            <span>Marketplace 100% Marocaine</span>
            <span className="w-1.5 h-1.5 rounded-full bg-souk-gold-400 animate-pulse" />
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight mb-5 text-white">
            {isAr ? (
              <>
                الصناعة التقليدية<br />
                المغربية<br />
                <span className="text-souk-gold-400">بين يديك</span>
              </>
            ) : (
              <>
                L&apos;artisanat<br />
                marocain<br />
                <span className="text-souk-gold-400 italic">à portée de clic</span>
              </>
            )}
          </h1>

          <p className="text-souk-green-300 text-[1.05rem] leading-relaxed mb-7 max-w-[26rem]">
            {isAr
              ? "اكتشف آلاف المنتجات الأصيلة المعتمدة، مع توصيل في كل أنحاء المغرب"
              : "Découvrez des milliers de produits authentiques certifiés, avec livraison partout au Maroc"}
          </p>

          {/* Search bar */}
          <Link
            href={`/${locale}/recherche`}
            className="group flex items-center gap-3 bg-white/8 hover:bg-white/12 border border-white/12 hover:border-souk-gold-400/50 rounded-2xl px-4 py-3.5 mb-6 transition-all duration-200 w-full max-w-[28rem] backdrop-blur-sm"
          >
            <Search size={17} className="text-souk-green-400 group-hover:text-souk-gold-400 transition-colors shrink-0" />
            <span className="text-souk-green-400 text-sm flex-1 group-hover:text-souk-green-300 transition-colors">
              {isAr ? "ابحث عن منتج، حرفي، متجر..." : "Rechercher un produit, artisan, boutique..."}
            </span>
            <span className="shrink-0 text-[11px] bg-souk-gold-500/20 border border-souk-gold-500/30 text-souk-gold-400 rounded-lg px-2 py-1 font-semibold">
              {isAr ? "بحث" : "Chercher"}
            </span>
          </Link>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3 mb-9">
            <Link href={`/${locale}/recherche`}>
              <Button variant="gold" size="lg" rightIcon={<ArrowRight size={18} />}>
                {isAr ? "استكشف الآن" : "Explorer maintenant"}
              </Button>
            </Link>
            <Link href={`/${locale}/account/become-vendor`}>
              <Button variant="outline" size="lg" className="border-white/25 text-white hover:bg-white/10">
                {isAr ? "أنشئ متجرك" : "Ouvrir ma boutique"}
              </Button>
            </Link>
          </div>

          {/* Social proof + stats */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 pt-7 border-t border-souk-green-700/50">
            {/* Buyer avatars */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex -space-x-2.5 rtl:space-x-reverse">
                {buyers.map((src, i) => (
                  <div key={i} className="relative w-9 h-9 rounded-full border-2 border-souk-green-900 overflow-hidden ring-1 ring-souk-green-700">
                    <Image src={src} alt="acheteur" fill sizes="36px" className="object-cover" />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white text-sm font-bold leading-none">5 000+</p>
                <p className="text-souk-green-400 text-[11px] mt-0.5">
                  {isAr ? "مشتري نشط" : "acheteurs actifs"}
                </p>
              </div>
            </div>

            <div className="hidden sm:block h-10 w-px bg-souk-green-700/60" />

            {/* Stats */}
            <div className="flex gap-7">
              {[
                { value: "50K+", label: isAr ? "منتج" : "Produits" },
                { value: "1K+",  label: isAr ? "بائع" : "Vendeurs" },
                { value: "99%",  label: isAr ? "رضا العملاء" : "Satisfaction" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-[1.4rem] font-black text-souk-gold-400 leading-none">{s.value}</p>
                  <p className="text-[11px] text-souk-green-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Image mosaic ── */}
        <div className="relative order-1 lg:order-2 h-[320px] sm:h-[440px] lg:h-[580px]">

          {/* Decorative glow ring */}
          <div className="absolute -inset-3 rounded-[2.5rem] border border-souk-gold-500/10 pointer-events-none" />

          {/* Mosaic: main tall left + 2 stacked right */}
          <div className="grid grid-cols-[3fr_2fr] gap-3 h-full">

            {/* Main tall image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&q=80"
                alt="Artisanat marocain"
                fill priority
                sizes="(max-width: 1024px) 60vw, 28vw"
                className="object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-souk-green-900/80 via-souk-green-900/10 to-transparent" />

              {/* Certified badge — top */}
              <div className="absolute top-4 start-4 flex items-center gap-2 bg-souk-gold-500 text-souk-green-900 rounded-xl px-3 py-2 shadow-xl">
                <Award size={14} strokeWidth={2.5} />
                <div>
                  <p className="text-[11px] font-black leading-none">
                    {isAr ? "معتمد رسميًا" : "Artisanat certifié"}
                  </p>
                  <p className="text-[10px] font-medium opacity-75 mt-0.5">
                    {isAr ? "+٥٠٠ حرفي" : "+500 artisans"}
                  </p>
                </div>
              </div>

              {/* Floating product card — bottom */}
              <div className="absolute bottom-4 start-3 end-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-3">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-souk-green-100">
                    <Image
                      src="https://images.unsplash.com/photo-1548516173-3cabfa4607e9?w=100&q=80"
                      alt="produit"
                      fill sizes="44px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 leading-tight truncate">
                      {isAr ? "طاجين أصيل" : "Tajine artisanal"}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={9} className="text-souk-gold-500 fill-souk-gold-500" />
                      ))}
                      <span className="text-[10px] text-gray-400 ms-0.5">(128)</span>
                    </div>
                  </div>
                  <p className="text-souk-gold-600 font-black text-sm shrink-0">320 MAD</p>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1.5">
                  <BadgeCheck size={12} className="text-emerald-500 shrink-0" />
                  <p className="text-[10px] text-gray-500 font-medium">
                    {isAr ? "متاح — توصيل اليوم" : "En stock — livraison aujourd'hui"}
                  </p>
                </div>
              </div>
            </div>

            {/* 2 stacked smaller images */}
            <div className="grid grid-rows-2 gap-3">

              {/* Top-right */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&q=80"
                  alt="Argan"
                  fill
                  sizes="(max-width: 1024px) 40vw, 18vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-souk-green-900/50" />
                <div className="absolute bottom-2.5 start-2.5 flex items-center gap-1 bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg px-2 py-1">
                  <Star size={10} className="text-souk-gold-400 fill-souk-gold-400" />
                  <span className="text-white text-[10px] font-bold">4.9</span>
                </div>
              </div>

              {/* Bottom-right */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"
                  alt="Souk"
                  fill
                  sizes="(max-width: 1024px) 40vw, 18vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-souk-green-900/50" />
                <div className="absolute inset-0 flex items-end p-2.5">
                  <div className="flex items-center gap-1 bg-souk-gold-500/90 backdrop-blur-sm rounded-lg px-2 py-1">
                    <Zap size={10} className="text-souk-green-900 fill-souk-green-900" />
                    <span className="text-souk-green-900 text-[10px] font-black">
                      {isAr ? "عرض اليوم" : "Deal du jour"}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
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
    <section className="py-14 bg-gradient-to-b from-[#F5EFE4] to-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Enhanced header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="flex items-center gap-2 text-souk-gold-600 text-xs font-bold uppercase tracking-widest mb-2">
              <span className="inline-block w-5 h-px bg-souk-gold-500" />
              {isAr ? "تسوق حسب الفئة" : "Parcourir par catégorie"}
              <span className="inline-block w-5 h-px bg-souk-gold-500" />
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-souk-green-900 leading-tight">
              {isAr ? "فئاتنا" : "Nos Catégories"}
            </h2>
          </div>
          <Link
            href={`/${locale}/recherche`}
            className="group flex items-center gap-1.5 text-souk-green-700 hover:text-souk-gold-600 font-semibold text-sm transition-colors"
          >
            {isAr ? "عرض الكل" : "Voir tout"}
            <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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

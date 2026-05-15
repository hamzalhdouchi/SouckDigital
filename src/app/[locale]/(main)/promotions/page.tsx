import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Zap, Tag, Truck, ArrowRight, ChevronRight, Flame, Percent, BadgePercent } from "lucide-react";
import ProductCard from "@/components/modules/product-card";
import FlashTimer from "@/components/modules/flash-timer";
import { getProducts } from "@/lib/api/products";
import type { ProductSummaryDto } from "@/lib/api/types";

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "العروض والتخفيضات — سوق الرقمي" : "Promotions & Ventes Flash — Souk Digital",
    description: locale === "ar"
      ? "اكتشف أفضل العروض والتخفيضات على المنتجات المغربية الأصيلة"
      : "Découvrez les meilleures promotions et ventes flash sur les produits marocains authentiques",
  };
}

export default async function PromotionsPage({ params }: Props) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const [flashRes, newRes, topRes] = await Promise.allSettled([
    getProducts({ page: 0, size: 8, sort: "newest" }),
    getProducts({ page: 0, size: 4, sort: "newest" }),
    getProducts({ page: 0, size: 4, sort: "rating" }),
  ]);

  const flashProducts = flashRes.status === "fulfilled" ? flashRes.value.content : [];
  const newProducts   = newRes.status   === "fulfilled" ? newRes.value.content   : [];
  const topProducts   = topRes.status   === "fulfilled" ? topRes.value.content   : [];

  const endsAt = new Date(Date.now() + 5 * 3600000 + 43 * 60000 + 20000);

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden bg-souk-green-900">
        {/* Zellige decorative dots */}
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="grid grid-cols-16 gap-3 p-6 h-full">
            {Array.from({ length: 192 }).map((_, i) => (
              <div key={i} className="h-2 w-2 rounded-full bg-souk-gold-400" />
            ))}
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-14 md:py-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-souk-green-400 mb-8">
            <Link href={`/${locale}`} className="hover:text-souk-gold-400 transition-colors">
              {isAr ? "الرئيسية" : "Accueil"}
            </Link>
            <ChevronRight size={12} className="rtl:rotate-180" />
            <span className="text-white font-medium">
              {isAr ? "العروض" : "Promotions"}
            </span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left — text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-souk-terracotta-500/20 border border-souk-terracotta-400/40 rounded-full px-3 py-1 text-souk-terracotta-300 text-sm font-semibold mb-5">
                <Flame size={14} className="fill-souk-terracotta-400 text-souk-terracotta-400" />
                {isAr ? "عروض محدودة الوقت" : "Offres à durée limitée"}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
                {isAr ? (
                  <>تخفيضات تصل<br /><span className="text-souk-gold-400">حتى ٥٠٪</span></>
                ) : (
                  <>Jusqu&apos;à <span className="text-souk-gold-400">–50 %</span><br />sur nos produits</>
                )}
              </h1>
              <p className="text-souk-green-300 text-base mb-8 max-w-md">
                {isAr
                  ? "اغتنم العروض الحصرية على الصناعة التقليدية المغربية الأصيلة. الكميات محدودة!"
                  : "Profitez d'offres exclusives sur l'artisanat marocain authentique. Stocks limités !"}
              </p>

              {/* Countdown */}
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <p className="text-souk-green-400 text-xs font-medium mb-1.5">
                    {isAr ? "ينتهي خلال" : "Se termine dans"}
                  </p>
                  <FlashTimer endsAt={endsAt} locale={locale} />
                </div>
                <Link
                  href="#deals"
                  className="inline-flex items-center gap-2 bg-souk-gold-500 hover:bg-souk-gold-400 text-souk-green-900 font-bold text-sm px-5 py-3 rounded-xl transition-colors shadow-lg shadow-souk-gold-500/20"
                >
                  <Zap size={16} className="fill-souk-green-900" />
                  {isAr ? "تسوق الآن" : "Voir les offres"}
                </Link>
              </div>
            </div>

            {/* Right — deal stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: BadgePercent,
                  value: "–50%",
                  label: isAr ? "أقصى خصم" : "Remise max",
                  color: "from-souk-terracotta-600/30 to-souk-terracotta-800/20",
                  border: "border-souk-terracotta-500/30",
                  iconColor: "text-souk-terracotta-400",
                },
                {
                  icon: Zap,
                  value: "48h",
                  label: isAr ? "توصيل سريع" : "Livraison express",
                  color: "from-souk-gold-600/20 to-souk-gold-900/10",
                  border: "border-souk-gold-500/30",
                  iconColor: "text-souk-gold-400",
                },
                {
                  icon: Tag,
                  value: "200+",
                  label: isAr ? "منتج بتخفيض" : "Produits en promo",
                  color: "from-emerald-600/20 to-emerald-900/10",
                  border: "border-emerald-500/30",
                  iconColor: "text-emerald-400",
                },
                {
                  icon: Truck,
                  value: "0 MAD",
                  label: isAr ? "توصيل مجاني" : "Frais de port offerts",
                  color: "from-sky-600/20 to-sky-900/10",
                  border: "border-sky-500/30",
                  iconColor: "text-sky-400",
                },
              ].map(({ icon: Icon, value, label, color, border, iconColor }) => (
                <div
                  key={label}
                  className={`bg-gradient-to-br ${color} border ${border} rounded-2xl p-5 flex flex-col gap-3`}
                >
                  <Icon size={22} className={iconColor} />
                  <div>
                    <p className="text-white text-2xl font-black">{value}</p>
                    <p className="text-souk-green-300 text-xs font-medium mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Promo Ribbon ── */}
      <div className="bg-souk-gold-500 py-2.5 overflow-hidden">
        <div className="flex items-center gap-8 animate-none whitespace-nowrap text-souk-green-900 text-sm font-bold px-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="flex items-center gap-2 shrink-0">
              <Percent size={14} />
              {isAr
                ? ["خصومات حصرية", "توصيل مجاني", "أفضل الأسعار", "عروض يومية", "منتجات أصيلة", "جودة مضمونة"][i]
                : ["Offres exclusives", "Livraison gratuite", "Meilleurs prix", "Deals du jour", "Produits certifiés", "Qualité garantie"][i]}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* ── Flash Deals ── */}
        <section id="deals" className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-souk-terracotta-500 flex items-center justify-center shadow-lg shadow-souk-terracotta-500/30">
                <Zap size={20} className="text-white fill-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-souk-green-900">
                  {isAr ? "عروض اليوم" : "Ventes Flash"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isAr ? "تنتهي قريبًا" : "Offres limitées dans le temps"}
                </p>
              </div>
            </div>
            <FlashTimer endsAt={endsAt} locale={locale} />
          </div>

          <ProductGrid products={flashProducts} locale={locale} isAr={isAr} />
        </section>

        {/* ── Banner Mid ── */}
        <div className="relative rounded-3xl overflow-hidden mb-14">
          <div className="absolute inset-0 bg-gradient-to-r from-souk-green-900 via-souk-green-800 to-souk-green-700" />
          <div className="absolute end-0 top-0 bottom-0 w-1/3 opacity-20">
            <div className="grid grid-cols-5 gap-1.5 p-6 h-full content-center">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className={`h-5 w-5 rounded-sm ${i % 3 === 0 ? "bg-souk-gold-400" : i % 3 === 1 ? "bg-souk-green-400" : "bg-white"}`} />
              ))}
            </div>
          </div>
          <div className="relative z-10 px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-white">
              <p className="text-souk-gold-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                <Tag size={12} />
                {isAr ? "عرض خاص" : "Offre spéciale"}
              </p>
              <h3 className="text-2xl sm:text-3xl font-black mb-2">
                {isAr ? "توصيل مجاني على كل طلب" : "Livraison offerte sur toute commande"}
              </h3>
              <p className="text-souk-green-300 text-sm">
                {isAr ? "لفترة محدودة — لا حد أدنى للطلب" : "Pour une durée limitée — sans montant minimum"}
              </p>
            </div>
            <Link
              href={`/${locale}/recherche`}
              className="shrink-0 inline-flex items-center gap-2 bg-souk-gold-500 hover:bg-souk-gold-400 text-souk-green-900 font-bold px-6 py-3 rounded-xl transition-colors shadow-lg"
            >
              {isAr ? "تسوق الآن" : "En profiter"}
              <ArrowRight size={16} className={isAr ? "rotate-180" : ""} />
            </Link>
          </div>
        </div>

        {/* ── Nouveautés en promo ── */}
        {newProducts.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-souk-gold-500 flex items-center justify-center shadow-lg shadow-souk-gold-500/30">
                  <Tag size={20} className="text-souk-green-900" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-souk-green-900">
                    {isAr ? "وصل حديثًا" : "Nouveautés en promotion"}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isAr ? "أحدث المنتجات بأسعار مميزة" : "Les derniers arrivages à prix réduit"}
                  </p>
                </div>
              </div>
              <Link
                href={`/${locale}/recherche`}
                className="text-sm font-semibold text-souk-green-700 hover:text-souk-gold-600 transition-colors flex items-center gap-1"
              >
                {isAr ? "عرض الكل" : "Voir tout"}
                <ChevronRight size={15} className={isAr ? "rotate-180" : ""} />
              </Link>
            </div>
            <ProductGrid products={newProducts} locale={locale} isAr={isAr} cols={4} />
          </section>
        )}

        {/* ── Mieux notés ── */}
        {topProducts.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
                  <Flame size={20} className="text-white fill-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-souk-green-900">
                    {isAr ? "الأكثر مبيعًا" : "Meilleures ventes"}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isAr ? "الأعلى تقييمًا من عملائنا" : "Les favoris de nos clients"}
                  </p>
                </div>
              </div>
              <Link
                href={`/${locale}/recherche`}
                className="text-sm font-semibold text-souk-green-700 hover:text-souk-gold-600 transition-colors flex items-center gap-1"
              >
                {isAr ? "عرض الكل" : "Voir tout"}
                <ChevronRight size={15} className={isAr ? "rotate-180" : ""} />
              </Link>
            </div>
            <ProductGrid products={topProducts} locale={locale} isAr={isAr} cols={4} />
          </section>
        )}
      </div>
    </div>
  );
}

function ProductGrid({
  products,
  locale,
  isAr,
  cols = 4,
}: {
  products: ProductSummaryDto[];
  locale: string;
  isAr: boolean;
  cols?: 4 | 8;
}) {
  if (products.length === 0) return null;
  return (
    <div className={`grid gap-3 sm:gap-4 ${cols === 8 ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-4" : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"}`}>
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
  );
}

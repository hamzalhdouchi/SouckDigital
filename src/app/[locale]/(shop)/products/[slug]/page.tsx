"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Heart, Share2, ShoppingCart, Truck, RefreshCw, Shield, Star,
  CheckCircle, MessageCircle, Zap, ChevronLeft, ChevronRight,
  Award, X, ZoomIn, Clock, AlertCircle,
} from "lucide-react";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Rating from "@/components/ui/rating";
import ProductCard from "@/components/modules/product-card";
import { ProductDetailSkeleton } from "@/components/skeletons/product-detail-skeleton";
import { useCartStore } from "@/lib/store/cart";
import { useProduct, useRelatedProducts } from "@/lib/hooks/use-products";
import { useReviews, useReviewStats } from "@/lib/hooks/use-reviews";
import { cn, formatPriceSimple, calculateDiscount } from "@/lib/utils";
import type { ReviewDetailDto, ReviewStatsDto } from "@/lib/api/types";

const COLORS = ["#C0614A", "#1A3C2E", "#C9973A", "#4A6FA5", "#2C2C2C"];
const SIZES  = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProductDetailPage() {
  const params = useParams();
  const locale = params.locale as string;
  const slug   = params.slug as string;
  const isAr   = locale === "ar";

  const { data: product, isLoading, isError } = useProduct(slug);
  const { data: relatedData } = useRelatedProducts(product?.id ?? "");
  const { data: reviewPages, fetchNextPage, hasNextPage } = useReviews(product?.id ?? "");
  const { data: reviewStats } = useReviewStats(product?.id ?? "");

  const [mainImage,    setMainImage]    = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [quantity,     setQuantity]     = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize,  setSelectedSize]  = useState<string | null>(null);
  const [activeTab,    setActiveTab]    = useState<"description" | "details" | "reviews">("description");
  const [wished,       setWished]       = useState(false);
  const [adding,       setAdding]       = useState(false);

  const addItem = useCartStore((s) => s.addItem);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <AlertCircle size={48} className="text-gray-300" />
        <p className="text-lg font-semibold text-gray-700">
          {isAr ? "المنتج غير موجود" : "Produit introuvable"}
        </p>
        <Link href={`/${locale}/categories`}>
          <Button>{isAr ? "متابعة التسوق" : "Continuer mes achats"}</Button>
        </Link>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
  const discount = product.originalPrice ? calculateDiscount(product.originalPrice, product.price) : 0;
  const isLowStock = product.inStock && product.stockCount <= 5;
  const relatedProducts = relatedData ?? [];
  const reviews = reviewPages?.pages.flatMap((p) => p.content) ?? [];
  const categoryName = isAr ? (product.category?.nameAr ?? "") : (product.category?.name ?? "");
  const categorySlug = product.category?.slug ?? "";

  const handleAddToCart = () => {
    setAdding(true);
    addItem({
      id: product.id, productId: product.id, slug: product.slug,
      name: isAr ? product.nameAr : product.name,
      price: product.price, image: product.image,
      vendorId: product.vendor.id, vendorName: product.vendor.name, vendorSlug: product.vendor.slug,
      maxStock: product.stockCount,
    });
    setTimeout(() => setAdding(false), 1500);
  };

  const tabLabels = {
    description: isAr ? "الوصف" : "Description",
    details:     isAr ? "المميزات" : "Caractéristiques",
    reviews:     isAr ? `التقييمات (${product.reviewCount})` : `Avis (${product.reviewCount})`,
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6 pb-28 sm:pb-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2 flex-wrap">
          <Link href={`/${locale}`} className="hover:text-souk-green-800">
            {isAr ? "الرئيسية" : "Accueil"}
          </Link>
          <ChevronRight size={14} className="text-gray-300 rtl:rotate-180" />
          {categorySlug && (
            <>
              <Link href={`/${locale}/categories/${categorySlug}`} className="hover:text-souk-green-800">
                {categoryName}
              </Link>
              <ChevronRight size={14} className="text-gray-300 rtl:rotate-180" />
            </>
          )}
          <span className="text-gray-900 font-medium truncate max-w-[200px]">
            {isAr ? product.nameAr : product.name}
          </span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* ── Gallery ── */}
          <div className="space-y-3">
            <div
              className="relative aspect-square rounded-2xl overflow-hidden bg-souk-sand cursor-zoom-in group"
              onClick={() => setLightboxOpen(true)}
            >
              {images[mainImage] && (
                <Image
                  src={images[mainImage]}
                  alt={product.name}
                  fill sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              )}
              {discount >= 10 && (
                <div className="absolute top-4 start-4">
                  <span className="bg-souk-terracotta-500 text-white font-bold px-3 py-1.5 rounded-xl text-sm">
                    -{discount}%
                  </span>
                </div>
              )}
              {product.vendor.artisan && (
                <div className="absolute top-4 end-4">
                  <Badge variant="artisan" className="flex items-center gap-1">
                    <Award size={10} />{isAr ? "حرفي معتمد" : "Artisan certifié"}
                  </Badge>
                </div>
              )}
              <div className="absolute bottom-3 end-3 bg-black/50 text-white rounded-lg px-2 py-1 text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn size={12} />{isAr ? "تكبير" : "Agrandir"}
              </div>
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setMainImage((i) => (i - 1 + images.length) % images.length); }}
                    className="absolute start-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setMainImage((i) => (i + 1) % images.length); }}
                    className="absolute end-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setMainImage(i)}
                    className={cn("relative h-16 w-16 rounded-lg overflow-hidden border-2 transition-colors",
                      mainImage === i ? "border-souk-green-800" : "border-gray-200 hover:border-souk-green-400")}>
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info panel ── */}
          <div className="flex flex-col">
            {categoryName && (
              <p className="text-sm text-souk-green-600 font-medium mb-1">{categoryName}</p>
            )}
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-3">
              {isAr ? product.nameAr : product.name}
            </h1>

            <div className="flex items-center gap-4 mb-3">
              <Rating value={product.rating} count={product.reviewCount} size="md" />
            </div>

            {isLowStock ? (
              <div className="flex items-center gap-1.5 mb-3 text-souk-terracotta-600 bg-souk-terracotta-50 border border-souk-terracotta-200 rounded-lg px-3 py-2 text-sm font-medium w-fit">
                <Clock size={14} />
                {isAr ? `لم يتبق سوى ${product.stockCount} في المخزون!` : `Plus que ${product.stockCount} en stock !`}
              </div>
            ) : (
              <span className="text-xs text-souk-green-600 bg-souk-green-50 px-2 py-0.5 rounded-full font-medium w-fit mb-3">
                {product.inStock
                  ? (isAr ? `${product.stockCount} في المخزون` : `${product.stockCount} en stock`)
                  : (isAr ? "نفد المخزون" : "Rupture de stock")}
              </span>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-3xl font-black text-souk-green-800">{formatPriceSimple(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPriceSimple(product.originalPrice)}</span>
                  <span className="bg-souk-terracotta-100 text-souk-terracotta-600 text-sm font-bold px-2 py-0.5 rounded-lg">
                    {isAr
                      ? `وفّر ${formatPriceSimple(product.originalPrice - product.price)}`
                      : `Économisez ${formatPriceSimple(product.originalPrice - product.price)}`}
                  </span>
                </>
              )}
            </div>

            {/* Color picker */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-800 mb-2">{isAr ? "اللون" : "Couleur"}</p>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button key={c} onClick={() => setSelectedColor(c)}
                    className={cn("h-8 w-8 rounded-full border-2 transition-all",
                      selectedColor === c ? "border-souk-green-800 scale-110" : "border-transparent hover:scale-105")}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            {/* Size picker */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-800 mb-2">{isAr ? "المقاس" : "Taille"}</p>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((s) => (
                  <button key={s} onClick={() => setSelectedSize(s)}
                    className={cn("h-9 px-3 rounded-lg border text-sm font-medium transition-all",
                      selectedSize === s
                        ? "border-souk-green-800 bg-souk-green-800 text-white"
                        : "border-gray-300 hover:border-souk-green-600 text-gray-700")}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity + Add to cart */}
            <div className="flex gap-3 mb-4">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-50 text-xl font-medium">−</button>
                <span className="px-4 py-2 text-sm font-bold min-w-[3rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(product.stockCount, q + 1))} className="px-3 py-2 hover:bg-gray-50 text-xl font-medium">+</button>
              </div>
              <Button fullWidth loading={adding} disabled={!product.inStock} onClick={handleAddToCart}
                leftIcon={adding ? undefined : <ShoppingCart size={18} />}>
                {adding ? (isAr ? "أضيف!" : "Ajouté !") : (isAr ? "أضف إلى السلة" : "Ajouter au panier")}
              </Button>
            </div>

            <Button variant="gold" fullWidth size="lg" className="mb-4">
              <Zap size={18} />
              {isAr ? "اشتري الآن" : "Acheter maintenant"}
            </Button>

            <div className="flex gap-3 mb-6">
              <button onClick={() => setWished((w) => !w)}
                className={cn("flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition-colors",
                  wished ? "border-red-300 text-red-500 bg-red-50" : "border-gray-300 text-gray-600 hover:border-souk-terracotta-400")}>
                <Heart size={16} fill={wished ? "currentColor" : "none"} />
                {wished ? (isAr ? "إزالة من المفضلة" : "Retiré des favoris") : (isAr ? "أضف للمفضلة" : "Ajouter aux favoris")}
              </button>
              <button className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:border-souk-green-400 transition-colors">
                <Share2 size={16} />
                {isAr ? "مشاركة" : "Partager"}
              </button>
            </div>

            {/* Delivery info */}
            <div className="bg-souk-sand rounded-xl p-4 space-y-3 mb-5">
              {[
                { Icon: Truck, bg: "bg-souk-green-100", tc: "text-souk-green-700", text: product.freeDelivery ? (isAr ? "توصيل مجاني" : "Livraison GRATUITE") : (isAr ? "توصيل 25–50 درهم" : "Livraison 25–50 MAD"), sub: isAr ? "مقدَّر في 2–5 أيام عمل" : "Estimée sous 2–5 jours ouvrés" },
                { Icon: RefreshCw, bg: "bg-sky-100", tc: "text-sky-700", text: isAr ? "إرجاع سهل خلال 30 يوماً" : "Retours faciles sous 30 jours", sub: isAr ? "منتج غير مفتوح" : "Produit non ouvert" },
                { Icon: Shield, bg: "bg-souk-gold-100", tc: "text-souk-gold-700", text: isAr ? "دفع آمن 100%" : "Paiement 100% sécurisé", sub: isAr ? "معتمد CMI & PCI DSS" : "Certifié CMI & PCI DSS" },
              ].map(({ Icon, bg, tc, text, sub }) => (
                <div key={text} className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${bg}`}><Icon size={16} className={tc} strokeWidth={1.75} /></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{text}</p>
                    <p className="text-xs text-gray-500">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Vendor */}
            <Link href={`/${locale}/vendeurs/${product.vendor.slug}`}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-souk-green-400 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-souk-green-100 flex items-center justify-center text-souk-green-800 font-bold">
                {product.vendor.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-sm text-gray-900">{product.vendor.name}</p>
                  {product.vendor.verified && <CheckCircle size={13} className="text-souk-green-600" />}
                </div>
                {product.vendor.artisan && (
                  <p className="text-xs text-souk-gold-600 flex items-center gap-1">
                    <Award size={10} />{isAr ? "حرفي معتمد" : "Artisan certifié"}
                  </p>
                )}
              </div>
              <span className="flex items-center gap-1 text-xs text-souk-green-700 font-medium px-2 py-1 border border-souk-green-300 rounded-lg hover:bg-souk-green-50">
                <MessageCircle size={12} />{isAr ? "تواصل" : "Contacter"}
              </span>
            </Link>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mb-8">
          <div className="flex border-b border-gray-200 gap-6 overflow-x-auto scrollbar-none">
            {(["description", "details", "reviews"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={cn("pb-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px",
                  activeTab === tab ? "border-souk-green-800 text-souk-green-800" : "border-transparent text-gray-500 hover:text-gray-800")}>
                {tabLabels[tab]}
              </button>
            ))}
          </div>

          <div className="pt-6">
            {activeTab === "description" && (
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                <p>
                  {isAr
                    ? (product.descriptionAr ?? product.description ?? "لا يوجد وصف متاح.")
                    : (product.description ?? "Aucune description disponible.")}
                </p>
              </div>
            )}

            {activeTab === "details" && (
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  [isAr ? "المرجع" : "Référence",     product.id.slice(0, 8).toUpperCase()],
                  [isAr ? "الأصل" : "Origine",         product.city ?? "—"],
                  [isAr ? "الفئة" : "Catégorie",       categoryName || "—"],
                  [isAr ? "الحالة" : "État",           isAr ? "جديد" : "Neuf"],
                  [isAr ? "المتوفر" : "Disponibilité", product.inStock ? (isAr ? `${product.stockCount} وحدة` : `${product.stockCount} unités`) : (isAr ? "نفد" : "Épuisé")],
                  [isAr ? "التوصيل" : "Livraison",     product.freeDelivery ? (isAr ? "مجاني" : "Gratuite") : (isAr ? "مدفوع" : "Payante")],
                ].map(([key, val]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100 text-sm">
                    <span className="font-medium text-gray-600">{key}</span>
                    <span className="text-gray-900">{val}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "reviews" && (
              <ReviewsSection
                stats={reviewStats}
                reviews={reviews}
                hasNextPage={!!hasNextPage}
                fetchNextPage={fetchNextPage}
                isAr={isAr}
              />
            )}
          </div>
        </div>

        {/* ── Related products ── */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              <span className="border-b-4 border-souk-gold-500 pb-1">
                {isAr ? "منتجات مشابهة" : "Produits similaires"}
              </span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} id={p.id} slug={p.slug}
                  name={isAr ? p.nameAr : p.name} price={p.price}
                  originalPrice={p.originalPrice ?? undefined}
                  image={p.image ?? ""} rating={p.rating} reviewCount={p.reviewCount}
                  vendor={p.vendor}
                  badge={(p.badge?.toLowerCase() as "artisan" | "sale" | "new" | "top" | "flash" | undefined)}
                  inStock={p.inStock} freeDelivery={p.freeDelivery} locale={locale} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky mobile CTA ── */}
      <div className="fixed bottom-0 start-0 end-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 sm:hidden z-40 shadow-lg">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 truncate">{isAr ? product.nameAr : product.name}</p>
          <p className="font-black text-souk-green-800 text-lg">{formatPriceSimple(product.price)}</p>
        </div>
        <button onClick={() => setWished((w) => !w)}
          className={cn("p-3 rounded-xl border transition-colors shrink-0",
            wished ? "border-red-300 text-red-500 bg-red-50" : "border-gray-300 text-gray-500")}>
          <Heart size={20} fill={wished ? "currentColor" : "none"} />
        </button>
        <Button onClick={handleAddToCart} loading={adding} disabled={!product.inStock}
          leftIcon={adding ? undefined : <ShoppingCart size={18} />} className="shrink-0">
          {adding ? (isAr ? "أضيف!" : "Ajouté !") : (isAr ? "إضافة للسلة" : "Ajouter")}
        </Button>
      </div>

      {/* ── Image lightbox ── */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 end-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
            <X size={24} />
          </button>
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setMainImage((i) => (i - 1 + images.length) % images.length); }}
                className="absolute start-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                <ChevronLeft size={24} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setMainImage((i) => (i + 1) % images.length); }}
                className="absolute end-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                <ChevronRight size={24} />
              </button>
            </>
          )}
          <div className="relative w-full max-w-2xl aspect-square" onClick={(e) => e.stopPropagation()}>
            {images[mainImage] && (
              <Image src={images[mainImage]} alt={product.name} fill sizes="100vw" className="object-contain" />
            )}
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-6 flex gap-2">
              {images.map((_, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setMainImage(i); }}
                  className={cn("w-2 h-2 rounded-full transition-all", i === mainImage ? "bg-white scale-125" : "bg-white/40")} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function ReviewsSection({ stats, reviews, hasNextPage, fetchNextPage, isAr }: {
  stats: ReviewStatsDto | undefined;
  reviews: ReviewDetailDto[];
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isAr: boolean;
}) {
  return (
    <div className="space-y-6">
      {stats && (
        <div className="bg-souk-sand rounded-2xl p-5 flex flex-col sm:flex-row gap-6 items-center">
          <div className="text-center shrink-0">
            <p className="text-5xl font-black text-souk-green-800">{stats.averageRating.toFixed(1)}</p>
            <div className="flex justify-center my-1">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={14} className={s <= Math.round(stats.averageRating) ? "fill-souk-gold-500 text-souk-gold-500" : "fill-gray-200 text-gray-200"} />
              ))}
            </div>
            <p className="text-xs text-gray-500">{stats.totalCount} {isAr ? "تقييم" : "avis"}</p>
          </div>
          <div className="flex-1 w-full space-y-1.5">
            {stats.distribution.map(({ star, percent }) => (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 w-3 text-end">{star}</span>
                <Star size={10} className="fill-souk-gold-400 text-souk-gold-400 shrink-0" />
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-souk-gold-400 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                </div>
                <span className="text-gray-400 w-7 text-end">{percent}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-souk-green-200 flex items-center justify-center text-souk-green-800 font-bold text-sm">
                  {r.author[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm">{r.author}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={10} className={s <= r.rating ? "fill-souk-gold-500 text-souk-gold-500" : "fill-gray-200 text-gray-200"} />
                      ))}
                    </div>
                    {r.isVerifiedPurchase && (
                      <span className="text-xs text-souk-green-600 flex items-center gap-0.5">
                        <CheckCircle size={10} />{isAr ? "شراء موثق" : "Achat vérifié"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(r.createdAt).toLocaleDateString(isAr ? "ar-MA" : "fr-MA")}
              </span>
            </div>
            {r.comment && <p className="text-sm text-gray-700">{r.comment}</p>}
          </div>
        ))}

        {reviews.length === 0 && (
          <p className="text-center text-gray-400 py-8">
            {isAr ? "لا توجد تقييمات بعد" : "Aucun avis pour l'instant"}
          </p>
        )}
      </div>

      {hasNextPage && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={fetchNextPage}>
            {isAr ? "تحميل المزيد" : "Charger plus d'avis"}
          </Button>
        </div>
      )}
    </div>
  );
}

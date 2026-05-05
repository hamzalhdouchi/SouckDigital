"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Heart, Share2, ShoppingCart, Truck, RefreshCw, Shield, Star,
  CheckCircle, MessageCircle, Zap, ChevronLeft, ChevronRight,
  Award, X, ZoomIn, Clock, Eye,
} from "lucide-react";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Rating from "@/components/ui/rating";
import ProductCard from "@/components/modules/product-card";
import { useCartStore } from "@/lib/store/cart";
import { MOCK_PRODUCTS, MOCK_REVIEWS } from "@/lib/mock-data";
import { cn, formatPriceSimple, calculateDiscount } from "@/lib/utils";

const COLORS = ["#C0614A", "#1A3C2E", "#C9973A", "#4A6FA5", "#2C2C2C"];
const SIZES  = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProductDetailPage() {
  const params = useParams();
  const locale = params.locale as string;
  const slug   = params.slug as string;
  const isAr   = locale === "ar";

  const product = MOCK_PRODUCTS.find((p) => p.slug === slug) ?? MOCK_PRODUCTS[0];
  const relatedProducts = MOCK_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  const [mainImage,     setMainImage]     = useState(0);
  const [lightboxOpen,  setLightboxOpen]  = useState(false);
  const [quantity,      setQuantity]      = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize,  setSelectedSize]  = useState<string | null>(null);
  const [activeTab,     setActiveTab]     = useState<"description" | "details" | "reviews">("description");
  const [wished,        setWished]        = useState(false);
  const [adding,        setAdding]        = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<typeof MOCK_PRODUCTS>([]);

  const addItem  = useCartStore((s) => s.addItem);
  const discount = product.originalPrice > product.price
    ? calculateDiscount(product.originalPrice, product.price) : 0;

  const isLowStock = product.inStock && product.stockCount <= 5;

  useEffect(() => {
    const key = "souk_recently_viewed";
    const stored: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");
    const updated = [product.id, ...stored.filter((id) => id !== product.id)].slice(0, 8);
    localStorage.setItem(key, JSON.stringify(updated));
    const recent = MOCK_PRODUCTS.filter((p) => updated.includes(p.id) && p.id !== product.id).slice(0, 4);
    setRecentlyViewed(recent);
  }, [product.id]);

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

  /* Rating distribution mock */
  const RATING_DIST = [
    { star: 5, count: Math.round(product.reviewCount * 0.62) },
    { star: 4, count: Math.round(product.reviewCount * 0.22) },
    { star: 3, count: Math.round(product.reviewCount * 0.09) },
    { star: 2, count: Math.round(product.reviewCount * 0.04) },
    { star: 1, count: Math.round(product.reviewCount * 0.03) },
  ];

  const tabLabels = {
    description: isAr ? "الوصف"         : "Description",
    details:     isAr ? "المميزات"      : "Caractéristiques",
    reviews:     isAr ? `التقييمات (${product.reviewCount})` : `Avis (${product.reviewCount})`,
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6 pb-28 sm:pb-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2 flex-wrap">
          <Link href={`/${locale}`} className="hover:text-souk-green-800">{isAr ? "الرئيسية" : "Accueil"}</Link>
          <ChevronRight size={14} className="text-gray-300 rtl:rotate-180" />
          <Link href={`/${locale}/categories/${product.category.toLowerCase()}`} className="hover:text-souk-green-800">{product.category}</Link>
          <ChevronRight size={14} className="text-gray-300 rtl:rotate-180" />
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{isAr ? product.nameAr : product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* ── Gallery ── */}
          <div className="space-y-3">
            <div
              className="relative aspect-square rounded-2xl overflow-hidden bg-souk-sand cursor-zoom-in group"
              onClick={() => setLightboxOpen(true)}
            >
              <Image
                src={product.images[mainImage] ?? product.image}
                alt={product.name}
                fill sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />
              {discount >= 10 && (
                <div className="absolute top-4 start-4">
                  <span className="bg-souk-terracotta-500 text-white font-bold px-3 py-1.5 rounded-xl text-sm">
                    -{discount}%
                  </span>
                </div>
              )}
              {product.vendor.artisan && (
                <div className="absolute top-4 end-4">
                  <Badge variant="artisan" className="flex items-center gap-1"><Award size={10} />{isAr ? "حرفي معتمد" : "Artisan certifié"}</Badge>
                </div>
              )}
              {/* Zoom hint */}
              <div className="absolute bottom-3 end-3 bg-black/50 text-white rounded-lg px-2 py-1 text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn size={12} />
                {isAr ? "تكبير" : "Agrandir"}
              </div>
              {/* Nav arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setMainImage((i) => (i - 1 + product.images.length) % product.images.length); }}
                    className="absolute start-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setMainImage((i) => (i + 1) % product.images.length); }}
                    className="absolute end-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setMainImage(i)}
                    className={cn("relative h-16 w-16 rounded-lg overflow-hidden border-2 transition-colors", mainImage === i ? "border-souk-green-800" : "border-gray-200 hover:border-souk-green-400")}>
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info panel ── */}
          <div className="flex flex-col">
            <p className="text-sm text-souk-green-600 font-medium mb-1">{product.category}</p>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-3">
              {isAr ? product.nameAr : product.name}
            </h1>

            <div className="flex items-center gap-4 mb-3">
              <Rating value={product.rating} count={product.reviewCount} size="md" />
              <span className="text-xs flex items-center gap-1">
                <Eye size={12} className="text-gray-400" />
                <span className="text-gray-500">
                  {Math.floor(Math.random() * 40) + 12} {isAr ? "يشاهد الآن" : "voient en ce moment"}
                </span>
              </span>
            </div>

            {/* Stock indicator */}
            {isLowStock ? (
              <div className="flex items-center gap-1.5 mb-3 text-souk-terracotta-600 bg-souk-terracotta-50 border border-souk-terracotta-200 rounded-lg px-3 py-2 text-sm font-medium w-fit">
                <Clock size={14} />
                {isAr ? `لم يتبق سوى ${product.stockCount} في المخزون!` : `Plus que ${product.stockCount} en stock !`}
              </div>
            ) : (
              <span className="text-xs text-souk-green-600 bg-souk-green-50 px-2 py-0.5 rounded-full font-medium w-fit mb-3">
                {product.inStock ? (isAr ? `${product.stockCount} في المخزون` : `${product.stockCount} en stock`) : (isAr ? "نفد المخزون" : "Rupture de stock")}
              </span>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-3xl font-black text-souk-green-800">{formatPriceSimple(product.price)}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPriceSimple(product.originalPrice)}</span>
                  <span className="bg-souk-terracotta-100 text-souk-terracotta-600 text-sm font-bold px-2 py-0.5 rounded-lg">
                    {isAr ? `وفّر ${formatPriceSimple(product.originalPrice - product.price)}` : `Économisez ${formatPriceSimple(product.originalPrice - product.price)}`}
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
                    className={cn("h-8 w-8 rounded-full border-2 transition-all", selectedColor === c ? "border-souk-green-800 scale-110" : "border-transparent hover:scale-105")}
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
                      selectedSize === s ? "border-souk-green-800 bg-souk-green-800 text-white" : "border-gray-300 hover:border-souk-green-600 text-gray-700")}>
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

            {/* Action icons */}
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
                { Icon: Truck,     bg: "bg-souk-green-100",  text_color: "text-souk-green-700",  text: product.freeDelivery ? (isAr ? "توصيل مجاني" : "Livraison GRATUITE") : (isAr ? "توصيل 25–50 درهم حسب المدينة" : "Livraison 25–50 MAD selon ville"), sub: isAr ? "مقدَّر في 2–5 أيام عمل" : "Estimée sous 2–5 jours ouvrés" },
                { Icon: RefreshCw, bg: "bg-sky-100",          text_color: "text-sky-700",          text: isAr ? "إرجاع سهل خلال 30 يوماً" : "Retours faciles sous 30 jours", sub: isAr ? "منتج غير مفتوح · على حساب البائع" : "Produit non ouvert · Frais à la charge du vendeur" },
                { Icon: Shield,    bg: "bg-souk-gold-100",   text_color: "text-souk-gold-700",   text: isAr ? "دفع آمن 100%" : "Paiement 100% sécurisé", sub: isAr ? "معتمد CMI & PCI DSS" : "Certifié CMI & PCI DSS" },
              ].map(({ Icon, bg, text_color, text, sub }) => (
                <div key={text} className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${bg}`}>
                    <Icon size={16} className={text_color} strokeWidth={1.75} />
                  </div>
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
                <MessageCircle size={12} />
                {isAr ? "تواصل" : "Contacter"}
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
                    ? "هذا المنتج الاستثنائي مصنوع يدوياً من قِبَل حرفيين مغاربة مهرة، باستخدام تقنيات تقليدية متوارثة جيلاً بعد جيل. كل قطعة فريدة من نوعها وتعكس غنى التراث الحرفي المغربي."
                    : "Ce produit exceptionnel est fabriqué à la main par des artisans marocains qualifiés, utilisant des techniques traditionnelles transmises de génération en génération. Chaque pièce est unique et reflète la richesse du patrimoine artisanal marocain."
                  }
                </p>
                <p className="mt-3">
                  {isAr
                    ? "جودة المواد المستخدمة تضمن المتانة والأصالة. هذا المنتج مثالي للاستخدام اليومي أو كهدية لأحبائك."
                    : "La qualité des matériaux utilisés garantit durabilité et authenticité. Ce produit est idéal comme usage quotidien ou comme cadeau pour vos proches."
                  }
                </p>
              </div>
            )}
            {activeTab === "details" && (
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  [isAr ? "المرجع" : "Référence",       product.id.toUpperCase()],
                  [isAr ? "الأصل" : "Origine",           product.city],
                  [isAr ? "الفئة" : "Catégorie",         product.category],
                  [isAr ? "الحالة" : "État",             isAr ? "جديد" : "Neuf"],
                  [isAr ? "المتوفر" : "Disponibilité",   product.inStock ? (isAr ? `${product.stockCount} وحدة` : `${product.stockCount} unités`) : (isAr ? "نفد" : "Épuisé")],
                  [isAr ? "التوصيل" : "Livraison",       product.freeDelivery ? (isAr ? "مجاني" : "Gratuite") : (isAr ? "مدفوع" : "Payante")],
                ].map(([key, val]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100 text-sm">
                    <span className="font-medium text-gray-600">{key}</span>
                    <span className="text-gray-900">{val}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                {/* Rating overview */}
                <div className="bg-souk-sand rounded-2xl p-5 flex flex-col sm:flex-row gap-6 items-center">
                  <div className="text-center shrink-0">
                    <p className="text-5xl font-black text-souk-green-800">{product.rating}</p>
                    <div className="flex justify-center my-1">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={14} className={s <= Math.round(product.rating) ? "fill-souk-gold-500 text-souk-gold-500" : "fill-gray-200 text-gray-200"} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">{product.reviewCount} {isAr ? "تقييم" : "avis"}</p>
                  </div>
                  <div className="flex-1 w-full space-y-1.5">
                    {RATING_DIST.map(({ star, count }) => {
                      const pct = product.reviewCount > 0 ? Math.round((count / product.reviewCount) * 100) : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500 w-3 text-end">{star}</span>
                          <Star size={10} className="fill-souk-gold-400 text-souk-gold-400 shrink-0" />
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-souk-gold-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-gray-400 w-7 text-end">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Review cards */}
                <div className="space-y-4">
                  {MOCK_REVIEWS.map((r) => (
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
                              {r.verified && (
                                <span className="text-xs text-souk-green-600 flex items-center gap-0.5">
                                  <CheckCircle size={10} />{isAr ? "شراء موثق" : "Achat vérifié"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{r.date}</span>
                      </div>
                      <p className="text-sm text-gray-700">{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Recently viewed ── */}
        {recentlyViewed.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              <span className="border-b-4 border-gray-200 pb-1">{isAr ? "شاهدته مؤخراً" : "Récemment consultés"}</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {recentlyViewed.map((p) => (
                <ProductCard key={p.id} id={p.id} slug={p.slug}
                  name={isAr ? p.nameAr : p.name} price={p.price}
                  originalPrice={p.originalPrice !== p.price ? p.originalPrice : undefined}
                  image={p.image} rating={p.rating} reviewCount={p.reviewCount}
                  vendor={p.vendor} badge={p.badge} inStock={p.inStock}
                  freeDelivery={p.freeDelivery} locale={locale} />
              ))}
            </div>
          </div>
        )}

        {/* ── Related products ── */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            <span className="border-b-4 border-souk-gold-500 pb-1">{isAr ? "منتجات مشابهة" : "Produits similaires"}</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} id={p.id} slug={p.slug}
                name={isAr ? p.nameAr : p.name} price={p.price}
                originalPrice={p.originalPrice !== p.price ? p.originalPrice : undefined}
                image={p.image} rating={p.rating} reviewCount={p.reviewCount}
                vendor={p.vendor} badge={p.badge} inStock={p.inStock}
                freeDelivery={p.freeDelivery} locale={locale} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Sticky mobile CTA ── */}
      <div className="fixed bottom-0 start-0 end-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 sm:hidden z-40 shadow-lg">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 truncate">{isAr ? product.nameAr : product.name}</p>
          <p className="font-black text-souk-green-800 text-lg">{formatPriceSimple(product.price)}</p>
        </div>
        <button onClick={() => setWished((w) => !w)}
          className={cn("p-3 rounded-xl border transition-colors shrink-0", wished ? "border-red-300 text-red-500 bg-red-50" : "border-gray-300 text-gray-500")}>
          <Heart size={20} fill={wished ? "currentColor" : "none"} />
        </button>
        <Button onClick={handleAddToCart} loading={adding} disabled={!product.inStock}
          leftIcon={adding ? undefined : <ShoppingCart size={18} />}
          className="shrink-0">
          {adding ? (isAr ? "أضيف!" : "Ajouté !") : (isAr ? "إضافة للسلة" : "Ajouter")}
        </Button>
      </div>

      {/* ── Image lightbox ── */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 end-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
            <X size={24} />
          </button>
          {product.images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setMainImage((i) => (i - 1 + product.images.length) % product.images.length); }}
                className="absolute start-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setMainImage((i) => (i + 1) % product.images.length); }}
                className="absolute end-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
          <div className="relative w-full max-w-2xl aspect-square" onClick={(e) => e.stopPropagation()}>
            <Image
              src={product.images[mainImage] ?? product.image}
              alt={product.name} fill sizes="100vw"
              className="object-contain"
            />
          </div>
          {product.images.length > 1 && (
            <div className="absolute bottom-6 flex gap-2">
              {product.images.map((_, i) => (
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

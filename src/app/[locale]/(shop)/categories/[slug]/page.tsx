"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Filter, SlidersHorizontal, X, ChevronDown, LayoutGrid, List,
  Landmark, Shirt, Sparkles, Home, Smartphone, Wheat, Package,
  Truck, Award, ChevronLeft, ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ProductCard from "@/components/modules/product-card";
import Button from "@/components/ui/button";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "relevance",  label: "Pertinence",      labelAr: "الأكثر صلة" },
  { value: "price_asc",  label: "Prix croissant",   labelAr: "السعر: الأقل أولاً" },
  { value: "price_desc", label: "Prix décroissant", labelAr: "السعر: الأعلى أولاً" },
  { value: "rating",     label: "Mieux notés",      labelAr: "الأعلى تقييماً" },
  { value: "newest",     label: "Plus récents",     labelAr: "الأحدث" },
];

const CITIES = ["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Safi", "Essaouira"];

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  artisanat:    Landmark,
  mode:         Shirt,
  beaute:       Sparkles,
  maison:       Home,
  electronique: Smartphone,
  alimentation: Wheat,
};

const SUBCATEGORIES: Record<string, { label: string; labelAr: string }[]> = {
  artisanat:    [{ label: "Poterie", labelAr: "الفخار" }, { label: "Tapis", labelAr: "السجاد" }, { label: "Bijoux", labelAr: "المجوهرات" }, { label: "Maroquinerie", labelAr: "الجلود" }, { label: "Sculpture", labelAr: "النحت" }],
  mode:         [{ label: "Djellabas", labelAr: "الجلابيب" }, { label: "Caftans", labelAr: "القفاطين" }, { label: "Accessoires", labelAr: "الإكسسوارات" }, { label: "Chaussures", labelAr: "الأحذية" }],
  beaute:       [{ label: "Argan", labelAr: "الأرغان" }, { label: "Savons", labelAr: "الصابون" }, { label: "Parfums", labelAr: "العطور" }, { label: "Soins corps", labelAr: "العناية بالجسم" }],
  maison:       [{ label: "Lanternes", labelAr: "الفوانيس" }, { label: "Coussins", labelAr: "الوسائد" }, { label: "Céramique", labelAr: "الخزف" }, { label: "Mobilier", labelAr: "الأثاث" }],
  electronique: [{ label: "Smartphones", labelAr: "الهواتف" }, { label: "Audio", labelAr: "الصوتيات" }, { label: "Informatique", labelAr: "الحاسوب" }, { label: "Accessoires", labelAr: "الملحقات" }],
  alimentation: [{ label: "Épices", labelAr: "التوابل" }, { label: "Huiles", labelAr: "الزيوت" }, { label: "Dattes", labelAr: "التمور" }, { label: "Thés", labelAr: "الشاي" }],
};

const PAGE_SIZE = 8;

function sortProducts(products: typeof MOCK_PRODUCTS, sort: string) {
  return [...products].sort((a, b) => {
    if (sort === "price_asc")  return a.price - b.price;
    if (sort === "price_desc") return b.price - a.price;
    if (sort === "rating")     return b.rating - a.rating;
    return 0;
  });
}

export default function CategoryPage() {
  const params = useParams();
  const locale = params.locale as string;
  const slug   = params.slug as string;
  const isAr   = locale === "ar";

  const category = MOCK_CATEGORIES.find((c) => c.slug === slug) ?? MOCK_CATEGORIES[0];
  const Icon = CATEGORY_ICONS[slug] ?? Landmark;

  const [sort,          setSort]          = useState("relevance");
  const [filterOpen,    setFilterOpen]    = useState(false);
  const [priceMin,      setPriceMin]      = useState("");
  const [priceMax,      setPriceMax]      = useState("");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [freeDelivery,  setFreeDelivery]  = useState(false);
  const [artisanOnly,   setArtisanOnly]   = useState(false);
  const [activeSub,     setActiveSub]     = useState<string | null>(null);
  const [view,          setView]          = useState<"grid" | "list">("grid");
  const [page,          setPage]          = useState(1);
  const [minRating,     setMinRating]     = useState(0);

  const toggleCity = (city: string) =>
    setSelectedCities((prev) => prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]);

  const resetFilters = () => {
    setPriceMin(""); setPriceMax(""); setSelectedCities([]);
    setFreeDelivery(false); setArtisanOnly(false); setMinRating(0); setActiveSub(null);
  };

  const filtered = useMemo(() => {
    let list = MOCK_PRODUCTS;
    if (freeDelivery)          list = list.filter((p) => p.freeDelivery);
    if (artisanOnly)           list = list.filter((p) => p.vendor.artisan);
    if (priceMin)              list = list.filter((p) => p.price >= Number(priceMin));
    if (priceMax)              list = list.filter((p) => p.price <= Number(priceMax));
    if (selectedCities.length) list = list.filter((p) => selectedCities.includes(p.city));
    if (minRating > 0)         list = list.filter((p) => p.rating >= minRating);
    return sortProducts(list, sort);
  }, [sort, freeDelivery, artisanOnly, priceMin, priceMax, selectedCities, minRating]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const hasActiveFilters = freeDelivery || artisanOnly || selectedCities.length > 0 || priceMin || priceMax || minRating > 0;

  const subcats = SUBCATEGORIES[slug] ?? [];

  return (
    <div>
      {/* ── Hero ── */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <Image
          src={category.image}
          alt={isAr ? category.nameAr : category.name}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-souk-green-900/60 via-souk-green-900/40 to-souk-green-900/80" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="text-xs text-white/70 flex items-center gap-1.5 mb-3">
            <Link href={`/${locale}`} className="hover:text-white transition-colors">
              {isAr ? "الرئيسية" : "Accueil"}
            </Link>
            <ChevronRight size={12} className="text-white/40 rtl:rotate-180" />
            <Link href={`/${locale}/categories`} className="hover:text-white transition-colors">
              {isAr ? "الفئات" : "Catégories"}
            </Link>
            <ChevronRight size={12} className="text-white/40 rtl:rotate-180" />
            <span className="text-white font-medium">{isAr ? category.nameAr : category.name}</span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-souk-gold-500/20 border border-souk-gold-400/40 flex items-center justify-center">
              <Icon size={24} className="text-souk-gold-300" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {isAr ? category.nameAr : category.name}
              </h1>
              <p className="text-sm text-white/70 mt-0.5">
                {filtered.length} {isAr ? "منتج" : "produits"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Subcategory chips ── */}
      {subcats.length > 0 && (
        <div className="bg-white border-b border-gray-100 px-4">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
            <button
              onClick={() => setActiveSub(null)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                activeSub === null
                  ? "bg-souk-green-800 text-white border-souk-green-800"
                  : "border-gray-200 text-gray-600 hover:border-souk-green-400"
              )}
            >
              {isAr ? "الكل" : "Tous"}
            </button>
            {subcats.map((sub) => (
              <button
                key={sub.label}
                onClick={() => setActiveSub(activeSub === sub.label ? null : sub.label)}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                  activeSub === sub.label
                    ? "bg-souk-green-800 text-white border-souk-green-800"
                    : "border-gray-200 text-gray-600 hover:border-souk-green-400"
                )}
              >
                {isAr ? sub.labelAr : sub.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters sidebar — desktop */}
          <aside className="hidden lg:block w-60 shrink-0">
            <FiltersPanel
              priceMin={priceMin} setPriceMin={setPriceMin}
              priceMax={priceMax} setPriceMax={setPriceMax}
              selectedCities={selectedCities} toggleCity={toggleCity}
              freeDelivery={freeDelivery} setFreeDelivery={setFreeDelivery}
              artisanOnly={artisanOnly} setArtisanOnly={setArtisanOnly}
              minRating={minRating} setMinRating={setMinRating}
              onReset={resetFilters} isAr={isAr}
            />
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <p className="text-sm text-gray-500">
                {isAr ? `${filtered.length} منتج` : `${filtered.length} produits`}
              </p>
              <div className="flex items-center gap-2">
                {/* Mobile filter */}
                <button
                  onClick={() => setFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:border-souk-green-600 transition-colors"
                >
                  <SlidersHorizontal size={16} />
                  {isAr ? "الفلاتر" : "Filtres"}
                  {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-souk-terracotta-500" />}
                </button>

                {/* Sort */}
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => { setSort(e.target.value); setPage(1); }}
                    className="appearance-none ps-3 pe-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-souk-gold-500 cursor-pointer"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{isAr ? o.labelAr : o.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute end-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
                </div>

                {/* View toggle */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setView("grid")}
                    className={cn("px-2.5 py-2 transition-colors", view === "grid" ? "bg-souk-green-800 text-white" : "hover:bg-gray-50 text-gray-600")}
                    title="Grille"
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setView("list")}
                    className={cn("px-2.5 py-2 transition-colors border-s border-gray-300", view === "list" ? "bg-souk-green-800 text-white" : "hover:bg-gray-50 text-gray-600")}
                    title="Liste"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {freeDelivery && (
                  <FilterChip label={isAr ? "توصيل مجاني" : "Livraison gratuite"} onRemove={() => setFreeDelivery(false)} color="green" />
                )}
                {artisanOnly && (
                  <FilterChip label={isAr ? "صناعة تقليدية" : "Artisanat authentique"} onRemove={() => setArtisanOnly(false)} color="gold" />
                )}
                {minRating > 0 && (
                  <FilterChip label={`≥ ${minRating}★`} onRemove={() => setMinRating(0)} color="gold" />
                )}
                {(priceMin || priceMax) && (
                  <FilterChip label={`${priceMin || "0"} – ${priceMax || "∞"} MAD`} onRemove={() => { setPriceMin(""); setPriceMax(""); }} color="gray" />
                )}
                {selectedCities.map((c) => (
                  <FilterChip key={c} label={c} onRemove={() => toggleCity(c)} color="gray" />
                ))}
                <button onClick={resetFilters} className="text-xs text-souk-terracotta-600 font-medium hover:underline px-1">
                  {isAr ? "مسح الكل" : "Tout effacer"}
                </button>
              </div>
            )}

            {/* Product grid / list */}
            {paginated.length === 0 ? (
              <EmptyState isAr={isAr} onReset={resetFilters} />
            ) : (
              <div className={cn(
                view === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
                  : "flex flex-col gap-3"
              )}>
                {paginated.map((p) => (
                  <ProductCard
                    key={p.id}
                    id={p.id} slug={p.slug}
                    name={isAr ? p.nameAr : p.name}
                    price={p.price}
                    originalPrice={p.originalPrice !== p.price ? p.originalPrice : undefined}
                    image={p.image} rating={p.rating} reviewCount={p.reviewCount}
                    vendor={p.vendor} badge={p.badge} inStock={p.inStock}
                    freeDelivery={p.freeDelivery} locale={locale}
                    variant={view}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-8">
                <PaginationBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  <ChevronLeft size={16} className="rtl:rotate-180" />
                </PaginationBtn>
                {Array.from({ length: totalPages }).map((_, i) => {
                  const n = i + 1;
                  const show = n === 1 || n === totalPages || Math.abs(n - currentPage) <= 1;
                  const dots = !show && (n === 2 || n === totalPages - 1);
                  if (dots) return <span key={n} className="px-2 text-gray-400 text-sm">…</span>;
                  if (!show) return null;
                  return (
                    <PaginationBtn key={n} onClick={() => setPage(n)} active={n === currentPage}>
                      {n}
                    </PaginationBtn>
                  );
                })}
                <PaginationBtn onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  <ChevronRight size={16} className="rtl:rotate-180" />
                </PaginationBtn>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFilterOpen(false)} />
          <div className="absolute bottom-0 start-0 end-0 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Filter size={18} />
                {isAr ? "الفلاتر" : "Filtres"}
              </h3>
              <button onClick={() => setFilterOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <FiltersPanel
                priceMin={priceMin} setPriceMin={setPriceMin}
                priceMax={priceMax} setPriceMax={setPriceMax}
                selectedCities={selectedCities} toggleCity={toggleCity}
                freeDelivery={freeDelivery} setFreeDelivery={setFreeDelivery}
                artisanOnly={artisanOnly} setArtisanOnly={setArtisanOnly}
                minRating={minRating} setMinRating={setMinRating}
                onReset={resetFilters} isAr={isAr}
              />
            </div>
            <div className="sticky bottom-0 bg-white p-4 border-t">
              <Button fullWidth onClick={() => setFilterOpen(false)}>
                {isAr ? `عرض ${filtered.length} منتج` : `Voir ${filtered.length} produits`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Filters panel ── */
interface FiltersPanelProps {
  priceMin: string; setPriceMin: (v: string) => void;
  priceMax: string; setPriceMax: (v: string) => void;
  selectedCities: string[]; toggleCity: (c: string) => void;
  freeDelivery: boolean; setFreeDelivery: (v: boolean) => void;
  artisanOnly: boolean; setArtisanOnly: (v: boolean) => void;
  minRating: number; setMinRating: (v: number) => void;
  onReset: () => void;
  isAr: boolean;
}

function FiltersPanel({ priceMin, setPriceMin, priceMax, setPriceMax, selectedCities, toggleCity, freeDelivery, setFreeDelivery, artisanOnly, setArtisanOnly, minRating, setMinRating, onReset, isAr }: FiltersPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-sm text-gray-900 mb-3">{isAr ? "السعر (درهم)" : "Prix (MAD)"}</h3>
        <div className="flex gap-2">
          <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="Min"
            className="flex-1 h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-souk-gold-500" />
          <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="Max"
            className="flex-1 h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-souk-gold-500" />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-gray-900">{isAr ? "خيارات" : "Options"}</h3>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={freeDelivery} onChange={(e) => setFreeDelivery(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 accent-souk-green-800" />
          <span className="text-sm text-gray-700 flex items-center gap-1.5">
            <Truck size={13} className="text-souk-green-600" />
            {isAr ? "توصيل مجاني" : "Livraison gratuite"}
          </span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={artisanOnly} onChange={(e) => setArtisanOnly(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 accent-souk-green-800" />
          <span className="text-sm text-gray-700 flex items-center gap-1.5">
            <Award size={13} className="text-souk-gold-600" />
            {isAr ? "صناعة تقليدية" : "Artisanat authentique"}
          </span>
        </label>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-900 mb-3">{isAr ? "الحد الأدنى للتقييم" : "Note minimale"}</h3>
        <div className="flex gap-1.5">
          {[0, 3, 4, 4.5].map((r) => (
            <button key={r} onClick={() => setMinRating(r)}
              className={cn("text-xs px-2 py-1 rounded-lg border font-medium transition-colors",
                minRating === r ? "bg-souk-gold-500 text-white border-souk-gold-500" : "border-gray-200 text-gray-600 hover:border-souk-gold-400"
              )}>
              {r === 0 ? (isAr ? "الكل" : "Tous") : `${r}★`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-900 mb-3">{isAr ? "المدينة" : "Ville"}</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {CITIES.map((city) => (
            <label key={city} className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={selectedCities.includes(city)} onChange={() => toggleCity(city)}
                className="h-4 w-4 rounded border-gray-300 accent-souk-green-800" />
              <span className="text-sm text-gray-700">{city}</span>
            </label>
          ))}
        </div>
      </div>

      <button onClick={onReset}
        className="w-full text-sm text-souk-terracotta-600 font-medium py-2 border border-souk-terracotta-200 rounded-lg hover:bg-souk-terracotta-50 transition-colors">
        {isAr ? "إعادة ضبط الفلاتر" : "Réinitialiser les filtres"}
      </button>
    </div>
  );
}

/* ── Empty state ── */
function EmptyState({ isAr, onReset }: { isAr: boolean; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <Package size={36} className="text-gray-300" />
      </div>
      <h3 className="text-lg font-bold text-gray-700 mb-2">
        {isAr ? "لا توجد منتجات" : "Aucun produit trouvé"}
      </h3>
      <p className="text-sm text-gray-500 mb-5 max-w-xs">
        {isAr ? "جرّب تعديل الفلاتر لعرض المزيد من المنتجات." : "Essayez de modifier vos filtres pour voir plus de produits."}
      </p>
      <button onClick={onReset}
        className="px-5 py-2.5 bg-souk-green-800 text-white rounded-xl text-sm font-semibold hover:bg-souk-green-700 transition-colors">
        {isAr ? "مسح الفلاتر" : "Effacer les filtres"}
      </button>
    </div>
  );
}

/* ── Filter chip ── */
function FilterChip({ label, onRemove, color }: { label: string; onRemove: () => void; color: "green" | "gold" | "gray" }) {
  const colors = {
    green: "bg-souk-green-100 text-souk-green-800",
    gold:  "bg-souk-gold-100 text-souk-gold-700",
    gray:  "bg-gray-100 text-gray-700",
  };
  return (
    <span className={cn("flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium", colors[color])}>
      {label}
      <button onClick={onRemove} className="hover:opacity-70 transition-opacity"><X size={12} /></button>
    </span>
  );
}

/* ── Pagination button ── */
function PaginationBtn({ children, onClick, disabled, active }: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean; active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors border",
        active   ? "bg-souk-green-800 text-white border-souk-green-800" :
        disabled ? "text-gray-300 border-gray-200 cursor-not-allowed" :
                   "border-gray-200 text-gray-700 hover:border-souk-green-400 hover:text-souk-green-800"
      )}
    >
      {children}
    </button>
  );
}

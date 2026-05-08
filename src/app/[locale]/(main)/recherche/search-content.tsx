"use client";

import { useState, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/modules/product-card";
import Button from "@/components/ui/button";
import { FilterPanel } from "@/components/modules/filter-panel";
import { searchApi } from "@/lib/api/search";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "relevance",  labelFr: "Pertinence",       labelAr: "الصلة" },
  { value: "price_asc",  labelFr: "Prix croissant",   labelAr: "السعر: من الأقل" },
  { value: "price_desc", labelFr: "Prix décroissant", labelAr: "السعر: من الأعلى" },
  { value: "newest",     labelFr: "Les plus récents", labelAr: "الأحدث" },
  { value: "rating",     labelFr: "Meilleures notes", labelAr: "الأعلى تقييماً" },
];

const PAGE_SIZE = 16;

function SearchContent() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const router       = useRouter();
  const locale       = params.locale as string;
  const isAr         = locale === "ar";
  const query        = searchParams.get("q") ?? "";

  const [searchInput,    setSearchInput]    = useState(query);
  const [sort,           setSort]           = useState("relevance");
  const [filtersOpen,    setFiltersOpen]    = useState(false);
  const [priceMin,       setPriceMin]       = useState("");
  const [priceMax,       setPriceMax]       = useState("");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [freeDelivery,   setFreeDelivery]   = useState(false);
  const [artisanOnly,    setArtisanOnly]    = useState(false);
  const [minRating,      setMinRating]      = useState(0);
  const [page,           setPage]           = useState(0);

  const toggleCity = (city: string) =>
    setSelectedCities((prev) => prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]);

  const resetFilters = () => {
    setFreeDelivery(false); setArtisanOnly(false);
    setSelectedCities([]); setPriceMin(""); setPriceMax(""); setMinRating(0); setPage(0);
  };

  const searchFilters = {
    q: query || undefined,
    ...(priceMin ? { minPrice: Number(priceMin) } : {}),
    ...(priceMax ? { maxPrice: Number(priceMax) } : {}),
    ...(selectedCities.length ? { city: selectedCities.join(",") } : {}),
    ...(freeDelivery ? { freeDelivery: true } : {}),
    ...(artisanOnly ? { artisanOnly: true } : {}),
    ...(minRating > 0 ? { minRating } : {}),
    sort: sort as "relevance" | "price_asc" | "price_desc" | "rating" | "newest",
    page,
    size: PAGE_SIZE,
  };

  const { data, isLoading } = useQuery({
    queryKey: ["search", searchFilters],
    queryFn: () => searchApi.search(searchFilters),
    staleTime: 30_000,
    enabled: true,
  });

  const products   = data?.products.content ?? [];
  const totalItems = data?.totalProducts ?? 0;
  const totalPages = data?.products.totalPages ?? 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    router.push(`/${locale}/recherche?q=${encodeURIComponent(searchInput)}`);
  };

  const activeFiltersCount = [
    freeDelivery, artisanOnly, selectedCities.length > 0,
    priceMin !== "", priceMax !== "", minRating > 0,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-2xl">
          <Search size={18} className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={isAr ? "ابحث عن منتج، تاجر..." : "Rechercher un produit, vendeur..."}
            className="w-full ps-11 pe-24 py-3.5 rounded-2xl border border-gray-200 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-souk-green-500"
          />
          <Button type="submit" size="sm" className="absolute end-2 top-1/2 -translate-y-1/2">
            {isAr ? "بحث" : "Chercher"}
          </Button>
        </div>
      </form>

      {/* Results header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          {query ? (
            <p className="text-sm text-gray-600">
              <span className="font-bold text-gray-900">{totalItems}</span>
              {" "}{isAr ? `نتيجة لـ "${query}"` : `résultat${totalItems !== 1 ? "s" : ""} pour "${query}"`}
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              {isAr ? "أدخل مصطلح بحث للعثور على المنتجات" : "Saisissez un terme pour rechercher des produits"}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors",
              filtersOpen || activeFiltersCount > 0
                ? "bg-souk-green-800 text-white border-souk-green-800"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
            )}
          >
            <SlidersHorizontal size={15} />
            {isAr ? "فلاتر" : "Filtres"}
            {activeFiltersCount > 0 && (
              <span className="h-5 w-5 rounded-full bg-souk-gold-500 text-white text-xs font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(0); }}
              className="appearance-none ps-3 pe-8 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-souk-green-500 cursor-pointer"
            >
              {SORT_OPTIONS.map(({ value, labelFr, labelAr }) => (
                <option key={value} value={value}>{isAr ? labelAr : labelFr}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute end-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters sidebar */}
        {filtersOpen && (
          <aside className="w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
              <FilterPanel
                priceMin={priceMin} setPriceMin={setPriceMin}
                priceMax={priceMax} setPriceMax={setPriceMax}
                selectedCities={selectedCities} toggleCity={toggleCity}
                freeDelivery={freeDelivery} setFreeDelivery={setFreeDelivery}
                artisanOnly={artisanOnly} setArtisanOnly={setArtisanOnly}
                minRating={minRating} setMinRating={setMinRating}
                onReset={resetFilters}
                isAr={isAr}
              />
            </div>
          </aside>
        )}

        {/* Results grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className={cn(
              "grid gap-3 sm:gap-4",
              filtersOpen ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
            )}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <Search size={56} className="text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {query
                  ? (isAr ? `لا توجد نتائج لـ "${query}"` : `Aucun résultat pour "${query}"`)
                  : (isAr ? "ابدأ بحثك" : "Commencez votre recherche")}
              </h3>
              <p className="text-gray-500 text-sm">
                {isAr ? "جرب كلمات بحث مختلفة أو تصفح الفئات" : "Essayez d'autres mots-clés ou parcourez les catégories"}
              </p>
            </div>
          ) : (
            <>
              <div className={cn(
                "grid gap-3 sm:gap-4",
                filtersOpen ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
              )}>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-8">
                  <PaginationBtn onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                    <ChevronLeft size={16} className="rtl:rotate-180" />
                  </PaginationBtn>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const show = i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1;
                    const dots = !show && (i === 1 || i === totalPages - 2);
                    if (dots) return <span key={i} className="px-2 text-gray-400 text-sm">…</span>;
                    if (!show) return null;
                    return (
                      <PaginationBtn key={i} onClick={() => setPage(i)} active={i === page}>
                        {i + 1}
                      </PaginationBtn>
                    );
                  })}
                  <PaginationBtn onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>
                    <ChevronRight size={16} className="rtl:rotate-180" />
                  </PaginationBtn>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-souk-green-800" /></div>}>
      <SearchContent />
    </Suspense>
  );
}

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

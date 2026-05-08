"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, Store, SlidersHorizontal } from "lucide-react";
import VendorCard from "@/components/modules/vendor-card";
import { VendorCardSkeleton } from "@/components/skeletons/vendor-card-skeleton";
import { vendorsApi } from "@/lib/api/vendors";

const MOROCCAN_CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir",
  "Meknès", "Oujda", "Kenitra", "Tétouan", "Salé", "Nador",
  "Béni Mellal", "Khouribga", "El Jadida", "Safi", "Mohammedia",
];

const PAGE_SIZE = 12;

export default function VendeursPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isAr = locale === "ar";

  const [page, setPage] = useState(0);
  const [city, setCity] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["vendors", { page, city }],
    queryFn: () => vendorsApi.getAll({ page, size: PAGE_SIZE, city: city || undefined }),
  });

  const vendors = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const filteredVendors = search
    ? vendors.filter((v) =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        (v.nameAr ?? "").includes(search)
      )
    : vendors;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    setPage(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-1">
          {isAr ? "المتاجر" : "Nos vendeurs"}
        </h1>
        <p className="text-gray-500 text-sm">
          {isAr
            ? "اكتشف أفضل الحرفيين والبائعين المغاربة"
            : "Découvrez les meilleurs artisans et vendeurs du Maroc"}
        </p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={isAr ? "ابحث عن متجر..." : "Rechercher un vendeur…"}
            className="w-full h-11 ps-9 pe-4 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-souk-green-500"
          />
        </form>

        {/* City filter */}
        <div className="relative sm:w-56">
          <SlidersHorizontal size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            value={city}
            onChange={(e) => handleCityChange(e.target.value)}
            className="w-full h-11 ps-9 pe-4 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-souk-green-500 appearance-none cursor-pointer"
          >
            <option value="">{isAr ? "كل المدن" : "Toutes les villes"}</option>
            {MOROCCAN_CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      {!isLoading && !isError && (
        <p className="text-xs text-gray-400 mb-4">
          {isAr
            ? `${totalElements} متجر`
            : `${totalElements} vendeur${totalElements !== 1 ? "s" : ""}`}
          {city && (
            <span>
              {" "}{isAr ? "في" : "à"} <strong className="text-gray-600">{city}</strong>
              <button
                onClick={() => handleCityChange("")}
                className="ms-1.5 text-souk-green-700 hover:underline"
              >
                ×
              </button>
            </span>
          )}
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <VendorCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="py-20 text-center text-gray-500">
          <Store size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="font-semibold">
            {isAr ? "فشل تحميل المتاجر" : "Impossible de charger les vendeurs"}
          </p>
        </div>
      ) : filteredVendors.length === 0 ? (
        <div className="py-20 text-center text-gray-500">
          <Store size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="font-semibold text-gray-700">
            {isAr ? "لا توجد متاجر" : "Aucun vendeur trouvé"}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {isAr ? "جرب بحثًا مختلفًا أو مدينة أخرى" : "Essayez une autre recherche ou une autre ville"}
          </p>
          {(city || search) && (
            <button
              onClick={() => { setCity(""); setSearch(""); setSearchInput(""); setPage(0); }}
              className="mt-4 text-sm text-souk-green-700 hover:underline"
            >
              {isAr ? "إعادة تعيين الفلاتر" : "Réinitialiser les filtres"}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredVendors.map((v) => (
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
      )}

      {/* Pagination */}
      {totalPages > 1 && !isLoading && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 disabled:opacity-40 hover:border-souk-green-400 hover:text-souk-green-700 transition-colors"
          >
            {isAr ? "السابق" : "Précédent"}
          </button>

          {Array.from({ length: totalPages }, (_, i) => i)
            .filter((i) => Math.abs(i - page) <= 2)
            .map((i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={
                  i === page
                    ? "h-9 w-9 rounded-lg bg-souk-green-800 text-white text-sm font-bold"
                    : "h-9 w-9 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-souk-green-400 hover:text-souk-green-700 transition-colors"
                }
              >
                {i + 1}
              </button>
            ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 disabled:opacity-40 hover:border-souk-green-400 hover:text-souk-green-700 transition-colors"
          >
            {isAr ? "التالي" : "Suivant"}
          </button>
        </div>
      )}
    </div>
  );
}

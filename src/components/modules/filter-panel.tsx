"use client";

import { Truck, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export const FILTER_CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger",
  "Agadir", "Safi", "Essaouira", "Azilal",
];

export interface FilterPanelState {
  priceMin: string;
  priceMax: string;
  selectedCities: string[];
  freeDelivery: boolean;
  artisanOnly: boolean;
  minRating: number;
}

interface FilterPanelProps extends FilterPanelState {
  setPriceMin: (v: string) => void;
  setPriceMax: (v: string) => void;
  toggleCity: (c: string) => void;
  setFreeDelivery: (v: boolean) => void;
  setArtisanOnly: (v: boolean) => void;
  setMinRating: (v: number) => void;
  onReset: () => void;
  isAr: boolean;
}

export function FilterPanel({
  priceMin, setPriceMin,
  priceMax, setPriceMax,
  selectedCities, toggleCity,
  freeDelivery, setFreeDelivery,
  artisanOnly, setArtisanOnly,
  minRating, setMinRating,
  onReset, isAr,
}: FilterPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-sm text-gray-900 mb-3">
          {isAr ? "السعر (درهم)" : "Prix (MAD)"}
        </h3>
        <div className="flex gap-2">
          <input
            type="number" value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            placeholder="Min"
            className="flex-1 h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-souk-gold-500"
          />
          <input
            type="number" value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            placeholder="Max"
            className="flex-1 h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-souk-gold-500"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-gray-900">
          {isAr ? "خيارات" : "Options"}
        </h3>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox" checked={freeDelivery}
            onChange={(e) => setFreeDelivery(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 accent-souk-green-800"
          />
          <span className="text-sm text-gray-700 flex items-center gap-1.5">
            <Truck size={13} className="text-souk-green-600" />
            {isAr ? "توصيل مجاني" : "Livraison gratuite"}
          </span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox" checked={artisanOnly}
            onChange={(e) => setArtisanOnly(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 accent-souk-green-800"
          />
          <span className="text-sm text-gray-700 flex items-center gap-1.5">
            <Award size={13} className="text-souk-gold-600" />
            {isAr ? "صناعة تقليدية" : "Artisanat authentique"}
          </span>
        </label>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-900 mb-3">
          {isAr ? "الحد الأدنى للتقييم" : "Note minimale"}
        </h3>
        <div className="flex gap-1.5 flex-wrap">
          {[0, 3, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={cn(
                "text-xs px-2 py-1 rounded-lg border font-medium transition-colors",
                minRating === r
                  ? "bg-souk-gold-500 text-white border-souk-gold-500"
                  : "border-gray-200 text-gray-600 hover:border-souk-gold-400",
              )}
            >
              {r === 0 ? (isAr ? "الكل" : "Tous") : `${r}★`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-900 mb-3">
          {isAr ? "المدينة" : "Ville"}
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {FILTER_CITIES.map((city) => (
            <label key={city} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox" checked={selectedCities.includes(city)}
                onChange={() => toggleCity(city)}
                className="h-4 w-4 rounded border-gray-300 accent-souk-green-800"
              />
              <span className="text-sm text-gray-700">{city}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full text-sm text-souk-terracotta-600 font-medium py-2 border border-souk-terracotta-200 rounded-lg hover:bg-souk-terracotta-50 transition-colors"
      >
        {isAr ? "إعادة ضبط الفلاتر" : "Réinitialiser les filtres"}
      </button>
    </div>
  );
}

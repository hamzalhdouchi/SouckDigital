"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { ProductFilterRequest } from "@/lib/api/types";

export function useFilterParams(): [ProductFilterRequest & { q?: string }, (partial: Partial<ProductFilterRequest & { q?: string }>) => void, () => void] {
  const searchParams = useSearchParams();
  const router = useRouter();

  const filters: ProductFilterRequest & { q?: string } = {
    q: searchParams.get("q") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    city: searchParams.get("city") ?? undefined,
    freeDelivery: searchParams.get("freeDelivery") === "true" ? true : undefined,
    artisanOnly: searchParams.get("artisanOnly") === "true" ? true : undefined,
    minRating: searchParams.get("minRating") ? Number(searchParams.get("minRating")) : undefined,
    sort: (searchParams.get("sort") as ProductFilterRequest["sort"]) ?? undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
    size: searchParams.get("size") ? Number(searchParams.get("size")) : undefined,
  };

  const updateFilters = useCallback(
    (partial: Partial<ProductFilterRequest & { q?: string }>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(partial).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") {
          params.delete(k);
        } else {
          params.set(k, String(v));
        }
      });
      params.delete("page");
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    const q = searchParams.get("q");
    router.push(q ? `?q=${encodeURIComponent(q)}` : "?");
  }, [router, searchParams]);

  return [filters, updateFilters, clearFilters];
}

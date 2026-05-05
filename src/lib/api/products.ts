import { get } from "./client";
import type {
  Page,
  ProductDetailDto,
  ProductFilterRequest,
  ProductSummaryDto,
  SearchRequest,
  SearchResultsDto,
} from "./types";

function toQuery(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function getProducts(filters: ProductFilterRequest = {}) {
  return get<Page<ProductSummaryDto>>(`/products${toQuery(filters as Record<string, unknown>)}`);
}

export function getProductBySlug(slug: string) {
  return get<ProductDetailDto>(`/products/${slug}`);
}

export function getRelatedProducts(id: string) {
  return get<ProductSummaryDto[]>(`/products/${id}/related`);
}

export function searchProducts(params: SearchRequest) {
  return get<SearchResultsDto>(`/search${toQuery(params as Record<string, unknown>)}`);
}

export function getSearchSuggestions(q: string) {
  return get<string[]>(`/search/suggestions?q=${encodeURIComponent(q)}`);
}

export function getCategories() {
  return get<{ id: string; slug: string; name: string; nameAr: string; emoji: string; imageUrl: string | null }[]>("/categories");
}

export function getCategoryBySlug(slug: string) {
  return get<{ id: string; slug: string; name: string; nameAr: string }>(`/categories/${slug}`);
}

export function getCategoryProducts(slug: string, page = 0, size = 20) {
  return get<Page<ProductSummaryDto>>(`/categories/${slug}/products?page=${page}&size=${size}`);
}

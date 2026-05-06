// Legacy named function exports that existing pages import from @/lib/api/products
import { get } from "./client";
import type { CategoryResponse, Page, ProductFilterRequest, ProductSummaryDto } from "./types";

export { categoriesApi } from "./categories";

export function getCategories() {
  return get<CategoryResponse[]>("/categories");
}

export function getCategoryBySlug(slug: string) {
  return get<CategoryResponse>(`/categories/${slug}`);
}

export function getCategoryProducts(slug: string, page = 0, size = 20, filters?: ProductFilterRequest) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
    });
  }
  return get<Page<ProductSummaryDto>>(`/categories/${slug}/products?${params}`);
}

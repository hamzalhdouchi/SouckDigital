import { del, get, patch, post, put } from "./client";
import type {
  CreateProductRequest,
  Page,
  ProductDetailDto,
  ProductFilterRequest,
  ProductSummaryDto,
} from "./types";

function toQuery(filters: Record<string, unknown>): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const productsApi = {
  getAll: (filters: ProductFilterRequest = {}) =>
    get<Page<ProductSummaryDto>>(`/products${toQuery(filters as Record<string, unknown>)}`),

  getBySlug: (slug: string) => get<ProductDetailDto>(`/products/${slug}`),

  getRelated: (id: string) => get<ProductSummaryDto[]>(`/products/${id}/related`),

  create: (data: CreateProductRequest) => post<ProductDetailDto>("/products", data),

  update: (id: string, data: Partial<CreateProductRequest>) =>
    put<ProductDetailDto>(`/products/${id}`, data),

  delete: (id: string) => del<void>(`/products/${id}`),

  toggleActive: (id: string) => patch<void>(`/products/${id}/toggle`),

  getOwn: (page = 0, size = 50) =>
    get<Page<ProductSummaryDto>>(`/vendor/dashboard/products?page=${page}&size=${size}`),
};

// Legacy named exports (keep for backward compat with existing pages)
export const getProducts = productsApi.getAll;
export const getProductBySlug = productsApi.getBySlug;
export const getRelatedProducts = productsApi.getRelated;

// Re-export categories for pages that import from products
export { categoriesApi, getCategories, getCategoryBySlug, getCategoryProducts } from "./categories-legacy";

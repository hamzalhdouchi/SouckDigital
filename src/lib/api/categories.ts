import { get } from "./client";
import type { CategoryResponse, Page, ProductFilterRequest, ProductSummaryDto } from "./types";

export const categoriesApi = {
  getAll: () => get<CategoryResponse[]>("/categories"),

  getBySlug: (slug: string) => get<CategoryResponse>(`/categories/${slug}`),

  getProducts: (slug: string, filters?: ProductFilterRequest) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
      });
    }
    const qs = params.toString();
    return get<Page<ProductSummaryDto>>(`/categories/${slug}/products${qs ? `?${qs}` : ""}`);
  },
};

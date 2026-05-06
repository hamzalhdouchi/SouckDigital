import { get } from "./client";
import type { ProductFilterRequest, SearchResultsDto } from "./types";

export const searchApi = {
  search: (params: ProductFilterRequest & { q?: string }) => {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
      ) as Record<string, string>
    );
    return get<SearchResultsDto>(`/search?${qs}`);
  },

  suggestions: (q: string) =>
    get<string[]>(`/search/suggestions?q=${encodeURIComponent(q)}`),
};

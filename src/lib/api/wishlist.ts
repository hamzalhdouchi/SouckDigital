import { get, post } from "./client";
import type { ProductSummaryDto } from "./types";

export const wishlistApi = {
  getAll: () => get<ProductSummaryDto[]>("/wishlist"),
  getIds:  () => get<string[]>("/wishlist/ids"),
  toggle:  (productId: string) =>
    post<{ wished: boolean }>(`/wishlist/${productId}/toggle`),
};

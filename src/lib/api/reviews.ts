import { del, get, post } from "./client";
import type {
  CreateReviewRequest,
  Page,
  ReviewDetailDto,
  ReviewStatsDto,
} from "./types";

export const reviewsApi = {
  getByProduct: (productId: string, page = 0) =>
    get<Page<ReviewDetailDto>>(
      `/products/${productId}/reviews?page=${page}&size=5`
    ),

  getStats: (productId: string) =>
    get<ReviewStatsDto>(`/products/${productId}/reviews/stats`),

  create: (productId: string, data: CreateReviewRequest) =>
    post<ReviewDetailDto>(`/products/${productId}/reviews`, data),

  delete: (reviewId: string) => del<void>(`/reviews/${reviewId}`),
};

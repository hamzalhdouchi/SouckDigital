"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { reviewsApi } from "@/lib/api/reviews";
import type { CreateReviewRequest } from "@/lib/api/types";

export function useReviews(productId: string) {
  return useInfiniteQuery({
    queryKey: ["reviews", productId],
    queryFn: ({ pageParam = 0 }) =>
      reviewsApi.getByProduct(productId, pageParam as number),
    getNextPageParam: (last) => (last.last ? undefined : last.number + 1),
    initialPageParam: 0,
    enabled: !!productId,
  });
}

export function useReviewStats(productId: string) {
  return useQuery({
    queryKey: ["reviews", "stats", productId],
    queryFn: () => reviewsApi.getStats(productId),
    enabled: !!productId,
  });
}

export function useAddReview(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReviewRequest) =>
      reviewsApi.create(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => reviewsApi.delete(reviewId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

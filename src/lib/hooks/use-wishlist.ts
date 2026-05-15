"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { wishlistApi } from "@/lib/api/wishlist";
import { useAuthStore } from "@/lib/store/auth";

export function useWishlist() {
  const isLoggedIn = !!useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: wishlistApi.getAll,
    enabled: isLoggedIn,
    staleTime: 60_000,
  });
}

export function useWishlistIds() {
  const isLoggedIn = !!useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["wishlist", "ids"],
    queryFn: wishlistApi.getIds,
    enabled: isLoggedIn,
    staleTime: 60_000,
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => wishlistApi.toggle(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
}

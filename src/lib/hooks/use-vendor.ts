"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vendorsApi } from "@/lib/api/vendors";
import { useAuthStore, useIsVendor } from "@/lib/store/auth";
import type { CreateVendorRequest } from "@/lib/api/types";

export function useVendor(slug: string) {
  return useQuery({
    queryKey: ["vendor", slug],
    queryFn: () => vendorsApi.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useMyVendorProfile() {
  const isVendor = useIsVendor();
  return useQuery({
    queryKey: ["vendor", "me"],
    queryFn: vendorsApi.getMyProfile,
    enabled: isVendor,
  });
}

export function useBecomeVendor() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: (data: CreateVendorRequest) => vendorsApi.register(data),
    onSuccess: (data) => {
      setAuth(data);
    },
  });
}

export function useFollowVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vendorId: string) => vendorsApi.follow(vendorId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vendor"] }),
  });
}

export function useUnfollowVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vendorId: string) => vendorsApi.unfollow(vendorId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vendor"] }),
  });
}

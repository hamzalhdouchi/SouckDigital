import { del, get, post, put } from "./client";
import type {
  AuthResponse,
  CreateVendorRequest,
  Page,
  ProductSummaryDto,
  VendorDetailDto,
  VendorSummaryDto,
} from "./types";

export const vendorsApi = {
  getAll: (params?: { page?: number; size?: number; city?: string }) => {
    const qs = new URLSearchParams();
    if (params?.city) qs.set("city", params.city);
    if (params?.page !== undefined) qs.set("page", String(params.page));
    if (params?.size !== undefined) qs.set("size", String(params.size));
    const s = qs.toString();
    return get<Page<VendorSummaryDto>>(`/vendors${s ? `?${s}` : ""}`);
  },

  getBySlug: (slug: string) => get<VendorDetailDto>(`/vendors/${slug}`),

  getProducts: (slug: string, page = 0) =>
    get<Page<ProductSummaryDto>>(`/vendors/${slug}/products?page=${page}`),

  register: (data: CreateVendorRequest) =>
    post<AuthResponse>("/vendors/register", data),

  getMyProfile: () => get<VendorDetailDto>("/vendors/me"),

  updateMyProfile: (data: Partial<CreateVendorRequest>) =>
    put<VendorDetailDto>("/vendors/me", data),

  follow: (vendorId: string) => post<void>(`/vendors/${vendorId}/follow`),

  unfollow: (vendorId: string) => del<void>(`/vendors/${vendorId}/follow`),
};

// Legacy named exports
export const getVendors = vendorsApi.getAll;
export const getVendorBySlug = vendorsApi.getBySlug;
export const getVendorProducts = vendorsApi.getProducts;
export const followVendor = vendorsApi.follow;
export const unfollowVendor = vendorsApi.unfollow;
export const getMyVendorProfile = vendorsApi.getMyProfile;
export const updateMyVendorProfile = vendorsApi.updateMyProfile;
export type { VendorDetailDto };

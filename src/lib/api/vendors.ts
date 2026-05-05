import { del, get, post, put } from "./client";
import type { Page, ProductSummaryDto, VendorSummaryDto } from "./types";

export interface VendorDetailDto extends VendorSummaryDto {
  description: string | null;
  descriptionAr: string | null;
  memberSince: string | null;
  followerCount: number;
}

export function getVendors(params?: { city?: string; page?: number; size?: number }) {
  const q = new URLSearchParams();
  if (params?.city)  q.set("city",  params.city);
  if (params?.page !== undefined) q.set("page", String(params.page));
  if (params?.size !== undefined) q.set("size", String(params.size));
  const qs = q.toString();
  return get<Page<VendorSummaryDto>>(`/vendors${qs ? `?${qs}` : ""}`);
}

export function getVendorBySlug(slug: string) {
  return get<VendorDetailDto>(`/vendors/${slug}/storefront`);
}

export function getVendorProducts(slug: string, page = 0, size = 20) {
  return get<Page<ProductSummaryDto>>(`/vendors/${slug}/products?page=${page}&size=${size}`);
}

export function followVendor(id: string) {
  return post<void>(`/vendors/${id}/follow`);
}

export function unfollowVendor(id: string) {
  return del<void>(`/vendors/${id}/follow`);
}

export function getMyVendorProfile() {
  return get<VendorDetailDto>("/vendors/me");
}

export function updateMyVendorProfile(data: Partial<VendorDetailDto>) {
  return put<VendorDetailDto>("/vendors/me", data);
}

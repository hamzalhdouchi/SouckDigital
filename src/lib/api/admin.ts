import { del, get, patch, post } from "./client";
import type {
  AdminUserDto,
  AdminVendorDto,
  CreatePromoRequest,
  OrderStatus,
  OrderSummaryDto,
  Page,
  PlatformStatsDto,
  ProductSummaryDto,
  PromoCodeDto,
  Role,
} from "./types";

export const adminApi = {
  // Users
  getUsers: (params?: { page?: number; q?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page !== undefined) qs.set("page", String(params.page));
    if (params?.q) qs.set("q", params.q);
    const s = qs.toString();
    return get<Page<AdminUserDto>>(`/admin/users${s ? `?${s}` : ""}`);
  },
  changeUserRole: (id: string, role: Role) =>
    patch<void>(`/admin/users/${id}/role`, { role }),
  banUser: (id: string) => patch<void>(`/admin/users/${id}/ban`),
  unbanUser: (id: string) => patch<void>(`/admin/users/${id}/unban`),

  // Vendors
  getVendors: (page = 0) =>
    get<Page<AdminVendorDto>>(`/admin/vendors?page=${page}`),
  verifyVendor: (id: string) => patch<void>(`/admin/vendors/${id}/verify`),
  unverifyVendor: (id: string) => patch<void>(`/admin/vendors/${id}/unverify`),
  toggleArtisan: (id: string) => patch<void>(`/admin/vendors/${id}/artisan`),

  // Orders
  getAllOrders: (params?: { page?: number; status?: OrderStatus }) => {
    const qs = new URLSearchParams();
    if (params?.page !== undefined) qs.set("page", String(params.page));
    if (params?.status) qs.set("status", params.status);
    const s = qs.toString();
    return get<Page<OrderSummaryDto>>(`/admin/orders${s ? `?${s}` : ""}`);
  },
  overrideOrderStatus: (id: string, status: OrderStatus) =>
    patch<void>(`/admin/orders/${id}/status`, { status }),
  refundOrder: (id: string) => post<void>(`/admin/orders/${id}/refund`),

  // Products
  getAllProducts: (page = 0) =>
    get<Page<ProductSummaryDto>>(`/admin/products?page=${page}`),
  deleteProduct: (id: string) => del<void>(`/admin/products/${id}`),
  activateProduct: (id: string, active: boolean) =>
    patch<void>(`/admin/products/${id}/activate`, { active }),

  // Stats
  getStats: () => get<PlatformStatsDto>("/admin/stats"),

  // Promo
  getPromoCodes: () => get<PromoCodeDto[]>("/admin/promo"),
  createPromoCode: (data: CreatePromoRequest) =>
    post<PromoCodeDto>("/admin/promo", data),
  togglePromoCode: (id: string) => patch<void>(`/admin/promo/${id}/toggle`),
};

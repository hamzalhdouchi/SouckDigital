import { get } from "./client";
import type {
  DashboardStatsDto,
  MonthlyRevenueDto,
  OrderStatus,
  OrderSummaryDto,
  Page,
  TopProductDto,
} from "./types";

export const vendorDashboardApi = {
  getStats: () => get<DashboardStatsDto>("/vendor/dashboard/stats"),

  getRevenueTrend: (months = 12) =>
    get<MonthlyRevenueDto[]>(`/vendor/dashboard/revenue-trend?months=${months}`),

  getOrders: (params?: { page?: number; size?: number; status?: OrderStatus }) => {
    const qs = new URLSearchParams();
    if (params?.page !== undefined) qs.set("page", String(params.page));
    if (params?.size !== undefined) qs.set("size", String(params.size));
    if (params?.status) qs.set("status", params.status);
    const s = qs.toString();
    return get<Page<OrderSummaryDto>>(`/vendor/dashboard/orders${s ? `?${s}` : ""}`);
  },

  getTopProducts: (limit = 5) =>
    get<TopProductDto[]>(`/vendor/dashboard/top-products?limit=${limit}`),

  getOrdersByStatus: () =>
    get<Record<string, number>>("/vendor/dashboard/orders-status"),
};

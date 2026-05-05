import { get, patch, post } from "./client";
import type { OrderDetailDto, OrderSummaryDto, Page, PlaceOrderRequest } from "./types";

export function placeOrder(data: PlaceOrderRequest) {
  return post<OrderDetailDto>("/orders", data);
}

export function getMyOrders(page = 0, size = 10) {
  return get<Page<OrderSummaryDto>>(`/orders/my?page=${page}&size=${size}`);
}

export function getOrderById(id: string) {
  return get<OrderDetailDto>(`/orders/${id}`);
}

export function updateOrderStatus(id: string, status: string) {
  return patch<OrderDetailDto>(`/orders/${id}/status`, { status });
}

export function validatePromo(code: string) {
  return post<{
    valid: boolean;
    code: string | null;
    discountPercent: number | null;
    message: string;
  }>("/promo/validate", { code });
}

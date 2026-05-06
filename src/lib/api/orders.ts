import { get, patch, post } from "./client";
import type {
  OrderDetailDto,
  OrderStatus,
  OrderSummaryDto,
  Page,
  PlaceOrderRequest,
  PromoValidationResponse,
} from "./types";

export const ordersApi = {
  place: (data: PlaceOrderRequest) => post<OrderDetailDto>("/orders", data),

  getMyOrders: (page = 0) =>
    get<Page<OrderSummaryDto>>(`/orders/my?page=${page}`),

  getById: (id: string) => get<OrderDetailDto>(`/orders/${id}`),

  updateStatus: (id: string, status: OrderStatus) =>
    patch<OrderDetailDto>(`/orders/${id}/status`, { status }),
};

export function validatePromo(code: string) {
  return post<PromoValidationResponse>("/promo/validate", { code });
}

// Legacy named exports
export const placeOrder = ordersApi.place;
export const getMyOrders = ordersApi.getMyOrders;
export const getOrderById = ordersApi.getById;
export const updateOrderStatus = ordersApi.updateStatus;

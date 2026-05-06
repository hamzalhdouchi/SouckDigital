import { get, post } from "./client";
import type { CmiInitResponse, PaymentStatusDto } from "./types";

export const paymentApi = {
  initCmi: (orderId: string) =>
    post<CmiInitResponse>("/payment/cmi/init", { orderId }),

  getStatus: (orderId: string) =>
    get<PaymentStatusDto>(`/payment/order/${orderId}`),
};

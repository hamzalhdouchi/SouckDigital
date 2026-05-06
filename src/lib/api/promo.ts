import { post } from "./client";
import type { PromoValidationResponse } from "./types";

export const promoApi = {
  validate: (code: string) =>
    post<PromoValidationResponse>("/promo/validate", { code }),
};

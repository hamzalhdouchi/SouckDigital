"use client";

import { useMutation } from "@tanstack/react-query";
import { paymentApi } from "@/lib/api/payment";

export function useCmiPayment() {
  return useMutation({
    mutationFn: (orderId: string) => paymentApi.initCmi(orderId),
    onSuccess: (data) => {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.paymentUrl;
      Object.entries(data.params).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    },
  });
}

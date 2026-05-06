"use client";

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiError } from "@/lib/api/client";

interface ToastMutationOptions<TData, TVariables>
  extends UseMutationOptions<TData, ApiError, TVariables> {
  successMessage?: string | ((data: TData) => string);
  errorMessage?: string | ((error: ApiError) => string);
}

export function useToastMutation<TData, TVariables>(
  options: ToastMutationOptions<TData, TVariables>
) {
  const { successMessage, errorMessage, ...rest } = options;
  return useMutation<TData, ApiError, TVariables>({
    ...rest,
    onSuccess: (data, variables, context, mutation) => {
      const msg =
        typeof successMessage === "function"
          ? successMessage(data)
          : successMessage;
      if (msg) toast.success(msg);
      rest.onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      const msg =
        typeof errorMessage === "function"
          ? errorMessage(error)
          : (errorMessage ?? error.message);
      toast.error(msg);
      rest.onError?.(error, variables, context, mutation);
    },
  });
}

"use client";

import { ApiError } from "@/lib/api/client";
import Button from "./button";

// Inline form-level error display (used inside forms)
export function ApiErrorDisplay({ error }: { error: ApiError | null | undefined }) {
  if (!error) return null;
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <p className="font-medium">{error.message}</p>
      {error.errors && Object.keys(error.errors).length > 0 && (
        <ul className="mt-2 list-disc pl-4 space-y-1">
          {Object.entries(error.errors).map(([field, msg]) => (
            <li key={field}>{msg}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface Props {
  error: unknown;
  onRetry?: () => void;
  locale?: string;
}

export default function ApiErrorMessage({ error, onRetry, locale = "fr" }: Props) {
  const isAr = locale === "ar";

  let message = isAr ? "حدث خطأ غير متوقع" : "Une erreur inattendue s'est produite";
  let isNotFound = false;

  if (error instanceof ApiError) {
    if (error.status === 404) {
      isNotFound = true;
      message = isAr ? "العنصر غير موجود" : "Introuvable";
    } else if (error.status === 403) {
      message = isAr ? "غير مصرح لك بهذا الإجراء" : "Accès refusé";
    } else {
      message = error.message;
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="text-5xl mb-4">{isNotFound ? "🔍" : "⚠️"}</div>
      <p className="text-gray-700 font-semibold text-lg mb-2">{message}</p>
      {onRetry && !isNotFound && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
          {isAr ? "إعادة المحاولة" : "Réessayer"}
        </Button>
      )}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center max-w-md mx-auto py-16">
      <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
        <AlertTriangle size={40} className="text-red-500" />
      </div>

      <h1 className="text-2xl font-black text-gray-900 mb-1">
        Quelque chose s&apos;est mal passé
      </h1>
      <p className="text-sm font-semibold text-gray-500 mb-3">حدث خطأ ما</p>

      {error.message && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2 mb-4 max-w-sm">
          {error.message}
        </p>
      )}

      <p className="text-sm text-gray-500 mb-8 max-w-xs leading-relaxed">
        Une erreur inattendue s&apos;est produite. Veuillez réessayer ou revenir à l&apos;accueil.
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-5 py-2.5 bg-souk-green-800 text-white text-sm font-semibold rounded-xl hover:bg-souk-green-700 transition-colors"
        >
          <RotateCcw size={15} />
          Réessayer
        </button>
        <Link
          href="/fr"
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Home size={15} />
          Accueil
        </Link>
      </div>

      {error.digest && (
        <p className="mt-6 text-xs text-gray-300 font-mono">ID: {error.digest}</p>
      )}
    </div>
  );
}

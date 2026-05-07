"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RootError({
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
    <html lang="fr">
      <body className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center font-sans">
        <div className="mb-6">
          <p className="text-7xl font-black text-gray-200 leading-none select-none">500</p>
          <div className="h-1 w-16 bg-gradient-to-r from-red-400 to-amber-400 rounded-full mx-auto mt-2" />
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Une erreur est survenue</h1>
        <p className="text-sm text-gray-500 mb-8 max-w-xs">
          {error.message ?? "Quelque chose s'est mal passé. Veuillez réessayer."}
        </p>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-emerald-800 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Réessayer
          </button>
          <Link
            href="/fr"
            className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            Accueil
          </Link>
        </div>
        {error.digest && (
          <p className="mt-6 text-xs text-gray-300 font-mono">ID: {error.digest}</p>
        )}
      </body>
    </html>
  );
}

import Link from "next/link";
import { ShieldOff } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center font-sans">
        <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <ShieldOff size={40} className="text-red-500" />
        </div>
        <p className="text-6xl font-black text-gray-200 leading-none select-none mb-2">403</p>
        <h1 className="text-xl font-bold text-gray-800 mb-1">Accès refusé</h1>
        <p className="text-sm text-gray-500 mb-1">وصول مرفوض</p>
        <p className="text-sm text-gray-500 mb-8 max-w-xs">
          Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link
            href="/fr/login"
            className="px-5 py-2.5 bg-emerald-800 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Se connecter
          </Link>
          <Link
            href="/fr"
            className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            Accueil
          </Link>
        </div>
      </body>
    </html>
  );
}

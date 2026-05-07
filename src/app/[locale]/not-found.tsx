import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function LocaleNotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center max-w-md mx-auto py-16">
      {/* Zellige decoration */}
      <div className="relative mb-8">
        <p className="text-9xl font-black text-gray-100 leading-none select-none">404</p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-souk-green-800/10 flex items-center justify-center rotate-12">
            <Search size={32} className="text-souk-green-700 -rotate-12" />
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-black text-gray-900 mb-1">Page introuvable</h1>
      <p className="text-sm font-semibold text-gray-500 mb-3">الصفحة غير موجودة</p>
      <p className="text-sm text-gray-500 mb-8 max-w-xs leading-relaxed">
        La page que vous cherchez n&apos;existe pas, a été déplacée ou l&apos;URL est incorrecte.
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        <Link
          href="/fr"
          className="flex items-center gap-2 px-5 py-2.5 bg-souk-green-800 text-white text-sm font-semibold rounded-xl hover:bg-souk-green-700 transition-colors"
        >
          <Home size={15} />
          Accueil
        </Link>
        <Link
          href="/fr/recherche"
          className="flex items-center gap-2 px-5 py-2.5 border-2 border-souk-green-800 text-souk-green-800 text-sm font-semibold rounded-xl hover:bg-souk-green-50 transition-colors"
        >
          <Search size={15} />
          Explorer
        </Link>
      </div>
    </div>
  );
}

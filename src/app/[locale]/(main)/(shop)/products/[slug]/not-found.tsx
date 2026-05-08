import Link from "next/link";
import { PackageSearch, ArrowLeft, Search } from "lucide-react";

export default function ProductNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center max-w-md mx-auto py-16">
      <div className="h-24 w-24 rounded-2xl bg-souk-sand flex items-center justify-center mb-6">
        <PackageSearch size={48} className="text-souk-green-300" />
      </div>

      <h1 className="text-2xl font-black text-gray-900 mb-1">Produit introuvable</h1>
      <p className="text-sm font-semibold text-gray-500 mb-4">المنتج غير موجود</p>
      <p className="text-sm text-gray-500 mb-8 max-w-xs leading-relaxed">
        Ce produit n&apos;existe plus ou son URL a changé.
        Découvrez d&apos;autres produits dans nos catégories.
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        <Link
          href="/fr"
          className="flex items-center gap-2 px-5 py-2.5 bg-souk-green-800 text-white text-sm font-semibold rounded-xl hover:bg-souk-green-700 transition-colors"
        >
          <Search size={15} />
          Explorer les catégories
        </Link>
        <Link
          href="/fr"
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={15} />
          Accueil
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center font-sans">
        <div className="mb-6">
          <p className="text-8xl font-black text-gray-200 leading-none select-none">404</p>
          <div className="h-1 w-16 bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full mx-auto mt-2" />
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Page introuvable</h1>
        <p className="text-sm text-gray-500 mb-8 max-w-xs">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/fr"
          className="px-6 py-2.5 bg-emerald-800 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </body>
    </html>
  );
}

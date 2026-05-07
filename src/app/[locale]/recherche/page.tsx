import type { Metadata } from "next";
import SearchPage from "./search-content";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  if (q) {
    return {
      title: `"${q}" — Recherche — Souk Digital`,
      description: `Résultats de recherche pour "${q}" sur Souk Digital`,
    };
  }
  return {
    title: "Recherche — Souk Digital",
    description: "Recherchez parmi des milliers de produits artisanaux marocains",
  };
}

export default function Page() {
  return <SearchPage />;
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  locale: string;
  isRTL?: boolean;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ locale, isRTL = false, placeholder, className }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    try {
      const { searchApi } = await import("@/lib/api/search");
      const data = await searchApi.suggestions(q);
      setSuggestions(data);
      setOpen(data.length > 0);
    } catch {
      setSuggestions([]);
      setOpen(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 300);
  };

  const navigate = (q: string) => {
    setOpen(false);
    setQuery(q);
    router.push(`/${locale}/recherche?q=${encodeURIComponent(q)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(query.trim());
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const ph = placeholder ?? (isRTL ? "ابحث عن منتج، تاجر..." : "Rechercher un produit, vendeur...");

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit} className="flex">
        <div className="relative flex-1">
          <input
            type="search"
            value={query}
            onChange={handleChange}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder={ph}
            className={cn(
              "w-full h-10 bg-souk-sand border border-gray-200 text-sm px-4",
              "focus:outline-none focus:ring-2 focus:ring-souk-gold-500 focus:border-transparent",
              "placeholder:text-gray-400",
              isRTL ? "rounded-e-lg" : "rounded-s-lg",
              query ? "pe-8" : "",
            )}
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setSuggestions([]); setOpen(false); }}
              className="absolute top-1/2 -translate-y-1/2 end-2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X size={13} />
            </button>
          )}
        </div>
        <button
          type="submit"
          className={cn(
            "h-10 px-4 bg-souk-green-800 text-white text-sm font-medium flex items-center gap-2",
            "hover:bg-souk-green-700 transition-colors shrink-0",
            isRTL ? "rounded-s-lg" : "rounded-e-lg",
          )}
        >
          <Search size={16} />
          <span className="hidden md:inline">{isRTL ? "بحث" : "Rechercher"}</span>
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute start-0 end-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => navigate(s)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-souk-green-50 text-sm text-gray-700 text-start transition-colors"
            >
              <Search size={13} className="text-gray-400 shrink-0" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

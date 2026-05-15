import Image from "next/image";
import Link from "next/link";
import { Landmark, Shirt, Sparkles, Home, Smartphone, Wheat, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  artisanat:    Landmark,
  mode:         Shirt,
  beaute:       Sparkles,
  maison:       Home,
  electronique: Smartphone,
  alimentation: Wheat,
};

interface CategoryCardProps {
  slug: string;
  name: string;
  emoji?: string;
  image: string;
  locale: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function CategoryCard({ slug, name, image, locale, size = "md", className }: CategoryCardProps) {
  const Icon = CATEGORY_ICONS[slug] ?? Landmark;
  const isAr = locale === "ar";

  return (
    <Link
      href={`/${locale}/categories/${slug}`}
      className={cn(
        "group relative overflow-hidden rounded-2xl flex flex-col",
        "border border-white/5 hover:border-souk-gold-400/50",
        "shadow-sm hover:shadow-2xl hover:shadow-souk-green-900/25",
        "transition-all duration-300 ease-out",
        size === "sm" && "h-32",
        size === "md" && "h-44 sm:h-52",
        size === "lg" && "h-56 sm:h-72",
        className
      )}
    >
      {/* Background image */}
      <Image
        src={image}
        alt={name}
        fill
        sizes="(max-width: 640px) 50vw, 17vw"
        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
      />

      {/* Layered gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-souk-green-900/95 via-souk-green-900/25 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-souk-green-900/30" />

      {/* Icon badge — top right */}
      <div className="absolute top-3 end-3 w-9 h-9 rounded-xl bg-black/30 backdrop-blur-md border border-souk-gold-400/35 flex items-center justify-center shadow-lg group-hover:bg-souk-gold-500/25 group-hover:border-souk-gold-400/60 transition-all duration-300">
        <Icon size={16} className="text-souk-gold-300" strokeWidth={1.5} />
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 inset-x-0 p-4">
        <p className="font-black text-sm sm:text-[15px] text-white leading-tight drop-shadow-sm">
          {name}
        </p>

        {/* Animated gold underline */}
        <div className="mt-1.5 h-[2px] w-5 bg-souk-gold-400 rounded-full group-hover:w-full transition-all duration-500 ease-out" />

        {/* Hover CTA — slides up */}
        <p className="text-souk-gold-300 text-xs font-semibold mt-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out">
          {isAr ? "استكشف ←" : "Parcourir →"}
        </p>
      </div>

      {/* Gold shimmer overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-souk-gold-500/0 via-souk-gold-400/6 to-souk-gold-500/0 pointer-events-none" />
    </Link>
  );
}

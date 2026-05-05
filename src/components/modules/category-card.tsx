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

  return (
    <Link
      href={`/${locale}/categories/${slug}`}
      className={cn(
        "group relative overflow-hidden rounded-2xl flex items-end",
        size === "sm" && "h-28",
        size === "md" && "h-36 sm:h-44",
        size === "lg" && "h-52 sm:h-64",
        className
      )}
    >
      <Image
        src={image}
        alt={name}
        fill
        sizes="(max-width: 640px) 50vw, 33vw"
        className="object-cover group-hover:scale-110 transition-transform duration-700"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-souk-green-900/80 via-souk-green-900/20 to-transparent" />

      {/* Content */}
      <div className="relative w-full p-3 text-white">
        <div className="w-8 h-8 rounded-lg bg-souk-gold-500/20 border border-souk-gold-400/30 flex items-center justify-center mb-1.5">
          <Icon size={18} className="text-souk-gold-300" strokeWidth={1.5} />
        </div>
        <p className="font-bold text-sm leading-tight">{name}</p>
      </div>

      {/* Hover shimmer */}
      <div className="absolute inset-0 bg-souk-gold-500/0 group-hover:bg-souk-gold-500/10 transition-colors duration-300" />
    </Link>
  );
}

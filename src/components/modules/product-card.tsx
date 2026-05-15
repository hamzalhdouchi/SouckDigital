"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Zap, Award, TrendingUp, Truck, Check } from "lucide-react";
import { useState } from "react";
import Badge from "@/components/ui/badge";
import Rating from "@/components/ui/rating";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistIds, useToggleWishlist } from "@/lib/hooks/use-wishlist";
import { useAuthStore } from "@/lib/store/auth";
import { calculateDiscount, cn, formatPriceSimple } from "@/lib/utils";

export interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  vendor: { name: string; slug: string; artisan?: boolean; verified?: boolean };
  badge?: "artisan" | "sale" | "new" | "top" | "flash";
  inStock?: boolean;
  freeDelivery?: boolean;
  locale: string;
  variant?: "grid" | "list";
}

export default function ProductCard({
  id, slug, name, price, originalPrice, image, rating, reviewCount,
  vendor, badge, inStock = true, freeDelivery, locale, variant = "grid",
}: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const isLoggedIn = !!useAuthStore((s) => s.token);
  const { data: wishedIds = [] } = useWishlistIds();
  const { mutate: toggleWishlist } = useToggleWishlist();
  const wished = wishedIds.includes(id);
  const discount = originalPrice ? calculateDiscount(originalPrice, price) : 0;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggedIn) return;
    toggleWishlist(id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id, productId: id, slug, name, price, image,
      vendorId: vendor.slug, vendorName: vendor.name, vendorSlug: vendor.slug,
      maxStock: 10,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (variant === "list") {
    return (
      <Link href={`/${locale}/products/${slug}`} className="group flex gap-4 bg-white rounded-xl border border-gray-100 p-3 hover:shadow-md transition-shadow">
        <div className="relative h-28 w-28 rounded-lg overflow-hidden shrink-0 bg-souk-sand">
          <Image src={image} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <p className="text-xs text-souk-green-600 font-medium mb-0.5">{vendor.name}</p>
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{name}</h3>
            <Rating value={rating} count={reviewCount} className="mt-1" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-base font-bold text-souk-green-800">{formatPriceSimple(price)}</span>
              {originalPrice && originalPrice > price && (
                <span className="text-xs text-gray-400 line-through ms-2">{formatPriceSimple(originalPrice)}</span>
              )}
            </div>
            {freeDelivery && <span className="text-xs text-emerald-600 font-medium">Livraison gratuite</span>}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/${locale}/products/${slug}`} className="group relative bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex flex-col">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-souk-sand">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-2 start-2 flex flex-col gap-1">
          {badge === "artisan" && (
            <Badge variant="artisan" className="text-[10px] flex items-center gap-0.5"><Award size={9} />Authentique</Badge>
          )}
          {badge === "flash" && (
            <Badge variant="flash" className="text-[10px] flex items-center gap-0.5"><Zap size={9} />Flash</Badge>
          )}
          {badge === "new" && <Badge variant="new" className="text-[10px]">Nouveau</Badge>}
          {badge === "top" && <Badge variant="top" className="text-[10px] flex items-center gap-0.5"><TrendingUp size={9} />Top vente</Badge>}
          {discount >= 10 && (
            <Badge variant="sale" className="text-[10px]">-{discount}%</Badge>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className={cn(
            "absolute top-2 end-2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all",
            "opacity-0 group-hover:opacity-100",
            wished ? "text-red-500" : "text-gray-400 hover:text-red-400"
          )}
        >
          <Heart size={14} fill={wished ? "currentColor" : "none"} />
        </button>

        {!inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-600">Rupture de stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-souk-green-600 font-medium truncate mb-0.5">
          {vendor.name}
          {vendor.artisan && <Award size={10} className="ms-1 text-souk-gold-500 inline shrink-0" />}
        </p>
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug flex-1">{name}</h3>
        <Rating value={rating} count={reviewCount} className="mt-1.5 mb-2" />

        {freeDelivery && (
          <p className="text-xs text-emerald-600 font-medium mb-1.5 flex items-center gap-1"><Truck size={11} />Livraison gratuite</p>
        )}

        {/* Price + Add to cart */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div>
            <p className="text-base font-bold text-souk-green-800">{formatPriceSimple(price)}</p>
            {originalPrice && originalPrice > price && (
              <p className="text-xs text-gray-400 line-through">{formatPriceSimple(originalPrice)}</p>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={cn(
              "p-2 rounded-lg transition-all duration-150 shrink-0",
              added
                ? "bg-emerald-100 text-emerald-600"
                : "bg-souk-green-800 text-white hover:bg-souk-green-700 active:scale-95",
              !inStock && "opacity-40 cursor-not-allowed"
            )}
            aria-label="Ajouter au panier"
          >
            {added ? <Check size={16} /> : <ShoppingCart size={16} />}
          </button>
        </div>
      </div>
    </Link>
  );
}

import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Star, MapPin, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface VendorCardProps {
  slug: string;
  name: string;
  city: string;
  rating: number;
  reviewCount: number;
  productCount: number;
  artisan: boolean;
  verified: boolean;
  avatar: string;
  banner: string;
  locale: string;
}

export default function VendorCard({ slug, name, city, rating, reviewCount, productCount, artisan, verified, avatar, banner, locale }: VendorCardProps) {
  return (
    <Link href={`/${locale}/vendeurs/${slug}`} className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 block">
      {/* Banner */}
      <div className="relative h-24 overflow-hidden bg-souk-sand">
        <Image src={banner} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
      </div>

      {/* Avatar + info */}
      <div className="px-4 pb-4">
        <div className="flex items-end gap-3 -mt-6 mb-2">
          <div className="relative h-12 w-12 rounded-xl border-2 border-white shadow-md overflow-hidden bg-white shrink-0">
            <Image src={avatar} alt={name} fill className="object-cover" />
          </div>
          <div className="mb-0.5">
            {artisan && (
              <p className="text-[10px] font-semibold text-souk-gold-600 bg-souk-gold-100 px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5 mb-0.5">
                <Award size={9} />Artisan certifié
              </p>
            )}
            <div className="flex items-center gap-1">
              <h3 className="font-bold text-sm text-gray-900">{name}</h3>
              {verified && <CheckCircle size={13} className="text-souk-green-600 shrink-0" />}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><MapPin size={11} className="text-souk-gold-500 shrink-0" />{city}</p>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-souk-gold-600 font-semibold">
            <Star size={11} fill="currentColor" />
            <span>{rating.toFixed(1)}</span>
            <span className="text-gray-400 font-normal">({reviewCount})</span>
          </div>
          <span className="text-gray-500">{productCount} produits</span>
        </div>
      </div>
    </Link>
  );
}

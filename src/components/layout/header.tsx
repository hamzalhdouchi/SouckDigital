"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, User, Menu, MapPin, ChevronDown, Heart, Phone, Tag } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useUIStore } from "@/lib/store/ui";
import { useAuthStore } from "@/lib/store/auth";
import { SearchBar } from "@/components/modules/search-bar";
import { cn } from "@/lib/utils";

const LOCALES = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية",  flag: "🇲🇦" },
  { code: "az", label: "ⵜⴰⵎⴰⵣⵉⵖⵜ",flag: "🇲🇦" },
];

const NAV_LINKS = [
  { key: "categories", href: "" },
  { key: "deals",      href: "/promotions" },
  { key: "vendors",    href: "/vendeurs" },
];

interface HeaderProps { locale: string }

export default function Header({ locale }: HeaderProps) {
  const t = useTranslations("navigation");
  const ts = useTranslations("search");
  const itemCount = useCartStore((s) => s.itemCount());
  const { toggleMobileMenu, setCartDrawerOpen } = useUIStore();
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const isRTL = locale === "ar";

  const switchLocale = (code: string) => {
    const segments = pathname.split("/");
    segments[1] = code;
    router.push(segments.join("/"));
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0_2px_12px_0_rgb(0_0_0/0.08)]">
      {/* Promo banner */}
      <div className="bg-souk-green-800 text-white text-center text-xs py-1.5 px-4 font-medium">
        <span className="inline-flex items-center gap-1.5"><Tag size={12} className="text-souk-gold-300" />{useTranslations("homepage")("promoBanner")}</span>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          aria-label="Menu"
        >
          <Menu size={22} />
        </button>

        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-black text-souk-green-800 tracking-tight">
            سوق<span className="text-souk-gold-500">·</span>Digital
          </span>
        </Link>

        {/* Search bar */}
        <div className="flex-1 max-w-2xl mx-auto hidden sm:flex">
          <SearchBar locale={locale} isRTL={isRTL} placeholder={ts("placeholder")} />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 ms-auto lg:ms-0">
          {/* Location */}
          <button className="hidden lg:flex items-center gap-1 text-xs text-gray-600 hover:text-souk-green-800 px-2 py-1 rounded-lg hover:bg-gray-50">
            <MapPin size={14} className="text-souk-gold-500" />
            <span>Maroc</span>
          </button>

          {/* Wishlist */}
          <Link href={`/${locale}/favoris`} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-souk-terracotta-500 transition-colors hidden md:flex">
            <Heart size={20} />
          </Link>

          {/* Cart */}
          <button
            onClick={() => setCartDrawerOpen(true)}
            className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-souk-green-800 transition-colors"
            aria-label={t("cart")}
          >
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -end-0.5 h-5 w-5 rounded-full bg-souk-terracotta-500 text-white text-[10px] font-bold flex items-center justify-center">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </button>

          {/* Auth */}
          {isAuthenticated ? (
            <Link href={`/${locale}/profil`} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100">
              <div className="h-7 w-7 rounded-full bg-souk-green-200 flex items-center justify-center text-souk-green-800 font-bold text-xs">
                {user?.firstName?.[0]?.toUpperCase()}
              </div>
              <span className="hidden lg:inline text-sm font-medium text-gray-700">{user?.firstName}</span>
            </Link>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-souk-green-800 text-souk-green-800 text-sm font-medium hover:bg-souk-green-50 transition-colors"
            >
              <User size={15} />
              <span>{t("login")}</span>
            </Link>
          )}

          {/* Language switcher */}
          <div className="relative group">
            <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-100 text-sm text-gray-600">
              <span>{LOCALES.find((l) => l.code === locale)?.flag}</span>
              <span className="hidden lg:inline">{locale.toUpperCase()}</span>
              <ChevronDown size={12} />
            </button>
            <div className="absolute end-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
              {LOCALES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => switchLocale(l.code)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-souk-green-50 first:rounded-t-xl last:rounded-b-xl",
                    locale === l.code ? "text-souk-green-800 font-semibold bg-souk-green-50" : "text-gray-700"
                  )}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category nav */}
      <nav className="hidden lg:block border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 h-10">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              href={`/${locale}${link.href}`}
              className="text-sm font-medium text-gray-700 hover:text-souk-green-800 transition-colors"
            >
              {t(link.key as keyof typeof NAV_LINKS[0])}
            </Link>
          ))}
          <div className="ms-auto flex items-center gap-2 text-xs text-gray-500">
            <Phone size={12} className="text-souk-gold-500" />
            <span>+212 5XX-XXXXXX</span>
          </div>
        </div>
      </nav>
    </header>
  );
}

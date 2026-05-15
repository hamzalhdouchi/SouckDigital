"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3x3, ShoppingCart, User, Tag } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface MobileNavProps { locale: string }

export default function MobileNav({ locale }: MobileNavProps) {
  const t = useTranslations("navigation");
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.itemCount());
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const items = [
    { key: "home",       href: `/${locale}`,             Icon: Home },
    { key: "categories", href: `/${locale}`,              Icon: Grid3x3 },
    { key: "deals",      href: `/${locale}/recherche`,   Icon: Tag },
    { key: "cart",       href: `/${locale}/cart`,        Icon: ShoppingCart, badge: mounted ? itemCount : 0 },
    { key: "profile",    href: `/${locale}/profil`,      Icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 start-0 end-0 bg-white border-t border-gray-200 z-40 safe-area-pb">
      <div className="flex items-center">
        {items.map(({ key, href, Icon, badge }) => {
          const active = pathname === href || (href !== `/${locale}` && pathname.startsWith(href));
          return (
            <Link
              key={key}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors",
                active ? "text-souk-green-800" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                {badge !== undefined && badge > 0 && (
                  <span className="absolute -top-1 -end-1.5 h-4 w-4 rounded-full bg-souk-terracotta-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] font-medium", active && "font-semibold")}>
                {t(key as "home")}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

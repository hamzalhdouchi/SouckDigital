"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Store, ShoppingCart, Tag, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin",         icon: LayoutDashboard, labelFr: "Vue d'ensemble",  labelAr: "نظرة عامة" },
  { href: "/admin/users",   icon: Users,            labelFr: "Utilisateurs",   labelAr: "المستخدمون" },
  { href: "/admin/vendors", icon: Store,            labelFr: "Vendeurs",       labelAr: "البائعون" },
  { href: "/admin/orders",  icon: ShoppingCart,     labelFr: "Commandes",      labelAr: "الطلبات" },
  { href: "/admin/promo",   icon: Tag,              labelFr: "Codes promo",    labelAr: "أكواد الخصم" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string;
  const isAr = locale === "ar";

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-white border-e border-gray-100 shrink-0 py-4">
        <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
          {isAr ? "الإدارة" : "Administration"}
        </p>
        <nav className="space-y-0.5 px-2">
          {NAV_ITEMS.map(({ href, icon: Icon, labelFr, labelAr }) => {
            const full = `/${locale}${href}`;
            const active = pathname === full || (href !== "/admin" && pathname.startsWith(full));
            return (
              <Link
                key={href}
                href={full}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "bg-souk-green-800 text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-souk-green-800",
                )}
              >
                <Icon size={17} />
                <span className="flex-1">{isAr ? labelAr : labelFr}</span>
                {active && <ChevronRight size={14} className="rtl:rotate-180 opacity-70" />}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile top nav */}
      <div className="lg:hidden fixed bottom-0 start-0 end-0 bg-white border-t border-gray-100 flex z-40">
        {NAV_ITEMS.map(({ href, icon: Icon, labelFr, labelAr }) => {
          const full = `/${locale}${href}`;
          const active = pathname === full || (href !== "/admin" && pathname.startsWith(full));
          return (
            <Link
              key={href}
              href={full}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2 text-[10px] font-medium",
                active ? "text-souk-green-800" : "text-gray-400",
              )}
            >
              <Icon size={18} />
              {isAr ? labelAr : labelFr}
            </Link>
          );
        })}
      </div>

      {/* Main */}
      <main className="flex-1 min-w-0 pb-20 lg:pb-0">
        {children}
      </main>
    </div>
  );
}

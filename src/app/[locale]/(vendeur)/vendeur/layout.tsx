"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingBag, BarChart3,
  Home, LogOut, Menu, X, Store, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth";
import { useState } from "react";

const NAV = [
  { href: "/vendeur/dashboard", icon: LayoutDashboard, fr: "Vue d'ensemble",  ar: "لوحة القيادة" },
  { href: "/vendeur/produits",  icon: Package,          fr: "Mes produits",    ar: "منتجاتي" },
  { href: "/vendeur/commandes", icon: ShoppingBag,      fr: "Commandes",       ar: "الطلبات" },
  { href: "/vendeur/analytics", icon: BarChart3,        fr: "Analytiques",     ar: "التحليلات" },
];

export default function VendeurLayout({ children }: { children: React.ReactNode }) {
  const { locale } = useParams() as { locale: string };
  const pathname = usePathname();
  const isAr = locale === "ar";
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = `/${locale}`;
  };

  const NavLink = ({ item }: { item: (typeof NAV)[0] }) => {
    const full = `/${locale}${item.href}`;
    const active = pathname.startsWith(full);
    const Icon = item.icon;
    return (
      <Link
        href={full}
        onClick={() => setSidebarOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
          active
            ? "bg-souk-gold-500 text-white shadow-sm"
            : "text-souk-green-200 hover:bg-souk-green-700 hover:text-white",
        )}
      >
        <Icon size={17} className={cn("shrink-0", active ? "opacity-100" : "opacity-60 group-hover:opacity-100")} />
        <span className="flex-1">{isAr ? item.ar : item.fr}</span>
        {active && <ChevronRight size={13} className={isAr ? "rotate-180" : ""} />}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-souk-sand flex flex-col" dir={isAr ? "rtl" : "ltr"}>

      {/* ── Top navbar ── */}
      <header className="h-14 bg-souk-green-900 border-b border-souk-green-800 flex items-center px-4 gap-3 shrink-0 z-30">
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="lg:hidden p-2 rounded-lg hover:bg-souk-green-800 text-souk-green-200 transition-colors"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Logo */}
        <Link href={`/${locale}/vendeur/dashboard`} className="flex items-center gap-2">
          <div className="w-7 h-7 bg-souk-gold-500 rounded-lg flex items-center justify-center shrink-0">
            <Store size={14} className="text-white" />
          </div>
          <span className="font-black text-white text-sm hidden sm:block">
            سوق<span className="text-souk-gold-400">·</span>Vendeur
          </span>
        </Link>

        <div className="flex-1" />

        {user && (
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-souk-gold-500/20 border border-souk-gold-400/30 flex items-center justify-center text-souk-gold-300 font-bold text-xs">
              {user.firstName[0]?.toUpperCase()}
            </div>
            <span className="text-sm font-medium text-souk-green-100">{user.firstName} {user.lastName}</span>
            <span className="text-xs bg-souk-gold-500/20 text-souk-gold-300 font-bold px-1.5 py-0.5 rounded-full border border-souk-gold-400/30">
              VENDEUR
            </span>
          </div>
        )}

        <Link
          href={`/${locale}`}
          className="flex items-center gap-1.5 text-sm font-semibold text-souk-green-200 hover:text-white hover:bg-souk-green-800 px-3 py-1.5 rounded-lg transition-colors border border-souk-green-700"
        >
          <Home size={14} />
          <span className="hidden sm:block">{isAr ? "الموقع" : "Retour au site"}</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm font-semibold text-souk-terracotta-500 hover:text-souk-terracotta-600 hover:bg-souk-terracotta-50 px-3 py-1.5 rounded-lg transition-colors border border-souk-terracotta-500/30"
        >
          <LogOut size={14} />
          <span className="hidden sm:block">{isAr ? "خروج" : "Déconnexion"}</span>
        </button>
      </header>

      <div className="flex flex-1 min-h-0">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside className={cn(
          "fixed lg:static inset-y-14 start-0 z-20 w-56 bg-souk-green-900 border-e border-souk-green-800 flex flex-col py-4 px-2 transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isAr && !sidebarOpen && "lg:translate-x-0 -translate-x-full",
          isAr && sidebarOpen && "translate-x-0",
        )}>
          <p className="px-3 text-[10px] font-bold text-souk-green-500 uppercase tracking-widest mb-2">
            {isAr ? "القائمة" : "Navigation"}
          </p>
          <nav className="space-y-0.5 flex-1">
            {NAV.map((item) => <NavLink key={item.href} item={item} />)}
          </nav>

          <div className="pt-4 border-t border-souk-green-800 px-1">
            <p className="text-[10px] text-souk-green-600 text-center">
              Souk Digital © {new Date().getFullYear()}
            </p>
          </div>
        </aside>

        <main className="flex-1 min-w-0 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

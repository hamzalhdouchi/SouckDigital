"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Store, ShoppingCart, Tag,
  Home, LogOut, ChevronRight, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth";
import { useState } from "react";

const NAV = [
  { href: "/admin",         icon: LayoutDashboard, fr: "Vue d'ensemble",  ar: "نظرة عامة" },
  { href: "/admin/users",   icon: Users,            fr: "Utilisateurs",    ar: "المستخدمون" },
  { href: "/admin/vendors", icon: Store,             fr: "Vendeurs",        ar: "البائعون" },
  { href: "/admin/orders",  icon: ShoppingCart,      fr: "Commandes",       ar: "الطلبات" },
  { href: "/admin/promo",   icon: Tag,               fr: "Codes promo",     ar: "أكواد الخصم" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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

  const NavLink = ({ item }: { item: typeof NAV[0] }) => {
    const full = `/${locale}${item.href}`;
    const exact = item.href === "/admin";
    const active = exact ? pathname === full : pathname.startsWith(full);
    const Icon = item.icon;
    return (
      <Link
        href={full}
        onClick={() => setSidebarOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
          active
            ? "bg-souk-green-800 text-white shadow-sm"
            : "text-gray-600 hover:bg-souk-green-50 hover:text-souk-green-800",
        )}
      >
        <Icon size={17} className={cn("shrink-0", active ? "opacity-100" : "opacity-60 group-hover:opacity-100")} />
        <span className="flex-1">{isAr ? item.ar : item.fr}</span>
        {active && <ChevronRight size={13} className={isAr ? "rotate-180" : ""} />}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir={isAr ? "rtl" : "ltr"}>

      {/* ── Top navbar ── */}
      <header className="h-14 bg-white border-b border-gray-100 shadow-sm flex items-center px-4 gap-3 shrink-0 z-30">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Logo */}
        <Link href={`/${locale}/admin`} className="flex items-center gap-2">
          <div className="w-7 h-7 bg-souk-green-800 rounded-lg flex items-center justify-center shrink-0">
            <LayoutDashboard size={14} className="text-white" />
          </div>
          <span className="font-black text-souk-green-900 text-sm hidden sm:block">
            سوق<span className="text-souk-gold-500">·</span>Admin
          </span>
        </Link>

        <div className="flex-1" />

        {/* User info */}
        {user && (
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-souk-green-100 flex items-center justify-center text-souk-green-800 font-bold text-xs">
              {user.firstName[0]?.toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700">{user.firstName} {user.lastName}</span>
            <span className="text-xs bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded-full">ADMIN</span>
          </div>
        )}

        {/* Return to site */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-1.5 text-sm font-semibold text-souk-green-700 hover:text-souk-green-900 hover:bg-souk-green-50 px-3 py-1.5 rounded-lg transition-colors border border-souk-green-200"
        >
          <Home size={14} />
          <span className="hidden sm:block">{isAr ? "الموقع" : "Retour au site"}</span>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-red-200"
        >
          <LogOut size={14} />
          <span className="hidden sm:block">{isAr ? "خروج" : "Déconnexion"}</span>
        </button>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* ── Sidebar overlay (mobile) ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside className={cn(
          "fixed lg:static inset-y-14 start-0 z-20 w-56 bg-white border-e border-gray-100 flex flex-col py-4 px-2 transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isAr && !sidebarOpen && "lg:translate-x-0 -translate-x-full",
          isAr && sidebarOpen && "translate-x-0",
        )}>
          <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            {isAr ? "القائمة" : "Navigation"}
          </p>
          <nav className="space-y-0.5 flex-1">
            {NAV.map((item) => <NavLink key={item.href} item={item} />)}
          </nav>

          {/* Sidebar footer */}
          <div className="pt-4 border-t border-gray-100 px-1">
            <p className="text-[10px] text-gray-400 text-center">
              Souk Digital © {new Date().getFullYear()}
            </p>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

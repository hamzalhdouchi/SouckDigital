"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Users, Store, Package, ShoppingCart, TrendingUp, DollarSign,
  ArrowUpRight, ArrowDownRight, Activity,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/api/admin";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth";

export default function AdminOverviewPage() {
  const { locale } = useParams() as { locale: string };
  const isAr = locale === "ar";
  const user = useAuthStore((s) => s.user);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.getStats(),
  });

  const hour = new Date().getHours();
  const greeting = isAr
    ? hour < 12 ? "صباح الخير" : hour < 18 ? "مساء الخير" : "مساء النور"
    : hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  const CARDS = stats ? [
    {
      labelFr: "Utilisateurs", labelAr: "المستخدمون",
      value: stats.totalUsers.toLocaleString(),
      icon: Users, bg: "bg-blue-50", iconColor: "text-blue-600", border: "border-blue-100",
      trend: null,
    },
    {
      labelFr: "Vendeurs", labelAr: "البائعون",
      value: stats.totalVendors.toLocaleString(),
      icon: Store, bg: "bg-amber-50", iconColor: "text-amber-600", border: "border-amber-100",
      trend: null,
    },
    {
      labelFr: "Produits", labelAr: "المنتجات",
      value: stats.totalProducts.toLocaleString(),
      icon: Package, bg: "bg-indigo-50", iconColor: "text-indigo-600", border: "border-indigo-100",
      trend: null,
    },
    {
      labelFr: "Commandes", labelAr: "الطلبات",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart, bg: "bg-rose-50", iconColor: "text-rose-600", border: "border-rose-100",
      trend: null,
    },
    {
      labelFr: "Revenu total", labelAr: "الإيراد الكلي",
      value: formatPrice(stats.totalRevenue, locale),
      icon: DollarSign, bg: "bg-emerald-50", iconColor: "text-emerald-600", border: "border-emerald-100",
      trend: null,
    },
    {
      labelFr: "Panier moyen", labelAr: "متوسط الطلب",
      value: formatPrice(stats.avgOrderValue, locale),
      icon: TrendingUp, bg: "bg-souk-gold-50", iconColor: "text-souk-gold-600", border: "border-souk-gold-100",
      trend: null,
    },
  ] : null;

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* ── Welcome banner ── */}
      <div className="relative overflow-hidden bg-souk-green-900 rounded-2xl p-6 mb-6 shadow-lg">
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="adm-zellige" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                <polygon points="16,2 17.5,12 22,9.6 19.6,14 24,16 19.6,18 22,22.4 17.5,20 16,30 14.5,20 10,22.4 12.4,18 8,16 12.4,14 10,9.6 14.5,12" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#adm-zellige)" />
          </svg>
        </div>
        <div className="absolute end-0 top-0 bottom-0 w-48 bg-gradient-to-l from-souk-green-800/40 to-transparent" />
        <div className="relative">
          <p className="text-souk-green-300 text-sm font-medium mb-1">{greeting} 👋</p>
          <h1 className="text-2xl font-black text-white mb-1">
            {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-souk-green-400 text-sm">
            {isAr ? "لوحة الإدارة — نظرة شاملة على المنصة" : "Tableau de bord admin — Vue globale de la plateforme"}
          </p>
        </div>
        <div className="absolute end-6 top-1/2 -translate-y-1/2 opacity-10">
          <Activity size={80} className="text-white" />
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))
          : CARDS?.map(({ labelFr, labelAr, value, icon: Icon, bg, iconColor, border }) => (
              <div
                key={labelFr}
                className={cn(
                  "bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-shadow duration-200",
                  border,
                )}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", bg)}>
                  <Icon size={20} className={iconColor} />
                </div>
                <p className="text-2xl font-black text-gray-900 tabular-nums">{value}</p>
                <p className="text-xs font-medium text-gray-500 mt-1">
                  {isAr ? labelAr : labelFr}
                </p>
              </div>
            ))}
      </div>

      {/* ── Quick actions ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-bold text-gray-700 mb-4">
          {isAr ? "إجراءات سريعة" : "Actions rapides"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "users",   icon: Users,        fr: "Utilisateurs",  ar: "المستخدمون",  color: "text-blue-600 bg-blue-50 border-blue-100" },
            { href: "vendors", icon: Store,         fr: "Vendeurs",       ar: "البائعون",    color: "text-amber-600 bg-amber-50 border-amber-100" },
            { href: "orders",  icon: ShoppingCart,  fr: "Commandes",      ar: "الطلبات",     color: "text-rose-600 bg-rose-50 border-rose-100" },
            { href: "promo",   icon: TrendingUp,    fr: "Codes promo",    ar: "أكواد الخصم", color: "text-souk-gold-600 bg-souk-gold-50 border-souk-gold-100" },
          ].map(({ href, icon: Icon, fr, ar, color }) => (
            <a
              key={href}
              href={`/${locale}/admin/${href}`}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border font-medium text-sm transition-all hover:shadow-sm hover:-translate-y-0.5 duration-150",
                color,
              )}
            >
              <Icon size={22} />
              <span>{isAr ? ar : fr}</span>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}

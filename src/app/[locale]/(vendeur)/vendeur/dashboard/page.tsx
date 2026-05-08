"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  BarChart3, Package, ShoppingBag, Star, TrendingUp, TrendingDown,
  Plus, ArrowUpRight, Zap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, cn } from "@/lib/utils";
import { vendorDashboardApi } from "@/lib/api/vendor-dashboard";
import { ordersApi } from "@/lib/api/orders";
import { useAuthStore } from "@/lib/store/auth";
import type { OrderStatus, OrderSummaryDto } from "@/lib/api/types";

const STATUS_META: Record<OrderStatus, { fr: string; ar: string; color: string; dot: string }> = {
  PENDING:    { fr: "En attente",    ar: "في الانتظار",  color: "text-gray-600 bg-gray-100",    dot: "bg-gray-400" },
  CONFIRMED:  { fr: "Confirmée",     ar: "مؤكد",         color: "text-blue-600 bg-blue-50",     dot: "bg-blue-500" },
  PROCESSING: { fr: "En traitement", ar: "قيد المعالجة", color: "text-amber-600 bg-amber-50",   dot: "bg-amber-500" },
  SHIPPED:    { fr: "En livraison",  ar: "في الطريق",    color: "text-indigo-600 bg-indigo-50",  dot: "bg-indigo-500" },
  DELIVERED:  { fr: "Livré",         ar: "مُسلَّم",      color: "text-emerald-600 bg-emerald-50", dot: "bg-emerald-500" },
  CANCELLED:  { fr: "Annulée",       ar: "ملغاة",        color: "text-red-600 bg-red-50",       dot: "bg-red-500" },
  REFUNDED:   { fr: "Remboursée",    ar: "مُسترجع",      color: "text-purple-600 bg-purple-50", dot: "bg-purple-500" },
};

const UPDATABLE: OrderStatus[] = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function VendorDashboardPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isAr = locale === "ar";
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["vendor-stats"],
    queryFn: () => vendorDashboardApi.getStats(),
  });

  const { data: revenue, isLoading: loadingRevenue } = useQuery({
    queryKey: ["vendor-revenue"],
    queryFn: () => vendorDashboardApi.getRevenueTrend(12),
  });

  const { data: topProducts } = useQuery({
    queryKey: ["vendor-top-products"],
    queryFn: () => vendorDashboardApi.getTopProducts(5),
  });

  const { data: recentOrders, isLoading: loadingOrders } = useQuery({
    queryKey: ["vendor-orders-recent"],
    queryFn: () => vendorDashboardApi.getOrders({ size: 5 }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor-orders-recent"] }),
  });

  const greetingHour = new Date().getHours();
  const greeting = isAr
    ? (greetingHour < 12 ? "صباح الخير" : greetingHour < 18 ? "مساء الخير" : "مساء النور")
    : (greetingHour < 12 ? "Bonjour" : greetingHour < 18 ? "Bon après-midi" : "Bonsoir");

  const statCards = stats ? [
    {
      labelFr: "Chiffre d'affaires",
      labelAr: "رقم الأعمال",
      subFr: "ce mois",
      subAr: "هذا الشهر",
      value: formatPrice(stats.revenue, locale),
      trend: stats.revenueGrowthPct,
      icon: BarChart3,
      bg: "bg-souk-gold-50",
      text: "text-souk-gold-700",
    },
    {
      labelFr: "Commandes",
      labelAr: "الطلبات",
      subFr: "ce mois",
      subAr: "هذا الشهر",
      value: String(stats.ordersThisMonth),
      trend: stats.ordersGrowthPct,
      icon: ShoppingBag,
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
    {
      labelFr: "Produits actifs",
      labelAr: "منتجات نشطة",
      subFr: "en ligne",
      subAr: "على الإنترنت",
      value: String(stats.activeProducts),
      trend: null,
      icon: Package,
      bg: "bg-souk-green-50",
      text: "text-souk-green-700",
    },
    {
      labelFr: "Note moyenne",
      labelAr: "التقييم",
      subFr: `${stats.reviewCount} avis`,
      subAr: `${stats.reviewCount} تقييم`,
      value: stats.averageRating.toFixed(1),
      trend: null,
      icon: Star,
      bg: "bg-souk-terracotta-50",
      text: "text-souk-terracotta-500",
    },
  ] : null;

  return (
    <div className="min-h-full bg-souk-sand">

      {/* ── Greeting banner ── */}
      <div className="relative overflow-hidden bg-souk-green-900 px-6 py-8">
        <div className="absolute -top-12 -end-12 w-48 h-48 rounded-full bg-souk-gold-500/10" />
        <div className="absolute -bottom-8 start-1/3 w-32 h-32 rounded-full bg-souk-gold-400/5" />
        <div className="absolute top-4 end-1/4 w-16 h-16 rounded-full bg-souk-green-700/40" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-souk-gold-400 text-sm font-medium mb-1">{greeting} 👋</p>
            <h1 className="text-2xl font-black text-white">{user?.firstName} {user?.lastName}</h1>
            <p className="text-souk-green-300 text-sm mt-1">
              {isAr ? "إليك نظرة عامة على نشاط متجرك" : "Voici un aperçu de l'activité de votre boutique"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/${locale}/vendeur/produits/nouveau`}>
              <button className="flex items-center gap-2 bg-souk-gold-500 hover:bg-souk-gold-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-lg shadow-souk-gold-900/30">
                <Plus size={15} />
                {isAr ? "منتج جديد" : "Nouveau produit"}
              </button>
            </Link>
            <Link href={`/${locale}/vendeur/commandes`}>
              <button className="flex items-center gap-2 bg-souk-green-800 hover:bg-souk-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-souk-green-700">
                <ShoppingBag size={15} />
                {isAr ? "الطلبات" : "Commandes"}
              </button>
            </Link>
          </div>
        </div>

        {/* Mini stats strip */}
        {stats && (
          <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { label: isAr ? "الإيرادات الإجمالية" : "Revenus totaux", value: formatPrice(stats.revenueTotal, locale), icon: BarChart3 },
              { label: isAr ? "إجمالي الطلبات" : "Commandes totales", value: stats.ordersTotal, icon: ShoppingBag },
              { label: isAr ? "المنتجات النشطة" : "Produits actifs", value: stats.activeProducts, icon: Package },
              { label: isAr ? "التقييم المتوسط" : "Note moyenne", value: `★ ${stats.averageRating.toFixed(1)}`, icon: Star },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-souk-green-800/60 border border-souk-green-700/50 rounded-xl px-4 py-3">
                <p className="text-souk-green-400 text-xs mb-1 flex items-center gap-1"><Icon size={11} /> {label}</p>
                <p className="text-white font-black text-lg">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 py-6 space-y-6">

        {/* Stat cards */}
        {loadingStats ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards?.map(({ labelFr, labelAr, subFr, subAr, value, trend, icon: Icon, bg, text }) => (
              <div key={labelFr} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", bg)}>
                  <Icon size={19} className={text} />
                </div>
                <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
                <p className="text-xs font-semibold text-gray-500 mt-1">{isAr ? labelAr : labelFr}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{isAr ? subAr : subFr}</p>
                {trend != null && (
                  <div className={cn("flex items-center gap-1 mt-3 text-xs font-bold px-2 py-0.5 rounded-full w-fit", trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500")}>
                    {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {trend >= 0 ? "+" : ""}{trend.toFixed(1)}%
                  </div>
                )}
                <div className={cn("absolute bottom-0 start-0 end-0 h-0.5 bg-souk-green-500 opacity-0 group-hover:opacity-100 transition-opacity")} />
              </div>
            ))}
          </div>
        )}

        {/* Revenue chart + Top products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue area chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-black text-gray-900">{isAr ? "تطور المبيعات" : "Évolution des ventes"}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{isAr ? "آخر 12 شهراً" : "12 derniers mois"}</p>
              </div>
              {stats && (
                <div className="text-end">
                  <p className="text-lg font-black text-souk-gold-600">{formatPrice(stats.revenueTotal, locale)}</p>
                  <p className="text-xs text-gray-400">{isAr ? "الإجمالي" : "Total"}</p>
                </div>
              )}
            </div>
            {loadingRevenue ? (
              <Skeleton className="h-48 w-full rounded-xl" />
            ) : revenue && revenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={revenue} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#347A58" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#347A58" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(v) => [formatPrice(v as number, locale), isAr ? "الإيرادات" : "Revenus"]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                  />
                  <Area dataKey="revenue" stroke="#347A58" strokeWidth={2.5} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-sm text-gray-400 gap-2">
                <BarChart3 size={32} className="text-gray-200" />
                {isAr ? "لا توجد بيانات بعد" : "Aucune donnée pour l'instant"}
              </div>
            )}
          </div>

          {/* Top products */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-gray-900 text-sm">{isAr ? "أفضل المنتجات" : "Top produits"}</h3>
              <Zap size={15} className="text-souk-gold-500" />
            </div>
            <div className="space-y-4">
              {!topProducts ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)
              ) : topProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  {isAr ? "لا توجد مبيعات بعد" : "Aucune vente pour l'instant"}
                </div>
              ) : topProducts.map((p, i) => (
                <div key={p.productId} className="flex items-center gap-3">
                  <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
                    i === 0 ? "bg-souk-gold-500 text-white" : i === 1 ? "bg-gray-300 text-gray-700" : "bg-souk-terracotta-100 text-souk-terracotta-600")}>
                    {i + 1}
                  </span>
                  {p.image && (
                    <div className="h-8 w-8 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      <Image src={p.image} alt={p.name} width={32} height={32} className="object-cover w-full h-full" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-400">{p.totalSold} {isAr ? "مباع" : "vendus"}</p>
                  </div>
                  <span className="text-xs font-black text-souk-gold-600 shrink-0">
                    {formatPrice(p.revenue, locale)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <div>
              <h3 className="font-black text-gray-900">{isAr ? "آخر الطلبات" : "Dernières commandes"}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{isAr ? "أحدث 5 طلبات" : "5 commandes récentes"}</p>
            </div>
            <Link href={`/${locale}/vendeur/commandes`}
              className="flex items-center gap-1.5 text-xs font-bold text-souk-green-700 hover:text-souk-green-900 bg-souk-green-50 hover:bg-souk-green-100 px-3 py-1.5 rounded-lg transition-colors">
              {isAr ? "عرض الكل" : "Voir tout"} <ArrowUpRight size={13} />
            </Link>
          </div>
          <RecentOrdersTable
            orders={recentOrders?.content.slice(0, 5) ?? []}
            loading={loadingOrders}
            isAr={isAr}
            locale={locale}
            onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
          />
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: `/vendeur/produits`, icon: Package, labelFr: "Gérer mes produits", labelAr: "إدارة المنتجات", sub: isAr ? "إضافة أو تعديل منتج" : "Ajouter ou modifier", color: "bg-souk-green-50 hover:bg-souk-green-100 text-souk-green-700 border-souk-green-200" },
            { href: `/vendeur/commandes`, icon: ShoppingBag, labelFr: "Voir les commandes", labelAr: "عرض الطلبات", sub: isAr ? "تتبع وتحديث الطلبات" : "Suivre et mettre à jour", color: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200" },
            { href: `/vendeur/analytics`, icon: BarChart3, labelFr: "Analytiques", labelAr: "التحليلات", sub: isAr ? "إحصائيات الأداء" : "Voir les statistiques", color: "bg-souk-gold-50 hover:bg-souk-gold-100 text-souk-gold-700 border-souk-gold-200" },
          ].map(({ href, icon: Icon, labelFr, labelAr, sub, color }) => (
            <Link key={href} href={`/${locale}${href}`}
              className={cn("flex items-center gap-4 p-4 rounded-2xl border transition-colors", color)}>
              <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center shrink-0">
                <Icon size={18} />
              </div>
              <div>
                <p className="font-bold text-sm">{isAr ? labelAr : labelFr}</p>
                <p className="text-xs opacity-60 mt-0.5">{sub}</p>
              </div>
              <ArrowUpRight size={15} className="ms-auto opacity-40" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecentOrdersTable({
  orders, loading, isAr, locale, onStatusChange,
}: {
  orders: OrderSummaryDto[];
  loading: boolean;
  isAr: boolean;
  locale: string;
  onStatusChange: (id: string, status: OrderStatus) => void;
}) {
  if (loading) {
    return (
      <div className="p-4 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
      </div>
    );
  }
  if (orders.length === 0) {
    return (
      <div className="py-14 text-center flex flex-col items-center gap-3 text-sm text-gray-400">
        <ShoppingBag size={32} className="text-gray-200" />
        {isAr ? "لا توجد طلبات بعد" : "Aucune commande pour l'instant"}
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-souk-green-50 text-xs text-souk-green-700 font-semibold">
            <th className="px-5 py-3 text-start">{isAr ? "رقم الطلب" : "N° commande"}</th>
            <th className="px-5 py-3 text-start">{isAr ? "المنتج" : "Article"}</th>
            <th className="px-5 py-3 text-start">{isAr ? "المبلغ" : "Montant"}</th>
            <th className="px-5 py-3 text-start">{isAr ? "التاريخ" : "Date"}</th>
            <th className="px-5 py-3 text-start">{isAr ? "الحالة" : "Statut"}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.map((order) => {
            const meta = STATUS_META[order.status];
            return (
              <tr key={order.id} className="hover:bg-souk-green-50/40 transition-colors">
                <td className="px-5 py-3.5 text-sm font-mono font-bold text-souk-green-800">
                  #{order.id.slice(0, 8).toUpperCase()}
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-600 max-w-[180px] truncate">
                  {order.firstItemName}
                  {order.itemCount > 1 && <span className="text-gray-400"> +{order.itemCount - 1}</span>}
                </td>
                <td className="px-5 py-3.5 text-sm font-black text-gray-900">
                  {formatPrice(order.total, locale)}
                </td>
                <td className="px-5 py-3.5 text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString(isAr ? "ar-MA" : "fr-MA")}
                </td>
                <td className="px-5 py-3.5">
                  <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg", meta.color)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", meta.dot)} />
                    {isAr ? meta.ar : meta.fr}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

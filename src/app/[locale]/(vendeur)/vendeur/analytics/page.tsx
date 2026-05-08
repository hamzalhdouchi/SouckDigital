"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { BarChart3, ShoppingBag, Star, Package, TrendingUp, TrendingDown, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { vendorDashboardApi } from "@/lib/api/vendor-dashboard";
import { formatPrice, cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/api/types";

const STATUS_META: Record<OrderStatus, { fr: string; ar: string }> = {
  PENDING:    { fr: "En attente",    ar: "في الانتظار" },
  CONFIRMED:  { fr: "Confirmée",     ar: "مؤكد" },
  PROCESSING: { fr: "En traitement", ar: "قيد المعالجة" },
  SHIPPED:    { fr: "En livraison",  ar: "في الطريق" },
  DELIVERED:  { fr: "Livré",         ar: "مُسلَّم" },
  CANCELLED:  { fr: "Annulée",       ar: "ملغاة" },
  REFUNDED:   { fr: "Remboursée",    ar: "مُسترجع" },
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#9CA3AF", CONFIRMED: "#3B82F6", PROCESSING: "#F59E0B",
  SHIPPED: "#6366F1", DELIVERED: "#10B981", CANCELLED: "#EF4444", REFUNDED: "#8B5CF6",
};

export default function VendeurAnalyticsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isAr = locale === "ar";

  const { data: stats } = useQuery({
    queryKey: ["vendor-stats"],
    queryFn: () => vendorDashboardApi.getStats(),
  });

  const { data: revenue, isLoading: loadingRevenue } = useQuery({
    queryKey: ["vendor-revenue"],
    queryFn: () => vendorDashboardApi.getRevenueTrend(12),
  });

  const { data: topProducts, isLoading: loadingTop } = useQuery({
    queryKey: ["vendor-top-products"],
    queryFn: () => vendorDashboardApi.getTopProducts(8),
  });

  const { data: ordersByStatus } = useQuery({
    queryKey: ["vendor-orders-by-status"],
    queryFn: vendorDashboardApi.getOrdersByStatus,
  });

  const statusChartData = ordersByStatus
    ? Object.entries(ordersByStatus)
        .filter(([, v]) => v > 0)
        .map(([status, count]) => ({
          name: isAr ? STATUS_META[status as OrderStatus]?.ar : STATUS_META[status as OrderStatus]?.fr,
          value: count,
          color: STATUS_COLORS[status] ?? "#9CA3AF",
        }))
    : [];

  return (
    <div className="min-h-full bg-souk-sand">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <h1 className="text-xl font-black text-gray-900">
          {isAr ? "التحليلات" : "Analytiques"}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {isAr ? "نظرة شاملة على أداء متجرك" : "Vue complète des performances de votre boutique"}
        </p>
      </div>

      <div className="px-6 py-6 space-y-6">

        {/* KPI cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: BarChart3, label: isAr ? "إجمالي الإيرادات" : "Revenus totaux", value: formatPrice(stats.revenueTotal, locale), sub: isAr ? "منذ البداية" : "Depuis le début", color: "bg-souk-gold-50 text-souk-gold-700", trend: stats.revenueGrowthPct },
              { icon: ShoppingBag, label: isAr ? "إجمالي الطلبات" : "Commandes totales", value: String(stats.ordersTotal), sub: isAr ? "كل الطلبات" : "Toutes les commandes", color: "bg-blue-50 text-blue-700", trend: stats.ordersGrowthPct },
              { icon: Star, label: isAr ? "عدد التقييمات" : "Avis clients", value: String(stats.reviewCount), sub: isAr ? "تقييمات العملاء" : "Total des avis", color: "bg-souk-terracotta-50 text-souk-terracotta-500", trend: null },
              { icon: CheckCircle2, label: isAr ? "التقييم المتوسط" : "Note moyenne", value: `★ ${stats.averageRating.toFixed(1)}`, sub: isAr ? "من أصل 5" : "sur 5", color: "bg-souk-green-50 text-souk-green-700", trend: null },
            ].map(({ icon: Icon, label, value, sub, color, trend }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", color)}>
                  <Icon size={18} />
                </div>
                <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
                <p className="text-xs font-semibold text-gray-500 mt-1">{label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
                {trend != null && (
                  <div className={cn("flex items-center gap-1 mt-2 text-xs font-bold px-2 py-0.5 rounded-full w-fit", trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500")}>
                    {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {trend >= 0 ? "+" : ""}{trend.toFixed(1)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Revenue charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 12-month area chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-black text-gray-900 mb-1">{isAr ? "تطور الإيرادات" : "Évolution des revenus"}</h3>
            <p className="text-xs text-gray-400 mb-5">{isAr ? "آخر 12 شهراً" : "12 derniers mois"}</p>
            {loadingRevenue ? (
              <Skeleton className="h-48 w-full rounded-xl" />
            ) : revenue && revenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={190}>
                <AreaChart data={revenue} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
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
                  <Area dataKey="revenue" stroke="#347A58" strokeWidth={2.5} fill="url(#areaGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-gray-400">
                {isAr ? "لا توجد بيانات" : "Aucune donnée"}
              </div>
            )}
          </div>

          {/* 6-month bar chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-black text-gray-900 mb-1">{isAr ? "الطلبات الشهرية" : "Commandes par mois"}</h3>
            <p className="text-xs text-gray-400 mb-5">{isAr ? "آخر 6 أشهر" : "6 derniers mois"}</p>
            {loadingRevenue ? (
              <Skeleton className="h-48 w-full rounded-xl" />
            ) : revenue && revenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={revenue.slice(-6)} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(v) => [String(v), isAr ? "الطلبات" : "Commandes"]}
                    contentStyle={{ borderRadius: "12px", fontSize: "11px" }}
                  />
                  <Bar dataKey="orderCount" fill="#C9973A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-gray-400">
                {isAr ? "لا توجد بيانات" : "Aucune donnée"}
              </div>
            )}
          </div>
        </div>

        {/* Top products + Orders by status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top products */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-black text-gray-900 mb-5">{isAr ? "أفضل المنتجات مبيعاً" : "Produits les plus vendus"}</h3>
            {loadingTop ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
              </div>
            ) : (topProducts ?? []).length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center gap-2">
                <Package size={32} className="text-gray-200" />
                <p className="text-sm text-gray-400">{isAr ? "لا توجد بيانات بعد" : "Aucune donnée"}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(topProducts ?? []).map((p, i) => (
                  <div key={p.productId} className="flex items-center gap-3">
                    <span className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0",
                      i === 0 ? "bg-souk-gold-500 text-white"
                        : i === 1 ? "bg-gray-300 text-gray-700"
                        : i === 2 ? "bg-souk-terracotta-100 text-souk-terracotta-600"
                        : "bg-souk-green-50 text-souk-green-700",
                    )}>
                      {i + 1}
                    </span>
                    {p.image && (
                      <div className="h-9 w-9 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                        <Image src={p.image} alt={p.name} width={36} height={36} className="object-cover w-full h-full" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-souk-green-50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-souk-green-500 rounded-full"
                            style={{ width: `${Math.min(100, (p.totalSold / (topProducts?.[0]?.totalSold || 1)) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500 shrink-0">{p.totalSold} {isAr ? "مبيع" : "vendus"}</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-souk-gold-700 shrink-0">
                      {formatPrice(p.revenue, locale)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Orders by status donut */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-black text-gray-900 mb-1">{isAr ? "الطلبات حسب الحالة" : "Commandes par statut"}</h3>
            <p className="text-xs text-gray-400 mb-4">{isAr ? "توزيع جميع الطلبات" : "Répartition de vos commandes"}</p>
            {!ordersByStatus ? (
              <Skeleton className="h-52 w-full rounded-xl" />
            ) : statusChartData.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-sm text-gray-400">
                {isAr ? "لا توجد بيانات" : "Aucune donnée"}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value">
                    {statusChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [String(v), ""]} contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Summary table */}
        {stats && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-black text-gray-900 mb-5">{isAr ? "ملخص الأداء" : "Récapitulatif des performances"}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: isAr ? "إيرادات هذا الشهر" : "Revenus ce mois", value: formatPrice(stats.revenue, locale), accent: "text-souk-gold-700" },
                { label: isAr ? "طلبات هذا الشهر" : "Commandes ce mois", value: stats.ordersThisMonth, accent: "text-blue-600" },
                { label: isAr ? "المنتجات النشطة" : "Produits actifs", value: stats.activeProducts, accent: "text-souk-green-700" },
                { label: isAr ? "إجمالي الإيرادات" : "Revenus totaux", value: formatPrice(stats.revenueTotal, locale), accent: "text-souk-gold-700" },
              ].map(({ label, value, accent }) => (
                <div key={label} className="bg-souk-green-50 rounded-xl p-4">
                  <p className={cn("text-xl font-black leading-none", accent)}>{value}</p>
                  <p className="text-xs text-gray-500 mt-2">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

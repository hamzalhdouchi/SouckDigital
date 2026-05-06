"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  BarChart3, Package, ShoppingBag, Star, TrendingUp, TrendingDown,
  Plus, Eye, Edit2, ToggleLeft, ToggleRight, AlertCircle,
  ArrowUpRight, Search, Download,
} from "lucide-react";
import Button from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardStatsSkeleton } from "@/components/skeletons/dashboard-stats-skeleton";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { vendorDashboardApi } from "@/lib/api/vendor-dashboard";
import { ordersApi } from "@/lib/api/orders";
import { productsApi } from "@/lib/api/products";
import type { OrderStatus, OrderSummaryDto, ProductSummaryDto } from "@/lib/api/types";

const ORDER_STATUS_META: Record<OrderStatus, { labelFr: string; labelAr: string; color: string }> = {
  PENDING:    { labelFr: "En attente",    labelAr: "في الانتظار",   color: "text-gray-600 bg-gray-50 border-gray-200" },
  CONFIRMED:  { labelFr: "Confirmée",     labelAr: "مؤكد",          color: "text-blue-600 bg-blue-50 border-blue-200" },
  PROCESSING: { labelFr: "En traitement", labelAr: "قيد المعالجة",  color: "text-amber-600 bg-amber-50 border-amber-200" },
  SHIPPED:    { labelFr: "En livraison",  labelAr: "في الطريق",     color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  DELIVERED:  { labelFr: "Livré",         labelAr: "مُسلَّم",       color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  CANCELLED:  { labelFr: "Annulée",       labelAr: "ملغاة",         color: "text-red-600 bg-red-50 border-red-200" },
  REFUNDED:   { labelFr: "Remboursée",    labelAr: "مُسترجع",       color: "text-purple-600 bg-purple-50 border-purple-200" },
};

const UPDATABLE_STATUSES: OrderStatus[] = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const TABS = [
  { key: "overview",  labelFr: "Tableau de bord", labelAr: "لوحة القيادة" },
  { key: "products",  labelFr: "Mes produits",    labelAr: "منتجاتي" },
  { key: "orders",    labelFr: "Commandes",       labelAr: "الطلبات" },
  { key: "analytics", labelFr: "Analytiques",     labelAr: "التحليلات" },
];

export default function VendorDashboardPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isAr = locale === "ar";
  const [activeTab, setActiveTab] = useState("overview");
  const qc = useQueryClient();

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["vendor-stats"],
    queryFn: () => vendorDashboardApi.getStats(),
  });

  const { data: revenue, isLoading: loadingRevenue } = useQuery({
    queryKey: ["vendor-revenue"],
    queryFn: () => vendorDashboardApi.getRevenueTrend(12),
    enabled: activeTab === "overview" || activeTab === "analytics",
  });

  const { data: topProducts } = useQuery({
    queryKey: ["vendor-top-products"],
    queryFn: () => vendorDashboardApi.getTopProducts(5),
    enabled: activeTab === "analytics" || activeTab === "overview",
  });

  const { data: recentOrders, isLoading: loadingOrders } = useQuery({
    queryKey: ["vendor-orders", activeTab],
    queryFn: () => vendorDashboardApi.getOrders({ size: activeTab === "orders" ? 20 : 5 }),
    enabled: activeTab === "overview" || activeTab === "orders",
  });

  const { data: vendorProducts, isLoading: loadingProducts } = useQuery({
    queryKey: ["vendor-products"],
    queryFn: () => productsApi.getAll({ page: 0, size: 20 }),
    enabled: activeTab === "products",
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor-orders"] }),
  });

  const toggleProduct = useMutation({
    mutationFn: (id: string) => productsApi.toggleActive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor-products"] }),
  });

  const STAT_CARDS = stats ? [
    {
      labelFr: "Chiffre d'affaires (mois)",
      labelAr: "رقم الأعمال (الشهر)",
      value: formatPrice(stats.revenue, locale),
      trend: stats.revenueGrowthPct,
      icon: BarChart3,
      color: "text-souk-green-700 bg-souk-green-50",
    },
    {
      labelFr: "Commandes ce mois",
      labelAr: "الطلبات هذا الشهر",
      value: String(stats.ordersThisMonth),
      trend: stats.ordersGrowthPct,
      icon: ShoppingBag,
      color: "text-blue-700 bg-blue-50",
    },
    {
      labelFr: "Produits actifs",
      labelAr: "المنتجات النشطة",
      value: String(stats.activeProducts),
      trend: null,
      icon: Package,
      color: "text-souk-gold-700 bg-souk-gold-50",
    },
    {
      labelFr: "Note moyenne",
      labelAr: "التقييم المتوسط",
      value: `${stats.averageRating.toFixed(1)} ★`,
      trend: null,
      icon: Star,
      color: "text-souk-terracotta-700 bg-souk-terracotta-50",
    },
  ] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            {isAr ? "لوحة تحكم المتجر" : "Tableau de bord vendeur"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAr ? "إدارة منتجاتك وطلباتك" : "Gérez vos produits et commandes"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" leftIcon={<Download size={15} />}>
            {isAr ? "تصدير" : "Exporter"}
          </Button>
          <Link href={`/${locale}/vendeur/produits/nouveau`}>
            <Button size="sm" leftIcon={<Plus size={15} />}>
              {isAr ? "إضافة منتج" : "Ajouter produit"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map(({ key, labelFr, labelAr }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              "flex-1 min-w-max px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap",
              activeTab === key
                ? "bg-white text-souk-green-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            {isAr ? labelAr : labelFr}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats */}
          {loadingStats ? (
            <DashboardStatsSkeleton />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {STAT_CARDS?.map(({ labelFr, labelAr, value, trend, icon: Icon, color }) => (
                <div key={labelFr} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", color)}>
                    <Icon size={20} />
                  </div>
                  <p className="text-2xl font-black text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{isAr ? labelAr : labelFr}</p>
                  {trend != null && (
                    <div className={cn("flex items-center gap-1 mt-2 text-xs font-semibold", trend >= 0 ? "text-green-600" : "text-red-500")}>
                      {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                      {trend >= 0 ? "+" : ""}{trend.toFixed(1)}% {isAr ? "هذا الشهر" : "ce mois"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Revenue chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">
                {isAr ? "تطور المبيعات (12 شهراً)" : "Évolution des ventes (12 mois)"}
              </h3>
            </div>
            {loadingRevenue ? (
              <Skeleton className="h-40 w-full rounded-xl" />
            ) : revenue && revenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={revenue} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value) => formatPrice(value as number, locale)}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                  />
                  <Bar dataKey="revenue" fill="#2D6A4F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 flex items-center justify-center text-sm text-gray-400">
                {isAr ? "لا توجد بيانات" : "Aucune donnée disponible"}
              </div>
            )}
          </div>

          {/* Recent orders */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <h3 className="font-bold text-gray-900">
                {isAr ? "آخر الطلبات" : "Dernières commandes"}
              </h3>
              <button
                onClick={() => setActiveTab("orders")}
                className="text-sm text-souk-green-700 font-semibold hover:text-souk-green-800 flex items-center gap-1"
              >
                {isAr ? "عرض الكل" : "Voir tout"} <ArrowUpRight size={14} />
              </button>
            </div>
            <OrdersTable
              orders={recentOrders?.content.slice(0, 5) ?? []}
              loading={loadingOrders}
              isAr={isAr}
              onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
              locale={locale}
            />
          </div>
        </div>
      )}

      {/* ── Products ── */}
      {activeTab === "products" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder={isAr ? "ابحث عن منتج..." : "Rechercher un produit..."}
                className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-souk-green-500"
              />
            </div>
            <Link href={`/${locale}/vendeur/produits/nouveau`}>
              <Button size="sm" leftIcon={<Plus size={15} />}>
                {isAr ? "إضافة منتج" : "Nouveau produit"}
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loadingProducts ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <ProductsTable
                products={vendorProducts?.content ?? []}
                isAr={isAr}
                locale={locale}
                onToggle={(id) => toggleProduct.mutate(id)}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Orders ── */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder={isAr ? "ابحث عن طلب..." : "Rechercher une commande..."}
                className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-souk-green-500"
              />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <OrdersTable
              orders={recentOrders?.content ?? []}
              loading={loadingOrders}
              isAr={isAr}
              onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
              locale={locale}
              showStatusUpdate
            />
          </div>
        </div>
      )}

      {/* ── Analytics ── */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top products */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                {isAr ? "أفضل المنتجات" : "Produits les plus vendus"}
              </h3>
              <div className="space-y-3">
                {(topProducts ?? []).map((p, i) => (
                  <div key={p.productId} className="flex items-center gap-3">
                    <span className="text-xs font-black text-gray-400 w-5">{i + 1}</span>
                    {p.image && (
                      <div className="h-9 w-9 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                        <Image src={p.image} alt={p.name} width={36} height={36} className="object-cover w-full h-full" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-souk-green-500 rounded-full"
                            style={{ width: `${Math.min(100, (p.totalSold / (topProducts?.[0]?.totalSold || 1)) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{p.totalSold}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-souk-green-700 shrink-0">
                      {formatPrice(p.revenue, locale)}
                    </span>
                  </div>
                ))}
                {!topProducts && <Skeleton className="h-24 w-full rounded-xl" />}
              </div>
            </div>

            {/* Revenue trend mini */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                {isAr ? "إيرادات الأشهر الأخيرة" : "Revenus des derniers mois"}
              </h3>
              {revenue && revenue.length > 0 ? (
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={revenue.slice(-6)} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      formatter={(v) => formatPrice(v as number, locale)}
                      contentStyle={{ borderRadius: "12px", fontSize: "11px" }}
                    />
                    <Bar dataKey="revenue" fill="#52B788" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Skeleton className="h-40 w-full rounded-xl" />
              )}
            </div>
          </div>

          {/* Stats summary */}
          {stats && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                {isAr ? "إحصائيات عامة" : "Statistiques générales"}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                {[
                  { label: isAr ? "إجمالي الإيرادات" : "Revenus totaux", value: formatPrice(stats.revenueTotal, locale) },
                  { label: isAr ? "إجمالي الطلبات" : "Commandes totales", value: stats.ordersTotal },
                  { label: isAr ? "عدد التقييمات" : "Nombre d'avis", value: stats.reviewCount },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-4">
                    <p className="text-lg font-black text-souk-green-800">{value}</p>
                    <p className="text-xs text-gray-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Orders table ── */
function OrdersTable({
  orders,
  loading,
  isAr,
  onStatusChange,
  locale,
  showStatusUpdate = false,
}: {
  orders: OrderSummaryDto[];
  loading: boolean;
  isAr: boolean;
  onStatusChange: (id: string, status: OrderStatus) => void;
  locale: string;
  showStatusUpdate?: boolean;
}) {
  if (loading) {
    return (
      <div className="p-4 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
      </div>
    );
  }
  if (orders.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-gray-400">
        {isAr ? "لا توجد طلبات" : "Aucune commande"}
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 text-xs text-gray-500 font-semibold">
            <th className="px-4 py-3 text-start">{isAr ? "رقم الطلب" : "N° commande"}</th>
            <th className="px-4 py-3 text-start">{isAr ? "المنتج" : "Article"}</th>
            <th className="px-4 py-3 text-start">{isAr ? "المبلغ" : "Montant"}</th>
            <th className="px-4 py-3 text-start">{isAr ? "التاريخ" : "Date"}</th>
            <th className="px-4 py-3 text-start">{isAr ? "الحالة" : "Statut"}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.map((order) => {
            const meta = ORDER_STATUS_META[order.status] ?? ORDER_STATUS_META.PENDING;
            return (
              <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 text-sm font-mono font-semibold text-souk-green-800">
                  #{order.id.slice(0, 8).toUpperCase()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-[180px] truncate">
                  {order.firstItemName}
                  {order.itemCount > 1 && (
                    <span className="text-gray-400"> +{order.itemCount - 1}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">
                  {formatPrice(order.total, locale)}
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString(isAr ? "ar-MA" : "fr-MA")}
                </td>
                <td className="px-4 py-3">
                  {showStatusUpdate ? (
                    <select
                      value={order.status}
                      onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
                      className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none",
                        meta.color,
                      )}
                    >
                      {UPDATABLE_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {isAr ? ORDER_STATUS_META[s].labelAr : ORDER_STATUS_META[s].labelFr}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border", meta.color)}>
                      {isAr ? meta.labelAr : meta.labelFr}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Products table ── */
function ProductsTable({
  products,
  isAr,
  locale,
  onToggle,
}: {
  products: ProductSummaryDto[];
  isAr: boolean;
  locale: string;
  onToggle: (id: string) => void;
}) {
  if (products.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-gray-400 flex flex-col items-center gap-3">
        <Package size={36} className="text-gray-200" />
        {isAr ? "لا توجد منتجات بعد" : "Aucun produit pour l'instant"}
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 text-xs text-gray-500 font-semibold">
            <th className="px-4 py-3 text-start">{isAr ? "المنتج" : "Produit"}</th>
            <th className="px-4 py-3 text-start">{isAr ? "السعر" : "Prix"}</th>
            <th className="px-4 py-3 text-start">{isAr ? "المخزون" : "Stock"}</th>
            <th className="px-4 py-3 text-start">{isAr ? "التقييم" : "Note"}</th>
            <th className="px-4 py-3 text-start">{isAr ? "الحالة" : "Statut"}</th>
            <th className="px-4 py-3 text-start">{isAr ? "إجراءات" : "Actions"}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {p.image && (
                      <Image src={p.image} alt={p.name} width={40} height={40} className="object-cover w-full h-full" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate max-w-[160px]">{p.name}</p>
                    {p.city && <p className="text-xs text-gray-400">{p.city}</p>}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <p className="text-sm font-bold text-souk-green-800">{formatPrice(p.price, locale)}</p>
                {p.originalPrice && p.originalPrice > p.price && (
                  <p className="text-xs text-gray-400 line-through">{formatPrice(p.originalPrice, locale)}</p>
                )}
              </td>
              <td className="px-4 py-3">
                <span className="text-xs font-semibold text-gray-600">
                  {!p.inStock && <AlertCircle size={12} className="inline me-1 text-red-500" />}
                  {p.inStock ? (isAr ? "متوفر" : "En stock") : (isAr ? "نفد" : "Épuisé")}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-souk-gold-600 font-semibold">★ {p.rating.toFixed(1)}</span>
                <p className="text-xs text-gray-400">({p.reviewCount})</p>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onToggle(p.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold"
                >
                  {p.inStock ? (
                    <><ToggleRight size={20} className="text-souk-green-600" /><span className="text-souk-green-600">{isAr ? "نشط" : "Actif"}</span></>
                  ) : (
                    <><ToggleLeft size={20} className="text-gray-400" /><span className="text-gray-400">{isAr ? "معطل" : "Désactivé"}</span></>
                  )}
                </button>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Link href={`/${locale}/products/${p.slug}`}>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700">
                      <Eye size={15} />
                    </button>
                  </Link>
                  <Link href={`/${locale}/vendeur/produits/${p.id}/modifier`}>
                    <button className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-gray-500 hover:text-blue-600">
                      <Edit2 size={15} />
                    </button>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  BarChart3, Package, ShoppingBag, Star, TrendingUp, TrendingDown,
  Plus, Eye, Edit2, Trash2, ToggleLeft, ToggleRight, AlertCircle,
  ArrowUpRight, ChevronDown, Search, Filter, Download,
} from "lucide-react";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

const STATS = [
  { key: "revenue",  labelFr: "Chiffre d'affaires",  labelAr: "رقم الأعمال",   value: "12 450 DH", trend: +18.5, icon: BarChart3,   color: "text-souk-green-700 bg-souk-green-50" },
  { key: "orders",   labelFr: "Commandes ce mois",   labelAr: "الطلبات هذا الشهر", value: "38",      trend: +6.2,  icon: ShoppingBag, color: "text-blue-700 bg-blue-50" },
  { key: "products", labelFr: "Produits actifs",     labelAr: "المنتجات النشطة", value: "24",        trend: +2,    icon: Package,     color: "text-souk-gold-700 bg-souk-gold-50" },
  { key: "rating",   labelFr: "Note moyenne",        labelAr: "التقييم المتوسط", value: "4.8 ★",     trend: +0.2,  icon: Star,        color: "text-souk-terracotta-700 bg-souk-terracotta-50" },
];

const MOCK_VENDOR_ORDERS = [
  { id: "ORD-001", customer: "Fatima B.", date: "2026-05-03", product: "Tajine Traditionnel de Safi", amount: 189, status: "processing" },
  { id: "ORD-002", customer: "Mohammed K.", date: "2026-05-02", product: "Tapis Berbère Azilal", amount: 1200, status: "shipped" },
  { id: "ORD-003", customer: "Amina L.", date: "2026-05-01", product: "Tajine Traditionnel de Safi", amount: 189, status: "delivered" },
  { id: "ORD-004", customer: "Karim A.", date: "2026-04-30", product: "Tapis Berbère Azilal", amount: 1200, status: "delivered" },
  { id: "ORD-005", customer: "Sara M.", date: "2026-04-29", product: "Tajine Traditionnel de Safi", amount: 378, status: "cancelled" },
];

const ORDER_STATUS: Record<string, { label: string; labelAr: string; color: string }> = {
  processing: { label: "En traitement", labelAr: "قيد المعالجة", color: "text-amber-600 bg-amber-50 border-amber-200" },
  shipped:    { label: "En livraison",  labelAr: "في الطريق",    color: "text-blue-600 bg-blue-50 border-blue-200" },
  delivered:  { label: "Livré",         labelAr: "مُسلَّم",      color: "text-green-600 bg-green-50 border-green-200" },
  cancelled:  { label: "Annulé",        labelAr: "ملغى",          color: "text-red-600 bg-red-50 border-red-200" },
};

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
  const [productEnabled, setProductEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(MOCK_PRODUCTS.map((p) => [p.id, true]))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            {isAr ? "لوحة تحكم المتجر" : "Tableau de bord vendeur"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAr ? "مرحباً بك، Poterie de Safi" : "Bienvenue, Poterie de Safi"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" leftIcon={<Download size={15} />}>
            {isAr ? "تصدير" : "Exporter"}
          </Button>
          <Button size="sm" leftIcon={<Plus size={15} />}>
            {isAr ? "إضافة منتج" : "Ajouter produit"}
          </Button>
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
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {isAr ? labelAr : labelFr}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map(({ key, labelFr, labelAr, value, trend, icon: Icon, color }) => (
              <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", color)}>
                  <Icon size={20} />
                </div>
                <p className="text-2xl font-black text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-1">{isAr ? labelAr : labelFr}</p>
                <div className={cn("flex items-center gap-1 mt-2 text-xs font-semibold", trend >= 0 ? "text-green-600" : "text-red-500")}>
                  {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {trend >= 0 ? "+" : ""}{trend}% {isAr ? "هذا الشهر" : "ce mois"}
                </div>
              </div>
            ))}
          </div>

          {/* Revenue chart placeholder */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900">{isAr ? "تطور المبيعات" : "Évolution des ventes"}</h3>
              <select className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none">
                <option>30 {isAr ? "يوم" : "jours"}</option>
                <option>3 {isAr ? "أشهر" : "mois"}</option>
                <option>12 {isAr ? "شهراً" : "mois"}</option>
              </select>
            </div>
            {/* Bar chart visualization */}
            <div className="flex items-end gap-2 h-36">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100, 82, 68, 78].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-souk-green-600 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>{isAr ? "١ أبريل" : "1 avr"}</span>
              <span>{isAr ? "١٥ أبريل" : "15 avr"}</span>
              <span>{isAr ? "٣٠ أبريل" : "30 avr"}</span>
            </div>
          </div>

          {/* Recent orders */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <h3 className="font-bold text-gray-900">{isAr ? "آخر الطلبات" : "Dernières commandes"}</h3>
              <button
                onClick={() => setActiveTab("orders")}
                className="text-sm text-souk-green-700 font-semibold hover:text-souk-green-800 flex items-center gap-1"
              >
                {isAr ? "عرض الكل" : "Voir tout"} <ArrowUpRight size={14} />
              </button>
            </div>
            <OrdersTable orders={MOCK_VENDOR_ORDERS.slice(0, 3)} isAr={isAr} />
          </div>
        </div>
      )}

      {/* Products tab */}
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
            <Button variant="outline" size="sm" leftIcon={<Filter size={15} />}>{isAr ? "فلتر" : "Filtrer"}</Button>
            <Button size="sm" leftIcon={<Plus size={15} />}>{isAr ? "إضافة منتج" : "Nouveau produit"}</Button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 font-semibold">
                    <th className="px-4 py-3 text-start">{isAr ? "المنتج" : "Produit"}</th>
                    <th className="px-4 py-3 text-start">{isAr ? "السعر" : "Prix"}</th>
                    <th className="px-4 py-3 text-start">{isAr ? "المخزون" : "Stock"}</th>
                    <th className="px-4 py-3 text-start">{isAr ? "المبيعات" : "Ventes"}</th>
                    <th className="px-4 py-3 text-start">{isAr ? "التقييم" : "Note"}</th>
                    <th className="px-4 py-3 text-start">{isAr ? "الحالة" : "Statut"}</th>
                    <th className="px-4 py-3 text-start">{isAr ? "إجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {MOCK_PRODUCTS.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            <Image src={product.image} alt={product.name} width={40} height={40} className="object-cover w-full h-full" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate max-w-[180px]">{product.name}</p>
                            <p className="text-xs text-gray-400">{product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-souk-green-800">{formatPrice(product.price)}</p>
                        {product.originalPrice > product.price && (
                          <p className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "text-xs font-semibold",
                          product.stockCount <= 5 ? "text-red-600" : "text-gray-700"
                        )}>
                          {product.stockCount <= 5 && <AlertCircle size={12} className="inline me-1" />}
                          {product.stockCount}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700">{product.reviewCount * 2}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-souk-gold-600 font-semibold">★ {product.rating}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setProductEnabled((prev) => ({ ...prev, [product.id]: !prev[product.id] }))}
                          className="flex items-center gap-1.5 text-xs font-semibold"
                        >
                          {productEnabled[product.id] ? (
                            <><ToggleRight size={20} className="text-souk-green-600" /><span className="text-souk-green-600">{isAr ? "نشط" : "Actif"}</span></>
                          ) : (
                            <><ToggleLeft size={20} className="text-gray-400" /><span className="text-gray-400">{isAr ? "معطل" : "Désactivé"}</span></>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700">
                            <Eye size={15} />
                          </button>
                          <button className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-gray-500 hover:text-blue-600">
                            <Edit2 size={15} />
                          </button>
                          <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-500 hover:text-red-500">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Orders tab */}
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
            <select className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 focus:outline-none">
              <option value="">{isAr ? "كل الحالات" : "Tous les statuts"}</option>
              <option value="processing">{isAr ? "قيد المعالجة" : "En traitement"}</option>
              <option value="shipped">{isAr ? "في الطريق" : "Expédié"}</option>
              <option value="delivered">{isAr ? "مُسلَّم" : "Livré"}</option>
            </select>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <OrdersTable orders={MOCK_VENDOR_ORDERS} isAr={isAr} />
          </div>
        </div>
      )}

      {/* Analytics tab */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top products */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">{isAr ? "أفضل المنتجات" : "Produits les plus vendus"}</h3>
              <div className="space-y-3">
                {MOCK_PRODUCTS.slice(0, 4).map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-xs font-black text-gray-400 w-5">{i + 1}</span>
                    <div className="h-9 w-9 rounded-lg overflow-hidden shrink-0">
                      <Image src={p.image} alt={p.name} width={36} height={36} className="object-cover w-full h-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-souk-green-500 rounded-full" style={{ width: `${100 - i * 20}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{p.reviewCount * 2}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Traffic sources */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">{isAr ? "مصادر الزيارات" : "Sources de trafic"}</h3>
              <div className="space-y-4">
                {[
                  { label: "Recherche directe", pct: 45, color: "bg-souk-green-500" },
                  { label: "Catégories",         pct: 28, color: "bg-souk-gold-500" },
                  { label: "Recommandations",    pct: 18, color: "bg-blue-500" },
                  { label: "Réseaux sociaux",    pct: 9,  color: "bg-souk-terracotta-500" },
                ].map(({ label, pct, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs text-gray-600 mb-1.5">
                      <span>{label}</span>
                      <span className="font-semibold">{pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">{isAr ? "ملخص التقييمات" : "Résumé des avis"}</h3>
            <div className="flex gap-8 items-center">
              <div className="text-center shrink-0">
                <p className="text-5xl font-black text-souk-green-800">4.8</p>
                <div className="flex justify-center gap-0.5 my-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="text-souk-gold-500">★</span>
                  ))}
                </div>
                <p className="text-xs text-gray-400">312 {isAr ? "تقييم" : "avis"}</p>
              </div>
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const pct = star === 5 ? 72 : star === 4 ? 18 : star === 3 ? 7 : star === 2 ? 2 : 1;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-4">{star}★</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-souk-gold-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersTable({ orders, isAr }: { orders: typeof MOCK_VENDOR_ORDERS; isAr: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 text-xs text-gray-500 font-semibold">
            <th className="px-4 py-3 text-start">{isAr ? "رقم الطلب" : "N° commande"}</th>
            <th className="px-4 py-3 text-start">{isAr ? "العميل" : "Client"}</th>
            <th className="px-4 py-3 text-start">{isAr ? "المنتج" : "Produit"}</th>
            <th className="px-4 py-3 text-start">{isAr ? "المبلغ" : "Montant"}</th>
            <th className="px-4 py-3 text-start">{isAr ? "التاريخ" : "Date"}</th>
            <th className="px-4 py-3 text-start">{isAr ? "الحالة" : "Statut"}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.map((order) => {
            const status = ORDER_STATUS[order.status];
            return (
              <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 text-sm font-mono font-semibold text-souk-green-800">{order.id}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{order.customer}</td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">{order.product}</td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">{formatPrice(order.amount)}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(order.date).toLocaleDateString(isAr ? "ar-MA" : "fr-MA")}</td>
                <td className="px-4 py-3">
                  <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border", status.color)}>
                    {isAr ? status.labelAr : status.label}
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

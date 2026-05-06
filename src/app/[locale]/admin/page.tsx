"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Users, Store, Package, ShoppingCart, TrendingUp, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/api/admin";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function AdminOverviewPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isAr = locale === "ar";

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.getStats(),
  });

  const CARDS = stats ? [
    { labelFr: "Utilisateurs", labelAr: "المستخدمون", value: stats.totalUsers.toLocaleString(), icon: Users, color: "text-blue-700 bg-blue-50" },
    { labelFr: "Vendeurs",     labelAr: "البائعون",    value: stats.totalVendors.toLocaleString(), icon: Store, color: "text-souk-gold-700 bg-souk-gold-50" },
    { labelFr: "Produits",     labelAr: "المنتجات",    value: stats.totalProducts.toLocaleString(), icon: Package, color: "text-indigo-700 bg-indigo-50" },
    { labelFr: "Commandes",    labelAr: "الطلبات",     value: stats.totalOrders.toLocaleString(), icon: ShoppingCart, color: "text-souk-terracotta-700 bg-souk-terracotta-50" },
    { labelFr: "Revenu total", labelAr: "الإيراد الكلي", value: formatPrice(stats.totalRevenue, locale), icon: DollarSign, color: "text-souk-green-700 bg-souk-green-50" },
    { labelFr: "Panier moyen", labelAr: "متوسط الطلب", value: formatPrice(stats.avgOrderValue, locale), icon: TrendingUp, color: "text-pink-700 bg-pink-50" },
  ] : null;

  return (
    <div className="px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-black text-gray-900">
          {isAr ? "لوحة الإدارة" : "Tableau de bord admin"}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {isAr ? "إحصائيات المنصة بشكل عام" : "Statistiques globales de la plateforme"}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {CARDS?.map(({ labelFr, labelAr, value, icon: Icon, color }) => (
            <div key={labelFr} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", color)}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{isAr ? labelAr : labelFr}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

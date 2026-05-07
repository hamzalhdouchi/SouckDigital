"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Package, Clock, Truck, CheckCircle, XCircle,
  RefreshCw, ChevronRight, ArrowLeft,
} from "lucide-react";
import Button from "@/components/ui/button";
import { OrderListSkeleton } from "@/components/skeletons/order-list-skeleton";
import { useMyOrders } from "@/lib/hooks/use-orders";
import { useAuthStore } from "@/lib/store/auth";
import { cn, formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/lib/api/types";

const STATUS_CONFIG: Record<OrderStatus, { labelFr: string; labelAr: string; color: string; icon: React.ReactNode }> = {
  PENDING:    { labelFr: "En attente",    labelAr: "في الانتظار",   color: "text-gray-600 bg-gray-50 border-gray-200",    icon: <Clock size={12} /> },
  CONFIRMED:  { labelFr: "Confirmée",     labelAr: "مؤكد",          color: "text-blue-600 bg-blue-50 border-blue-200",    icon: <CheckCircle size={12} /> },
  PROCESSING: { labelFr: "En traitement", labelAr: "قيد المعالجة",  color: "text-amber-600 bg-amber-50 border-amber-200", icon: <RefreshCw size={12} /> },
  SHIPPED:    { labelFr: "En livraison",  labelAr: "في الطريق",     color: "text-indigo-600 bg-indigo-50 border-indigo-200", icon: <Truck size={12} /> },
  DELIVERED:  { labelFr: "Livré",         labelAr: "تم التسليم",    color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: <CheckCircle size={12} /> },
  CANCELLED:  { labelFr: "Annulée",       labelAr: "ملغاة",         color: "text-red-600 bg-red-50 border-red-200",       icon: <XCircle size={12} /> },
  REFUNDED:   { labelFr: "Remboursée",    labelAr: "مُسترجع",       color: "text-purple-600 bg-purple-50 border-purple-200", icon: <RefreshCw size={12} /> },
};

export default function OrdersPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const isAr = locale === "ar";
  const { user } = useAuthStore();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useMyOrders();

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <Package size={48} className="text-gray-300" />
        <p className="text-lg font-semibold text-gray-800">
          {isAr ? "يجب تسجيل الدخول" : "Connexion requise"}
        </p>
        <Button onClick={() => router.push(`/${locale}/login`)}>
          {isAr ? "تسجيل الدخول" : "Se connecter"}
        </Button>
      </div>
    );
  }

  const orders = data?.pages.flatMap((p) => p.content) ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/${locale}/profil`} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
          <ArrowLeft size={20} className="rtl:rotate-180" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isAr ? "طلباتي" : "Mes commandes"}
          </h1>
          {!isLoading && (
            <p className="text-sm text-gray-500">
              {orders.length > 0
                ? (isAr ? `${orders.length} طلب` : `${orders.length} commande${orders.length > 1 ? "s" : ""}`)
                : (isAr ? "لا توجد طلبات" : "Aucune commande")}
            </p>
          )}
        </div>
      </div>

      {isLoading ? (
        <OrderListSkeleton count={4} />
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="h-20 w-20 rounded-full bg-souk-green-50 flex items-center justify-center">
            <Package size={36} className="text-souk-green-300" />
          </div>
          <p className="font-semibold text-gray-700">
            {isAr ? "لم تقم بأي طلب بعد" : "Vous n'avez encore passé aucune commande"}
          </p>
          <p className="text-sm text-gray-400 max-w-xs">
            {isAr ? "ابدأ التسوق واكتشف آلاف المنتجات المغربية الأصيلة" : "Commencez vos achats et découvrez des milliers de produits marocains authentiques"}
          </p>
          <Link href={`/${locale}`}>
            <Button>{isAr ? "تسوق الآن" : "Commencer mes achats"}</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
            return (
              <Link
                key={order.id}
                href={`/${locale}/account/orders/${order.id}`}
                className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString(
                        isAr ? "ar-MA" : "fr-MA",
                        { day: "numeric", month: "long", year: "numeric" }
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border",
                      status.color
                    )}>
                      {status.icon}
                      {isAr ? status.labelAr : status.labelFr}
                    </span>
                    <ChevronRight size={16} className="text-gray-300 rtl:rotate-180" />
                  </div>
                </div>

                <div className="px-4 py-3 flex items-center gap-3">
                  {order.firstItemImage && (
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-souk-sand shrink-0">
                      <Image src={order.firstItemImage} alt={order.firstItemName} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{order.firstItemName}</p>
                    {order.itemCount > 1 && (
                      <p className="text-xs text-gray-400">
                        {isAr ? `+ ${order.itemCount - 1} منتج آخر` : `+ ${order.itemCount - 1} autre${order.itemCount - 1 > 1 ? "s" : ""} article${order.itemCount - 1 > 1 ? "s" : ""}`}
                      </p>
                    )}
                  </div>
                  <p className="font-bold text-souk-green-800 text-sm shrink-0">
                    {formatPrice(order.total, locale)}
                  </p>
                </div>
              </Link>
            );
          })}

          {hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                loading={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                {isAr ? "تحميل المزيد" : "Charger plus"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

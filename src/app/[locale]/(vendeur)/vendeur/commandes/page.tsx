"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import Button from "@/components/ui/button";
import { vendorDashboardApi } from "@/lib/api/vendor-dashboard";
import { ordersApi } from "@/lib/api/orders";
import { formatPrice, cn } from "@/lib/utils";
import type { OrderStatus, OrderSummaryDto } from "@/lib/api/types";

const STATUS_META: Record<OrderStatus, { fr: string; ar: string; color: string; dot: string }> = {
  PENDING:    { fr: "En attente",    ar: "في الانتظار",  color: "text-gray-600 bg-gray-100",     dot: "bg-gray-400" },
  CONFIRMED:  { fr: "Confirmée",     ar: "مؤكد",         color: "text-blue-600 bg-blue-50",      dot: "bg-blue-500" },
  PROCESSING: { fr: "En traitement", ar: "قيد المعالجة", color: "text-amber-600 bg-amber-50",    dot: "bg-amber-500" },
  SHIPPED:    { fr: "En livraison",  ar: "في الطريق",    color: "text-indigo-600 bg-indigo-50",  dot: "bg-indigo-500" },
  DELIVERED:  { fr: "Livré",         ar: "مُسلَّم",      color: "text-emerald-600 bg-emerald-50", dot: "bg-emerald-500" },
  CANCELLED:  { fr: "Annulée",       ar: "ملغاة",        color: "text-red-600 bg-red-50",        dot: "bg-red-500" },
  REFUNDED:   { fr: "Remboursée",    ar: "مُسترجع",      color: "text-purple-600 bg-purple-50",  dot: "bg-purple-500" },
};

const UPDATABLE: OrderStatus[] = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const ALL_STATUSES = ["ALL", ...Object.keys(STATUS_META)] as const;

export default function VendeurCommandesPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isAr = locale === "ar";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(0);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["vendor-orders-page", page],
    queryFn: () => vendorDashboardApi.getOrders({ page, size: 15 }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendor-orders-page"] });
      toast.success(isAr ? "تم تحديث الحالة" : "Statut mis à jour");
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Échec de la mise à jour"),
  });

  const orders = (data?.content ?? []).filter((o) => {
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    const matchSearch = !search || o.id.includes(search) || o.firstItemName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="min-h-full bg-souk-sand">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-black text-gray-900">
              {isAr ? "الطلبات" : "Commandes"}
            </h1>
            {data && (
              <p className="text-sm text-gray-500 mt-0.5">
                {data.totalElements} {isAr ? "طلب" : "commandes"}
              </p>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? "ابحث برقم الطلب أو المنتج..." : "Chercher par N° ou article..."}
              className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-souk-green-500 bg-white"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap",
                  statusFilter === s
                    ? "bg-souk-green-800 text-white"
                    : "bg-souk-green-50 text-souk-green-700 hover:bg-souk-green-100",
                )}
              >
                {s === "ALL"
                  ? (isAr ? "الكل" : "Toutes")
                  : (isAr ? STATUS_META[s as OrderStatus].ar : STATUS_META[s as OrderStatus].fr)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <ShoppingBag size={48} className="text-gray-200" />
              <p className="text-sm text-gray-400">
                {isAr ? "لا توجد طلبات" : "Aucune commande"}
              </p>
            </div>
          ) : (
            <OrdersTable orders={orders} isAr={isAr} locale={locale}
              onStatusChange={(id, status) => updateStatus.mutate({ id, status })} />
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 0}
              leftIcon={<ChevronLeft size={14} className="rtl:rotate-180" />}>
              {isAr ? "السابق" : "Précédent"}
            </Button>
            <span className="text-sm text-gray-500">{page + 1} / {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}
              rightIcon={<ChevronRight size={14} className="rtl:rotate-180" />}>
              {isAr ? "التالي" : "Suivant"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function OrdersTable({
  orders, isAr, locale, onStatusChange,
}: {
  orders: OrderSummaryDto[];
  isAr: boolean;
  locale: string;
  onStatusChange: (id: string, status: OrderStatus) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-souk-green-50 text-xs text-souk-green-700 font-semibold">
            <th className="px-5 py-3 text-start">{isAr ? "رقم الطلب" : "N° commande"}</th>
            <th className="px-5 py-3 text-start">{isAr ? "المنتج" : "Article"}</th>
            <th className="px-5 py-3 text-start">{isAr ? "القطع" : "Qté"}</th>
            <th className="px-5 py-3 text-start">{isAr ? "المبلغ" : "Montant"}</th>
            <th className="px-5 py-3 text-start">{isAr ? "طريقة الدفع" : "Paiement"}</th>
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
                <td className="px-5 py-3.5">
                  <p className="text-sm text-gray-700 truncate max-w-[180px]">{order.firstItemName}</p>
                  {order.itemCount > 1 && <p className="text-[10px] text-gray-400">+{order.itemCount - 1} {isAr ? "منتج آخر" : "autres"}</p>}
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{order.itemCount}</td>
                <td className="px-5 py-3.5 text-sm font-black text-gray-900">
                  {formatPrice(order.total, locale)}
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                    {order.paymentMethod}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString(isAr ? "ar-MA" : "fr-MA")}
                </td>
                <td className="px-5 py-3.5">
                  <select
                    value={order.status}
                    onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
                    className={cn("text-xs font-semibold px-2.5 py-1.5 rounded-lg cursor-pointer focus:outline-none border-0", meta.color)}
                  >
                    {UPDATABLE.map((s) => (
                      <option key={s} value={s}>
                        {isAr ? STATUS_META[s].ar : STATUS_META[s].fr}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

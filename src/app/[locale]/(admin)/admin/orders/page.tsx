"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/api/admin";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

// Valid forward transitions only — prevents nonsensical reversals
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING:    ["CONFIRMED", "CANCELLED"],
  CONFIRMED:  ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED:    ["DELIVERED"],
  DELIVERED:  ["REFUNDED"],
  CANCELLED:  [],
  REFUNDED:   [],
};

const STATUS_META: Record<OrderStatus, { labelFr: string; labelAr: string; color: string }> = {
  PENDING:    { labelFr: "En attente",    labelAr: "في الانتظار",  color: "text-gray-600 bg-gray-50 border-gray-200" },
  CONFIRMED:  { labelFr: "Confirmée",     labelAr: "مؤكد",         color: "text-blue-600 bg-blue-50 border-blue-200" },
  PROCESSING: { labelFr: "En traitement", labelAr: "قيد المعالجة", color: "text-amber-600 bg-amber-50 border-amber-200" },
  SHIPPED:    { labelFr: "En livraison",  labelAr: "في الطريق",    color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  DELIVERED:  { labelFr: "Livré",         labelAr: "مُسلَّم",      color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  CANCELLED:  { labelFr: "Annulée",       labelAr: "ملغاة",        color: "text-red-600 bg-red-50 border-red-200" },
  REFUNDED:   { labelFr: "Remboursée",    labelAr: "مُسترجع",      color: "text-purple-600 bg-purple-50 border-purple-200" },
};

const ALL_STATUSES = Object.keys(STATUS_META) as OrderStatus[];

export default function AdminOrdersPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isAr = locale === "ar";
  const [page, setPage] = useState(0);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "">("");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", page, filterStatus],
    queryFn: () => adminApi.getAllOrders({ page, status: filterStatus || undefined }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      adminApi.overrideOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success(isAr ? "تم تحديث حالة الطلب" : "Statut de commande mis à jour");
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : (isAr ? "فشل تحديث الحالة" : "Échec de la mise à jour du statut"));
    },
  });

  const refundMutation = useMutation({
    mutationFn: (id: string) => adminApi.refundOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success(isAr ? "تم رد المبلغ بنجاح" : "Remboursement effectué");
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : (isAr ? "فشل رد المبلغ" : "Échec du remboursement"));
    },
  });

  const orders = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900">
            {isAr ? "إدارة الطلبات" : "Gestion des commandes"}
          </h1>
          {data && <p className="text-sm text-gray-500 mt-0.5">{data.totalElements} {isAr ? "طلب" : "commandes"}</p>}
        </div>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value as OrderStatus | ""); setPage(0); }}
          className="h-10 px-3 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none bg-white"
        >
          <option value="">{isAr ? "كل الحالات" : "Tous les statuts"}</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{isAr ? STATUS_META[s].labelAr : STATUS_META[s].labelFr}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 font-semibold">
                  <th className="px-4 py-3 text-start">{isAr ? "رقم الطلب" : "Commande"}</th>
                  <th className="px-4 py-3 text-start">{isAr ? "المنتج" : "Article"}</th>
                  <th className="px-4 py-3 text-start">{isAr ? "المبلغ" : "Total"}</th>
                  <th className="px-4 py-3 text-start">{isAr ? "التاريخ" : "Date"}</th>
                  <th className="px-4 py-3 text-start">{isAr ? "الحالة" : "Statut"}</th>
                  <th className="px-4 py-3 text-start">{isAr ? "إجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => {
                  const meta = STATUS_META[order.status];
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono font-semibold text-souk-green-800">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-[180px] truncate">{order.firstItemName}</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">{formatPrice(order.total, locale)}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString(isAr ? "ar-MA" : "fr-MA")}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={(e) => {
                            const next = e.target.value as OrderStatus;
                            if (!VALID_TRANSITIONS[order.status].includes(next)) return;
                            statusMutation.mutate({ id: order.id, status: next });
                          }}
                          disabled={statusMutation.isPending || VALID_TRANSITIONS[order.status].length === 0}
                          className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border focus:outline-none",
                            VALID_TRANSITIONS[order.status].length === 0 ? "cursor-not-allowed opacity-70" : "cursor-pointer",
                            meta.color)}
                        >
                          <option value={order.status}>{isAr ? STATUS_META[order.status].labelAr : STATUS_META[order.status].labelFr}</option>
                          {VALID_TRANSITIONS[order.status].map((s) => (
                            <option key={s} value={s}>{isAr ? STATUS_META[s].labelAr : STATUS_META[s].labelFr}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {order.status !== "REFUNDED" && order.paymentStatus === "PAID" && (
                          <button
                            onClick={() => refundMutation.mutate(order.id)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 px-2.5 py-1.5 rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors"
                          >
                            <RefreshCw size={12} />
                            {isAr ? "استرجاع" : "Rembourser"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
  );
}

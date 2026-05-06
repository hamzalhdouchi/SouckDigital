"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Award, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/api/admin";
import { cn } from "@/lib/utils";

export default function AdminVendorsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isAr = locale === "ar";
  const [page, setPage] = useState(0);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-vendors", page],
    queryFn: () => adminApi.getVendors(page),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, verify }: { id: string; verify: boolean }) =>
      verify ? adminApi.verifyVendor(id) : adminApi.unverifyVendor(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-vendors"] }),
  });

  const artisanMutation = useMutation({
    mutationFn: (id: string) => adminApi.toggleArtisan(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-vendors"] }),
  });

  const vendors = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-black text-gray-900">
          {isAr ? "إدارة البائعين" : "Gestion des vendeurs"}
        </h1>
        {data && (
          <p className="text-sm text-gray-500 mt-0.5">
            {data.totalElements} {isAr ? "بائع" : "vendeurs"}
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 font-semibold">
                  <th className="px-4 py-3 text-start">{isAr ? "المتجر" : "Boutique"}</th>
                  <th className="px-4 py-3 text-start">{isAr ? "المدينة" : "Ville"}</th>
                  <th className="px-4 py-3 text-start">{isAr ? "المنتجات" : "Produits"}</th>
                  <th className="px-4 py-3 text-start">{isAr ? "التقييم" : "Note"}</th>
                  <th className="px-4 py-3 text-start">{isAr ? "التحقق" : "Vérifié"}</th>
                  <th className="px-4 py-3 text-start">{isAr ? "صانع تقليدي" : "Artisan"}</th>
                  <th className="px-4 py-3 text-start">{isAr ? "إجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-800">{v.name}</p>
                      {v.nameAr && <p className="text-xs text-gray-400">{v.nameAr}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{v.city}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{v.productCount}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-souk-gold-600 font-semibold">
                        ★ {v.rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "flex items-center gap-1 text-xs font-semibold w-fit",
                        v.verified ? "text-emerald-600" : "text-gray-400",
                      )}>
                        {v.verified ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {v.verified ? (isAr ? "محقق" : "Vérifié") : (isAr ? "غير محقق" : "Non vérifié")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "flex items-center gap-1 text-xs font-semibold w-fit",
                        v.artisan ? "text-souk-gold-600" : "text-gray-400",
                      )}>
                        <Award size={14} />
                        {v.artisan ? (isAr ? "نعم" : "Oui") : (isAr ? "لا" : "Non")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => verifyMutation.mutate({ id: v.id, verify: !v.verified })}
                          className={cn(
                            "text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors",
                            v.verified
                              ? "border-gray-200 text-gray-500 hover:bg-gray-50"
                              : "border-emerald-200 text-emerald-600 hover:bg-emerald-50",
                          )}
                        >
                          {v.verified
                            ? (isAr ? "إلغاء التحقق" : "Retirer")
                            : (isAr ? "تحقق" : "Vérifier")}
                        </button>
                        <button
                          onClick={() => artisanMutation.mutate(v.id)}
                          className={cn(
                            "text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors",
                            v.artisan
                              ? "border-souk-gold-200 text-souk-gold-600 hover:bg-souk-gold-50"
                              : "border-gray-200 text-gray-500 hover:bg-gray-50",
                          )}
                        >
                          {v.artisan ? (isAr ? "إلغاء الصانع" : "Retirer artisan") : (isAr ? "صانع تقليدي" : "Artisan")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

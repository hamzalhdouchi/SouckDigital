"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Plus, ToggleLeft, ToggleRight, Tag } from "lucide-react";
import Button from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/api/admin";
import type { CreatePromoRequest } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const schema = z.object({
  code: z.string().min(3, "Min 3 caractères"),
  discountPercent: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 1 && Number(v) <= 100, "1–100"),
  maxUses: z.string().optional(),
  expiresAt: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AdminPromoPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isAr = locale === "ar";
  const qc = useQueryClient();

  const { data: codes, isLoading } = useQuery({
    queryKey: ["admin-promo"],
    queryFn: () => adminApi.getPromoCodes(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePromoRequest) => adminApi.createPromoCode(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-promo"] });
      reset();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminApi.togglePromoCode(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-promo"] }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit((data: FormData) => {
    createMutation.mutate({
      code: data.code.toUpperCase(),
      discountPercent: Number(data.discountPercent),
      maxUses: data.maxUses ? Number(data.maxUses) : undefined,
      expiresAt: data.expiresAt || undefined,
    });
  });

  return (
    <div className="px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-black text-gray-900">
          {isAr ? "أكواد الخصم" : "Codes promo"}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {isAr ? "إنشاء وإدارة أكواد الخصم" : "Créer et gérer les codes de réduction"}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Create form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Plus size={15} className="text-souk-green-700" />
            {isAr ? "إنشاء كود جديد" : "Créer un code"}
          </h2>
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {isAr ? "الكود" : "Code"} *
              </label>
              <input
                {...register("code")}
                placeholder="SOUK10"
                className={cn(
                  "w-full h-9 border rounded-lg px-3 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-souk-green-500",
                  errors.code ? "border-red-400" : "border-gray-300",
                )}
              />
              {errors.code && <p className="text-xs text-red-500 mt-0.5">{errors.code.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {isAr ? "نسبة الخصم (%)" : "Réduction (%)"} *
              </label>
              <input
                {...register("discountPercent")}
                type="number" min="1" max="100"
                placeholder="10"
                className={cn(
                  "w-full h-9 border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-souk-green-500",
                  errors.discountPercent ? "border-red-400" : "border-gray-300",
                )}
              />
              {errors.discountPercent && <p className="text-xs text-red-500 mt-0.5">{errors.discountPercent.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {isAr ? "الحد الأقصى للاستخدام" : "Max. utilisations"}
              </label>
              <input
                {...register("maxUses")}
                type="number" min="1"
                placeholder={isAr ? "غير محدود" : "Illimité"}
                className="w-full h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-souk-green-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {isAr ? "تاريخ الانتهاء" : "Date d'expiration"}
              </label>
              <input
                {...register("expiresAt")}
                type="date"
                className="w-full h-9 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-souk-green-500"
              />
            </div>

            <Button type="submit" fullWidth size="sm" loading={isSubmitting} leftIcon={<Plus size={14} />}>
              {isAr ? "إنشاء الكود" : "Créer le code"}
            </Button>
          </form>
        </div>

        {/* Codes list */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
            </div>
          ) : (codes ?? []).length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
              <Tag size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                {isAr ? "لا توجد أكواد بعد" : "Aucun code pour l'instant"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {(codes ?? []).map((code) => (
                <div
                  key={code.id}
                  className={cn(
                    "bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4",
                    !code.active && "opacity-60",
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono font-black text-souk-green-800 text-base tracking-wider">{code.code}</span>
                      <span className="bg-souk-gold-100 text-souk-gold-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        -{code.discountPercent}%
                      </span>
                      {!code.active && (
                        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                          {isAr ? "معطل" : "Désactivé"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>
                        {code.usedCount} / {code.maxUses ?? "∞"} {isAr ? "استخدام" : "utilisations"}
                      </span>
                      {code.expiresAt && (
                        <span>
                          {isAr ? "تنتهي:" : "Expire:"}{" "}
                          {new Date(code.expiresAt).toLocaleDateString(isAr ? "ar-MA" : "fr-MA")}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleMutation.mutate(code.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold shrink-0"
                  >
                    {code.active ? (
                      <><ToggleRight size={22} className="text-souk-green-600" /><span className="text-souk-green-600">{isAr ? "نشط" : "Actif"}</span></>
                    ) : (
                      <><ToggleLeft size={22} className="text-gray-400" /><span className="text-gray-400">{isAr ? "معطل" : "Désactivé"}</span></>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

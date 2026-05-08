"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Ban, UserCheck, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/api/admin";
import type { Role } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const ROLE_COLOR: Record<Role, string> = {
  ADMIN:  "bg-red-100 text-red-700",
  VENDOR: "bg-souk-gold-100 text-souk-gold-700",
  BUYER:  "bg-blue-100 text-blue-700",
};

export default function AdminUsersPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isAr = locale === "ar";
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, searchQ],
    queryFn: () => adminApi.getUsers({ page, q: searchQ || undefined }),
  });

  const banMutation = useMutation({
    mutationFn: ({ id, ban }: { id: string; ban: boolean }) =>
      ban ? adminApi.banUser(id) : adminApi.unbanUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
  // verified=false means banned in this backend

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      adminApi.changeUserRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQ(search);
    setPage(0);
  };

  const users = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900">
            {isAr ? "إدارة المستخدمين" : "Gestion des utilisateurs"}
          </h1>
          {data && (
            <p className="text-sm text-gray-500 mt-0.5">
              {data.totalElements} {isAr ? "مستخدم" : "utilisateurs"}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? "ابحث بالاسم أو الهاتف..." : "Rechercher par nom, téléphone..."}
            className="w-full h-10 ps-9 pe-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-souk-green-500"
          />
        </div>
        <Button type="submit" size="sm">{isAr ? "بحث" : "Chercher"}</Button>
      </form>

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
                  <th className="px-4 py-3 text-start">{isAr ? "المستخدم" : "Utilisateur"}</th>
                  <th className="px-4 py-3 text-start">{isAr ? "الهاتف" : "Téléphone"}</th>
                  <th className="px-4 py-3 text-start">{isAr ? "الدور" : "Rôle"}</th>
                  <th className="px-4 py-3 text-start">{isAr ? "تاريخ التسجيل" : "Inscrit le"}</th>
                  <th className="px-4 py-3 text-start">{isAr ? "الحالة" : "Statut"}</th>
                  <th className="px-4 py-3 text-start">{isAr ? "إجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className={cn("hover:bg-gray-50/50 transition-colors", !u.verified && "opacity-60")}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-souk-green-100 flex items-center justify-center text-souk-green-800 font-bold text-xs shrink-0">
                          {u.firstName[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{u.firstName} {u.lastName}</p>
                          {u.email && <p className="text-xs text-gray-400">{u.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.phone}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => roleMutation.mutate({ id: u.id, role: e.target.value as Role })}
                        className={cn("text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer focus:outline-none", ROLE_COLOR[u.role])}
                      >
                        <option value="BUYER">BUYER</option>
                        <option value="VENDOR">VENDOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString(isAr ? "ar-MA" : "fr-MA")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full",
                        !u.verified ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600")}>
                        {!u.verified ? (isAr ? "محظور" : "Banni") : (isAr ? "نشط" : "Actif")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => banMutation.mutate({ id: u.id, ban: u.verified })}
                        className={cn(
                          "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors",
                          !u.verified
                            ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                            : "border-red-200 text-red-500 hover:bg-red-50",
                        )}
                      >
                        {!u.verified ? <UserCheck size={14} /> : <Ban size={14} />}
                        {!u.verified ? (isAr ? "إلغاء الحظر" : "Débannir") : (isAr ? "حظر" : "Bannir")}
                      </button>
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

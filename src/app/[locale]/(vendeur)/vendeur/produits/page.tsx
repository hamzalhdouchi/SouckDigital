"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Eye, Edit2, ToggleLeft, ToggleRight, AlertCircle, Package, Trash2 } from "lucide-react";
import Button from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { productsApi } from "@/lib/api/products";
import { useDeleteProduct } from "@/lib/hooks/use-products";
import { formatPrice, cn } from "@/lib/utils";
import type { ProductSummaryDto } from "@/lib/api/types";

export default function VendeurProduitsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isAr = locale === "ar";
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["vendor-products"],
    queryFn: () => productsApi.getAll({ page: 0, size: 50 }),
  });

  const toggleProduct = useMutation({
    mutationFn: (id: string) => productsApi.toggleActive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor-products"] }),
  });

  const deleteProduct = useDeleteProduct();

  const products = (data?.content ?? []).filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-full bg-souk-sand">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900">
              {isAr ? "منتجاتي" : "Mes produits"}
            </h1>
            {data && (
              <p className="text-sm text-gray-500 mt-0.5">
                {data.totalElements} {isAr ? "منتج" : "produits"}
              </p>
            )}
          </div>
          <Link href={`/${locale}/vendeur/produits/nouveau`}>
            <Button size="sm" leftIcon={<Plus size={15} />}>
              {isAr ? "منتج جديد" : "Nouveau produit"}
            </Button>
          </Link>
        </div>

        <div className="mt-4 relative max-w-sm">
          <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? "ابحث عن منتج..." : "Rechercher un produit..."}
            className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-souk-green-500 bg-white"
          />
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <Package size={48} className="text-gray-200" />
              <p className="text-gray-400 text-sm">
                {search
                  ? (isAr ? "لا توجد نتائج" : "Aucun résultat")
                  : (isAr ? "لا توجد منتجات بعد" : "Aucun produit pour l'instant")}
              </p>
              {!search && (
                <Link href={`/${locale}/vendeur/produits/nouveau`}>
                  <Button size="sm" leftIcon={<Plus size={14} />} className="mt-1">
                    {isAr ? "أضف أول منتج" : "Ajouter un produit"}
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <ProductsTable
              products={products}
              isAr={isAr}
              locale={locale}
              onToggle={(id) => toggleProduct.mutate(id)}
              onDelete={(id) => deleteProduct.mutate(id)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ProductsTable({
  products, isAr, locale, onToggle, onDelete,
}: {
  products: ProductSummaryDto[];
  isAr: boolean;
  locale: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-souk-green-50 text-xs text-souk-green-700 font-semibold">
            <th className="px-5 py-3 text-start">{isAr ? "المنتج" : "Produit"}</th>
            <th className="px-5 py-3 text-start">{isAr ? "السعر" : "Prix"}</th>
            <th className="px-5 py-3 text-start">{isAr ? "المخزون" : "Stock"}</th>
            <th className="px-5 py-3 text-start">{isAr ? "التقييم" : "Note"}</th>
            <th className="px-5 py-3 text-start">{isAr ? "الحالة" : "Statut"}</th>
            <th className="px-5 py-3 text-start">{isAr ? "إجراءات" : "Actions"}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-souk-green-50/40 transition-colors">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                    {p.image ? (
                      <Image src={p.image} alt={p.name} width={40} height={40} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={16} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">{p.name}</p>
                    {p.city && <p className="text-[10px] text-gray-400">{p.city}</p>}
                  </div>
                </div>
              </td>
              <td className="px-5 py-3.5">
                <p className="text-sm font-black text-souk-green-800">{formatPrice(p.price, locale)}</p>
                {p.originalPrice && p.originalPrice > p.price && (
                  <p className="text-[10px] text-gray-400 line-through">{formatPrice(p.originalPrice, locale)}</p>
                )}
              </td>
              <td className="px-5 py-3.5">
                <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", p.inStock ? "text-emerald-600" : "text-red-500")}>
                  {!p.inStock && <AlertCircle size={11} />}
                  {p.inStock ? (isAr ? "متوفر" : "En stock") : (isAr ? "نفد" : "Épuisé")}
                </span>
              </td>
              <td className="px-5 py-3.5">
                <span className="text-sm text-souk-gold-600 font-bold">★ {p.rating.toFixed(1)}</span>
                <p className="text-[10px] text-gray-400">({p.reviewCount})</p>
              </td>
              <td className="px-5 py-3.5">
                <button onClick={() => onToggle(p.id)} className="flex items-center gap-1.5 text-xs font-semibold">
                  {p.inStock
                    ? <><ToggleRight size={20} className="text-souk-green-600" /><span className="text-souk-green-700">{isAr ? "نشط" : "Actif"}</span></>
                    : <><ToggleLeft size={20} className="text-gray-400" /><span className="text-gray-400">{isAr ? "معطل" : "Désactivé"}</span></>}
                </button>
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-1">
                  <Link href={`/${locale}/products/${p.slug}`}>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-700">
                      <Eye size={14} />
                    </button>
                  </Link>
                  <Link href={`/${locale}/vendeur/produits/${p.id}/modifier`}>
                    <button className="p-1.5 hover:bg-souk-green-50 rounded-lg transition-colors text-gray-400 hover:text-souk-green-700">
                      <Edit2 size={14} />
                    </button>
                  </Link>
                  {confirmId === p.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => { onDelete(p.id); setConfirmId(null); }} className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600">
                        {isAr ? "تأكيد" : "Oui"}
                      </button>
                      <button onClick={() => setConfirmId(null)} className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200">
                        {isAr ? "إلغاء" : "Non"}
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmId(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

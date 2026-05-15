"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import Link from "next/link";
import { ArrowLeft, Save, Package } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { ImageUpload } from "@/components/modules/image-upload";
import { useCreateProduct } from "@/lib/hooks/use-products";
import { categoriesApi } from "@/lib/api/categories";
import type { Badge } from "@/lib/api/types";

const schema = z.object({
  name:           z.string().min(2, "Nom requis (min. 2 caractères)"),
  nameAr:         z.string().min(2, "Nom arabe requis (min. 2 caractères)"),
  description:    z.string().optional(),
  descriptionAr:  z.string().optional(),
  price:          z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Prix invalide"),
  originalPrice:  z.string().optional(),
  stockCount:     z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Stock invalide"),
  categoryId:     z.string().min(1, "Catégorie requise"),
  badge:          z.string().optional(),
  city:           z.string().optional(),
  freeDelivery:   z.boolean().optional(),
  imageUrls:      z.array(z.string()).min(1, "Ajoutez au moins une image"),
});

type FormData = z.infer<typeof schema>;

export default function NewProductPage() {
  const params   = useParams();
  const router   = useRouter();
  const locale   = params.locale as string;
  const isAr     = locale === "ar";

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.getAll,
    staleTime: 300_000,
  });

  const createProduct = useCreateProduct();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { imageUrls: [], freeDelivery: false },
  });

  const onSubmit = handleSubmit(async (data) => {
    await createProduct.mutateAsync({
      name:          data.name,
      nameAr:        data.nameAr,
      description:   data.description || undefined,
      descriptionAr: data.descriptionAr || undefined,
      price:         Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
      stockCount:    Number(data.stockCount),
      categoryId:    data.categoryId,
      badge:         (data.badge as Badge) || undefined,
      city:          data.city || undefined,
      freeDelivery:  data.freeDelivery,
      imageUrls:     data.imageUrls,
    });
    router.push(`/${locale}/vendeur/dashboard`);
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/${locale}/vendeur/dashboard`} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
          <ArrowLeft size={18} className="rtl:rotate-180" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Package size={22} className="text-souk-green-700" />
            {isAr ? "إضافة منتج جديد" : "Nouveau produit"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isAr ? "أضف تفاصيل منتجك للبدء في البيع" : "Renseignez les détails de votre produit"}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <section className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 mb-4">{isAr ? "صور المنتج" : "Photos du produit"}</h2>
          <Controller
            name="imageUrls"
            control={control}
            render={({ field }) => (
              <ImageUpload value={field.value} onChange={field.onChange} folder="products" maxFiles={5} isAr={isAr} />
            )}
          />
          {errors.imageUrls && <p className="text-sm text-red-500 mt-2">{errors.imageUrls.message}</p>}
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-bold text-gray-900">{isAr ? "التسمية" : "Dénomination"}</h2>
          <Input label={isAr ? "اسم المنتج (بالفرنسية)" : "Nom du produit (français)"} placeholder="Ex: Théière en cuivre" fullWidth error={errors.name?.message} {...register("name")} />
          <Input label={isAr ? "اسم المنتج (بالعربية)" : "Nom du produit (arabe)"} placeholder="مثال: إبريق نحاسي" fullWidth dir="rtl" error={errors.nameAr?.message} {...register("nameAr")} />
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-bold text-gray-900">{isAr ? "الوصف" : "Description"}</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? "الوصف (بالفرنسية)" : "Description (français)"}</label>
            <textarea rows={4} placeholder={isAr ? "وصف المنتج بالفرنسية..." : "Décrivez votre produit en français..."} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-souk-green-500 resize-none" {...register("description")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? "الوصف (بالعربية)" : "Description (arabe)"}</label>
            <textarea rows={4} dir="rtl" placeholder="وصف المنتج بالعربية..." className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-souk-green-500 resize-none" {...register("descriptionAr")} />
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-bold text-gray-900">{isAr ? "السعر والمخزون" : "Prix & Stock"}</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label={isAr ? "السعر (MAD)" : "Prix (MAD)"} type="number" placeholder="0.00" min="0" step="0.01" fullWidth error={errors.price?.message} {...register("price")} />
            <Input label={isAr ? "السعر الأصلي — اختياري" : "Prix original — optionnel"} type="number" placeholder="0.00" min="0" step="0.01" hint={isAr ? "اتركه فارغاً إن لم يكن هناك تخفيض" : "Laissez vide si pas de promo"} fullWidth error={errors.originalPrice?.message} {...register("originalPrice")} />
          </div>
          <Input label={isAr ? "الكمية المتاحة" : "Quantité en stock"} type="number" placeholder="0" min="0" fullWidth error={errors.stockCount?.message} {...register("stockCount")} />
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-bold text-gray-900">{isAr ? "التصنيف والعلامة" : "Catégorie & Badge"}</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? "الفئة *" : "Catégorie *"}</label>
            <select className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-souk-green-500 bg-white" {...register("categoryId")}>
              <option value="">{isAr ? "اختر فئة" : "Choisir une catégorie"}</option>
              {categories.map((cat) => <option key={cat.id} value={cat.id}>{isAr ? cat.nameAr : cat.name}</option>)}
            </select>
            {errors.categoryId && <p className="text-sm text-red-500 mt-1">{errors.categoryId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? "العلامة — اختياري" : "Badge — optionnel"}</label>
            <select className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-souk-green-500 bg-white" {...register("badge")}>
              <option value="">{isAr ? "بدون علامة" : "Aucun badge"}</option>
              <option value="new">{isAr ? "جديد" : "Nouveau"}</option>
              <option value="sale">{isAr ? "تخفيض" : "Promo"}</option>
              <option value="top">{isAr ? "الأكثر مبيعًا" : "Top ventes"}</option>
              <option value="artisan">{isAr ? "حرفي" : "Artisan"}</option>
              <option value="flash">{isAr ? "عرض لمحدود الوقت" : "Vente flash"}</option>
            </select>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-bold text-gray-900">{isAr ? "التوصيل" : "Livraison"}</h2>
          <Input label={isAr ? "المدينة" : "Ville"} placeholder={isAr ? "مثال: Marrakech" : "Ex: Marrakech"} fullWidth {...register("city")} />
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-souk-green-700 focus:ring-souk-green-500" {...register("freeDelivery")} />
            <span className="text-sm font-medium text-gray-700">{isAr ? "توصيل مجاني" : "Livraison gratuite"}</span>
          </label>
        </section>

        {createProduct.isError && (
          <p className="text-sm text-red-500 text-center">
            {(createProduct.error as Error)?.message ?? (isAr ? "حدث خطأ" : "Une erreur s'est produite")}
          </p>
        )}

        <div className="flex gap-3 pb-6">
          <Link href={`/${locale}/vendeur/dashboard`} className="flex-1">
            <Button variant="outline" fullWidth type="button">{isAr ? "إلغاء" : "Annuler"}</Button>
          </Link>
          <Button type="submit" fullWidth loading={isSubmitting} leftIcon={<Save size={16} />}>
            {isAr ? "نشر المنتج" : "Publier le produit"}
          </Button>
        </div>
      </form>
    </div>
  );
}

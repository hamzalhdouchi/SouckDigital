"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Store, Award, MapPin, ArrowLeft, CheckCircle } from "lucide-react";
import Button from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

const MOROCCAN_CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir",
  "Meknès", "Oujda", "Kénitra", "Tétouan", "Safi", "Mohammedia",
  "El Jadida", "Béni Mellal", "Nador", "Essaouira", "Chefchaouen",
  "Azilal", "Taroudant", "Zagora",
];

const schema = z.object({
  name: z.string().min(2, "Min 2 caractères"),
  nameAr: z.string().optional(),
  city: z.string().min(1, "Ville requise"),
  description: z.string().max(500).optional(),
  isArtisan: z.boolean(),
});

type FormData = z.infer<typeof schema>;

const BENEFITS = [
  { icon: Store,       labelFr: "Boutique personnalisée", labelAr: "متجر مخصص لك" },
  { icon: Award,       labelFr: "Badge artisan certifié", labelAr: "شارة صانع معتمد" },
  { icon: CheckCircle, labelFr: "Accès au tableau de bord", labelAr: "لوحة تحكم شاملة" },
  { icon: MapPin,      labelFr: "Visibilité nationale",    labelAr: "ظهور على المستوى الوطني" },
];

export default function BecomeVendorPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const isAr = locale === "ar";
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isArtisan: false },
  });

  const onSubmit = async (data: FormData) => {
    const { vendorsApi } = await import("@/lib/api/vendors");
    await vendorsApi.register({
      name: data.name,
      nameAr: data.nameAr || undefined,
      city: data.city,
      description: data.description || undefined,
      isArtisan: data.isArtisan,
    });
  };

  if (isSubmitSuccessful) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center max-w-md mx-auto">
        <div className="h-20 w-20 rounded-full bg-souk-green-100 flex items-center justify-center mb-5">
          <CheckCircle size={40} className="text-souk-green-700" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">
          {isAr ? "تم تقديم الطلب!" : "Demande envoyée !"}
        </h1>
        <p className="text-sm text-gray-500 mb-8 max-w-xs">
          {isAr
            ? "سيراجع فريقنا طلبك ويتواصل معك خلال 24-48 ساعة."
            : "Notre équipe examinera votre demande et vous contactera dans les 24-48h."}
        </p>
        <Button onClick={() => router.push(`/${locale}/profil`)}>
          {isAr ? "العودة للحساب" : "Retour au compte"}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-souk-green-700 mb-6 transition-colors"
      >
        <ArrowLeft size={16} className="rtl:rotate-180" />
        {isAr ? "رجوع" : "Retour"}
      </button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left — info */}
        <div>
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 bg-souk-gold-50 text-souk-gold-700 text-xs font-semibold px-3 py-1 rounded-full border border-souk-gold-200 mb-3">
              <Store size={12} />
              {isAr ? "برنامج البائعين" : "Programme vendeur"}
            </span>
            <h1 className="text-2xl font-black text-gray-900 mb-2">
              {isAr ? "افتح متجرك على سوق ديجيتال" : "Ouvrez votre boutique sur Souk Digital"}
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              {isAr
                ? "انضم إلى آلاف التجار المغاربة وابدأ البيع لملايين المشترين عبر المنصة."
                : "Rejoignez des milliers de commerçants marocains et vendez à des millions d'acheteurs."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {BENEFITS.map(({ icon: Icon, labelFr, labelAr }) => (
              <div key={labelFr} className="flex items-start gap-3 bg-souk-green-50 rounded-xl p-3.5">
                <div className="p-2 bg-souk-green-100 rounded-lg shrink-0">
                  <Icon size={15} className="text-souk-green-700" />
                </div>
                <p className="text-xs font-medium text-souk-green-800 leading-snug">
                  {isAr ? labelAr : labelFr}
                </p>
              </div>
            ))}
          </div>

          {user && (
            <div className="mt-6 flex items-center gap-3 bg-gray-50 rounded-xl p-4">
              <div className="h-9 w-9 rounded-full bg-souk-green-200 flex items-center justify-center text-souk-green-800 font-bold shrink-0">
                {user.firstName?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-500 truncate">{user.phone}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right — form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">
            {isAr ? "معلومات متجرك" : "Informations de votre boutique"}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {isAr ? "اسم المتجر (بالفرنسية)" : "Nom de la boutique (français)"} *
              </label>
              <input
                {...register("name")}
                placeholder={isAr ? "مثال: Poterie de Safi" : "Ex: Poterie de Safi"}
                className={cn(
                  "w-full h-10 border rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-souk-green-500",
                  errors.name ? "border-red-400" : "border-gray-300",
                )}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {isAr ? "اسم المتجر (بالعربية)" : "Nom de la boutique (arabe)"}
              </label>
              <input
                {...register("nameAr")}
                dir="rtl"
                placeholder={isAr ? "اختياري" : "Optionnel"}
                className="w-full h-10 border border-gray-300 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-souk-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {isAr ? "المدينة" : "Ville"} *
              </label>
              <select
                {...register("city")}
                className={cn(
                  "w-full h-10 border rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-souk-green-500 bg-white",
                  errors.city ? "border-red-400" : "border-gray-300",
                )}
              >
                <option value="">{isAr ? "اختر مدينة" : "Choisir une ville"}</option>
                {MOROCCAN_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {isAr ? "وصف المتجر" : "Description de la boutique"}
              </label>
              <textarea
                {...register("description")}
                rows={3}
                placeholder={isAr ? "صِف منتجاتك وخبرتك..." : "Décrivez vos produits et votre savoir-faire..."}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-souk-green-500 resize-none"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer p-3.5 rounded-xl border border-souk-gold-200 bg-souk-gold-50 hover:bg-souk-gold-100 transition-colors">
              <input
                {...register("isArtisan")}
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-souk-gold-600"
              />
              <div>
                <p className="text-sm font-semibold text-souk-gold-800 flex items-center gap-1.5">
                  <Award size={14} />
                  {isAr ? "أنا صانع تقليدي" : "Je suis artisan"}
                </p>
                <p className="text-xs text-souk-gold-600 mt-0.5">
                  {isAr
                    ? "سيتم عرض شارة الصانع التقليدي على متجرك ومنتجاتك."
                    : "Le badge artisan sera affiché sur votre boutique et vos produits."}
                </p>
              </div>
            </label>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isSubmitting}
              className="mt-2"
            >
              {isAr ? "إرسال الطلب" : "Envoyer la demande"}
            </Button>

            <p className="text-xs text-center text-gray-400">
              {isAr
                ? "بالتقديم، توافق على شروط الخدمة وسياسة الخصوصية."
                : "En soumettant, vous acceptez nos CGU et politique de confidentialité."}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

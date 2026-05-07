"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  User, Package, MapPin, Heart, Settings, LogOut,
  ChevronRight, CheckCircle, Clock, Truck, Star,
  Edit2, Plus, Trash2, Phone, AlertCircle, Loader2,
} from "lucide-react";
import Button from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth";
import { useMyOrders } from "@/lib/hooks/use-orders";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { OrderSummaryDto } from "@/lib/api/types";

const STATUS_CONFIG: Record<string, { label: string; labelAr: string; color: string; icon: React.ReactNode }> = {
  PENDING:    { label: "En attente",    labelAr: "في الانتظار",  color: "text-gray-600 bg-gray-50 border-gray-200",     icon: <Clock size={13} /> },
  CONFIRMED:  { label: "Confirmée",     labelAr: "مؤكد",        color: "text-blue-600 bg-blue-50 border-blue-200",     icon: <CheckCircle size={13} /> },
  PROCESSING: { label: "En traitement", labelAr: "قيد المعالجة", color: "text-amber-600 bg-amber-50 border-amber-200",  icon: <Clock size={13} /> },
  SHIPPED:    { label: "En livraison",  labelAr: "في الطريق",    color: "text-blue-600 bg-blue-50 border-blue-200",     icon: <Truck size={13} /> },
  DELIVERED:  { label: "Livré",         labelAr: "تم التسليم",   color: "text-green-600 bg-green-50 border-green-200",  icon: <CheckCircle size={13} /> },
  CANCELLED:  { label: "Annulée",       labelAr: "ملغى",        color: "text-red-600 bg-red-50 border-red-200",        icon: <AlertCircle size={13} /> },
  REFUNDED:   { label: "Remboursée",    labelAr: "مُسترد",      color: "text-purple-600 bg-purple-50 border-purple-200", icon: <AlertCircle size={13} /> },
};

const TABS = [
  { key: "orders",    labelFr: "Mes commandes",   labelAr: "طلباتي",     icon: Package },
  { key: "addresses", labelFr: "Mes adresses",     labelAr: "عناويني",   icon: MapPin },
  { key: "wishlist",  labelFr: "Mes favoris",      labelAr: "المفضلة",   icon: Heart },
  { key: "settings",  labelFr: "Paramètres",       labelAr: "الإعدادات", icon: Settings },
];

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const isAr = locale === "ar";
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("orders");

  const { data: ordersData, isLoading: ordersLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useMyOrders();
  const orders = ordersData?.pages.flatMap((p) => p.content) ?? [];
  const totalOrders = ordersData?.pages[0]?.totalElements ?? 0;

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
          <LogOut size={36} className="text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          {isAr ? "يجب تسجيل الدخول" : "Connexion requise"}
        </h2>
        <p className="text-gray-500 text-center">
          {isAr ? "يرجى تسجيل الدخول للوصول إلى ملفك الشخصي" : "Veuillez vous connecter pour accéder à votre profil"}
        </p>
        <div className="flex gap-3">
          <Button onClick={() => router.push(`/${locale}/login`)}>
            {isAr ? "تسجيل الدخول" : "Se connecter"}
          </Button>
          <Button variant="outline" onClick={() => router.push(`/${locale}/register`)}>
            {isAr ? "إنشاء حساب" : "S'inscrire"}
          </Button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push(`/${locale}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Profile header */}
      <div className="bg-gradient-to-br from-souk-green-800 to-souk-green-900 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute w-8 h-8 border border-white/30 rounded"
              style={{ left: `${(i % 5) * 22}%`, top: `${Math.floor(i / 5) * 28}%`, transform: "rotate(45deg)" }} />
          ))}
        </div>
        <div className="relative flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-souk-gold-500/20 border-2 border-souk-gold-500/40 flex items-center justify-center text-2xl font-black text-souk-gold-400">
            {user.firstName?.[0] ?? (user.email ?? "?")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black">
              {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : (user.email ?? "")}
            </h1>
            {user.email && (
              <p className="text-souk-green-300 text-sm mt-0.5">{user.email}</p>
            )}
            {user.phone && (
              <p className="text-souk-green-300 text-sm flex items-center gap-1 mt-0.5">
                <Phone size={12} />{user.phone}
              </p>
            )}
          </div>
          <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
            <Edit2 size={16} />
          </button>
        </div>

        <div className="relative grid grid-cols-3 gap-3 mt-5">
          {[
            { label: isAr ? "الطلبات" : "Commandes", value: ordersLoading ? "…" : totalOrders },
            { label: isAr ? "المفضلة" : "Favoris", value: 0 },
            { label: isAr ? "نقاط الولاء" : "Points fidélité", value: "850" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xl font-black text-souk-gold-400">{value}</p>
              <p className="text-xs text-souk-green-300 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-56 shrink-0">
          <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {TABS.map(({ key, labelFr, labelAr, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors border-b border-gray-50 last:border-0",
                  activeTab === key
                    ? "bg-souk-green-50 text-souk-green-800 border-e-2 border-e-souk-green-800"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <Icon size={17} className={activeTab === key ? "text-souk-green-700" : "text-gray-400"} />
                {isAr ? labelAr : labelFr}
                <ChevronRight size={14} className="ms-auto text-gray-300" />
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={17} />
              {isAr ? "تسجيل الخروج" : "Se déconnecter"}
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "orders" && (
            <OrdersTab
              isAr={isAr}
              locale={locale}
              orders={orders}
              isLoading={ordersLoading}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={() => fetchNextPage()}
            />
          )}
          {activeTab === "addresses" && <AddressesTab isAr={isAr} />}
          {activeTab === "wishlist" && <WishlistTab isAr={isAr} locale={locale} />}
          {activeTab === "settings" && <SettingsTab isAr={isAr} user={user} />}
        </div>
      </div>
    </div>
  );
}

function OrdersTab({
  isAr,
  locale,
  orders,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: {
  isAr: boolean;
  locale: string;
  orders: OrderSummaryDto[];
  isLoading: boolean;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <Loader2 size={28} className="animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <Package size={40} className="mx-auto text-gray-300 mb-3" />
        <p className="font-semibold text-gray-700">{isAr ? "لا توجد طلبات بعد" : "Aucune commande pour le moment"}</p>
        <p className="text-sm text-gray-400 mt-1">
          {isAr ? "ابدأ التسوق الآن!" : "Commencez vos achats dès maintenant !"}
        </p>
        <Link href={`/${locale}`}>
          <Button className="mt-5" size="sm">{isAr ? "تسوق الآن" : "Explorer la boutique"}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">
        {isAr ? "طلباتي" : "Mes commandes"} ({orders.length})
      </h2>
      {orders.map((order) => {
        const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["PENDING"];
        return (
          <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Order header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <div>
                <p className="font-bold text-gray-900 text-sm">#{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString(isAr ? "ar-MA" : "fr-MA", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border", status.color)}>
                  {status.icon}
                  {isAr ? status.labelAr : status.label}
                </span>
                <span className="font-black text-souk-green-800 text-sm">{formatPrice(order.total)}</span>
              </div>
            </div>
            {/* First item preview */}
            <div className="px-5 py-4 flex items-center gap-3">
              {order.firstItemImage && (
                <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  <Image src={order.firstItemImage} alt={order.firstItemName} width={48} height={48} className="object-cover w-full h-full" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{order.firstItemName}</p>
                {order.itemCount > 1 && (
                  <p className="text-xs text-gray-400">
                    {isAr ? `+${order.itemCount - 1} منتج آخر` : `+${order.itemCount - 1} autre(s) article(s)`}
                  </p>
                )}
              </div>
            </div>
            {/* Actions */}
            <div className="px-5 py-3 bg-gray-50 flex gap-3">
              <Link href={`/${locale}/account/orders/${order.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  {isAr ? "تفاصيل" : "Voir détails"}
                </Button>
              </Link>
              {order.status === "DELIVERED" && (
                <Button variant="ghost" size="sm" className="flex-1 text-souk-gold-600">
                  <Star size={14} className="me-1" />
                  {isAr ? "تقييم" : "Évaluer"}
                </Button>
              )}
            </div>
          </div>
        );
      })}
      {hasNextPage && (
        <div className="text-center pt-2">
          <Button variant="outline" onClick={onLoadMore} loading={isFetchingNextPage}>
            {isAr ? "تحميل المزيد" : "Charger plus"}
          </Button>
        </div>
      )}
    </div>
  );
}

function AddressesTab({ isAr }: { isAr: boolean }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">{isAr ? "عناويني" : "Mes adresses"}</h2>
        <Button size="sm" leftIcon={<Plus size={15} />}>{isAr ? "إضافة" : "Ajouter"}</Button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <MapPin size={40} className="mx-auto text-gray-300 mb-3" />
        <p className="font-semibold text-gray-700">{isAr ? "لا توجد عناوين محفوظة" : "Aucune adresse enregistrée"}</p>
        <p className="text-sm text-gray-400 mt-1">
          {isAr ? "أضف عنوانًا لتسريع عملية الدفع" : "Ajoutez une adresse pour accélérer vos commandes"}
        </p>
      </div>
    </div>
  );
}

function WishlistTab({ isAr, locale }: { isAr: boolean; locale: string }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">{isAr ? "المفضلة" : "Mes favoris"}</h2>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <Heart size={40} className="mx-auto text-gray-300 mb-3" />
        <p className="font-semibold text-gray-700">{isAr ? "قائمة المفضلة فارغة" : "Votre liste de favoris est vide"}</p>
        <p className="text-sm text-gray-400 mt-1">
          {isAr ? "احفظ المنتجات التي تعجبك هنا" : "Sauvegardez les produits qui vous plaisent"}
        </p>
        <Link href={`/${locale}`}>
          <Button className="mt-5" size="sm">{isAr ? "تصفح المنتجات" : "Parcourir les produits"}</Button>
        </Link>
      </div>
    </div>
  );
}

function SettingsTab({ isAr, user }: { isAr: boolean; user: { email: string | null; firstName?: string; lastName?: string; phone?: string } }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">{isAr ? "الإعدادات الشخصية" : "Paramètres du compte"}</h2>

      {/* Personal info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4 text-sm">{isAr ? "المعلومات الشخصية" : "Informations personnelles"}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: isAr ? "الاسم الأول" : "Prénom", value: user.firstName ?? "", placeholder: "Mohammed" },
            { label: isAr ? "الاسم الأخير" : "Nom", value: user.lastName ?? "", placeholder: "Alami" },
            { label: isAr ? "البريد الإلكتروني" : "Email", value: user.email ?? "", placeholder: "email@example.com" },
            { label: isAr ? "الهاتف" : "Téléphone", value: user.phone ?? "", placeholder: "06XXXXXXXX" },
          ].map(({ label, value, placeholder }) => (
            <div key={label}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
              <input
                type="text"
                defaultValue={value}
                placeholder={placeholder}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-souk-green-500 focus:border-transparent"
              />
            </div>
          ))}
        </div>
        <Button className="mt-5">{isAr ? "حفظ التغييرات" : "Enregistrer"}</Button>
      </div>

      {/* Password */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4 text-sm">{isAr ? "تغيير كلمة المرور" : "Changer le mot de passe"}</h3>
        <div className="space-y-3">
          {[
            isAr ? "كلمة المرور الحالية" : "Mot de passe actuel",
            isAr ? "كلمة المرور الجديدة" : "Nouveau mot de passe",
            isAr ? "تأكيد كلمة المرور" : "Confirmer le nouveau mot de passe",
          ].map((label) => (
            <div key={label}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
              <input type="password" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-souk-green-500 focus:border-transparent" />
            </div>
          ))}
        </div>
        <Button className="mt-5">{isAr ? "تحديث كلمة المرور" : "Mettre à jour"}</Button>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4 text-sm">{isAr ? "الإشعارات" : "Notifications"}</h3>
        {[
          { label: isAr ? "تحديثات الطلبات" : "Mises à jour des commandes", defaultChecked: true },
          { label: isAr ? "العروض والتخفيضات" : "Offres et promotions", defaultChecked: true },
          { label: isAr ? "النشرة الإخبارية" : "Newsletter", defaultChecked: false },
        ].map(({ label, defaultChecked }) => (
          <label key={label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 cursor-pointer">
            <span className="text-sm text-gray-700">{label}</span>
            <div className="relative">
              <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-souk-green-600 transition-colors"></div>
              <div className="absolute top-0.5 start-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5 transition-transform"></div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

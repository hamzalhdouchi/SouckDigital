"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  User, Package, MapPin, Heart, Settings, LogOut,
  ChevronRight, CheckCircle, Clock, Truck, Star,
  Edit3, Plus, Phone, AlertCircle, Loader2,
  ShieldCheck, Award, Gem, BadgeCheck, Lock,
  Bell, Sparkles,
} from "lucide-react";
import Button from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth";
import { useMyOrders } from "@/lib/hooks/use-orders";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { OrderSummaryDto } from "@/lib/api/types";

const STATUS_CONFIG: Record<string, { label: string; labelAr: string; color: string; icon: React.ReactNode }> = {
  PENDING:    { label: "En attente",    labelAr: "في الانتظار",   color: "text-gray-600 bg-gray-50 border-gray-200",      icon: <Clock size={12} /> },
  CONFIRMED:  { label: "Confirmée",     labelAr: "مؤكد",          color: "text-blue-600 bg-blue-50 border-blue-200",      icon: <CheckCircle size={12} /> },
  PROCESSING: { label: "En traitement", labelAr: "قيد المعالجة",  color: "text-amber-600 bg-amber-50 border-amber-200",   icon: <Clock size={12} /> },
  SHIPPED:    { label: "En livraison",  labelAr: "في الطريق",     color: "text-indigo-600 bg-indigo-50 border-indigo-200", icon: <Truck size={12} /> },
  DELIVERED:  { label: "Livré",         labelAr: "تم التسليم",    color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: <CheckCircle size={12} /> },
  CANCELLED:  { label: "Annulée",       labelAr: "ملغى",          color: "text-red-600 bg-red-50 border-red-200",         icon: <AlertCircle size={12} /> },
  REFUNDED:   { label: "Remboursée",    labelAr: "مُسترد",        color: "text-purple-600 bg-purple-50 border-purple-200", icon: <AlertCircle size={12} /> },
};

const TABS = [
  { key: "orders",    labelFr: "Mes commandes",  labelAr: "طلباتي",     icon: Package,  badge: null },
  { key: "addresses", labelFr: "Mes adresses",    labelAr: "عناويني",   icon: MapPin,   badge: null },
  { key: "wishlist",  labelFr: "Mes favoris",     labelAr: "المفضلة",   icon: Heart,    badge: null },
  { key: "settings",  labelFr: "Paramètres",      labelAr: "الإعدادات", icon: Settings, badge: null },
];

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const isAr   = locale === "ar";
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState("orders");

  const { data: ordersData, isLoading: ordersLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useMyOrders();
  const orders      = ordersData?.pages.flatMap((p) => p.content) ?? [];
  const totalOrders = ordersData?.pages[0]?.totalElements ?? 0;

  /* ── Not logged in ── */
  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-4 bg-[#F5EFE4]">
        <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center">
          <User size={40} className="text-gray-300" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-souk-green-900 mb-2">
            {isAr ? "يجب تسجيل الدخول" : "Connexion requise"}
          </h2>
          <p className="text-gray-500 max-w-xs">
            {isAr ? "يرجى تسجيل الدخول للوصول إلى ملفك الشخصي" : "Veuillez vous connecter pour accéder à votre profil"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="gold" onClick={() => router.push(`/${locale}/login`)}>
            {isAr ? "تسجيل الدخول" : "Se connecter"}
          </Button>
          <Button variant="outline" onClick={() => router.push(`/${locale}/register`)}>
            {isAr ? "إنشاء حساب" : "S'inscrire"}
          </Button>
        </div>
      </div>
    );
  }

  const initials = user.firstName
    ? `${user.firstName[0]}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : (user.email ?? "?")[0].toUpperCase();

  const fullName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : (user.email ?? "");

  const handleLogout = () => { logout(); router.push(`/${locale}`); };

  return (
    <div className="min-h-screen bg-[#F5EFE4]">

      {/* ── Profile Banner ── */}
      <div className="relative">
        {/* Cover */}
        <div className="h-40 sm:h-52 bg-souk-green-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_0%_100%,rgba(184,134,11,0.18)_0%,transparent_60%)]" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: "repeating-conic-gradient(#D4A017 0% 25%, transparent 0% 50%)", backgroundSize: "24px 24px" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-souk-green-900/60 to-transparent" />

          {/* Edit cover button */}
          <button className="absolute top-4 end-4 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-2 rounded-xl transition-colors">
            <Edit3 size={13} />
            {isAr ? "تعديل الغلاف" : "Modifier"}
          </button>
        </div>

        {/* Avatar + info row */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-14 pb-5 border-b border-[#E5DDD0]">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-souk-gold-400 to-souk-gold-600 flex items-center justify-center text-souk-green-900 text-3xl font-black shadow-xl border-4 border-[#F5EFE4]">
                {initials}
              </div>
              {user.isVerified && (
                <div className="absolute -bottom-1.5 -end-1.5 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#F5EFE4] shadow-md">
                  <BadgeCheck size={14} className="text-white" strokeWidth={2.5} />
                </div>
              )}
            </div>

            {/* Name & info */}
            <div className="flex-1 min-w-0 sm:pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-souk-green-900">{fullName}</h1>
                <span className="inline-flex items-center gap-1 bg-souk-gold-100 border border-souk-gold-300 text-souk-gold-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  <Gem size={10} />
                  {isAr ? "عضو ذهبي" : "Membre Gold"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                {user.email && (
                  <p className="text-gray-500 text-sm">{user.email}</p>
                )}
                {user.phone && (
                  <p className="flex items-center gap-1 text-gray-500 text-sm">
                    <Phone size={12} />{user.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Edit profile btn */}
            <button className="shrink-0 flex items-center gap-2 bg-white border border-gray-200 hover:border-souk-gold-400 hover:text-souk-gold-600 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all duration-200 self-end sm:self-auto">
              <Edit3 size={15} />
              {isAr ? "تعديل الملف" : "Modifier le profil"}
            </button>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-5">
            {[
              { label: isAr ? "الطلبات" : "Commandes",       value: ordersLoading ? "…" : totalOrders, icon: Package,   color: "text-souk-green-700", bg: "bg-souk-green-50",  border: "border-souk-green-100" },
              { label: isAr ? "المفضلة" : "Favoris",          value: 0,                                 icon: Heart,     color: "text-rose-600",       bg: "bg-rose-50",        border: "border-rose-100" },
              { label: isAr ? "نقاط الولاء" : "Points fidélité", value: "850",                          icon: Award,     color: "text-souk-gold-600",  bg: "bg-souk-gold-50",   border: "border-souk-gold-100" },
              { label: isAr ? "عضو منذ" : "Membre depuis",   value: "2024",                             icon: ShieldCheck, color: "text-indigo-600",  bg: "bg-indigo-50",      border: "border-indigo-100" },
            ].map(({ label, value, icon: Icon, color, bg, border }) => (
              <div key={label} className={`${bg} border ${border} rounded-2xl p-4 flex items-center gap-3`}>
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={color} />
                </div>
                <div>
                  <p className={`text-xl font-black leading-none ${color}`}>{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Sidebar ── */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-4">

              {/* Nav items */}
              <nav className="p-2">
                {TABS.map(({ key, labelFr, labelAr, icon: Icon }) => {
                  const active = activeTab === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 mb-0.5",
                        active
                          ? "bg-souk-green-900 text-white shadow-md shadow-souk-green-900/20"
                          : "text-gray-600 hover:bg-gray-50 hover:text-souk-green-800"
                      )}
                    >
                      <Icon
                        size={17}
                        className={active ? "text-souk-gold-400" : "text-gray-400"}
                      />
                      <span className="flex-1 text-start">{isAr ? labelAr : labelFr}</span>
                      <ChevronRight
                        size={14}
                        className={cn("transition-transform", active ? "text-souk-gold-400 translate-x-0.5" : "text-gray-300")}
                      />
                    </button>
                  );
                })}
              </nav>

              {/* Loyalty card */}
              <div className="mx-3 mb-3 bg-gradient-to-br from-souk-green-800 to-souk-green-900 rounded-xl p-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.07]"
                  style={{ backgroundImage: "repeating-conic-gradient(#D4A017 0% 25%, transparent 0% 50%)", backgroundSize: "16px 16px" }} />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-souk-gold-400" />
                    <p className="text-souk-gold-400 text-xs font-bold uppercase tracking-wider">
                      {isAr ? "نقاط الولاء" : "Points fidélité"}
                    </p>
                  </div>
                  <p className="text-2xl font-black text-white">850 pts</p>
                  <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-souk-gold-400 rounded-full" style={{ width: "68%" }} />
                  </div>
                  <p className="text-souk-green-400 text-[11px] mt-1.5">
                    {isAr ? "١٥٠ نقطة حتى المستوى التالي" : "150 pts avant le niveau suivant"}
                  </p>
                </div>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-100 p-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={17} />
                  {isAr ? "تسجيل الخروج" : "Se déconnecter"}
                </button>
              </div>
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">
            {activeTab === "orders" && (
              <OrdersTab
                isAr={isAr} locale={locale} orders={orders}
                isLoading={ordersLoading} hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                onLoadMore={() => fetchNextPage()}
              />
            )}
            {activeTab === "addresses" && <AddressesTab isAr={isAr} />}
            {activeTab === "wishlist"  && <WishlistTab  isAr={isAr} locale={locale} />}
            {activeTab === "settings"  && <SettingsTab  isAr={isAr} user={user} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────── Orders Tab ────────────── */
function OrdersTab({ isAr, locale, orders, isLoading, hasNextPage, isFetchingNextPage, onLoadMore }: {
  isAr: boolean; locale: string; orders: OrderSummaryDto[];
  isLoading: boolean; hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean; onLoadMore: () => void;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 size={32} className="animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title={isAr ? "لا توجد طلبات بعد" : "Aucune commande pour le moment"}
        subtitle={isAr ? "ابدأ التسوق واكتشف منتجاتنا الأصيلة" : "Commencez vos achats et découvrez nos produits authentiques"}
        cta={isAr ? "تسوق الآن" : "Explorer la boutique"}
        href={`/${locale}`}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-souk-green-900">
          {isAr ? "طلباتي" : "Mes commandes"}
          <span className="ms-2 text-sm font-normal text-gray-400">({orders.length})</span>
        </h2>
      </div>

      {orders.map((order) => {
        const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["PENDING"];
        return (
          <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md hover:border-gray-200 transition-all duration-200">

            {/* Order header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gray-50/70 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-souk-green-100 flex items-center justify-center">
                  <Package size={15} className="text-souk-green-700" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm tracking-wide">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString(isAr ? "ar-MA" : "fr-MA", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border", status.color)}>
                  {status.icon}
                  {isAr ? status.labelAr : status.label}
                </span>
                <span className="font-black text-souk-green-800 text-base">{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Product preview */}
            <div className="px-5 py-4 flex items-center gap-4">
              {order.firstItemImage ? (
                <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                  <Image src={order.firstItemImage} alt={order.firstItemName} fill sizes="56px" className="object-cover" />
                </div>
              ) : (
                <div className="h-14 w-14 rounded-xl bg-souk-green-50 flex items-center justify-center shrink-0">
                  <Package size={22} className="text-souk-green-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{order.firstItemName}</p>
                {order.itemCount > 1 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {isAr ? `+ ${order.itemCount - 1} منتج آخر` : `+ ${order.itemCount - 1} autre(s) article(s)`}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-3 border-t border-gray-50 flex gap-2.5">
              <Link href={`/${locale}/account/orders/${order.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  {isAr ? "عرض التفاصيل" : "Voir les détails"}
                  <ChevronRight size={13} className="ms-1" />
                </Button>
              </Link>
              {order.status === "DELIVERED" && (
                <Button variant="ghost" size="sm" className="text-souk-gold-600 hover:bg-souk-gold-50 text-xs gap-1">
                  <Star size={13} />
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

/* ────────────── Addresses Tab ────────────── */
function AddressesTab({ isAr }: { isAr: boolean }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-souk-green-900">{isAr ? "عناويني" : "Mes adresses"}</h2>
        <Button size="sm" leftIcon={<Plus size={15} />} variant="gold">
          {isAr ? "إضافة عنوان" : "Ajouter"}
        </Button>
      </div>
      <EmptyState
        icon={MapPin}
        title={isAr ? "لا توجد عناوين محفوظة" : "Aucune adresse enregistrée"}
        subtitle={isAr ? "أضف عنوانًا لتسريع عملية الدفع" : "Ajoutez une adresse pour accélérer vos commandes"}
      />
    </div>
  );
}

/* ────────────── Wishlist Tab ────────────── */
function WishlistTab({ isAr, locale }: { isAr: boolean; locale: string }) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-black text-souk-green-900">{isAr ? "المفضلة" : "Mes favoris"}</h2>
      <EmptyState
        icon={Heart}
        title={isAr ? "قائمة المفضلة فارغة" : "Votre liste de favoris est vide"}
        subtitle={isAr ? "احفظ المنتجات التي تعجبك هنا" : "Sauvegardez les produits qui vous plaisent"}
        cta={isAr ? "تصفح المنتجات" : "Parcourir les produits"}
        href={`/${locale}`}
      />
    </div>
  );
}

/* ────────────── Settings Tab ────────────── */
function SettingsTab({ isAr, user }: { isAr: boolean; user: { email: string | null; firstName?: string; lastName?: string; phone?: string } }) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-black text-souk-green-900">
        {isAr ? "إعدادات الحساب" : "Paramètres du compte"}
      </h2>

      {/* Personal info */}
      <SettingsCard
        title={isAr ? "المعلومات الشخصية" : "Informations personnelles"}
        icon={User}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: isAr ? "الاسم الأول" : "Prénom",          value: user.firstName ?? "",  placeholder: "Mohammed" },
            { label: isAr ? "الاسم الأخير" : "Nom",            value: user.lastName ?? "",   placeholder: "Alami" },
            { label: isAr ? "البريد الإلكتروني" : "Email",     value: user.email ?? "",      placeholder: "email@example.com" },
            { label: isAr ? "الهاتف" : "Téléphone",            value: user.phone ?? "",      placeholder: "06XXXXXXXX" },
          ].map(({ label, value, placeholder }) => (
            <div key={label}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
              <input
                type="text"
                defaultValue={value}
                placeholder={placeholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-souk-green-500 focus:border-transparent bg-gray-50/50 transition-all"
              />
            </div>
          ))}
        </div>
        <Button variant="gold" className="mt-5">{isAr ? "حفظ التغييرات" : "Enregistrer les modifications"}</Button>
      </SettingsCard>

      {/* Password */}
      <SettingsCard title={isAr ? "تغيير كلمة المرور" : "Changer le mot de passe"} icon={Lock}>
        <div className="space-y-3">
          {[
            isAr ? "كلمة المرور الحالية" : "Mot de passe actuel",
            isAr ? "كلمة المرور الجديدة" : "Nouveau mot de passe",
            isAr ? "تأكيد كلمة المرور" : "Confirmer le mot de passe",
          ].map((label) => (
            <div key={label}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
              <input
                type="password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-souk-green-500 focus:border-transparent bg-gray-50/50 transition-all"
              />
            </div>
          ))}
        </div>
        <Button className="mt-5">{isAr ? "تحديث كلمة المرور" : "Mettre à jour"}</Button>
      </SettingsCard>

      {/* Notifications */}
      <SettingsCard title={isAr ? "الإشعارات" : "Notifications"} icon={Bell}>
        {[
          { label: isAr ? "تحديثات الطلبات"     : "Mises à jour des commandes", sub: isAr ? "تتبع حالة طلباتك في الوقت الفعلي" : "Suivez vos commandes en temps réel", defaultChecked: true },
          { label: isAr ? "العروض والتخفيضات"   : "Offres et promotions",        sub: isAr ? "لا تفوّت أي عرض حصري" : "Ne ratez aucune offre exclusive",                  defaultChecked: true },
          { label: isAr ? "النشرة الإخبارية"    : "Newsletter",                  sub: isAr ? "أخبار المنتجات الجديدة" : "Actualités et nouveaux produits",                defaultChecked: false },
        ].map(({ label, sub, defaultChecked }) => (
          <label key={label} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0 cursor-pointer group">
            <div>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-souk-green-800 transition-colors">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
            <div className="relative ms-4">
              <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-souk-green-600 transition-colors" />
              <div className="absolute top-0.5 start-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5 transition-transform" />
            </div>
          </label>
        ))}
      </SettingsCard>

      {/* Danger zone */}
      <SettingsCard title={isAr ? "منطقة الخطر" : "Zone de danger"} icon={AlertCircle} danger>
        <p className="text-sm text-gray-500 mb-4">
          {isAr
            ? "حذف حسابك نهائيًا سيؤدي إلى فقدان جميع بياناتك وطلباتك"
            : "Supprimer votre compte entraîne la perte définitive de toutes vos données et commandes"}
        </p>
        <Button variant="outline" size="sm" className="border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300">
          {isAr ? "حذف الحساب نهائيًا" : "Supprimer mon compte"}
        </Button>
      </SettingsCard>
    </div>
  );
}

/* ────────────── Shared helpers ────────────── */
function SettingsCard({
  title, icon: Icon, children, danger = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className={cn("bg-white rounded-2xl border shadow-sm p-6", danger ? "border-red-100" : "border-gray-100")}>
      <div className="flex items-center gap-2.5 mb-5">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", danger ? "bg-red-50" : "bg-souk-green-50")}>
          <Icon size={16} className={danger ? "text-red-500" : "text-souk-green-700"} />
        </div>
        <h3 className={cn("font-bold text-sm", danger ? "text-red-600" : "text-gray-900")}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  subtitle,
  cta,
  href,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  cta?: string;
  href?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: "repeating-conic-gradient(#1a4a3a 0% 25%, transparent 0% 50%)", backgroundSize: "20px 20px" }}
      />
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4">
          <Icon size={28} className="text-gray-300" />
        </div>
        <p className="font-bold text-gray-700 text-base">{title}</p>
        <p className="text-sm text-gray-400 mt-1.5 max-w-xs mx-auto">{subtitle}</p>
        {cta && href && (
          <Link href={href}>
            <Button variant="gold" className="mt-6" size="sm">{cta}</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

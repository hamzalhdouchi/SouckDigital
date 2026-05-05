"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  User, Package, MapPin, Heart, Settings, LogOut,
  ChevronRight, CheckCircle, Clock, Truck, Star,
  Edit2, Plus, Trash2, Phone, Mail,
} from "lucide-react";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Rating from "@/components/ui/rating";
import { useAuthStore } from "@/lib/store/auth";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

const MOCK_ORDERS = [
  {
    id: "ORD-2026-001", date: "2026-04-28", status: "delivered",
    total: 534, items: 2,
    products: [
      { name: "Tajine Traditionnel de Safi", image: "https://images.unsplash.com/photo-1548516173-3cabfa4607e9?w=100&q=80", price: 189, qty: 1 },
      { name: "Huile d'Argan Pure Bio", image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=100&q=80", price: 145, qty: 2 },
    ],
  },
  {
    id: "ORD-2026-002", date: "2026-05-01", status: "shipped",
    total: 599, items: 1,
    products: [
      { name: "Djellaba Homme Premium", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&q=80", price: 599, qty: 1 },
    ],
  },
  {
    id: "ORD-2026-003", date: "2026-05-04", status: "processing",
    total: 1200, items: 1,
    products: [
      { name: "Tapis Berbère Azilal", image: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=100&q=80", price: 1200, qty: 1 },
    ],
  },
];

const MOCK_ADDRESSES = [
  { id: "a1", label: "Domicile", firstName: "Youssef", lastName: "Alami", phone: "0661234567", address: "12 Rue Al Qods, Maarif", city: "Casablanca", zipCode: "20100", isDefault: true },
  { id: "a2", label: "Bureau", firstName: "Youssef", lastName: "Alami", phone: "0661234567", address: "45 Boulevard Anfa, Bureau 304", city: "Casablanca", zipCode: "20050", isDefault: false },
];

const MOCK_WISHLIST = [
  { id: "w1", name: "Lanterne Marrakchi en Cuivre", price: 320, originalPrice: 420, image: "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=300&q=80", inStock: true },
  { id: "w2", name: "Babouches en Cuir de Fès", price: 280, originalPrice: 280, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80", inStock: true },
  { id: "w3", name: "Panneau Décoratif Zellij", price: 950, originalPrice: 1200, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80", inStock: true },
];

const STATUS_CONFIG: Record<string, { label: string; labelAr: string; color: string; icon: React.ReactNode }> = {
  processing: { label: "En traitement", labelAr: "قيد المعالجة", color: "text-amber-600 bg-amber-50 border-amber-200", icon: <Clock size={13} /> },
  shipped:    { label: "En livraison",  labelAr: "في الطريق",    color: "text-blue-600 bg-blue-50 border-blue-200",   icon: <Truck size={13} /> },
  delivered:  { label: "Livré",         labelAr: "تم التسليم",   color: "text-green-600 bg-green-50 border-green-200", icon: <CheckCircle size={13} /> },
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
            {user.firstName?.[0] ?? user.email[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black">
              {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
            </h1>
            <p className="text-souk-green-300 text-sm mt-0.5">{user.email}</p>
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
            { label: isAr ? "الطلبات" : "Commandes", value: MOCK_ORDERS.length },
            { label: isAr ? "المفضلة" : "Favoris", value: MOCK_WISHLIST.length },
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
          {activeTab === "orders" && <OrdersTab isAr={isAr} locale={locale} />}
          {activeTab === "addresses" && <AddressesTab isAr={isAr} />}
          {activeTab === "wishlist" && <WishlistTab isAr={isAr} locale={locale} />}
          {activeTab === "settings" && <SettingsTab isAr={isAr} user={user} />}
        </div>
      </div>
    </div>
  );
}

function OrdersTab({ isAr, locale }: { isAr: boolean; locale: string }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">
        {isAr ? "طلباتي" : "Mes commandes"} ({MOCK_ORDERS.length})
      </h2>
      {MOCK_ORDERS.map((order) => {
        const status = STATUS_CONFIG[order.status];
        return (
          <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Order header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <div>
                <p className="font-bold text-gray-900 text-sm">{order.id}</p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(order.date).toLocaleDateString(isAr ? "ar-MA" : "fr-MA", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border", status.color)}>
                  {status.icon}
                  {isAr ? status.labelAr : status.label}
                </span>
                <span className="font-black text-souk-green-800 text-sm">{formatPrice(order.total)}</span>
              </div>
            </div>
            {/* Products */}
            <div className="px-5 py-4 space-y-3">
              {order.products.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <Image src={p.image} alt={p.name} width={48} height={48} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">x{p.qty} · {formatPrice(p.price)}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Actions */}
            <div className="px-5 py-3 bg-gray-50 flex gap-3">
              <Button variant="outline" size="sm" className="flex-1">
                {isAr ? "تفاصيل" : "Voir détails"}
              </Button>
              {order.status === "delivered" && (
                <Button variant="ghost" size="sm" className="flex-1 text-souk-gold-600">
                  <Star size={14} className="me-1" />
                  {isAr ? "تقييم" : "Évaluer"}
                </Button>
              )}
            </div>
          </div>
        );
      })}
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
      {MOCK_ADDRESSES.map((addr) => (
        <div key={addr.id} className={cn(
          "bg-white rounded-2xl border shadow-sm p-5 relative",
          addr.isDefault ? "border-souk-green-300 ring-1 ring-souk-green-200" : "border-gray-100"
        )}>
          {addr.isDefault && (
            <span className="absolute top-4 end-4 text-xs bg-souk-green-100 text-souk-green-700 px-2 py-0.5 rounded-full font-semibold">
              {isAr ? "الافتراضي" : "Par défaut"}
            </span>
          )}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-souk-green-50 rounded-lg">
              <MapPin size={18} className="text-souk-green-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm">{addr.label}</p>
              <p className="text-sm text-gray-600 mt-1">{addr.firstName} {addr.lastName}</p>
              <p className="text-sm text-gray-500">{addr.address}</p>
              <p className="text-sm text-gray-500">{addr.zipCode} {addr.city}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Phone size={12} className="text-souk-gold-500" />{addr.phone}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" leftIcon={<Edit2 size={14} />}>{isAr ? "تعديل" : "Modifier"}</Button>
            {!addr.isDefault && (
              <Button variant="ghost" size="sm" leftIcon={<Trash2 size={14} />} className="text-red-500 hover:bg-red-50">
                {isAr ? "حذف" : "Supprimer"}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function WishlistTab({ isAr, locale }: { isAr: boolean; locale: string }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">{isAr ? "المفضلة" : "Mes favoris"} ({MOCK_WISHLIST.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_WISHLIST.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
            <div className="relative h-44 bg-gray-100">
              <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <button className="absolute top-3 end-3 p-2 bg-white/90 rounded-full shadow-sm text-red-400 hover:text-red-500 transition-colors">
                <Heart size={16} className="fill-current" />
              </button>
            </div>
            <div className="p-4">
              <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{item.name}</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-black text-souk-green-800">{formatPrice(item.price)}</span>
                {item.originalPrice > item.price && (
                  <span className="text-xs text-gray-400 line-through">{formatPrice(item.originalPrice)}</span>
                )}
              </div>
              <Button size="sm" className="w-full mt-3">{isAr ? "إضافة للسلة" : "Ajouter au panier"}</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab({ isAr, user }: { isAr: boolean; user: { email: string; firstName?: string; lastName?: string; phone?: string } }) {
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
            { label: isAr ? "البريد الإلكتروني" : "Email", value: user.email, placeholder: "email@example.com" },
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

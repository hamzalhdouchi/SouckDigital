"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle, Clock, Truck, XCircle,
  RefreshCw, Package, MapPin, CreditCard, Banknote,
  Smartphone, Building2, AlertCircle,
} from "lucide-react";
import Button from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrder } from "@/lib/hooks/use-orders";
import { cn, formatPrice } from "@/lib/utils";
import type { OrderStatus, PaymentMethod } from "@/lib/api/types";

const STATUS_STEPS: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

const STATUS_META: Record<OrderStatus, { labelFr: string; labelAr: string; color: string; icon: React.ReactNode }> = {
  PENDING:    { labelFr: "En attente",    labelAr: "في الانتظار",   color: "text-gray-600 bg-gray-50 border-gray-200",       icon: <Clock size={13} /> },
  CONFIRMED:  { labelFr: "Confirmée",     labelAr: "مؤكد",          color: "text-blue-600 bg-blue-50 border-blue-200",       icon: <CheckCircle size={13} /> },
  PROCESSING: { labelFr: "En traitement", labelAr: "قيد المعالجة",  color: "text-amber-600 bg-amber-50 border-amber-200",    icon: <RefreshCw size={13} /> },
  SHIPPED:    { labelFr: "En livraison",  labelAr: "في الطريق",     color: "text-indigo-600 bg-indigo-50 border-indigo-200", icon: <Truck size={13} /> },
  DELIVERED:  { labelFr: "Livré",         labelAr: "تم التسليم",    color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: <CheckCircle size={13} /> },
  CANCELLED:  { labelFr: "Annulée",       labelAr: "ملغاة",         color: "text-red-600 bg-red-50 border-red-200",          icon: <XCircle size={13} /> },
  REFUNDED:   { labelFr: "Remboursée",    labelAr: "مُسترجع",       color: "text-purple-600 bg-purple-50 border-purple-200", icon: <RefreshCw size={13} /> },
};

const PAYMENT_ICONS: Record<PaymentMethod, React.ReactNode> = {
  COD:      <Banknote size={16} className="text-souk-green-700" />,
  CARD_CMI: <CreditCard size={16} className="text-souk-green-700" />,
  MOBILE:   <Smartphone size={16} className="text-souk-green-700" />,
  TRANSFER: <Building2 size={16} className="text-souk-green-700" />,
};

const PAYMENT_LABEL: Record<PaymentMethod, { fr: string; ar: string }> = {
  COD:      { fr: "Paiement à la livraison", ar: "الدفع عند الاستلام" },
  CARD_CMI: { fr: "Carte bancaire (CMI)",    ar: "بطاقة بنكية (CMI)" },
  MOBILE:   { fr: "Mobile Money",            ar: "موبايل موني" },
  TRANSFER: { fr: "Virement bancaire",        ar: "تحويل بنكي" },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const orderId = params.id as string;
  const isAr = locale === "ar";

  const { data: order, isLoading, isError } = useOrder(orderId);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <AlertCircle size={48} className="text-gray-300" />
        <p className="text-lg font-semibold text-gray-700">
          {isAr ? "الطلب غير موجود" : "Commande introuvable"}
        </p>
        <Button onClick={() => router.push(`/${locale}/account/orders`)}>
          {isAr ? "عودة للطلبات" : "Retour aux commandes"}
        </Button>
      </div>
    );
  }

  const meta = STATUS_META[order.status] ?? STATUS_META.PENDING;
  const stepIndex = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/${locale}/account/orders`)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
        >
          <ArrowLeft size={20} className="rtl:rotate-180" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900">
            #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-xs text-gray-400">
            {new Date(order.createdAt).toLocaleDateString(
              isAr ? "ar-MA" : "fr-MA",
              { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }
            )}
          </p>
        </div>
        <span className={cn("flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border shrink-0", meta.color)}>
          {meta.icon}
          {isAr ? meta.labelAr : meta.labelFr}
        </span>
      </div>

      {/* Progress timeline */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">
            {isAr ? "تتبع الطلب" : "Suivi de commande"}
          </h2>
          <div className="flex items-center gap-1">
            {STATUS_STEPS.map((s, i) => {
              const done = i <= stepIndex;
              const active = i === stepIndex;
              const sm = STATUS_META[s];
              return (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                      active ? "bg-souk-green-800 text-white ring-4 ring-souk-green-200"
                        : done ? "bg-souk-green-800 text-white"
                        : "bg-gray-200 text-gray-400"
                    )}>
                      {done ? <CheckCircle size={14} /> : i + 1}
                    </div>
                    <span className={cn(
                      "text-[10px] font-medium text-center leading-tight max-w-[52px]",
                      done ? "text-souk-green-700" : "text-gray-400"
                    )}>
                      {isAr ? sm.labelAr : sm.labelFr}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={cn("flex-1 h-0.5 mx-1 mb-5 transition-colors", i < stepIndex ? "bg-souk-green-800" : "bg-gray-200")} />
                  )}
                </div>
              );
            })}
          </div>
          {order.trackingNumber && (
            <p className="mt-4 text-xs text-gray-500 flex items-center gap-1.5">
              <Truck size={13} className="text-souk-green-600" />
              {isAr ? "رقم التتبع:" : "N° de suivi :"} <span className="font-bold text-souk-green-700">{order.trackingNumber}</span>
            </p>
          )}
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Package size={15} className="text-souk-green-700" />
            {isAr ? "المنتجات" : "Articles"} ({order.items.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          {order.items.map((item) => (
            <div key={item.productId} className="flex items-center gap-3 px-4 py-3">
              {item.productImage && (
                <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-souk-sand shrink-0">
                  <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.productName}</p>
                <p className="text-xs text-gray-400">{isAr ? "يُباع من" : "Vendu par"} {item.vendorName}</p>
                <p className="text-xs text-gray-400">×{item.quantity} · {formatPrice(item.price, locale)}</p>
              </div>
              <p className="text-sm font-bold text-gray-800 shrink-0">{formatPrice(item.subtotal, locale)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery address */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <MapPin size={15} className="text-souk-green-700" />
          {isAr ? "عنوان التوصيل" : "Adresse de livraison"}
        </h2>
        <p className="text-sm text-gray-700 font-medium">{order.address.firstName} {order.address.lastName}</p>
        <p className="text-sm text-gray-500">{order.address.street}</p>
        <p className="text-sm text-gray-500">{order.address.zipCode ? `${order.address.zipCode} ` : ""}{order.address.city}</p>
        <p className="text-sm text-gray-500">{order.address.phone}</p>
      </div>

      {/* Order summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h2 className="text-sm font-bold text-gray-900 mb-3">
          {isAr ? "ملخص الطلب" : "Récapitulatif"}
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>{isAr ? "المجموع الفرعي" : "Sous-total"}</span>
            <span>{formatPrice(order.subtotal, locale)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>{isAr ? "الخصم" : "Réduction"}{order.promoCode ? ` (${order.promoCode})` : ""}</span>
              <span>-{formatPrice(order.discountAmount, locale)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>{isAr ? "التوصيل" : "Livraison"}</span>
            <span className={order.deliveryFee === 0 ? "text-emerald-600" : ""}>
              {order.deliveryFee === 0 ? (isAr ? "مجاني" : "Gratuite") : formatPrice(order.deliveryFee, locale)}
            </span>
          </div>
          <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2">
            <span>{isAr ? "الإجمالي" : "Total"}</span>
            <span className="text-souk-green-800">{formatPrice(order.total, locale)}</span>
          </div>
        </div>

        {/* Payment method */}
        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center gap-2 text-sm text-gray-600">
          {PAYMENT_ICONS[order.paymentMethod]}
          {isAr ? PAYMENT_LABEL[order.paymentMethod].ar : PAYMENT_LABEL[order.paymentMethod].fr}
          <span className={cn(
            "ms-auto text-xs font-semibold px-2 py-0.5 rounded-full",
            order.paymentStatus === "PAID" ? "bg-emerald-100 text-emerald-700"
              : order.paymentStatus === "FAILED" ? "bg-red-100 text-red-700"
              : "bg-amber-100 text-amber-700"
          )}>
            {order.paymentStatus === "PAID" ? (isAr ? "مدفوع" : "Payé")
              : order.paymentStatus === "FAILED" ? (isAr ? "فشل" : "Échoué")
              : (isAr ? "في الانتظار" : "En attente")}
          </span>
        </div>
      </div>
    </div>
  );
}

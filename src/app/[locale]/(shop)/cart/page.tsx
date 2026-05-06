"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag, Truck, Banknote, CreditCard, Smartphone, Building2, PartyPopper } from "lucide-react";
import Button from "@/components/ui/button";
import { PromoInput } from "@/components/modules/promo-input";
import { useCartStore } from "@/lib/store/cart";
import { cn, formatPriceSimple } from "@/lib/utils";

export default function CartPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isAr = locale === "ar";

  const { items, removeItem, updateQuantity, subtotal, total, discount } = useCartStore();

  const sub = subtotal();
  const tot = total();
  const deliveryFee = sub >= 300 ? 0 : 35;

  const groupedByVendor = items.reduce<Record<string, typeof items>>((acc, item) => {
    const key = item.vendorName;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <ShoppingBag size={64} className="text-gray-200 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {isAr ? "سلتك فارغة" : "Votre panier est vide"}
        </h1>
        <p className="text-gray-500 mb-6">
          {isAr ? "اكتشف منتجاتنا وابدأ تسوقك" : "Découvrez nos produits et commencez vos achats"}
        </p>
        <Link href={`/${locale}/categories`}>
          <Button variant="primary" size="lg">
            {isAr ? "متابعة التسوق" : "Continuer mes achats"}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isAr ? "سلة التسوق" : "Mon Panier"} <span className="text-base font-normal text-gray-500">({items.length} article{items.length > 1 ? "s" : ""})</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {Object.entries(groupedByVendor).map(([vendorName, vendorItems]) => (
            <div key={vendorName} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {/* Vendor header */}
              <div className="px-4 py-3 bg-souk-green-50 border-b border-souk-green-100 flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-souk-green-200 flex items-center justify-center text-souk-green-800 font-bold text-xs">
                  {vendorName[0]}
                </div>
                <p className="text-sm font-semibold text-souk-green-800">
                  {isAr ? "يُباع من" : "Vendu par"} {vendorName}
                </p>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-50">
                {vendorItems.map((item) => (
                  <div key={item.id} className="p-4 flex gap-4">
                    <Link href={`/${locale}/produits/${item.slug}`} className="relative h-20 w-20 rounded-lg overflow-hidden bg-souk-sand shrink-0">
                      <Image src={item.image ?? ""} alt={item.name} fill className="object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/${locale}/produits/${item.slug}`} className="font-semibold text-sm text-gray-900 hover:text-souk-green-800 line-clamp-2">
                        {item.name}
                      </Link>
                      {item.variant && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.variant.color && `Couleur: ${item.variant.color}`}
                          {item.variant.size && ` · Taille: ${item.variant.size}`}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2.5 py-1 hover:bg-gray-50 text-gray-600">
                            <Minus size={14} />
                          </button>
                          <span className="px-3 py-1 text-sm font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2.5 py-1 hover:bg-gray-50 text-gray-600" disabled={item.quantity >= item.maxStock}>
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="text-end">
                          <p className="font-bold text-souk-green-800">{formatPriceSimple(item.price * item.quantity)}</p>
                          {item.quantity > 1 && <p className="text-xs text-gray-400">{formatPriceSimple(item.price)} / unité</p>}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Free delivery progress */}
          {sub < 300 && (
            <div className="bg-souk-green-50 border border-souk-green-200 rounded-xl p-4">
              <p className="text-sm font-medium text-souk-green-800 mb-2 flex items-center gap-2">
                <Truck size={15} className="text-souk-green-700 shrink-0" />
                Plus que <strong>{formatPriceSimple(300 - sub)}</strong> pour la livraison gratuite !
              </p>
              <div className="h-2 bg-souk-green-200 rounded-full overflow-hidden">
                <div className="h-full bg-souk-green-600 rounded-full transition-all" style={{ width: `${(sub / 300) * 100}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          {/* Promo code */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
              <Tag size={15} className="text-souk-gold-500" />
              {isAr ? "رمز الترويج" : "Code promo"}
            </h3>
            <PromoInput isAr={isAr} />
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">
              {isAr ? "ملخص الطلب" : "Récapitulatif"}
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-medium">{formatPriceSimple(sub)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Réduction ({discount}%)</span>
                  <span className="font-medium">-{formatPriceSimple(sub * discount / 100)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Livraison</span>
                <span className={cn("font-medium", deliveryFee === 0 ? "text-emerald-600" : "")}>
                  {deliveryFee === 0 ? <span className="flex items-center gap-1"><PartyPopper size={13} />Gratuite</span> : formatPriceSimple(deliveryFee)}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-souk-green-800">{formatPriceSimple(tot + deliveryFee)}</span>
              </div>
            </div>

            <Link href={`/${locale}/commander`}>
              <Button fullWidth size="lg" className="mt-4" rightIcon={<ArrowRight size={18} />}>
                {isAr ? "إتمام الطلب" : "Passer la commande"}
              </Button>
            </Link>

            {/* Payment methods */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400 mb-2">Modes de paiement acceptés</p>
              <div className="flex justify-center gap-2 flex-wrap">
                {[
                  { icon: Banknote,    label: "COD" },
                  { icon: CreditCard,  label: "CMI" },
                  { icon: Smartphone,  label: "Mobile" },
                  { icon: Building2,   label: "Virement" },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} className="flex items-center gap-1 text-xs bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-gray-600">
                    <Icon size={11} className="text-souk-green-600" />{label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

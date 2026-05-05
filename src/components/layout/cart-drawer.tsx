"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Gift, ShoppingCart } from "lucide-react";
import Button from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart";
import { useUIStore } from "@/lib/store/ui";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CartDrawerProps {
  locale: string;
  isAr: boolean;
}

export default function CartDrawer({ locale, isAr }: CartDrawerProps) {
  const { cartDrawerOpen, setCartDrawerOpen: setCartDrawer } = useUIStore();
  const { items, removeItem, updateQuantity, subtotal, total, itemCount } = useCartStore();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (cartDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [cartDrawerOpen]);

  const FREE_DELIVERY_THRESHOLD = 300;
  const sub = subtotal();
  const remaining = FREE_DELIVERY_THRESHOLD - sub;
  const progressPct = Math.min((sub / FREE_DELIVERY_THRESHOLD) * 100, 100);

  if (!cartDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={() => setCartDrawer(false)}
      />

      {/* Drawer panel */}
      <div className={cn(
        "fixed top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col",
        isAr ? "left-0" : "right-0"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-souk-green-800" />
            <h2 className="font-black text-gray-900 text-lg">
              {isAr ? "سلة التسوق" : "Mon panier"}
            </h2>
            {itemCount() > 0 && (
              <span className="h-6 min-w-6 px-1.5 rounded-full bg-souk-terracotta-500 text-white text-xs font-bold flex items-center justify-center">
                {itemCount()}
              </span>
            )}
          </div>
          <button
            onClick={() => setCartDrawer(false)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingCart size={56} className="text-gray-200" />
            <h3 className="font-bold text-gray-900">
              {isAr ? "سلتك فارغة" : "Votre panier est vide"}
            </h3>
            <p className="text-sm text-gray-500">
              {isAr ? "أضف منتجات لبدء تسوقك" : "Ajoutez des articles pour commencer"}
            </p>
            <Button onClick={() => setCartDrawer(false)} leftIcon={<ArrowRight size={16} />}>
              {isAr ? "تصفح المنتجات" : "Parcourir les produits"}
            </Button>
          </div>
        ) : (
          <>
            {/* Free delivery progress */}
            {remaining > 0 && (
              <div className="mx-4 mt-3 mb-1 bg-souk-green-50 rounded-xl px-4 py-3 border border-souk-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <Gift size={14} className="text-souk-green-700" />
                  <p className="text-xs font-semibold text-souk-green-800">
                    {isAr
                      ? `أضف ${formatPrice(remaining)} للتوصيل المجاني`
                      : `Plus que ${formatPrice(remaining)} pour la livraison gratuite !`}
                  </p>
                </div>
                <div className="h-1.5 bg-souk-green-200 rounded-full overflow-hidden">
                  <div className="h-full bg-souk-green-600 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            )}
            {remaining <= 0 && (
              <div className="mx-4 mt-3 mb-1 bg-green-50 rounded-xl px-4 py-2.5 border border-green-100 flex items-center gap-2">
                <Gift size={14} className="text-green-600" />
                <p className="text-xs font-semibold text-green-700 flex items-center gap-1">
                  <Gift size={12} />{isAr ? "توصيل مجاني!" : "Livraison gratuite offerte !"}
                </p>
              </div>
            )}

            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 bg-gray-50 rounded-2xl p-3">
                  <div className="h-18 w-18 rounded-xl overflow-hidden bg-white shrink-0 border border-gray-100">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={72}
                        height={72}
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate leading-snug">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{isAr ? "البائع:" : "Vendeur:"} {item.vendorName}</p>
                    {item.variant?.color && <p className="text-xs text-gray-400">{item.variant.color}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-black text-souk-green-800 text-sm">{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          className="h-7 w-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-souk-green-500 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-7 w-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-souk-green-500 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="h-7 w-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors ms-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-4 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{isAr ? "المجموع الفرعي" : "Sous-total"}</span>
                <span className="font-bold text-gray-900">{formatPrice(sub)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{isAr ? "التوصيل" : "Livraison"}</span>
                <span className={cn("text-sm font-semibold", remaining <= 0 ? "text-green-600" : "text-gray-700")}>
                  {remaining <= 0 ? (isAr ? "مجاني" : "Gratuit") : formatPrice(30)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <span className="font-bold text-gray-900">{isAr ? "الإجمالي" : "Total"}</span>
                <span className="font-black text-xl text-souk-green-800">{formatPrice(total())}</span>
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <Link href={`/${locale}/checkout`} onClick={() => setCartDrawer(false)}>
                  <Button className="w-full">
                    {isAr ? "إتمام الشراء" : "Commander"}
                    <ArrowRight size={16} className="ms-2" />
                  </Button>
                </Link>
                <Link href={`/${locale}/cart`} onClick={() => setCartDrawer(false)}>
                  <button className="w-full text-center text-sm text-souk-green-700 font-semibold hover:text-souk-green-800 py-1">
                    {isAr ? "عرض السلة الكاملة" : "Voir le panier complet"}
                  </button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

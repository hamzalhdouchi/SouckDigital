"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, ChevronRight, Truck, CreditCard, Smartphone, Building2, Banknote, Zap, Package, AlertCircle, Loader2 } from "lucide-react";
import Button from "@/components/ui/button";
import { DeliveryAddressForm, type DeliveryAddressFormRef } from "@/components/modules/delivery-address-form";
import { useCartStore } from "@/lib/store/cart";
import { cn, formatPriceSimple } from "@/lib/utils";
import { ordersApi } from "@/lib/api/orders";
import { paymentApi } from "@/lib/api/payment";
import type { PlaceOrderRequest } from "@/lib/api/types";

type Step = 1 | 2 | 3;
type PostOrderState = "none" | "mobile_pending" | "transfer_pending";

const PAYMENT_METHODS = [
  { id: "cod",      icon: Banknote,    label: "Paiement à la livraison",   sub: "Payez cash à la réception",        popular: true },
  { id: "card",     icon: CreditCard,  label: "Carte bancaire (CMI)",       sub: "Visa / Mastercard — sécurisé",     popular: false },
  { id: "mobile",   icon: Smartphone,  label: "Mobile Money",               sub: "Inwi Money · Orange Money · M-Wallet", popular: false },
  { id: "transfer", icon: Building2,   label: "Virement bancaire",          sub: "Confirmation sous 24h",            popular: false },
];

const PAYMENT_METHOD_MAP: Record<string, PlaceOrderRequest["paymentMethod"]> = {
  cod: "COD",
  card: "CARD_CMI",
  mobile: "MOBILE",
  transfer: "TRANSFER",
};

export default function CheckoutPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const isAr = locale === "ar";

  const { items, subtotal, total, discount, promoCode, clearCart } = useCartStore();
  const addressFormRef = useRef<DeliveryAddressFormRef>(null);
  const [step, setStep] = useState<Step>(1);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [postOrderState, setPostOrderState] = useState<PostOrderState>("none");
  const [pendingOrderId, setPendingOrderId] = useState("");

  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const sub = subtotal();
  const tot = total();
  const deliveryFees: Record<string, number> = { standard: 35, express: 65, relay: 25 };
  const deliveryFee = sub >= 300 ? 0 : deliveryFees[deliveryMethod] ?? 35;
  const grandTotal = tot + deliveryFee;

  const STEPS = [
    { n: 1, label: isAr ? "العنوان" : "Adresse" },
    { n: 2, label: isAr ? "التوصيل" : "Livraison" },
    { n: 3, label: isAr ? "الدفع" : "Paiement" },
  ];

  if (confirmed) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          {isAr ? "تم تأكيد الطلب!" : "Commande confirmée !"}
        </h1>
        <p className="text-gray-600 mb-2">
          {isAr ? "رقم الطلب:" : "Numéro de commande :"} <strong>#{confirmedOrderId.slice(0, 8).toUpperCase()}</strong>
        </p>
        <p className="text-sm text-gray-500 mb-8 max-w-md">
          {isAr
            ? "سيتم إرسال تأكيد بالبريد الإلكتروني والرسائل القصيرة. يمكنك متابعة طلبك من حسابك."
            : "Un email et SMS de confirmation vous seront envoyés. Vous pouvez suivre votre commande depuis votre espace personnel."}
        </p>
        <div className="flex gap-3">
          <Link href={`/${locale}`}>
            <Button variant="outline">Retour à l'accueil</Button>
          </Link>
          <Link href={`/${locale}/account/orders`}>
            <Button>Suivre ma commande</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (postOrderState === "mobile_pending") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-6">
          <Loader2 size={40} className="text-blue-500 animate-spin" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isAr ? "بانتظار تأكيد الدفع عبر الهاتف" : "Paiement Mobile Money en attente"}
        </h1>
        <p className="text-gray-600 mb-2">
          {isAr ? "رقم الطلب:" : "Commande n°"} <strong>#{pendingOrderId.slice(0, 8).toUpperCase()}</strong>
        </p>
        <p className="text-sm text-gray-500 mb-8 max-w-md">
          {isAr
            ? "سيتم إرسال طلب تأكيد إلى هاتفك عبر Inwi Money / Orange Money / M-Wallet. يمكنك متابعة حالة طلبك من حسابك."
            : "Une demande de confirmation sera envoyée sur votre téléphone via Inwi Money, Orange Money ou M-Wallet. Suivez l'état de votre commande depuis votre espace personnel."}
        </p>
        <div className="flex gap-3">
          <Link href={`/${locale}`}>
            <Button variant="outline">{isAr ? "الرئيسية" : "Accueil"}</Button>
          </Link>
          <Link href={`/${locale}/account/orders`}>
            <Button>{isAr ? "تتبع طلبي" : "Suivre ma commande"}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (postOrderState === "transfer_pending") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center mb-6">
          <Building2 size={40} className="text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isAr ? "أكمل التحويل البنكي" : "Finalisez votre virement bancaire"}
        </h1>
        <p className="text-gray-600 mb-2">
          {isAr ? "رقم الطلب:" : "Commande n°"} <strong>#{pendingOrderId.slice(0, 8).toUpperCase()}</strong>
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 text-left max-w-sm w-full">
          <p className="text-sm font-bold text-amber-800 mb-3">{isAr ? "تفاصيل الحساب البنكي" : "Coordonnées bancaires"}</p>
          <div className="space-y-1 text-sm text-amber-900">
            <p><span className="font-semibold">{isAr ? "البنك:" : "Banque :"}</span> CIH Bank</p>
            <p><span className="font-semibold">{isAr ? "الاسم:" : "Nom :"}</span> Souk Digital SARL</p>
            <p><span className="font-semibold">RIB :</span> 230 780 4567891234567890 12</p>
            <p className="mt-2 text-xs text-amber-700">
              {isAr
                ? "أذكر رقم الطلب كمرجع للتحويل"
                : `Indiquez la référence : #${pendingOrderId.slice(0, 8).toUpperCase()}`}
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-8 max-w-md">
          {isAr
            ? "سيتم تأكيد طلبك خلال 24 ساعة بعد استلام التحويل."
            : "Votre commande sera confirmée sous 24h après réception du virement."}
        </p>
        <div className="flex gap-3">
          <Link href={`/${locale}`}>
            <Button variant="outline">{isAr ? "الرئيسية" : "Accueil"}</Button>
          </Link>
          <Link href={`/${locale}/account/orders`}>
            <Button>{isAr ? "تتبع طلبي" : "Suivre ma commande"}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isAr ? "إتمام الطلب" : "Finaliser ma commande"}
      </h1>

      {/* Stepper */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                step > s.n ? "bg-souk-green-800 text-white" : step === s.n ? "bg-souk-green-800 text-white ring-4 ring-souk-green-200" : "bg-gray-200 text-gray-500"
              )}>
                {step > s.n ? <CheckCircle size={16} /> : s.n}
              </div>
              <span className={cn("text-sm font-medium hidden sm:inline", step >= s.n ? "text-souk-green-800" : "text-gray-400")}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("flex-1 h-0.5 mx-3 transition-colors", step > s.n ? "bg-souk-green-800" : "bg-gray-200")} />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form area */}
        <div className="lg:col-span-2">
          {/* Step 1 — Address */}
          {step === 1 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-bold text-lg text-gray-900 mb-5">
                {isAr ? "عنوان التوصيل" : "Adresse de livraison"}
              </h2>
              <DeliveryAddressForm ref={addressFormRef} isAr={isAr} />
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={async () => {
                    const valid = await addressFormRef.current?.validate();
                    if (valid) setStep(2);
                  }}
                  rightIcon={<ChevronRight size={16} />}
                >
                  {isAr ? "الخطوة التالية" : "Étape suivante"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2 — Delivery */}
          {step === 2 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-bold text-lg text-gray-900 mb-5">
                {isAr ? "طريقة التوصيل" : "Mode de livraison"}
              </h2>
              <div className="space-y-3">
                {[
                  { id: "standard", icon: Truck,   label: "Standard",     sub: "3–5 jours ouvrés",  price: sub >= 300 ? 0 : 35 },
                  { id: "express",  icon: Zap,     label: "Express",      sub: "24–48h en ville",    price: 65 },
                  { id: "relay",    icon: Package, label: "Point relais", sub: "5–7 jours ouvrés",   price: 25 },
                ].map((m) => (
                  <label key={m.id} className={cn(
                    "flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors",
                    deliveryMethod === m.id ? "border-souk-green-800 bg-souk-green-50" : "border-gray-200 hover:border-souk-green-400"
                  )}>
                    <input type="radio" name="delivery" value={m.id} checked={deliveryMethod === m.id} onChange={() => setDeliveryMethod(m.id)} className="sr-only" />
                    <div className={cn("p-2 rounded-xl shrink-0", deliveryMethod === m.id ? "bg-souk-green-200" : "bg-gray-100")}>
                      <m.icon size={20} className={deliveryMethod === m.id ? "text-souk-green-800" : "text-gray-500"} strokeWidth={1.75} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{m.label}</p>
                      <p className="text-xs text-gray-500">{m.sub}</p>
                    </div>
                    <p className="font-bold text-sm text-souk-green-800">
                      {m.id === "standard" && sub >= 300 ? "Gratuit" : formatPriceSimple(m.price)}
                    </p>
                  </label>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>Retour</Button>
                <Button onClick={() => setStep(3)} rightIcon={<ChevronRight size={16} />}>Étape suivante</Button>
              </div>
            </div>
          )}

          {/* Step 3 — Payment */}
          {step === 3 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-bold text-lg text-gray-900 mb-5">
                {isAr ? "طريقة الدفع" : "Mode de paiement"}
              </h2>
              <div className="space-y-3 mb-6">
                {PAYMENT_METHODS.map((m) => (
                  <label key={m.id} className={cn(
                    "flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors",
                    paymentMethod === m.id ? "border-souk-green-800 bg-souk-green-50" : "border-gray-200 hover:border-souk-green-400"
                  )}>
                    <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} className="sr-only" />
                    <m.icon size={22} className="text-souk-green-700 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{m.label}</p>
                        {m.popular && <span className="text-[10px] bg-souk-gold-100 text-souk-gold-700 px-1.5 py-0.5 rounded-md font-semibold">Populaire</span>}
                      </div>
                      <p className="text-xs text-gray-500">{m.sub}</p>
                    </div>
                    {paymentMethod === m.id && <CheckCircle size={18} className="text-souk-green-800 shrink-0" />}
                  </label>
                ))}
              </div>

              {submitError && (
                <p className="text-sm text-red-500 flex items-center gap-1.5 mb-3">
                  <AlertCircle size={14} />{submitError}
                </p>
              )}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>Retour</Button>
                <Button
                  variant="gold"
                  size="lg"
                  loading={submitting}
                  onClick={async () => {
                    setSubmitError("");
                    const addr = addressFormRef.current?.getValues();
                    if (!addr) {
                      setStep(1);
                      setSubmitError(isAr ? "يرجى ملء عنوان التوصيل" : "Veuillez compléter l'adresse de livraison");
                      return;
                    }
                    setSubmitting(true);
                    try {
                      const order = await ordersApi.place({
                        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
                        address: {
                          firstName: addr.firstName,
                          lastName: addr.lastName,
                          phone: addr.phone,
                          street: addr.street,
                          city: addr.city,
                          zipCode: addr.zipCode || undefined,
                        },
                        paymentMethod: PAYMENT_METHOD_MAP[paymentMethod] ?? "COD",
                        promoCode: promoCode ?? undefined,
                      });
                      clearCart();
                      const method = PAYMENT_METHOD_MAP[paymentMethod];
                      if (method === "CARD_CMI") {
                        const cmi = await paymentApi.initCmi(order.id);
                        router.push(cmi.paymentUrl);
                        return;
                      }
                      if (method === "MOBILE") {
                        await paymentApi.initMobile(order.id);
                        setPendingOrderId(order.id);
                        setPostOrderState("mobile_pending");
                        return;
                      }
                      if (method === "TRANSFER") {
                        setPendingOrderId(order.id);
                        setPostOrderState("transfer_pending");
                        return;
                      }
                      // COD
                      setConfirmedOrderId(order.id);
                      setConfirmed(true);
                    } catch (err: unknown) {
                      setSubmitError(err instanceof Error ? err.message : (isAr ? "فشل تأكيد الطلب" : "Échec de la commande"));
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  leftIcon={<CheckCircle size={18} />}
                >
                  {isAr ? "تأكيد الطلب" : "Confirmer la commande"} · {formatPriceSimple(grandTotal)}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 h-fit sticky top-20">
          <h3 className="font-bold text-gray-900 mb-4">
            {isAr ? "ملخص الطلب" : "Récapitulatif"}
          </h3>
          <div className="space-y-2 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <div className="relative h-10 w-10 rounded-md overflow-hidden bg-souk-sand shrink-0">
                  <Image src={item.image ?? ""} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">×{item.quantity}</p>
                </div>
                <span className="text-xs font-bold text-gray-800">{formatPriceSimple(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span><span>{formatPriceSimple(sub)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Réduction -{discount}%</span>
                <span>-{formatPriceSimple(sub * discount / 100)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Livraison</span>
              <span className={deliveryFee === 0 ? "text-emerald-600" : ""}>{deliveryFee === 0 ? "Gratuite" : formatPriceSimple(deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2">
              <span>Total</span>
              <span className="text-souk-green-800">{formatPriceSimple(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

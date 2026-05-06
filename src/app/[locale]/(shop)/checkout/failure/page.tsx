"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, RefreshCw, Banknote, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/button";
import { useCmiPayment } from "@/lib/hooks/use-cmi-payment";

function CheckoutFailureContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const isAr = locale === "ar";

  const orderId = searchParams.get("orderId") ?? "";
  const reason = searchParams.get("reason") ?? "";

  const { mutate: retryCard, isPending: retrying } = useCmiPayment();

  const FAILURE_REASONS: Record<string, { fr: string; ar: string }> = {
    insufficient_funds: { fr: "Fonds insuffisants sur votre carte",    ar: "رصيد غير كافٍ في بطاقتك" },
    card_declined:      { fr: "Carte bancaire refusée",                 ar: "تم رفض البطاقة البنكية" },
    expired_card:       { fr: "Carte expirée",                          ar: "البطاقة منتهية الصلاحية" },
    timeout:            { fr: "Session de paiement expirée",            ar: "انتهت مهلة الجلسة" },
  };

  const reasonText = reason && FAILURE_REASONS[reason]
    ? (isAr ? FAILURE_REASONS[reason].ar : FAILURE_REASONS[reason].fr)
    : null;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center max-w-md mx-auto py-12">
      {/* Icon */}
      <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center mb-6">
        <XCircle size={48} className="text-red-500" />
      </div>

      <h1 className="text-2xl font-black text-gray-900 mb-2">
        {isAr ? "فشل الدفع" : "Paiement échoué"}
      </h1>

      {orderId && (
        <p className="text-sm text-gray-500 mb-1">
          {isAr ? "رقم الطلب:" : "Commande n°"}{" "}
          <span className="font-bold text-gray-700">#{orderId.slice(0, 8).toUpperCase()}</span>
        </p>
      )}

      {reasonText && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2 mb-4 mt-1">
          {reasonText}
        </p>
      )}

      <p className="text-sm text-gray-500 mb-8 max-w-sm">
        {isAr
          ? "لم تتم معالجة دفعتك. يمكنك المحاولة مجدداً أو اختيار طريقة دفع أخرى."
          : "Votre paiement n'a pas pu être traité. Vous pouvez réessayer ou choisir un autre mode de paiement."}
      </p>

      {/* Options */}
      <div className="w-full space-y-3">
        {/* Retry card */}
        {orderId && (
          <button
            onClick={() => retryCard(orderId)}
            disabled={retrying}
            className="w-full flex items-center gap-4 p-4 border-2 border-souk-green-800 bg-souk-green-50 rounded-xl hover:bg-souk-green-100 transition-colors disabled:opacity-60"
          >
            <div className="p-2 bg-souk-green-200 rounded-xl shrink-0">
              <RefreshCw size={20} className={`text-souk-green-800 ${retrying ? "animate-spin" : ""}`} />
            </div>
            <div className="text-start">
              <p className="font-semibold text-sm text-souk-green-900">
                {isAr ? "إعادة المحاولة بالبطاقة" : "Réessayer par carte"}
              </p>
              <p className="text-xs text-souk-green-600">
                {isAr ? "Visa / Mastercard — CMI" : "Visa / Mastercard — CMI"}
              </p>
            </div>
          </button>
        )}

        {/* Switch to COD */}
        {orderId ? (
          <Link
            href={`/${locale}/account/orders/${orderId}`}
            className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-souk-gold-400 hover:bg-souk-gold-50 transition-colors"
          >
            <div className="p-2 bg-souk-gold-100 rounded-xl shrink-0">
              <Banknote size={20} className="text-souk-gold-700" />
            </div>
            <div className="text-start">
              <p className="font-semibold text-sm text-gray-900">
                {isAr ? "الدفع عند الاستلام" : "Payer à la livraison"}
              </p>
              <p className="text-xs text-gray-500">
                {isAr ? "تواصل معنا لتحويل الطلب" : "Contactez-nous pour basculer la commande"}
              </p>
            </div>
          </Link>
        ) : (
          <Link
            href={`/${locale}/commander`}
            className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-souk-gold-400 hover:bg-souk-gold-50 transition-colors"
          >
            <div className="p-2 bg-souk-gold-100 rounded-xl shrink-0">
              <Banknote size={20} className="text-souk-gold-700" />
            </div>
            <div className="text-start">
              <p className="font-semibold text-sm text-gray-900">
                {isAr ? "العودة لإتمام الطلب" : "Retourner au paiement"}
              </p>
              <p className="text-xs text-gray-500">
                {isAr ? "اختر طريقة دفع أخرى" : "Choisir un autre mode de paiement"}
              </p>
            </div>
          </Link>
        )}
      </div>

      {/* Back */}
      <Link href={`/${locale}`} className="mt-8 flex items-center gap-1.5 text-sm text-gray-500 hover:text-souk-green-700 transition-colors">
        <ArrowLeft size={14} className="rtl:rotate-180" />
        {isAr ? "العودة للرئيسية" : "Retour à l'accueil"}
      </Link>
    </div>
  );
}

export default function CheckoutFailurePage() {
  return (
    <Suspense>
      <CheckoutFailureContent />
    </Suspense>
  );
}

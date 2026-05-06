"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, Loader2, AlertCircle } from "lucide-react";
import Button from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { PaymentStatusDto } from "@/lib/api/types";

function CheckoutSuccessContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = params.locale as string;
  const isAr = locale === "ar";

  const orderId = searchParams.get("orderId") ?? "";

  const [status, setStatus] = useState<PaymentStatusDto | null>(null);
  const [polling, setPolling] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 10;

  useEffect(() => {
    if (!orderId) {
      setPolling(false);
      return;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const { paymentApi } = await import("@/lib/api/payment");
        const data = await paymentApi.getStatus(orderId);
        if (cancelled) return;
        setStatus(data);

        if (data.status === "PAID" || data.status === "FAILED" || data.status === "REFUNDED") {
          setPolling(false);
          if (data.status === "FAILED") {
            router.replace(`/${locale}/checkout/failure?orderId=${orderId}`);
          }
          return;
        }

        setAttempts((a) => {
          const next = a + 1;
          if (next >= MAX_ATTEMPTS) {
            setPolling(false);
          }
          return next;
        });
      } catch {
        if (!cancelled) setPolling(false);
      }
    };

    poll();
    const interval = setInterval(() => {
      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(interval);
        return;
      }
      poll();
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (polling && !status) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <Loader2 size={48} className="text-souk-green-600 animate-spin" />
        <h1 className="text-xl font-bold text-gray-900">
          {isAr ? "جارٍ التحقق من الدفع…" : "Vérification du paiement…"}
        </h1>
        <p className="text-sm text-gray-500 max-w-xs">
          {isAr ? "يرجى الانتظار، لا تغلق هذه الصفحة" : "Veuillez patienter, ne fermez pas cette page"}
        </p>
        <div className="flex gap-1.5 mt-2">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
            <div key={i} className={`h-1.5 w-6 rounded-full transition-colors ${i < attempts ? "bg-souk-green-600" : "bg-gray-200"}`} />
          ))}
        </div>
      </div>
    );
  }

  if (status?.status === "PAID" || (!orderId && !polling)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
          <CheckCircle size={48} className="text-emerald-500" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">
          {isAr ? "تم الدفع بنجاح!" : "Paiement confirmé !"}
        </h1>
        {orderId && (
          <p className="text-gray-600 mb-2">
            {isAr ? "رقم الطلب:" : "Commande n°"}{" "}
            <strong>#{orderId.slice(0, 8).toUpperCase()}</strong>
          </p>
        )}
        {status && (
          <p className="text-sm text-emerald-600 font-semibold mb-2">
            {isAr ? "المبلغ المدفوع:" : "Montant payé :"}{" "}
            {formatPrice(status.amount, locale)}
          </p>
        )}
        <p className="text-sm text-gray-500 mb-8 max-w-sm">
          {isAr
            ? "سيتم إرسال تأكيد بالبريد الإلكتروني والرسائل القصيرة. يمكنك متابعة طلبك من حسابك."
            : "Un email et SMS de confirmation vous seront envoyés. Suivez votre commande depuis votre espace personnel."}
        </p>

        {/* Order highlights */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex items-center gap-2 bg-souk-green-50 border border-souk-green-200 rounded-xl px-4 py-3 text-sm text-souk-green-800">
            <Package size={16} />
            {isAr ? "التوصيل خلال 2–5 أيام عمل" : "Livraison sous 2–5 jours ouvrés"}
          </div>
        </div>

        <div className="flex gap-3 flex-wrap justify-center">
          <Link href={`/${locale}`}>
            <Button variant="outline">{isAr ? "العودة للرئيسية" : "Retour à l'accueil"}</Button>
          </Link>
          {orderId && (
            <Link href={`/${locale}/account/orders/${orderId}`}>
              <Button>{isAr ? "تتبع طلبي" : "Suivre ma commande"}</Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Timed out but still PENDING
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center mb-2">
        <AlertCircle size={40} className="text-amber-500" />
      </div>
      <h1 className="text-xl font-bold text-gray-900">
        {isAr ? "لم يتم تأكيد الدفع بعد" : "Paiement en cours de traitement"}
      </h1>
      <p className="text-sm text-gray-500 max-w-sm">
        {isAr
          ? "قد يستغرق التأكيد بضع دقائق. تحقق من طلباتك لاحقاً."
          : "La confirmation peut prendre quelques minutes. Vérifiez vos commandes dans quelques instants."}
      </p>
      <div className="flex gap-3 mt-2">
        <Link href={`/${locale}`}>
          <Button variant="outline">{isAr ? "الرئيسية" : "Accueil"}</Button>
        </Link>
        <Link href={`/${locale}/account/orders`}>
          <Button>{isAr ? "طلباتي" : "Mes commandes"}</Button>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

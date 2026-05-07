"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Phone, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import Button from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth";

function VerifyOtpContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = params.locale as string;
  const phone = searchParams.get("phone") ?? "";
  const isAr = locale === "ar";

  const apiVerifyOtp = useAuthStore((s) => s.apiVerifyOtp);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleInput = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) return;
    setError("");
    setLoading(true);
    try {
      await apiVerifyOtp({ phone, code });
      router.push(`/${locale}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (isAr ? "رمز غير صحيح" : "Code incorrect"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    try {
      const { authApi } = await import("@/lib/api/auth");
      await authApi.resendOtp(phone);
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      setError("");
      inputRefs.current[0]?.focus();
    } catch {
      // silent — server may throttle
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-souk-sand">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-block text-2xl font-black text-souk-green-800 mb-6">
            سوق<span className="text-souk-gold-500">·</span>Digital
          </Link>
          <div className="h-16 w-16 rounded-full bg-souk-green-100 flex items-center justify-center mx-auto mb-4">
            <Phone size={28} className="text-souk-green-800" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">
            {isAr ? "التحقق برسالة SMS" : "Vérification par SMS"}
          </h1>
          <p className="text-gray-500 text-sm">
            {phone
              ? (isAr ? `تم إرسال رمز إلى ${phone}` : `Un code a été envoyé au ${phone}`)
              : (isAr ? "أدخل الرمز المرسل إليك" : "Entrez le code reçu par SMS")}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={handleSubmit}>
            {/* 6-digit OTP input */}
            <div className="flex justify-center gap-2 mb-6" dir="ltr" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInput(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="h-12 w-10 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:border-souk-green-800 focus:ring-2 focus:ring-souk-green-200 transition-all bg-souk-sand"
                />
              ))}
            </div>

            {error && (
              <p className="text-sm text-red-500 flex items-center justify-center gap-1.5 mb-4">
                <AlertCircle size={14} />{error}
              </p>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              disabled={otp.join("").length < 6}
              leftIcon={<CheckCircle size={18} />}
            >
              {isAr ? "تحقق من الرمز" : "Vérifier le code"}
            </Button>
          </form>

          {/* Resend */}
          <div className="mt-5 text-center">
            {countdown > 0 ? (
              <p className="text-sm text-gray-500">
                {isAr ? `إعادة الإرسال خلال` : `Renvoyer dans`}{" "}
                <span className="font-bold text-souk-green-700 tabular-nums">{countdown}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-sm text-souk-green-700 font-semibold hover:underline flex items-center gap-1.5 mx-auto disabled:opacity-50"
              >
                <RefreshCw size={14} className={resending ? "animate-spin" : ""} />
                {isAr ? "إعادة إرسال الرمز" : "Renvoyer le code"}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {isAr ? "رقم هاتف خاطئ؟ " : "Mauvais numéro ? "}
          <Link href={`/${locale}/register`} className="text-souk-green-700 font-semibold hover:underline">
            {isAr ? "العودة للتسجيل" : "Retour à l'inscription"}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpContent />
    </Suspense>
  );
}

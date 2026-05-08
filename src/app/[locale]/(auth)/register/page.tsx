"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye, EyeOff, Mail, Phone, User, Lock, ArrowRight,
  CheckCircle, AlertCircle, Check, Sparkles, ShieldCheck, Truck, Banknote,
} from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    firstName:       z.string().min(2, "Prénom requis (min. 2 caractères)"),
    lastName:        z.string().min(2, "Nom requis (min. 2 caractères)"),
    email:           z.string().email("Email invalide").or(z.literal("")),
    phone:           z.string().min(9, "Numéro requis"),
    password:        z.string().min(8, "Au moins 8 caractères"),
    confirmPassword: z.string().min(1, "Confirmation requise"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

/* ── Zellige pattern ── */
function ZelligePattern({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <pattern id="zellige-reg" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <polygon
            points="20,2 21.9,15.4 27.8,12.2 24.6,18.1 31,20 24.6,21.9 27.8,27.8 21.9,24.6 20,31 18.1,24.6 12.2,27.8 15.4,21.9 9,20 15.4,18.1 12.2,12.2 18.1,15.4"
            fill="rgba(201,168,76,0.9)"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#zellige-reg)" />
    </svg>
  );
}

/* ── OTP step ── */
function OtpStep({
  phone, otp, onInput, onSubmit, loading, error, isAr,
}: {
  phone: string;
  otp: string[];
  onInput: (i: number, v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string;
  isAr: boolean;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4" dir={isAr ? "rtl" : "ltr"}>
      <div className="w-full max-w-sm text-center">

        {/* Icon circle */}
        <div className="relative mx-auto mb-8 w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-souk-green-100 animate-pulse" />
          <div className="relative h-24 w-24 rounded-full bg-souk-green-800 flex items-center justify-center shadow-lg">
            <Phone size={32} className="text-white" />
          </div>
          <div className="absolute -top-1 -end-1 h-7 w-7 bg-souk-gold-500 rounded-full flex items-center justify-center shadow">
            <ShieldCheck size={14} className="text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-2">
          {isAr ? "التحقق برسالة SMS" : "Vérification par SMS"}
        </h1>
        <p className="text-gray-500 text-sm mb-2">
          {isAr ? "أدخل الرمز المرسل إلى" : "Saisissez le code envoyé au"}
        </p>
        <p className="text-souk-green-800 font-bold text-sm mb-8 font-mono">{phone}</p>

        <form onSubmit={onSubmit}>
          {/* OTP inputs */}
          <div className="flex justify-center gap-2.5 mb-6 ltr" dir="ltr">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => onInput(i, e.target.value)}
                className={cn(
                  "h-14 w-12 text-center text-xl font-black rounded-xl border-2 transition-all duration-150",
                  "focus:outline-none focus:ring-2 focus:ring-souk-gold-400 focus:border-souk-gold-400",
                  digit
                    ? "border-souk-green-700 bg-souk-green-50 text-souk-green-900"
                    : "border-gray-200 bg-white text-gray-900",
                )}
              />
            ))}
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading} leftIcon={<CheckCircle size={18} />} className="rounded-xl mb-4">
            {isAr ? "تحقق من الرمز" : "Vérifier le code"}
          </Button>

          <p className="text-center text-sm text-gray-500">
            {isAr ? "لم تستلم الرمز؟ " : "Pas reçu le code ? "}
            <button type="button" className="text-souk-green-700 font-bold hover:underline">
              {isAr ? "إعادة الإرسال" : "Renvoyer"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const isAr = locale === "ar";
  const apiRegister = useAuthStore((s) => s.apiRegister);
  const apiVerifyOtp = useAuthStore((s) => s.apiVerifyOtp);

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const watchedPassword = watch("password", "");
  const passwordStrength = getPasswordStrength(watchedPassword);

  const onSubmit = handleSubmit(async (data) => {
    setServerError("");
    try {
      await apiRegister({
        firstName: data.firstName,
        lastName:  data.lastName,
        email:     data.email || undefined,
        phone:     data.phone,
        password:  data.password,
      });
      setPhone(data.phone);
      setStep("otp");
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : (isAr ? "حدث خطأ" : "Une erreur s'est produite")
      );
    }
  });

  const handleOtpInput = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) (document.getElementById(`otp-${i + 1}`) as HTMLInputElement)?.focus();
  };

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    setOtpLoading(true);
    try {
      await apiVerifyOtp({ phone, code: otp.join("") });
      router.push(`/${locale}`);
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : (isAr ? "رمز غير صحيح" : "Code incorrect"));
    } finally {
      setOtpLoading(false);
    }
  };

  if (step === "otp") {
    return (
      <OtpStep
        phone={phone}
        otp={otp}
        onInput={handleOtpInput}
        onSubmit={handleOtp}
        loading={otpLoading}
        error={otpError}
        isAr={isAr}
      />
    );
  }

  const benefits = isAr
    ? ["وصول إلى +50,000 منتج أصيل", "التوصيل في كل أنحاء المغرب", "الدفع عند الاستلام متاح", "خدمة عملاء 7/7 أيام"]
    : ["Accès à 50 000+ produits authentiques", "Livraison partout au Maroc", "Paiement à la livraison disponible", "Service client 7j/7"];

  return (
    <div className="min-h-screen flex bg-white" dir={isAr ? "rtl" : "ltr"}>

      {/* ── LEFT — Decorative panel ── */}
      <div className="hidden lg:flex lg:w-[38%] xl:w-[40%] relative overflow-hidden flex-col bg-souk-green-900">

        {/* Zellige background */}
        <ZelligePattern className="absolute inset-0 w-full h-full opacity-[0.065]" />
        <div className="absolute inset-0 bg-gradient-to-br from-souk-green-900 via-souk-green-900/95 to-souk-green-800" />

        {/* Decorative arch rings */}
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.08]">
          {[280, 220, 160].map((size) => (
            <div
              key={size}
              className="absolute border border-souk-gold-400 rounded-t-full"
              style={{
                width: size,
                height: size * 0.65,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -100%)",
              }}
            />
          ))}
        </div>

        {/* Gold accent line */}
        <div className="absolute end-0 top-12 bottom-12 w-px bg-gradient-to-b from-transparent via-souk-gold-400/50 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">

          <Link href={`/${locale}`} className="text-2xl font-black text-white tracking-tight">
            سوق<span className="text-souk-gold-400">·</span>Digital
          </Link>

          <div className="flex-1 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 bg-souk-gold-500/15 border border-souk-gold-500/30 rounded-full px-3 py-1.5 w-fit mb-6">
              <Sparkles size={13} className="text-souk-gold-400" />
              <span className="text-souk-gold-300 text-xs font-semibold uppercase tracking-wide">
                {isAr ? "انضم اليوم مجانًا" : "Inscription gratuite"}
              </span>
            </div>

            <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight mb-4">
              {isAr ? (
                <>انضم إلى مجتمع<br /><span className="text-souk-gold-400">سوق الرقمي</span></>
              ) : (
                <>Rejoignez la<br /><span className="text-souk-gold-400">communauté Souk Digital</span></>
              )}
            </h2>

            <p className="text-souk-green-300 text-sm mb-8 max-w-xs leading-relaxed">
              {isAr
                ? "أنشئ حسابك في ثوانٍ وابدأ التسوق في أكبر سوق مغربي رقمي."
                : "Créez votre compte en quelques secondes et commencez à acheter sur la plus grande marketplace marocaine."}
            </p>

            {/* Benefits list */}
            <ul className="space-y-3">
              {benefits.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-souk-gold-500/20 border border-souk-gold-500/40 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-souk-gold-400" />
                  </div>
                  <span className="text-sm text-souk-green-300">{item}</span>
                </li>
              ))}
            </ul>

            {/* Trust badges */}
            <div className="flex gap-4 mt-10 pt-8 border-t border-souk-green-700/60">
              {[
                { icon: Truck,       label: isAr ? "توصيل سريع" : "Livraison" },
                { icon: Banknote,    label: isAr ? "دفع آمن" : "Paiement sécurisé" },
                { icon: ShieldCheck, label: isAr ? "ضمان" : "Garantie" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <div className="h-8 w-8 rounded-lg bg-souk-green-700/50 flex items-center justify-center">
                    <Icon size={16} className="text-souk-gold-400" />
                  </div>
                  <span className="text-xs text-souk-green-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-souk-green-500 text-xs">
            <span>🇲🇦</span>
            <span>{isAr ? "صنع في المغرب" : "Fait au Maroc"}</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT — Form panel ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">

        <div className="h-1 w-full bg-gradient-to-r from-souk-gold-300 via-souk-gold-500 to-souk-gold-300 lg:hidden" />

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 py-10 max-w-lg mx-auto w-full">

          {/* Mobile logo */}
          <div className="mb-6 lg:hidden">
            <Link href={`/${locale}`} className="text-xl font-black text-souk-green-800 tracking-tight">
              سوق<span className="text-souk-gold-500">·</span>Digital
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-1 rounded-full bg-souk-gold-500" />
              <h1 className="text-2xl font-black text-gray-900">
                {isAr ? "إنشاء حساب" : "Créer un compte"}
              </h1>
            </div>
            <p className="text-gray-500 text-sm ps-3">
              {isAr ? "انضم إلى أكثر من 50,000 مشترٍ" : "Rejoignez plus de 50 000 acheteurs sur Souk Digital"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={isAr ? "الاسم الأول" : "Prénom"}
                leftIcon={<User size={15} />}
                fullWidth
                error={errors.firstName?.message}
                {...register("firstName")}
              />
              <Input
                label={isAr ? "اسم العائلة" : "Nom"}
                leftIcon={<User size={15} />}
                fullWidth
                error={errors.lastName?.message}
                {...register("lastName")}
              />
            </div>

            <Input
              label={isAr ? "البريد الإلكتروني" : "Email"}
              type="email"
              placeholder="vous@exemple.com"
              leftIcon={<Mail size={15} />}
              fullWidth
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label={isAr ? "الهاتف المغربي" : "Téléphone marocain"}
              type="tel"
              placeholder="+212 6XX XXX XXX"
              leftIcon={<Phone size={15} />}
              fullWidth
              error={errors.phone?.message}
              {...register("phone")}
            />

            <div>
              <Input
                label={isAr ? "كلمة المرور" : "Mot de passe"}
                type={showPassword ? "text" : "password"}
                placeholder={isAr ? "8 أحرف على الأقل" : "8 caractères minimum"}
                leftIcon={<Lock size={15} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-gray-400 hover:text-souk-green-700 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
                fullWidth
                error={errors.password?.message}
                {...register("password")}
              />
              {/* Password strength indicator */}
              {watchedPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-all duration-300",
                          level <= passwordStrength.score
                            ? passwordStrength.score <= 1 ? "bg-red-400"
                              : passwordStrength.score <= 2 ? "bg-orange-400"
                              : passwordStrength.score <= 3 ? "bg-yellow-400"
                              : "bg-souk-green-500"
                            : "bg-gray-100"
                        )}
                      />
                    ))}
                  </div>
                  <p className={cn(
                    "text-xs",
                    passwordStrength.score <= 1 ? "text-red-500"
                      : passwordStrength.score <= 2 ? "text-orange-500"
                      : passwordStrength.score <= 3 ? "text-yellow-600"
                      : "text-souk-green-600"
                  )}>
                    {passwordStrength.label[isAr ? "ar" : "fr"]}
                  </p>
                </div>
              )}
            </div>

            <Input
              label={isAr ? "تأكيد كلمة المرور" : "Confirmer le mot de passe"}
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock size={15} />}
              fullWidth
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            {/* Terms */}
            <p className="text-xs text-gray-500 leading-relaxed">
              {isAr ? "بإنشاء حساب، فإنك توافق على " : "En créant un compte, vous acceptez nos "}
              <Link href={`/${locale}/cgv`} className="text-souk-green-700 font-semibold hover:underline">
                {isAr ? "شروط الاستخدام" : "Conditions d'utilisation"}
              </Link>
              {" "}{isAr ? "و" : "et notre"}{" "}
              <Link href={`/${locale}/confidentialite`} className="text-souk-green-700 font-semibold hover:underline">
                {isAr ? "سياسة الخصوصية" : "Politique de confidentialité"}
              </Link>
            </p>

            {serverError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <AlertCircle size={15} className="shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isSubmitting}
              rightIcon={<ArrowRight size={18} />}
              className="rounded-xl mt-1"
            >
              {isAr ? "إنشاء حسابي" : "Créer mon compte"}
            </Button>
          </form>

          {/* Login link */}
          <p className="text-sm text-center text-gray-500 mt-5">
            {isAr ? "لديك حساب بالفعل؟ " : "Déjà un compte ? "}
            <Link href={`/${locale}/login`} className="text-souk-green-700 font-bold hover:text-souk-green-900 hover:underline">
              {isAr ? "تسجيل الدخول" : "Se connecter"}
            </Link>
          </p>

          {/* Vendor CTA */}
          <div className="mt-5 p-4 bg-souk-sand rounded-2xl border border-souk-gold-200 flex items-center gap-3">
            <span className="text-2xl">🏪</span>
            <div>
              <p className="text-xs font-bold text-souk-green-800">
                {isAr ? "هل أنت بائع؟" : "Vous êtes vendeur ?"}
              </p>
              <Link href={`/${locale}/account/become-vendor`} className="text-xs text-souk-gold-600 font-semibold hover:underline">
                {isAr ? "أنشئ متجرك المجاني ←" : "Créer votre boutique gratuitement →"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Password strength helper ── */
function getPasswordStrength(password: string): {
  score: number;
  label: { fr: string; ar: string };
} {
  if (!password) return { score: 0, label: { fr: "", ar: "" } };
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;

  const labels: Record<number, { fr: string; ar: string }> = {
    1: { fr: "Très faible", ar: "ضعيف جدًا" },
    2: { fr: "Faible",      ar: "ضعيف" },
    3: { fr: "Moyen",       ar: "متوسط" },
    4: { fr: "Fort",        ar: "قوي" },
  };
  return { score, label: labels[score] ?? { fr: "", ar: "" } };
}

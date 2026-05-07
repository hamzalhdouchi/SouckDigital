"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Phone, User, Lock, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAuthStore } from "@/lib/store/auth";

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
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

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
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="h-16 w-16 rounded-full bg-souk-green-100 flex items-center justify-center mx-auto mb-4">
              <Phone size={28} className="text-souk-green-800" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-1">
              {isAr ? "التحقق برسالة SMS" : "Vérification par SMS"}
            </h1>
            <p className="text-gray-500 text-sm">
              {isAr ? `تم إرسال رمز إلى ${phone}` : `Un code a été envoyé au ${phone}`}
            </p>
          </div>
          <form onSubmit={handleOtp}>
            <div className="flex justify-center gap-2 mb-6" dir="ltr">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpInput(i, e.target.value)}
                  className="h-12 w-10 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:border-souk-green-800 focus:ring-2 focus:ring-souk-green-200 transition-all"
                />
              ))}
            </div>
            {otpError && (
              <p className="text-sm text-red-500 flex items-center justify-center gap-1.5 mb-3">
                <AlertCircle size={14} />{otpError}
              </p>
            )}
            <Button type="submit" fullWidth size="lg" loading={otpLoading} leftIcon={<CheckCircle size={18} />}>
              {isAr ? "تحقق" : "Vérifier le code"}
            </Button>
            <p className="text-center text-sm text-gray-500 mt-4">
              {isAr ? "لم تستلم الرمز؟ " : "Pas reçu le code ? "}
              <button type="button" className="text-souk-green-700 font-semibold hover:underline">
                {isAr ? "إعادة الإرسال" : "Renvoyer"}
              </button>
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Decorative panel */}
      <div className="hidden lg:flex lg:flex-1 bg-souk-green-800 flex-col justify-between p-12 relative overflow-hidden max-w-sm">
        <Link href={`/${locale}`} className="text-2xl font-black text-white">
          سوق<span className="text-souk-gold-400">·</span>Digital
        </Link>
        <div className="text-white">
          <h2 className="text-3xl font-black mb-4 leading-tight">
            {isAr ? "انضم إلى مجتمع\nسوق الرقمي" : "Rejoignez la\ncommunauté Souk Digital"}
          </h2>
          {["Accès à 50 000+ produits", "Livraison partout au Maroc", "Paiement à la livraison disponible", "Service client 7j/7"].map((item) => (
            <div key={item} className="flex items-center gap-2 mb-2">
              <CheckCircle size={15} className="text-souk-gold-400 shrink-0" />
              <span className="text-sm text-souk-green-300">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 max-w-lg mx-auto w-full">
        <div className="mb-6 lg:hidden">
          <Link href={`/${locale}`} className="text-xl font-black text-souk-green-800">
            سوق<span className="text-souk-gold-500">·</span>Digital
          </Link>
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-1">
          {isAr ? "إنشاء حساب" : "Créer un compte"}
        </h1>
        <p className="text-gray-500 mb-6">
          {isAr ? "انضم إلى أكثر من 50,000 مشترٍ" : "Rejoignez plus de 50 000 acheteurs sur Souk Digital"}
        </p>

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
          <Input
            label={isAr ? "كلمة المرور" : "Mot de passe"}
            type={showPassword ? "text" : "password"}
            placeholder={isAr ? "8 أحرف على الأقل" : "8 caractères minimum"}
            leftIcon={<Lock size={15} />}
            rightIcon={
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
            hint={isAr ? "8 أحرف على الأقل" : "Au moins 8 caractères"}
            fullWidth
            error={errors.password?.message}
            {...register("password")}
          />
          <Input
            label={isAr ? "تأكيد كلمة المرور" : "Confirmer le mot de passe"}
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock size={15} />}
            fullWidth
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <p className="text-xs text-gray-500 leading-relaxed">
            {isAr ? "بإنشاء حساب، فإنك توافق على" : "En créant un compte, vous acceptez nos"}{" "}
            <Link href={`/${locale}/cgv`} className="text-souk-green-700 hover:underline">
              {isAr ? "شروط الاستخدام" : "Conditions d'utilisation"}
            </Link>
            {" "}{isAr ? "و" : "et notre"}{" "}
            <Link href={`/${locale}/confidentialite`} className="text-souk-green-700 hover:underline">
              {isAr ? "سياسة الخصوصية" : "Politique de confidentialité"}
            </Link>
          </p>

          {serverError && (
            <p className="text-sm text-red-500 flex items-center justify-center gap-1.5">
              <AlertCircle size={14} />{serverError}
            </p>
          )}

          <Button type="submit" fullWidth size="lg" loading={isSubmitting} rightIcon={<ArrowRight size={18} />}>
            {isAr ? "إنشاء حسابي" : "Créer mon compte"}
          </Button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-4">
          {isAr ? "لديك حساب بالفعل؟ " : "Déjà un compte ? "}
          <Link href={`/${locale}/login`} className="text-souk-green-700 font-semibold hover:underline">
            {isAr ? "تسجيل الدخول" : "Se connecter"}
          </Link>
        </p>

        <div className="mt-4 p-3 bg-souk-sand rounded-xl border border-souk-gold-200 text-center">
          <p className="text-xs font-medium text-souk-gold-700">
            🏪 {isAr ? "هل أنت بائع؟" : "Vous êtes vendeur ?"}
          </p>
          <Link href={`/${locale}/account/become-vendor`} className="text-xs text-souk-green-700 font-semibold hover:underline">
            {isAr ? "أنشئ متجرك المجاني" : "Créer votre boutique gratuitement"}
          </Link>
        </div>
      </div>
    </div>
  );
}

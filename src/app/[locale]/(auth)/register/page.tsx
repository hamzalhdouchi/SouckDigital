"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Phone, User, Lock, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAuthStore } from "@/lib/store/auth";

type Step = "form" | "otp";

export default function RegisterPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const isAr = locale === "ar";
  const apiRegister = useAuthStore((s) => s.apiRegister);
  const apiVerifyOtp = useAuthStore((s) => s.apiVerifyOtp);

  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [pendingUserId, setPendingUserId] = useState("");

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "",
  });

  const setField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError(isAr ? "كلمتا المرور غير متطابقتين" : "Les mots de passe ne correspondent pas");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await apiRegister({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      setPendingUserId(res.id);
      setStep("otp");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (isAr ? "حدث خطأ" : "Une erreur s'est produite"));
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiVerifyOtp({ userId: pendingUserId, code: otp.join("") });
      router.push(`/${locale}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (isAr ? "رمز غير صحيح" : "Code incorrect"));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpInput = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) (document.getElementById(`otp-${i + 1}`) as HTMLInputElement)?.focus();
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
              {isAr ? `تم إرسال رمز إلى ${form.phone}` : `Un code a été envoyé au ${form.phone}`}
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
            {error && <p className="text-sm text-red-500 flex items-center justify-center gap-1.5 mb-3"><AlertCircle size={14} />{error}</p>}
            <Button type="submit" fullWidth size="lg" loading={loading} leftIcon={<CheckCircle size={18} />}>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label={isAr ? "الاسم الأول" : "Prénom"} value={form.firstName} onChange={setField("firstName")} leftIcon={<User size={15} />} required fullWidth />
            <Input label={isAr ? "اسم العائلة" : "Nom"} value={form.lastName} onChange={setField("lastName")} leftIcon={<User size={15} />} required fullWidth />
          </div>
          <Input label={isAr ? "البريد الإلكتروني" : "Email"} type="email" value={form.email} onChange={setField("email")} placeholder="vous@exemple.com" leftIcon={<Mail size={15} />} required fullWidth />
          <Input label={isAr ? "الهاتف المغربي" : "Téléphone marocain"} type="tel" value={form.phone} onChange={setField("phone")} placeholder="+212 6XX XXX XXX" leftIcon={<Phone size={15} />} required fullWidth />
          <Input
            label={isAr ? "كلمة المرور" : "Mot de passe"}
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={setField("password")}
            placeholder="8 caractères minimum"
            leftIcon={<Lock size={15} />}
            rightIcon={
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
            hint={isAr ? "8 أحرف على الأقل" : "Au moins 8 caractères"}
            required fullWidth
          />
          <Input label={isAr ? "تأكيد كلمة المرور" : "Confirmer le mot de passe"} type="password" value={form.confirmPassword} onChange={setField("confirmPassword")} placeholder="••••••••" leftIcon={<Lock size={15} />} required fullWidth />

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

          {error && <p className="text-sm text-red-500 flex items-center justify-center gap-1.5"><AlertCircle size={14} />{error}</p>}

          <Button type="submit" fullWidth size="lg" loading={loading} rightIcon={<ArrowRight size={18} />}>
            {isAr ? "إنشاء حسابي" : "Créer mon compte"}
          </Button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-4">
          {isAr ? "لديك حساب بالفعل؟ " : "Déjà un compte ? "}
          <Link href={`/${locale}/connexion`} className="text-souk-green-700 font-semibold hover:underline">
            {isAr ? "تسجيل الدخول" : "Se connecter"}
          </Link>
        </p>

        <div className="mt-4 p-3 bg-souk-sand rounded-xl border border-souk-gold-200 text-center">
          <p className="text-xs font-medium text-souk-gold-700">
            🏪 {isAr ? "هل أنت بائع؟" : "Vous êtes vendeur ?"}
          </p>
          <Link href={`/${locale}/vendeurs/inscription`} className="text-xs text-souk-green-700 font-semibold hover:underline">
            {isAr ? "أنشئ متجرك المجاني" : "Créer votre boutique gratuitement"}
          </Link>
        </div>
      </div>
    </div>
  );
}

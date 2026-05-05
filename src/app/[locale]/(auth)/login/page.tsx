"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Phone, Lock, ArrowRight, AlertCircle } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const isAr = locale === "ar";

  const apiLogin = useAuthStore((s) => s.apiLogin);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiLogin({ identifier, password });
      router.push(`/${locale}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (isAr ? "بيانات غير صحيحة" : "Identifiants incorrects");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — decorative */}
      <div className="hidden lg:flex lg:flex-1 bg-souk-green-800 flex-col justify-between p-12 relative overflow-hidden">
        <Link href={`/${locale}`} className="text-2xl font-black text-white">
          سوق<span className="text-souk-gold-400">·</span>Digital
        </Link>
        <div className="text-white">
          <h2 className="text-4xl font-black mb-4 leading-tight">
            {isAr ? "مرحبًا بعودتك\nإلى سوق الرقمي" : "Bon retour\nsur Souk Digital"}
          </h2>
          <p className="text-souk-green-300 text-lg">
            {isAr ? "آلاف المنتجات الأصيلة بانتظارك" : "Des milliers de produits authentiques vous attendent"}
          </p>
          <div className="flex gap-6 mt-8">
            {[
              { n: "50K+", label: isAr ? "منتج" : "Produits" },
              { n: "1K+",  label: isAr ? "بائع" : "Vendeurs" },
              { n: "4.8★", label: isAr ? "تقييم" : "Note" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-black text-souk-gold-400">{s.n}</p>
                <p className="text-xs text-souk-green-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Zellige decorative grid */}
        <div className="absolute bottom-0 end-0 w-48 h-48 opacity-10 grid grid-cols-6 gap-1 p-3">
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className={cn("h-5 w-5 rounded-sm", i % 2 === 0 ? "bg-souk-gold-400" : "bg-white")} />
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 max-w-md mx-auto w-full lg:max-w-lg">
        <div className="mb-8 lg:hidden">
          <Link href={`/${locale}`} className="text-xl font-black text-souk-green-800">
            سوق<span className="text-souk-gold-500">·</span>Digital
          </Link>
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-1">
          {isAr ? "تسجيل الدخول" : "Connexion"}
        </h1>
        <p className="text-gray-500 mb-6">
          {isAr ? "مرحبًا بعودتك إلى سوق الرقمي" : "Bon retour sur Souk Digital"}
        </p>

        {/* Social auth */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: "🌐", label: "Google" },
            { icon: "📘", label: "Facebook" },
          ].map((s) => (
            <button key={s.label} className="flex items-center justify-center gap-2 h-11 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center"><span className="bg-white px-3 text-sm text-gray-500">{isAr ? "أو" : "ou"}</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={isAr ? "البريد الإلكتروني أو الهاتف" : "Email ou téléphone"}
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={isAr ? "example@email.com أو 0612345678" : "email@exemple.com ou 0612345678"}
            leftIcon={<Phone size={16} />}
            required fullWidth
          />
          <div>
            <Input
              label={isAr ? "كلمة المرور" : "Mot de passe"}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              required fullWidth
            />
            <div className="flex justify-end mt-1">
              <Link href={`/${locale}/mot-de-passe-oublie`} className="text-xs text-souk-green-700 hover:text-souk-green-800 hover:underline">
                {isAr ? "نسيت كلمة المرور؟" : "Mot de passe oublié ?"}
              </Link>
            </div>
          </div>

          {error && <p className="text-sm text-red-500 flex items-center justify-center gap-1.5"><AlertCircle size={14} />{error}</p>}

          <Button type="submit" fullWidth size="lg" loading={loading} rightIcon={<ArrowRight size={18} />}>
            {isAr ? "تسجيل الدخول" : "Se connecter"}
          </Button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-6">
          {isAr ? "ليس لديك حساب؟ " : "Pas encore de compte ? "}
          <Link href={`/${locale}/inscription`} className="text-souk-green-700 font-semibold hover:underline">
            {isAr ? "إنشاء حساب مجاني" : "S'inscrire gratuitement"}
          </Link>
        </p>
      </div>
    </div>
  );
}

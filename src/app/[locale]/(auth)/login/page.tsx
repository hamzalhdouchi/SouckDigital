"use client";

import { Suspense, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Phone, Lock, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAuthStore } from "@/lib/store/auth";

/* ── Zellige SVG pattern ── */
function ZelligePattern({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <pattern id="zellige-login" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <polygon
            points="20,2 21.9,15.4 27.8,12.2 24.6,18.1 31,20 24.6,21.9 27.8,27.8 21.9,24.6 20,31 18.1,24.6 12.2,27.8 15.4,21.9 9,20 15.4,18.1 12.2,12.2 18.1,15.4"
            fill="rgba(201,168,76,0.9)"
          />
          <circle cx="20" cy="20" r="2.5" fill="rgba(201,168,76,0.4)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#zellige-login)" />
    </svg>
  );
}

/* ── Moroccan arch SVG ── */
function MoroccanArch() {
  return (
    <svg viewBox="0 0 200 260" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Outer arch */}
      <path
        d="M 20,260 L 20,100 Q 20,10 100,10 Q 180,10 180,100 L 180,260"
        fill="none"
        stroke="rgba(201,168,76,0.25)"
        strokeWidth="2"
      />
      {/* Inner arch */}
      <path
        d="M 35,260 L 35,105 Q 35,28 100,28 Q 165,28 165,105 L 165,260"
        fill="none"
        stroke="rgba(201,168,76,0.15)"
        strokeWidth="1"
      />
      {/* Keyhole bulge */}
      <ellipse cx="100" cy="100" rx="60" ry="65" fill="rgba(201,168,76,0.05)" stroke="rgba(201,168,76,0.2)" strokeWidth="1" />
      {/* Top ornament */}
      <circle cx="100" cy="10" r="5" fill="rgba(201,168,76,0.4)" />
      <circle cx="100" cy="10" r="10" fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="1" />
      {/* Decorative stars at arch base */}
      <polygon points="20,220 22,227 29,227 23,231 25,238 20,234 15,238 17,231 11,227 18,227" fill="rgba(201,168,76,0.3)" />
      <polygon points="180,220 182,227 189,227 183,231 185,238 180,234 175,238 177,231 171,227 178,227" fill="rgba(201,168,76,0.3)" />
    </svg>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}

function LoginForm() {
  const params = useParams();
  const locale = params.locale as string;
  const searchParams = useSearchParams();
  const isAr = locale === "ar";

  const apiLogin = useAuthStore((s) => s.apiLogin);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { identifier?: string; password?: string } = {};
    if (!identifier.trim()) errs.identifier = isAr ? "حقل مطلوب" : "Champ requis";
    if (!password.trim()) errs.password = isAr ? "حقل مطلوب" : "Champ requis";
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setServerError("");
    setLoading(true);
    try {
      await apiLogin({ identifier: identifier.trim(), password });
      const from = searchParams.get("from");
      // Always go to homepage first — a role banner there guides to dashboard
      window.location.href = from ?? `/${locale}`;
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : (isAr ? "بيانات غير صحيحة" : "Identifiants incorrects")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white" dir={isAr ? "rtl" : "ltr"}>

      {/* ── LEFT — Decorative panel ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative overflow-hidden flex-col bg-souk-green-900">

        {/* Zellige background pattern */}
        <ZelligePattern className="absolute inset-0 w-full h-full opacity-[0.065]" />

        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-souk-green-900 via-souk-green-900/95 to-souk-green-800" />
        <div className="absolute inset-0 bg-gradient-to-t from-souk-green-900/80 via-transparent to-transparent" />

        {/* Moroccan arch — centered decorative */}
        <div className="absolute inset-0 flex items-center justify-center opacity-50 scale-125">
          <div className="w-72 h-96">
            <MoroccanArch />
          </div>
        </div>

        {/* Gold vertical accent line */}
        <div className="absolute end-0 top-12 bottom-12 w-px bg-gradient-to-b from-transparent via-souk-gold-400/60 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">

          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 w-fit">
            <span className="text-2xl font-black text-white tracking-tight">
              سوق<span className="text-souk-gold-400">·</span>Digital
            </span>
          </Link>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 bg-souk-gold-500/15 border border-souk-gold-500/30 rounded-full px-3 py-1.5 w-fit mb-6">
              <Sparkles size={13} className="text-souk-gold-400" />
              <span className="text-souk-gold-300 text-xs font-semibold tracking-wide uppercase">
                {isAr ? "Marketplace 100% مغربي" : "Marketplace 100% Marocaine"}
              </span>
            </div>

            <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-4">
              {isAr ? (
                <>مرحبًا بعودتك<br /><span className="text-souk-gold-400">إلى سوق الرقمي</span></>
              ) : (
                <>Bon retour<br /><span className="text-souk-gold-400">sur Souk Digital</span></>
              )}
            </h2>

            <p className="text-souk-green-300 text-base leading-relaxed max-w-xs">
              {isAr
                ? "آلاف المنتجات الأصيلة المغربية بانتظارك — اكتشف وتسوق بكل سهولة."
                : "Des milliers de produits authentiques vous attendent — découvrez et achetez en toute simplicité."}
            </p>

            {/* Stats */}
            <div className="flex gap-8 mt-10 pt-8 border-t border-souk-green-700/60">
              {[
                { n: "50K+", label: isAr ? "منتج" : "Produits" },
                { n: "1K+",  label: isAr ? "بائع معتمد" : "Vendeurs" },
                { n: "4.8★", label: isAr ? "تقييم" : "Note moy." },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-black text-souk-gold-400">{s.n}</p>
                  <p className="text-xs text-souk-green-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom badge */}
          <div className="flex items-center gap-2 text-souk-green-500 text-xs">
            <span>🇲🇦</span>
            <span>{isAr ? "صنع في المغرب، للمغاربة" : "Fait au Maroc, pour les Marocains"}</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT — Form panel ── */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* Top gold accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-souk-gold-300 via-souk-gold-500 to-souk-gold-300 lg:hidden" />

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 py-12 max-w-md mx-auto w-full">

          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <Link href={`/${locale}`} className="flex items-center gap-2 w-fit">
              <span className="text-xl font-black text-souk-green-800 tracking-tight">
                سوق<span className="text-souk-gold-500">·</span>Digital
              </span>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-1 rounded-full bg-souk-gold-500" />
              <h1 className="text-2xl font-black text-gray-900">
                {isAr ? "تسجيل الدخول" : "Connexion"}
              </h1>
            </div>
            <p className="text-gray-500 text-sm ps-3">
              {isAr ? "مرحبًا بك مجددًا في سوق الرقمي" : "Bon retour sur Souk Digital"}
            </p>
          </div>

          {/* Social auth */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              className="flex items-center justify-center gap-2 h-11 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 shadow-sm"
            >
              <GoogleIcon />
              <span>Google</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 h-11 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 shadow-sm"
            >
              <FacebookIcon />
              <span>Facebook</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs font-medium text-gray-400 uppercase tracking-widest">
                {isAr ? "أو بالبريد / الهاتف" : "ou par email / tél"}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label={isAr ? "البريد الإلكتروني أو الهاتف" : "Email ou téléphone"}
              type="text"
              placeholder={isAr ? "example@email.com أو 0612345678" : "email@exemple.com ou 0612345678"}
              leftIcon={<Phone size={16} />}
              fullWidth
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              error={fieldErrors.identifier}
            />

            <div>
              <Input
                label={isAr ? "كلمة المرور" : "Mot de passe"}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                leftIcon={<Lock size={16} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-gray-400 hover:text-souk-green-700 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={fieldErrors.password}
              />
              <div className="flex justify-end mt-1.5">
                <Link
                  href={`/${locale}/mot-de-passe-oublie`}
                  className="text-xs text-souk-green-700 hover:text-souk-green-900 hover:underline font-medium"
                >
                  {isAr ? "نسيت كلمة المرور؟" : "Mot de passe oublié ?"}
                </Link>
              </div>
            </div>

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
              loading={loading}
              rightIcon={<ArrowRight size={18} />}
              className="mt-2 rounded-xl"
            >
              {isAr ? "تسجيل الدخول" : "Se connecter"}
            </Button>
          </form>

          {/* Register link */}
          <p className="text-sm text-center text-gray-500 mt-6">
            {isAr ? "ليس لديك حساب؟ " : "Pas encore de compte ? "}
            <Link
              href={`/${locale}/register`}
              className="text-souk-green-700 font-bold hover:text-souk-green-900 hover:underline"
            >
              {isAr ? "إنشاء حساب مجاني" : "S'inscrire gratuitement"}
            </Link>
          </p>

          {/* Vendor CTA */}
          <div className="mt-6 p-4 bg-souk-sand rounded-2xl border border-souk-gold-200 flex items-center gap-3">
            <span className="text-2xl">🏪</span>
            <div>
              <p className="text-xs font-bold text-souk-green-800">
                {isAr ? "هل أنت بائع؟" : "Vous êtes vendeur ?"}
              </p>
              <Link
                href={`/${locale}/account/become-vendor`}
                className="text-xs text-souk-gold-600 font-semibold hover:underline"
              >
                {isAr ? "انضم كبائع مجانًا ←" : "Rejoindre comme vendeur →"}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom gold bar on mobile */}
        <div className="h-1 w-full bg-gradient-to-r from-souk-gold-300 via-souk-gold-500 to-souk-gold-300 lg:hidden" />
      </div>
    </div>
  );
}

/* ── Social icons ── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
        fill="#1877F2"
      />
    </svg>
  );
}

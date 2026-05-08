"use client";

import Link from "next/link";
import { LayoutDashboard, Store, ArrowRight, X } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  locale: string;
}

export default function DashboardBanner({ locale }: Props) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [dismissed, setDismissed] = useState(false);

  if (!isAuthenticated || !user || dismissed) return null;
  if (user.role !== "ADMIN" && user.role !== "VENDOR") return null;

  const isAdmin = user.role === "ADMIN";
  const isAr = locale === "ar";

  const dashHref = isAdmin ? `/${locale}/admin` : `/${locale}/vendeur/dashboard`;

  return (
    <div className={cn(
      "relative flex items-center gap-3 px-4 py-3 text-sm font-medium",
      isAdmin
        ? "bg-souk-green-900 text-white"
        : "bg-souk-gold-500 text-souk-green-900",
    )}>
      {/* Icon */}
      <div className={cn(
        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
        isAdmin ? "bg-white/10" : "bg-souk-green-900/10",
      )}>
        {isAdmin ? <LayoutDashboard size={14} /> : <Store size={14} />}
      </div>

      {/* Text */}
      <span className="flex-1">
        {isAr ? (
          isAdmin
            ? `مرحبًا ${user.firstName}، أنت مسجل دخول كمسؤول`
            : `مرحبًا ${user.firstName}، أنت مسجل دخول كبائع`
        ) : (
          isAdmin
            ? `Bonjour ${user.firstName}, vous êtes connecté en tant qu'administrateur`
            : `Bonjour ${user.firstName}, vous êtes connecté en tant que vendeur`
        )}
      </span>

      {/* CTA */}
      <Link
        href={dashHref}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors shrink-0",
          isAdmin
            ? "bg-souk-gold-400 text-souk-green-900 hover:bg-souk-gold-300"
            : "bg-souk-green-900 text-white hover:bg-souk-green-800",
        )}
      >
        {isAr ? "لوحة التحكم" : "Tableau de bord"}
        <ArrowRight size={13} className={isAr ? "rotate-180" : ""} />
      </Link>

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded opacity-60 hover:opacity-100 transition-opacity shrink-0"
        aria-label="Fermer"
      >
        <X size={14} />
      </button>
    </div>
  );
}

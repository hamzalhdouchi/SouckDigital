"use client";

import { useState } from "react";
import { CheckCircle, X } from "lucide-react";
import Button from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

interface PromoInputProps {
  isAr?: boolean;
}

export function PromoInput({ isAr = false }: PromoInputProps) {
  const { applyPromo, removePromo, promoCode, discount } = useCartStore();
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const handleApply = async () => {
    if (!input.trim()) return;
    setStatus("loading");
    const ok = await applyPromo(input.trim());
    if (ok) {
      setInput("");
      setStatus("idle");
    } else {
      setStatus("error");
    }
  };

  const handleRemove = () => {
    removePromo();
    setInput("");
    setStatus("idle");
  };

  if (promoCode) {
    return (
      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
        <div className="flex items-center gap-2 text-sm text-emerald-700">
          <CheckCircle size={15} />
          <span className="font-semibold">{promoCode}</span>
          <span className="text-emerald-600">
            {isAr ? `خصم ${discount}%` : `-${discount}%`}
          </span>
        </div>
        <button
          onClick={handleRemove}
          className="p-1 rounded-lg text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 transition-colors"
          aria-label={isAr ? "إزالة الكود" : "Supprimer le code"}
        >
          <X size={15} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => { setInput(e.target.value); setStatus("idle"); }}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
          placeholder={isAr ? "أدخل الرمز" : "Entrez votre code"}
          className={cn(
            "flex-1 h-10 border rounded-lg px-3 text-sm focus:outline-none focus:ring-2",
            status === "error"
              ? "border-red-400 focus:ring-red-300"
              : "border-gray-300 focus:ring-souk-gold-400",
          )}
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={handleApply}
          loading={status === "loading"}
          disabled={!input.trim()}
        >
          {isAr ? "تطبيق" : "Appliquer"}
        </Button>
      </div>
      {status === "error" && (
        <p className="text-xs text-red-500 mt-1">
          {isAr ? "الرمز غير صالح أو منتهي الصلاحية" : "Code invalide ou expiré"}
        </p>
      )}
      {!input && status === "idle" && (
        <p className="text-xs text-gray-400 mt-1">
          {isAr ? "جرّب: SOUK10 أو ARTISAN20" : "Essayez : SOUK10, ARTISAN20, BIENVENUE15"}
        </p>
      )}
    </div>
  );
}

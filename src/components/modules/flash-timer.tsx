"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface FlashTimerProps {
  endsAt: Date;
  className?: string;
  locale?: string;
}

function pad(n: number) { return String(n).padStart(2, "0"); }

export default function FlashTimer({ endsAt, className, locale = "fr" }: FlashTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, endsAt.getTime() - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  const labels = locale === "ar"
    ? { h: "س", m: "د", s: "ث" }
    : { h: "h", m: "min", s: "s" };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {(["h", "m", "s"] as const).map((unit) => (
        <div key={unit} className="flex items-center gap-1">
          <div className="bg-souk-green-800 text-white font-bold text-sm rounded-lg px-2 py-1 min-w-[2rem] text-center countdown-digit">
            {pad(timeLeft[unit])}
          </div>
          <span className="text-xs text-gray-500 font-medium">{labels[unit]}</span>
        </div>
      ))}
    </div>
  );
}

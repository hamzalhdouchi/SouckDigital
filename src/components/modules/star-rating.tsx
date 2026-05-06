"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value?: number;
  onChange?: (v: number) => void;
  max?: number;
  size?: number;
  className?: string;
}

export function StarRating({ value = 0, onChange, max = 5, size = 16, className }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const interactive = !!onChange;
  const display = hovered ?? value;

  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;

        if (interactive) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(starValue)}
              onMouseEnter={() => setHovered(starValue)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer transition-transform hover:scale-110 focus:outline-none"
            >
              <Star
                size={size}
                className={cn(
                  "transition-colors",
                  starValue <= display
                    ? "fill-souk-gold-500 text-souk-gold-500"
                    : "fill-gray-200 text-gray-200",
                )}
              />
            </button>
          );
        }

        const filled = starValue <= Math.floor(display);
        const half = !filled && starValue - 0.5 <= display;

        return (
          <span key={i} className="relative inline-flex shrink-0">
            <Star size={size} className="fill-gray-200 text-gray-200" />
            {(filled || half) && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: filled ? "100%" : "50%" }}
              >
                <Star size={size} className="fill-souk-gold-500 text-souk-gold-500" />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

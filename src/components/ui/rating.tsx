import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface RatingProps {
  value: number;
  count?: number;
  size?: "sm" | "md";
  showCount?: boolean;
  className?: string;
}

export default function Rating({ value, count, size = "sm", showCount = true, className }: RatingProps) {
  const starSize = size === "sm" ? 12 : 16;
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={starSize}
            className={star <= Math.round(value) ? "fill-souk-gold-500 text-souk-gold-500" : "fill-gray-200 text-gray-200"}
          />
        ))}
      </div>
      <span className={cn("font-semibold text-gray-800", size === "sm" ? "text-xs" : "text-sm")}>
        {value.toFixed(1)}
      </span>
      {showCount && count !== undefined && (
        <span className={cn("text-gray-500", size === "sm" ? "text-xs" : "text-sm")}>
          ({count})
        </span>
      )}
    </div>
  );
}

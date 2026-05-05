import { cn } from "@/lib/utils";

type BadgeVariant = "artisan" | "sale" | "new" | "top" | "verified" | "flash" | "free" | "default";

const variants: Record<BadgeVariant, string> = {
  artisan:  "bg-souk-gold-100 text-souk-gold-700 border border-souk-gold-300",
  sale:     "bg-souk-terracotta-100 text-souk-terracotta-700 border border-souk-terracotta-500/30",
  new:      "bg-souk-green-100 text-souk-green-700 border border-souk-green-300",
  top:      "bg-amber-50 text-amber-700 border border-amber-300",
  verified: "bg-souk-green-100 text-souk-green-700 border border-souk-green-300",
  flash:    "bg-red-50 text-red-700 border border-red-300",
  free:     "bg-emerald-50 text-emerald-700 border border-emerald-300",
  default:  "bg-gray-100 text-gray-600 border border-gray-200",
};

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

export default function Badge({ variant = "default", className, children }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-semibold",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}

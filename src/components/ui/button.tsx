import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "gold";
type Size = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variants: Record<Variant, string> = {
  primary:   "bg-souk-green-800 text-white hover:bg-souk-green-700 active:bg-souk-green-900 shadow-sm",
  secondary: "bg-souk-green-100 text-souk-green-800 hover:bg-souk-green-200 active:bg-souk-green-300",
  outline:   "border border-souk-green-800 text-souk-green-800 hover:bg-souk-green-50 active:bg-souk-green-100",
  ghost:     "text-souk-green-800 hover:bg-souk-green-50 active:bg-souk-green-100",
  danger:    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm",
  gold:      "bg-souk-gold-500 text-white hover:bg-souk-gold-600 active:bg-souk-gold-700 shadow-sm",
};

const sizes: Record<Size, string> = {
  xs: "h-7 px-2.5 text-xs gap-1",
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-6 text-base gap-2",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, fullWidth, leftIcon, rightIcon, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-souk-gold-500 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed select-none",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Spinner size="sm" />
          {children}
        </span>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  )
);
Button.displayName = "Button";
export default Button;

function Spinner({ size }: { size: "sm" | "md" }) {
  const s = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <svg className={cn(s, "animate-spin")} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

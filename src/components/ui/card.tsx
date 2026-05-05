import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: boolean;
}

export default function Card({ hover, padding = true, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-100",
        "shadow-[0_1px_4px_0_rgb(0_0_0/0.06),0_4px_16px_0_rgb(0_0_0/0.06)]",
        hover && "transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_0_rgb(0_0_0/0.1)]",
        padding && "p-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

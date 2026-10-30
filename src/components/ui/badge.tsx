import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#C5A880] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border border-slate-200 bg-slate-100 text-[#0A192F]",
        secondary:
          "border border-slate-200 bg-white text-[#0A192F]",
        destructive:
          "border-transparent bg-rose-600 text-white font-medium",
        outline:
          "border border-slate-300 text-[#0A192F] bg-white",
        warning:
          "border border-amber-300 bg-amber-50 text-amber-900",
        accent:
          "border border-[#C5A880]/40 bg-slate-50 text-[#C5A880]",
        published:
          "border-transparent bg-[#0A192F] text-white font-semibold",
        draft:
          "border border-slate-200 bg-slate-100 text-slate-700 font-medium",
        closed:
          "border-transparent bg-slate-700 text-white font-medium",
        black:
          "border-transparent bg-[#0A192F] text-white font-medium",
        forest:
          "border-transparent bg-[#0A192F] text-white font-medium",
        terracotta:
          "border-transparent bg-[#C5A880] text-[#0A192F] font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

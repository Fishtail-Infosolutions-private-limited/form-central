import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-saffron focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border border-cream-dark bg-soft-cream text-charcoal",
        secondary:
          "border border-cream-dark bg-white text-charcoal",
        destructive:
          "border-transparent bg-rose-600 text-white font-medium",
        outline:
          "border border-cream-dark text-charcoal bg-white",
        warning:
          "border border-amber-300 bg-amber-50 text-amber-900",
        accent:
          "border border-antique-gold/40 bg-soft-cream text-antique-gold",
        published:
          "border-transparent bg-maroon text-white font-semibold",
        draft:
          "border border-cream-dark bg-soft-cream text-stone-700 font-medium",
        closed:
          "border-transparent bg-stone-700 text-white font-medium",
        black:
          "border-transparent bg-maroon text-white font-medium",
        forest:
          "border-transparent bg-maroon text-white font-medium",
        terracotta:
          "border-transparent bg-saffron text-white font-bold",
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

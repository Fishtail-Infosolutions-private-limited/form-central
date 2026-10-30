import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-emerald-100 text-emerald-900 border border-emerald-200",
        secondary:
          "border-transparent bg-zinc-100 text-zinc-800",
        destructive:
          "border-transparent bg-zinc-900 text-white font-medium",
        outline:
          "border border-zinc-200 text-zinc-800 bg-white",
        warning:
          "border-transparent bg-emerald-50 text-emerald-800 border border-emerald-200",
        accent:
          "border-transparent bg-emerald-100 text-emerald-900 border border-emerald-200",
        published:
          "border-transparent bg-emerald-600 text-white font-semibold",
        draft:
          "border-transparent bg-zinc-200 text-zinc-800 font-medium",
        closed:
          "border-transparent bg-black text-white font-medium",
        black:
          "border-transparent bg-black text-white font-medium",
        forest:
          "border-transparent bg-emerald-900 text-emerald-100 font-medium",
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

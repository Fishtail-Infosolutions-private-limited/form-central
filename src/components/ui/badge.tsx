import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border border-[#E8DFD0] bg-[#FAF5EE] text-[#292821]",
        secondary:
          "border border-[#E8DFD0] bg-[#E8DFD0]/60 text-[#292821]",
        destructive:
          "border-transparent bg-[#A64B36] text-white font-medium",
        outline:
          "border border-[#E8DFD0] text-[#292821] bg-white",
        warning:
          "border border-[#B69A65]/40 bg-[#FAF5EE] text-[#B69A65]",
        accent:
          "border border-[#B69A65]/40 bg-[#FAF5EE] text-[#A64B36]",
        published:
          "border-transparent bg-[#292821] text-[#F5F0E6] font-semibold",
        draft:
          "border border-[#E8DFD0] bg-[#FAF5EE] text-[#3C332A] font-medium",
        closed:
          "border-transparent bg-[#3C332A] text-white font-medium",
        black:
          "border-transparent bg-[#292821] text-white font-medium",
        forest:
          "border-transparent bg-[#292821] text-[#F5F0E6] font-medium",
        terracotta:
          "border-transparent bg-[#A64B36] text-white font-medium",
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

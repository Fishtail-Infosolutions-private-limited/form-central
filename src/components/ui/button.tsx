import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B69A65] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[#292821] text-[#F5F0E6] shadow-xs hover:bg-[#3C332A] active:bg-[#1E1D18]",
        destructive:
          "bg-[#A64B36] text-white shadow-xs hover:bg-[#8F3E2C] active:bg-[#783323]",
        outline:
          "border border-[#E8DFD0] bg-[#FFFFFF] text-[#292821] shadow-xs hover:bg-[#FAF5EE] hover:border-[#B69A65]/50",
        secondary:
          "bg-[#FAF5EE] text-[#292821] border border-[#E8DFD0] shadow-xs hover:bg-[#E8DFD0]",
        ghost:
          "text-[#292821] hover:bg-[#FAF5EE] hover:text-[#292821]",
        link:
          "text-[#A64B36] underline-offset-4 hover:underline",
        terracotta:
          "bg-[#A64B36] text-white shadow-xs hover:bg-[#8F3E2C] active:bg-[#783323]",
        accent:
          "bg-[#B69A65] text-[#292821] font-semibold hover:bg-[#A38752]",
        black:
          "bg-[#292821] text-white shadow-xs hover:bg-[#3C332A] active:bg-[#1E1D18]",
        forest:
          "bg-[#292821] text-[#F5F0E6] shadow-xs hover:bg-[#3C332A] active:bg-[#1E1D18]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

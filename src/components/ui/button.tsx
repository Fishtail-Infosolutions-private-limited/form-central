import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[#0A192F] text-white shadow-xs hover:bg-[#162C4E] active:bg-[#071324]",
        destructive:
          "bg-rose-600 text-white shadow-xs hover:bg-rose-700 active:bg-rose-800",
        outline:
          "border border-slate-200 bg-white text-[#0A192F] shadow-xs hover:bg-slate-50 hover:border-[#C5A880]/60",
        secondary:
          "bg-slate-100 text-[#0A192F] border border-slate-200 shadow-xs hover:bg-slate-200",
        ghost:
          "text-[#0A192F] hover:bg-slate-100 hover:text-[#0A192F]",
        link:
          "text-[#0A192F] hover:text-[#C5A880] underline-offset-4 hover:underline",
        terracotta:
          "bg-[#C5A880] text-[#0A192F] font-bold shadow-xs hover:bg-[#B59870]",
        accent:
          "bg-[#C5A880] text-[#0A192F] font-bold shadow-xs hover:bg-[#B59870]",
        black:
          "bg-[#0A192F] text-white shadow-xs hover:bg-[#162C4E] active:bg-[#071324]",
        forest:
          "bg-[#0A192F] text-white shadow-xs hover:bg-[#162C4E]",
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

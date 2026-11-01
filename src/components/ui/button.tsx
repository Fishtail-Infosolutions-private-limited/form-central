import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-maroon text-white shadow-xs hover:bg-maroon-dark active:bg-maroon-dark",
        destructive:
          "bg-rose-600 text-white shadow-xs hover:bg-rose-700 active:bg-rose-800",
        outline:
          "border border-cream-dark bg-white text-charcoal shadow-xs hover:bg-soft-cream hover:border-antique-gold",
        secondary:
          "bg-soft-cream text-charcoal border border-cream-dark shadow-xs hover:bg-cream-dark",
        ghost:
          "text-charcoal hover:bg-soft-cream hover:text-maroon",
        link:
          "text-maroon hover:text-saffron underline-offset-4 hover:underline",
        terracotta:
          "bg-saffron text-white font-bold shadow-xs hover:bg-saffron-dark",
        accent:
          "bg-saffron text-white font-bold shadow-xs hover:bg-saffron-dark",
        black:
          "bg-maroon text-white shadow-xs hover:bg-maroon-dark active:bg-maroon-dark",
        forest:
          "bg-maroon text-white shadow-xs hover:bg-maroon-dark",
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

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800",
        destructive:
          "bg-zinc-900 text-white shadow-sm hover:bg-black active:bg-zinc-800",
        outline:
          "border border-zinc-200 bg-white text-zinc-900 shadow-xs hover:bg-zinc-50 hover:border-zinc-300",
        secondary:
          "bg-zinc-100 text-zinc-900 shadow-xs hover:bg-zinc-200",
        ghost:
          "text-zinc-700 hover:bg-zinc-100 hover:text-black",
        link:
          "text-emerald-600 underline-offset-4 hover:underline",
        accent:
          "bg-emerald-800 text-white shadow-sm hover:bg-emerald-900 active:bg-emerald-950",
        black:
          "bg-black text-white shadow-sm hover:bg-zinc-800 active:bg-zinc-900",
        forest:
          "bg-emerald-900 text-white shadow-sm hover:bg-emerald-950 active:bg-black",
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

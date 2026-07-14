import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#050915] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_12px_34px_rgba(255,216,77,0.16)] hover:-translate-y-0.5 hover:bg-[#f4c430] hover:shadow-[0_16px_42px_rgba(255,216,77,0.24)]",
        outline:
          "border border-yellow-300/15 bg-white/[0.035] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md hover:-translate-y-0.5 hover:border-yellow-300/30 hover:bg-yellow-300/[0.08]",
        ghost: "text-white/75 hover:bg-yellow-300/[0.08] hover:text-white",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 rounded-lg px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-semibold transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#cfab71] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#713105] text-[#fff7e8] shadow-xs hover:bg-[#341100] active:bg-[#341100]",
        destructive:
          "bg-red-700 text-white shadow-xs hover:bg-red-800 border border-red-800",
        outline:
          "border border-[#e8decf] bg-white shadow-2xs hover:bg-[#fff7e8] hover:border-[#cfab71] text-[#713105]",
        secondary:
          "bg-[#fff7e8] text-[#713105] border border-[#e8decf] shadow-2xs hover:bg-[#fcf3e3] hover:border-[#cfab71]/60",
        ghost:
          "hover:bg-[#fff7e8] text-[#4f351c] hover:text-[#341100]",
        link:
          "text-[#713105] underline-offset-4 hover:underline hover:text-[#341100]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-10 rounded-xl px-8 text-sm",
        icon: "h-9 w-9",
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

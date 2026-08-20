import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-stone-400",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#2C221E] text-white shadow-xs",
        secondary:
          "border-transparent bg-stone-100 text-stone-900",
        destructive:
          "border-transparent bg-red-50 text-red-700 font-bold",
        success:
          "border-transparent bg-emerald-50 text-emerald-700 font-medium",
        warning:
          "border-transparent bg-amber-50 text-amber-800 font-medium",
        outline: "text-stone-900 border-stone-200",
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

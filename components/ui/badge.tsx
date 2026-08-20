import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#cfab71]",
  {
    variants: {
      variant: {
        default:
          "border-[#713105] bg-[#713105] text-[#fff7e8] shadow-2xs",
        secondary:
          "border-[#e8decf] bg-[#fff7e8] text-[#713105]",
        crema:
          "border-[#cfab71]/60 bg-[#fcf3e3] text-[#713105] font-bold",
        destructive:
          "border-red-200/80 bg-red-50 text-red-700 font-bold",
        success:
          "border-emerald-200/80 bg-emerald-50 text-emerald-700 font-semibold",
        warning:
          "border-amber-200/80 bg-amber-50 text-[#713105] font-semibold",
        outline:
          "border-[#e8decf] bg-white text-[#4f351c]",
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

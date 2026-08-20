import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-xl border border-[#e8decf] bg-[#fff7e8] px-3 py-1 text-xs text-[#341100] transition-all file:border-0 file:bg-transparent file:text-xs file:font-semibold placeholder:text-[#7f5e35]/60 focus-visible:outline-hidden focus-visible:bg-white focus-visible:border-[#cfab71] focus-visible:ring-1 focus-visible:ring-[#cfab71] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };

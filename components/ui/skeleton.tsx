import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-[#e8decf]/60",
        className
      )}
      {...props}
    />
  );
}

export function TableSkeleton({
  columns = 6,
  rows = 5,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="border-b border-[#e8decf]/40 animate-in fade-in duration-200">
          {Array.from({ length: columns }).map((_, cIdx) => (
            <td key={cIdx} className="py-3.5 px-4">
              <Skeleton
                className={cn(
                  "h-4 rounded-md",
                  cIdx === 0
                    ? "w-20"
                    : cIdx === 1
                    ? "w-36"
                    : cIdx === columns - 1
                    ? "w-20 ml-auto"
                    : "w-24"
                )}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="border border-[#e8decf] bg-white p-5 rounded-2xl shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24 rounded-md" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <Skeleton className="h-7 w-32 rounded-lg" />
      <Skeleton className="h-4 w-20 rounded-md" />
    </div>
  );
}

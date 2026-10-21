import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  indicatorColor?: string;
}

export function Progress({
  value,
  className,
  indicatorColor = "bg-gradient-to-r from-indigo-500 to-violet-500",
  ...props
}: ProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div
      className={cn(
        "relative h-2.5 w-full overflow-hidden rounded-full bg-slate-800 border border-slate-700/50",
        className
      )}
      {...props}
    >
      <div
        className={cn("h-full transition-all duration-300 ease-out", indicatorColor)}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}

import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "danger" | "warning" | "outline" | "accent";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    secondary: "bg-slate-800 text-slate-300 border-slate-700",
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    danger: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    outline: "bg-transparent text-slate-300 border-slate-700",
    accent: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors select-none",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

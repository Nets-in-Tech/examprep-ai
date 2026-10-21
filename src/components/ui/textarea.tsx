import React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn(
            "flex min-h-[140px] w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all font-sans",
            error && "border-rose-500/80 focus-visible:ring-rose-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-rose-400 font-medium">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

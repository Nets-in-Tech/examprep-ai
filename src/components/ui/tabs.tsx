"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 select-none cursor-pointer",
              isActive
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 border border-indigo-500/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            )}
          >
            {tab.icon && <span className="text-base">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && (
              <span
                className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider",
                  isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

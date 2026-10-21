"use client";

import React from "react";
import { PRESET_DOMAINS_LIST } from "@/lib/ai/sampleQuizzes";
import { Badge } from "@/components/ui/badge";
import { Cloud, Shield, Server, Code, Check } from "lucide-react";

interface DomainSelectorProps {
  selectedDomain: string;
  onSelectDomain: (domain: string) => void;
}

export function DomainSelector({ selectedDomain, onSelectDomain }: DomainSelectorProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "cloud":
        return <Cloud className="h-4 w-4 text-cyan-400" />;
      case "security":
        return <Shield className="h-4 w-4 text-emerald-400" />;
      case "devops":
        return <Server className="h-4 w-4 text-indigo-400" />;
      case "coding":
        return <Code className="h-4 w-4 text-amber-400" />;
      default:
        return <Cloud className="h-4 w-4 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200">
          Select Standard Certification or Tech Domain
        </label>
        <span className="text-xs text-indigo-400 font-medium">Curated Exam Blueprints</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {PRESET_DOMAINS_LIST.map((preset) => {
          const isSelected = selectedDomain === preset.code || selectedDomain === preset.title;

          return (
            <div
              key={preset.id}
              onClick={() => onSelectDomain(preset.code)}
              className={`relative rounded-2xl p-4 cursor-pointer transition-all border ${
                isSelected
                  ? "bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/15 ring-1 ring-indigo-500/50"
                  : "bg-slate-900/50 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 border border-slate-700">
                    {getCategoryIcon(preset.category)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{preset.title}</span>
                    </h4>
                    <span className="text-xs font-mono text-indigo-400 font-semibold">
                      {preset.code}
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <Badge variant="outline" className="text-[10px]">
                    {preset.badge}
                  </Badge>
                )}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-3">{preset.description}</p>

              {/* Sample Topic Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-800/60">
                {preset.sampleTopics.slice(0, 3).map((topic, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/50"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

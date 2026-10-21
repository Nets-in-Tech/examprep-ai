"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Globe, Sparkles, ExternalLink, ShieldCheck } from "lucide-react";

interface UrlInputProps {
  value: string;
  onChange: (val: string) => void;
}

const SAMPLE_URLS = [
  {
    name: "Wikipedia: Cloud Computing",
    url: "https://en.wikipedia.org/wiki/Cloud_computing",
  },
  {
    name: "Wikipedia: Microservices",
    url: "https://en.wikipedia.org/wiki/Microservices",
  },
  {
    name: "Wikipedia: Computer Security",
    url: "https://en.wikipedia.org/wiki/Computer_security",
  },
];

export function UrlInput({ value, onChange }: UrlInputProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Globe className="h-4 w-4 text-emerald-400" />
          <span>Enter Documentation, Technical Blog, or Article URL</span>
        </label>
        <span className="text-xs text-slate-400">Public HTTP / HTTPS web pages</span>
      </div>

      <div className="relative">
        <Input
          type="url"
          placeholder="https://en.wikipedia.org/wiki/Cloud_computing"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 text-sm pl-4 pr-10 font-mono"
        />
        <div className="absolute right-3 top-3.5 text-slate-500">
          <Globe className="h-5 w-5" />
        </div>
      </div>

      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3 flex items-start gap-2.5 text-xs text-slate-400">
        <ShieldCheck className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
        <span>
          Our backend crawler extracts the core pedagogical text using <strong>cheerio</strong>, automatically stripping advertisements, cookie prompts, and navigation sidebars.
        </span>
      </div>

      {/* 1-Click Sample URLs */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Test immediately with sample public documentation URLs:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_URLS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(sample.url)}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 hover:text-white transition-all flex items-center gap-1.5"
            >
              <ExternalLink className="h-3 w-3 text-emerald-400" />
              <span>{sample.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

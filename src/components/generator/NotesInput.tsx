"use client";

import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, FileText, BookOpen } from "lucide-react";

interface NotesInputProps {
  value: string;
  onChange: (val: string) => void;
}

const SAMPLE_NOTES = [
  {
    title: "System Design: Microservices & Event Sourcing",
    content: `# System Design: Microservices & Event Sourcing Architecture
- Microservices decouple monolithic software into independent deployable units communicating via REST, gRPC, or message brokers (Kafka/RabbitMQ).
- The Database-per-Service pattern ensures autonomous service boundaries, but requires distributed transaction management.
- Saga Pattern: Coordinates distributed transactions across multiple microservices without 2-phase commit. Choreography uses domain events without a central coordinator; Orchestration uses an orchestrator service.
- Event Sourcing: State changes are captured as an immutable sequence of events in an append-only event store instead of updating records in-place.
- CQRS (Command Query Responsibility Segregation): Separates read operations (optimized projection views) from write operations (domain aggregate commands).
- Circuit Breakers: Prevent cascading failure by tripping open when error rates cross thresholds (e.g., Netflix Hystrix or Resilience4j).`,
  },
  {
    title: "Biology 101: Cellular Respiration",
    content: `# Cellular Respiration & ATP Synthesis
- Cellular respiration is the catabolic pathway that breaks down glucose in the presence of oxygen to generate ATP, CO2, and H2O.
- Glycolysis: Occurs in the cytoplasm. Converts 1 glucose into 2 pyruvate molecules, yielding a net of 2 ATP and 2 NADH. Does not require oxygen.
- Krebs Cycle (Citric Acid Cycle): Occurs in the mitochondrial matrix. Acetyl-CoA combines with oxaloacetate to produce citrate. Generates NADH, FADH2, and 2 ATP per glucose.
- Electron Transport Chain (ETC) & Oxidative Phosphorylation: Located on the inner mitochondrial membrane (cristae). Electrons from NADH and FADH2 pass through complexes I-IV, pumping protons into the intermembrane space.
- ATP Synthase: Uses the proton-motive force (chemiosmosis) to phosphorylate ADP into ATP, generating ~30-32 ATP per glucose.
- Anaerobic fermentation occurs when oxygen is absent, regenerating NAD+ via lactic acid fermentation or ethanol fermentation.`,
  },
  {
    title: "React 19 & Modern Web Architecture",
    content: `# React 19 Core Architectural Paradigm
- React Server Components (RSC): Execute strictly on the server during build or on-demand request time, with zero impact on client bundle size. Server components can directly access databases, file systems, and internal microservices.
- Client Components ('use client'): Opt-in boundaries for client-side interactivity, state (useState/useReducer), and browser APIs (window, DOM listeners).
- Server Actions ('use server'): Async functions called from client forms or event handlers that execute securely on the server and automatically revalidate cached data.
- React Compiler: Automatically memoizes component subtrees and hooks (eliminating manual useMemo and useCallback boilerplate).
- Suspense & Streaming: Allows progressive rendering where heavy components stream HTML chunks to the browser as soon as server promises resolve.`,
  },
];

export function NotesInput({ value, onChange }: NotesInputProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <FileText className="h-4 w-4 text-indigo-400" />
          <span>Paste Study Notes, Lecture Transcripts, or Markdown</span>
        </label>
        <div className="text-xs text-slate-400">
          {value.length > 0 ? `${value.length} characters` : "Minimum ~30 characters"}
        </div>
      </div>

      <Textarea
        placeholder="Paste your notes or study guides here (Markdown, outlines, key terms, definitions)..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[220px] font-mono text-xs leading-relaxed"
      />

      {/* 1-Click Sample Notes Presets */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Need a quick test? Load sample study material in 1 click:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_NOTES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(sample.content)}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 hover:text-white transition-all flex items-center gap-1.5"
            >
              <BookOpen className="h-3 w-3 text-indigo-400" />
              <span>{sample.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

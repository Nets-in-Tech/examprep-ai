"use client";

import React from "react";
import { QuizDifficulty } from "@/types/quiz";
import { Sliders, Zap, Timer } from "lucide-react";

interface QuizConfigPanelProps {
  questionCount: number;
  onQuestionCountChange: (count: number) => void;
  difficulty: QuizDifficulty;
  onDifficultyChange: (diff: QuizDifficulty) => void;
  practiceMode: boolean;
  onPracticeModeChange: (practice: boolean) => void;
}

export function QuizConfigPanel({
  questionCount,
  onQuestionCountChange,
  difficulty,
  onDifficultyChange,
  practiceMode,
  onPracticeModeChange,
}: QuizConfigPanelProps) {
  const counts = [5, 10, 15, 20];
  const difficulties: { id: QuizDifficulty; label: string; desc: string }[] = [
    { id: "beginner", label: "Fundamental", desc: "Core definitions & syntax" },
    { id: "intermediate", label: "Intermediate", desc: "Standard multi-choice scenarios" },
    { id: "advanced", label: "Advanced", desc: "Complex enterprise edge cases" },
    { id: "exam_simulation", label: "Exam Simulation", desc: "Official cert-style distractor traps" },
  ];

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
        <Sliders className="h-4 w-4 text-indigo-400" />
        <span>Exam Parameters & Simulation Settings</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Question Count */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400">Number of Questions</label>
          <div className="grid grid-cols-4 gap-2">
            {counts.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onQuestionCountChange(c)}
                className={`h-9 rounded-xl text-xs font-semibold border transition-all ${
                  questionCount === c
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30"
                    : "bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {c} Qs
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400">Target Difficulty</label>
          <div className="relative">
            <select
              value={difficulty}
              onChange={(e) => onDifficultyChange(e.target.value as QuizDifficulty)}
              className="w-full h-9 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 text-xs text-slate-100 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
            >
              {difficulties.map((d) => (
                <option key={d.id} value={d.id} className="bg-slate-900 text-slate-100">
                  {d.label} — {d.desc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Practice Mode vs Exam Simulation */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400">Study Experience</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onPracticeModeChange(true)}
              className={`h-9 px-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                practiceMode
                  ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/50"
                  : "bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200"
              }`}
            >
              <Zap className="h-3.5 w-3.5 text-indigo-400" />
              <span>Instant Rationale</span>
            </button>
            <button
              type="button"
              onClick={() => onPracticeModeChange(false)}
              className={`h-9 px-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                !practiceMode
                  ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/50"
                  : "bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200"
              }`}
            >
              <Timer className="h-3.5 w-3.5 text-amber-400" />
              <span>Timed Exam</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

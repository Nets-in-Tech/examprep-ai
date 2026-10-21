"use client";

import React from "react";
import { QuizQuestion, QuizOption } from "@/types/quiz";
import { useQuizStore } from "@/store/useQuizStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  BookOpen,
  Info,
  Lightbulb,
  HelpCircle,
  Strikethrough,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface QuestionCardProps {
  question: QuizQuestion;
  isEliminateMode: boolean;
}

export function QuestionCard({ question, isEliminateMode }: QuestionCardProps) {
  const {
    userAnswers,
    selectOption,
    eliminatedOptions,
    toggleEliminateOption,
    practiceMode,
  } = useQuizStore();

  const currentAnswer = userAnswers[question.id];
  const isAnswered = Boolean(currentAnswer);
  const eliminatedList = eliminatedOptions[question.id] || [];

  const handleOptionClick = (optionId: string) => {
    if (isEliminateMode) {
      toggleEliminateOption(question.id, optionId);
    } else {
      selectOption(question.id, optionId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Question Card */}
      <Card className="border-slate-800 bg-slate-900/80 p-6 md:p-8 backdrop-blur-xl shadow-2xl shadow-black/40">
        <CardContent className="p-0 space-y-6">
          {/* Header Info: Topic & Vignette */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Question {question.order}
              </span>
              {question.topic && (
                <>
                  <span className="text-slate-600">•</span>
                  <Badge variant="secondary" className="text-[11px] font-medium">
                    {question.topic}
                  </Badge>
                </>
              )}
            </div>

            {isEliminateMode && (
              <Badge variant="danger" className="text-[11px] animate-pulse">
                Elimination Mode: Click options to strike through
              </Badge>
            )}
          </div>

          {/* Real-World Exam Vignette / Scenario */}
          {question.scenario && (
            <div className="rounded-2xl bg-indigo-950/20 border border-indigo-500/30 p-4 md:p-5 relative">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">
                <BookOpen className="h-4 w-4 text-indigo-400" />
                <span>Scenario / Case Context</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed italic font-serif">
                "{question.scenario}"
              </p>
            </div>
          )}

          {/* Exact Question Prompt */}
          <div className="space-y-2">
            <h2 className="text-lg md:text-xl font-bold text-white leading-snug tracking-tight">
              {question.question}
            </h2>
            {!isAnswered && !isEliminateMode && (
              <p className="text-xs text-slate-400">
                Select the single best answer below to reveal deep rationales.
              </p>
            )}
          </div>

          {/* Options Grid */}
          <div className="space-y-3 pt-2">
            {question.options.map((option) => {
              const isSelected = currentAnswer?.selectedOptionId === option.id;
              const isEliminated = eliminatedList.includes(option.id);

              // Styling computation depending on answered state and practice mode
              let containerStyle =
                "relative rounded-2xl p-4 md:p-5 border transition-all cursor-pointer flex flex-col gap-2.5 text-left";
              let badgeStyle =
                "flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold shrink-0 transition-colors";

              if (isEliminated) {
                containerStyle +=
                  " bg-slate-900/30 border-slate-800/50 opacity-40 line-through select-none";
                badgeStyle += " bg-slate-800 text-slate-500 border border-slate-700/50";
              } else if (!isAnswered) {
                containerStyle +=
                  " bg-slate-900/70 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700 shadow-sm";
                badgeStyle += " bg-slate-800 text-slate-300 border border-slate-700";
              } else if (practiceMode) {
                // Answered in practice mode: show instant feedback
                if (option.isCorrect) {
                  containerStyle +=
                    " bg-emerald-950/30 border-emerald-500/80 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/40";
                  badgeStyle += " bg-emerald-600 text-white shadow-sm";
                } else if (isSelected && !option.isCorrect) {
                  containerStyle +=
                    " bg-rose-950/30 border-rose-500/80 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/40";
                  badgeStyle += " bg-rose-600 text-white shadow-sm";
                } else {
                  containerStyle += " bg-slate-900/40 border-slate-800/70 opacity-60";
                  badgeStyle += " bg-slate-800 text-slate-400 border border-slate-700";
                }
              } else {
                // Exam mode: only highlight selected option without revealing truth yet
                if (isSelected) {
                  containerStyle +=
                    " bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/50";
                  badgeStyle += " bg-indigo-600 text-white";
                } else {
                  containerStyle += " bg-slate-900/50 border-slate-800/70";
                  badgeStyle += " bg-slate-800 text-slate-400 border border-slate-700";
                }
              }

              return (
                <div
                  key={option.id}
                  onClick={() => handleOptionClick(option.id)}
                  className={containerStyle}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className={badgeStyle}>{option.id}</div>
                      <span className="text-sm md:text-base font-medium text-slate-100 pt-0.5 leading-relaxed">
                        {option.text}
                      </span>
                    </div>

                    {/* Status Icons */}
                    <div className="shrink-0 pt-0.5">
                      {isEliminated ? (
                        <Strikethrough className="h-4 w-4 text-slate-500" />
                      ) : isAnswered && practiceMode ? (
                        option.isCorrect ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                            <CheckCircle className="h-5 w-5" />
                            <span className="hidden sm:inline">Correct</span>
                          </div>
                        ) : isSelected ? (
                          <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                            <XCircle className="h-5 w-5" />
                            <span className="hidden sm:inline">Incorrect</span>
                          </div>
                        ) : null
                      ) : null}
                    </div>
                  </div>

                  {/* Distractor Rationale (Revealed in Practice Mode) */}
                  {isAnswered && practiceMode && (
                    <div
                      className={`text-xs leading-relaxed pt-2.5 mt-1 border-t ${
                        option.isCorrect
                          ? "border-emerald-500/30 text-emerald-200"
                          : isSelected
                          ? "border-rose-500/30 text-rose-200"
                          : "border-slate-800 text-slate-400"
                      }`}
                    >
                      <div className="flex items-start gap-1.5">
                        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-80" />
                        <span>
                          <strong>{option.isCorrect ? "Rationale:" : "Distractor Analysis:"}</strong>{" "}
                          {option.explanation}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Deep Comprehensive Rationale Box (Revealed in Practice Mode after selection) */}
          {isAnswered && practiceMode && (
            <div className="mt-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/40 p-5 md:p-6 space-y-3 animate-fade-in shadow-xl">
              <div className="flex items-center gap-2 text-sm font-bold text-indigo-300">
                <Lightbulb className="h-5 w-5 text-amber-400" />
                <span>Deep Architectural & Conceptual Explanation</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-sans">
                {question.correctExplanation}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

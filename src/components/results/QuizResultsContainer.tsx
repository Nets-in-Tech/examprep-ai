"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { useQuizStore } from "@/store/useQuizStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExportModal } from "@/components/export/ExportModal";
import {
  Trophy,
  Clock,
  RotateCcw,
  PlusCircle,
  Share2,
  CheckCircle,
  XCircle,
  Bookmark,
  Lightbulb,
  Cloud,
  ArrowRight,
  BookOpen,
} from "lucide-react";

interface QuizResultsContainerProps {
  onOpenAuth: () => void;
}

export function QuizResultsContainer({ onOpenAuth }: QuizResultsContainerProps) {
  const {
    currentQuiz,
    userAnswers,
    timeElapsedSeconds,
    bookmarkedQuestionIds,
    retakeCurrentQuiz,
    resetToHome,
    currentUser,
  } = useQuizStore();

  const [activeFilter, setActiveFilter] = useState<"all" | "incorrect" | "bookmarked">("all");
  const [isExportOpen, setIsExportOpen] = useState(false);

  if (!currentQuiz) return null;

  const totalQuestions = currentQuiz.questions.length;
  let correctCount = 0;

  currentQuiz.questions.forEach((q) => {
    if (userAnswers[q.id]?.isCorrect) {
      correctCount++;
    }
  });

  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const isPassing = percentage >= 70;

  // Grade classification
  let letterGrade = "F";
  let gradeColor = "text-rose-400";
  let gradeFeedback = "Needs further review of the core domains.";

  if (percentage === 100) {
    letterGrade = "A+";
    gradeColor = "text-emerald-400";
    gradeFeedback = "Mastery Achieved! Flawless knowledge retention.";
  } else if (percentage >= 85) {
    letterGrade = "A";
    gradeColor = "text-emerald-400";
    gradeFeedback = "Exam Ready! Excellent understanding of key topics.";
  } else if (percentage >= 70) {
    letterGrade = "B";
    gradeColor = "text-indigo-400";
    gradeFeedback = "Passing Grade! Review the few missed concepts below.";
  } else if (percentage >= 50) {
    letterGrade = "C";
    gradeColor = "text-amber-400";
    gradeFeedback = "Solid foundation, but requires targeted review.";
  }

  // Trigger celebration confetti if passing
  useEffect(() => {
    if (percentage >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#6366f1", "#10b981", "#f59e0b", "#8b5cf6"],
        });
      } catch (e) {
        // Safe fallback if canvas not available
      }
    }
  }, [percentage]);

  const incorrectQuestions = currentQuiz.questions.filter(
    (q) => !userAnswers[q.id] || !userAnswers[q.id].isCorrect
  );
  const bookmarkedQuestions = currentQuiz.questions.filter((q) =>
    bookmarkedQuestionIds.includes(q.id)
  );

  const displayedQuestions =
    activeFilter === "incorrect"
      ? incorrectQuestions
      : activeFilter === "bookmarked"
      ? bookmarkedQuestions
      : currentQuiz.questions;

  const minutes = Math.floor(timeElapsedSeconds / 60);
  const seconds = timeElapsedSeconds % 60;
  const avgSecondsPerQ = totalQuestions > 0 ? Math.round(timeElapsedSeconds / totalQuestions) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Hero Scorecard */}
      <Card className="border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <Badge variant="default">{currentQuiz.domain}</Badge>
              <Badge variant={isPassing ? "success" : "danger"}>
                {isPassing ? "PASSING SCORE" : "NEEDS PRACTICE"}
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {currentQuiz.title}
            </h1>
            <p className="text-sm text-slate-300 max-w-lg">{gradeFeedback}</p>
          </div>

          {/* Big Circular Score */}
          <div className="flex items-center gap-5 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shrink-0">
            <div className="text-center">
              <span className={`block text-4xl md:text-5xl font-black ${gradeColor}`}>
                {percentage}%
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {correctCount} of {totalQuestions} Correct
              </span>
            </div>
            <div className="border-l border-slate-800 pl-4 text-center">
              <span className="block text-2xl font-black text-white">{letterGrade}</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Grade</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-slate-800/80 text-center">
          <div className="rounded-xl bg-slate-900/50 p-3">
            <span className="block text-base md:text-lg font-bold text-white">
              {minutes}m {seconds}s
            </span>
            <span className="text-xs text-slate-400">Total Duration</span>
          </div>
          <div className="rounded-xl bg-slate-900/50 p-3">
            <span className="block text-base md:text-lg font-bold text-indigo-400">
              {avgSecondsPerQ}s
            </span>
            <span className="text-xs text-slate-400">Avg Pace / Question</span>
          </div>
          <div className="rounded-xl bg-slate-900/50 p-3">
            <span className="block text-base md:text-lg font-bold text-amber-400">
              {bookmarkedQuestionIds.length}
            </span>
            <span className="text-xs text-slate-400">Flagged Questions</span>
          </div>
        </div>
      </Card>

      {/* Guest Cloud Sync Callout */}
      {!currentUser && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/60 border border-indigo-500/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Save Your Performance History</h4>
              <p className="text-xs text-slate-300">
                Create a free account to track your progress over time and sync across devices.
              </p>
            </div>
          </div>
          <Button size="sm" variant="primary" onClick={onOpenAuth} className="shrink-0 text-xs font-semibold">
            <span>Sign In to Sync</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={retakeCurrentQuiz}
            className="border-slate-800 hover:border-slate-700 bg-slate-900"
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            <span>Retake This Quiz</span>
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsExportOpen(true)}
            className="bg-slate-900 border-slate-800"
          >
            <Share2 className="h-4 w-4 mr-1.5 text-cyan-400" />
            <span>Export / Print</span>
          </Button>
        </div>

        <Button variant="primary" size="md" onClick={resetToHome} className="font-semibold">
          <PlusCircle className="h-4 w-4 mr-1.5" />
          <span>Build Another Quiz</span>
        </Button>
      </div>

      {/* In-depth Question Review Section */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white">Question Review & Rationales</h2>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-xl border transition-colors ${
                activeFilter === "all"
                  ? "bg-indigo-600 text-white border-indigo-500 font-semibold"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              All ({totalQuestions})
            </button>
            <button
              onClick={() => setActiveFilter("incorrect")}
              className={`px-3 py-1.5 rounded-xl border transition-colors ${
                activeFilter === "incorrect"
                  ? "bg-rose-600 text-white border-rose-500 font-semibold"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              Incorrect ({incorrectQuestions.length})
            </button>
            <button
              onClick={() => setActiveFilter("bookmarked")}
              className={`px-3 py-1.5 rounded-xl border transition-colors ${
                activeFilter === "bookmarked"
                  ? "bg-amber-600 text-white border-amber-500 font-semibold"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              Bookmarked ({bookmarkedQuestions.length})
            </button>
          </div>
        </div>

        {/* Question Review Cards List */}
        <div className="space-y-5">
          {displayedQuestions.map((q) => {
            const answer = userAnswers[q.id];
            const isCorrect = answer?.isCorrect;
            const correctOpt = q.options.find((opt) => opt.isCorrect);

            return (
              <Card
                key={q.id}
                className={`border p-6 transition-all ${
                  isCorrect
                    ? "bg-slate-900/60 border-slate-800"
                    : "bg-rose-950/10 border-rose-500/30"
                }`}
              >
                <CardContent className="p-0 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-400">
                        Question {q.order}
                      </span>
                      {q.topic && (
                        <Badge variant="secondary" className="text-[10px]">
                          {q.topic}
                        </Badge>
                      )}
                    </div>
                    <div>
                      {isCorrect ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
                          <CheckCircle className="h-4 w-4" />
                          <span>Correct</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-400 font-bold text-xs">
                          <XCircle className="h-4 w-4" />
                          <span>Incorrect</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {q.scenario && (
                    <div className="rounded-xl bg-slate-950/50 border border-slate-800/80 p-3.5 text-xs text-slate-300 italic">
                      "{q.scenario}"
                    </div>
                  )}

                  <h3 className="text-base font-bold text-white">{q.question}</h3>

                  {/* Options List with Explanations */}
                  <div className="space-y-2 pt-1">
                    {q.options.map((opt) => {
                      const wasSelected = answer?.selectedOptionId === opt.id;
                      let optClass =
                        "p-3 rounded-xl border text-xs flex flex-col gap-1.5 transition-all";

                      if (opt.isCorrect) {
                        optClass += " bg-emerald-950/25 border-emerald-500/60 text-emerald-100";
                      } else if (wasSelected && !opt.isCorrect) {
                        optClass += " bg-rose-950/25 border-rose-500/60 text-rose-100";
                      } else {
                        optClass += " bg-slate-950/30 border-slate-800/50 text-slate-400";
                      }

                      return (
                        <div key={opt.id} className={optClass}>
                          <div className="flex items-center justify-between font-medium">
                            <span>
                              <strong>({opt.id})</strong> {opt.text}
                            </span>
                            {opt.isCorrect && (
                              <Badge variant="success" className="text-[9px]">
                                Correct Choice
                              </Badge>
                            )}
                            {wasSelected && !opt.isCorrect && (
                              <Badge variant="danger" className="text-[9px]">
                                Your Choice
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] opacity-80 leading-relaxed pl-1">
                            {opt.explanation}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Deep Conceptual Explanation */}
                  <div className="rounded-xl bg-indigo-950/20 border border-indigo-500/20 p-4 text-xs text-slate-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                      <span>Conceptual Takeaway</span>
                    </div>
                    <p className="leading-relaxed text-slate-300">{q.correctExplanation}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        quiz={currentQuiz}
      />
    </div>
  );
}

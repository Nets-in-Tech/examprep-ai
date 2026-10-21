"use client";

import React, { useEffect } from "react";
import { useQuizStore } from "@/store/useQuizStore";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Bookmark,
  BookmarkCheck,
  Strikethrough,
  Grid,
  Zap,
  Timer,
  XCircle,
} from "lucide-react";

interface PlayerHeaderProps {
  isEliminateMode: boolean;
  onToggleEliminateMode: () => void;
  onOpenQuestionGrid: () => void;
}

export function PlayerHeader({
  isEliminateMode,
  onToggleEliminateMode,
  onOpenQuestionGrid,
}: PlayerHeaderProps) {
  const {
    currentQuiz,
    currentIndex,
    timeElapsedSeconds,
    tickTimer,
    practiceMode,
    bookmarkedQuestionIds,
    toggleBookmark,
    resetToHome,
  } = useQuizStore();

  useEffect(() => {
    const timerInterval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [tickTimer]);

  if (!currentQuiz) return null;

  const currentQuestion = currentQuiz.questions[currentIndex];
  const isBookmarked = currentQuestion
    ? bookmarkedQuestionIds.includes(currentQuestion.id)
    : false;

  const totalQuestions = currentQuiz.questions.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const minutes = Math.floor(timeElapsedSeconds / 60);
  const seconds = timeElapsedSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="space-y-4 pb-2">
      {/* Top row: Title, badges, timer, exit */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge variant="default" className="text-xs font-semibold py-1 px-3">
            {currentQuiz.domain}
          </Badge>
          <span className="text-xs font-semibold text-slate-400 capitalize hidden sm:inline">
            {currentQuiz.difficulty.replace("_", " ")}
          </span>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className="text-xs text-slate-400 font-medium truncate max-w-[280px]">
            {currentQuiz.title}
          </span>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {/* Practice vs Exam mode badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            {practiceMode ? (
              <>
                <Zap className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-indigo-300 font-medium hidden sm:inline">Instant Explanations</span>
              </>
            ) : (
              <>
                <Timer className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-amber-300 font-medium hidden sm:inline">Exam Mode</span>
              </>
            )}
          </div>

          {/* Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs font-bold text-slate-200">
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            <span>{formattedTime}</span>
          </div>

          {/* Strikethrough elimination mode toggle */}
          <Button
            size="sm"
            variant={isEliminateMode ? "danger" : "outline"}
            onClick={onToggleEliminateMode}
            className="h-8 text-xs border-slate-700 hover:border-slate-600"
            title="Toggle elimination mode: strikethrough options you know are incorrect"
          >
            <Strikethrough className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">Eliminate</span>
          </Button>

          {/* Bookmark question */}
          {currentQuestion && (
            <Button
              size="sm"
              variant={isBookmarked ? "accent" : "outline"}
              onClick={() => toggleBookmark(currentQuestion.id)}
              className="h-8 text-xs border-slate-700 hover:border-slate-600"
              title="Bookmark question for review"
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="h-3.5 w-3.5 text-white mr-1" />
                  <span className="hidden sm:inline">Bookmarked</span>
                </>
              ) : (
                <>
                  <Bookmark className="h-3.5 w-3.5 mr-1 text-slate-400" />
                  <span className="hidden sm:inline">Bookmark</span>
                </>
              )}
            </Button>
          )}

          {/* Grid Jump */}
          <Button
            size="sm"
            variant="secondary"
            onClick={onOpenQuestionGrid}
            className="h-8 text-xs bg-slate-900 border-slate-800"
            title="Question overview grid"
          >
            <Grid className="h-3.5 w-3.5" />
          </Button>

          {/* Exit / Abandon */}
          <button
            onClick={() => {
              if (window.confirm("Leave this quiz session? Progress will be saved in your history.")) {
                resetToHome();
              }
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
            title="Exit quiz"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar & Question Tracker */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-white">
            Question <span className="text-indigo-400 text-sm font-bold">{currentIndex + 1}</span> of{" "}
            {totalQuestions}
          </span>
          <span className="text-slate-400 font-mono">{progressPercent}% complete</span>
        </div>
        <Progress value={progressPercent} />
      </div>
    </div>
  );
}

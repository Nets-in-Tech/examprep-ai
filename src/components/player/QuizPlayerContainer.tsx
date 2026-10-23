"use client";

import React, { useState, useEffect } from "react";
import { useQuizStore } from "@/store/useQuizStore";
import { PlayerHeader } from "./PlayerHeader";
import { QuestionCard } from "./QuestionCard";
import { QuestionGridModal } from "./QuestionGridModal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

export function QuizPlayerContainer() {
  const {
    currentQuiz,
    currentIndex,
    nextQuestion,
    prevQuestion,
    finishQuiz,
    userAnswers,
    selectOption,
  } = useQuizStore();

  const [isEliminateMode, setIsEliminateMode] = useState(false);
  const [isGridOpen, setIsGridOpen] = useState(false);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === "ArrowRight") {
        nextQuestion();
      } else if (e.key === "ArrowLeft") {
        prevQuestion();
      } else if (["1", "2", "3", "4"].includes(e.key) && currentQuiz) {
        const optionIdx = parseInt(e.key) - 1;
        const currentQ = currentQuiz.questions[currentIndex];
        if (currentQ && currentQ.options[optionIdx]) {
          selectOption(currentQ.id, currentQ.options[optionIdx].id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, currentQuiz, nextQuestion, prevQuestion, selectOption]);

  if (!currentQuiz) return null;

  const currentQuestion = currentQuiz.questions[currentIndex];
  const totalQuestions = currentQuiz.questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with timer, progress, and tools */}
      <PlayerHeader
        isEliminateMode={isEliminateMode}
        onToggleEliminateMode={() => setIsEliminateMode(!isEliminateMode)}
        onOpenQuestionGrid={() => setIsGridOpen(true)}
      />

      {/* Active Question Carousel Card */}
      {currentQuestion && (
        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          isEliminateMode={isEliminateMode}
        />
      )}

      {/* Bottom Navigation & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="md"
          onClick={prevQuestion}
          disabled={currentIndex === 0}
          className="border-slate-800 hover:border-slate-700 bg-slate-900/60"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          <span>Previous</span>
        </Button>

        {/* Answered Counter */}
        <div className="text-xs text-slate-400 font-medium">
          Answered <span className="text-indigo-400 font-bold">{answeredCount}</span> of{" "}
          <span className="text-slate-200 font-bold">{totalQuestions}</span>
        </div>

        {/* Next or Submit Exam Button */}
        {isLastQuestion ? (
          <Button
            variant="success"
            size="md"
            onClick={finishQuiz}
            className="px-6 font-bold shadow-lg shadow-emerald-600/20"
          >
            <span>Finish & Review Exam</span>
            <CheckCircle2 className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={nextQuestion}
            className="px-6 font-semibold"
          >
            <span>Next Question</span>
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        )}
      </div>

      {/* Grid Modal */}
      <QuestionGridModal isOpen={isGridOpen} onClose={() => setIsGridOpen(false)} />
    </div>
  );
}

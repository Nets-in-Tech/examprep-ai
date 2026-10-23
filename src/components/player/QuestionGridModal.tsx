"use client";

import React from "react";
import { Dialog } from "@/components/ui/dialog";
import { useQuizStore } from "@/store/useQuizStore";
import { Bookmark } from "lucide-react";

interface QuestionGridModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuestionGridModal({ isOpen, onClose }: QuestionGridModalProps) {
  const {
    currentQuiz,
    currentIndex,
    goToQuestion,
    userAnswers,
    bookmarkedQuestionIds,
  } = useQuizStore();

  if (!currentQuiz) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Question Overview Grid"
      description="Quickly jump to any question or review flagged items."
    >
      <div className="space-y-4">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-indigo-600" />
            <span>Current</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-emerald-600/30 border border-emerald-500/50" />
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-amber-500/30 border border-amber-500/50" />
            <span>Bookmarked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-slate-800 border border-slate-700" />
            <span>Unanswered</span>
          </div>
        </div>

        {/* Grid of question buttons */}
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2.5 max-h-[300px] overflow-y-auto p-1">
          {currentQuiz.questions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const isAnswered = Boolean(userAnswers[q.id]);
            const isBookmarked = bookmarkedQuestionIds.includes(q.id);

            let btnStyle =
              "h-11 rounded-xl text-xs font-bold flex flex-col items-center justify-center relative transition-all border cursor-pointer";

            if (isCurrent) {
              btnStyle += " bg-indigo-600 text-white border-indigo-400 ring-2 ring-indigo-400/40";
            } else if (isAnswered) {
              btnStyle +=
                " bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/40";
            } else {
              btnStyle += " bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700";
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  goToQuestion(idx);
                  onClose();
                }}
                className={btnStyle}
              >
                <span>{idx + 1}</span>
                {isBookmarked && (
                  <Bookmark className="h-3 w-3 text-amber-400 fill-amber-400 absolute top-1 right-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </Dialog>
  );
}

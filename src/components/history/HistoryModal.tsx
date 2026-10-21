"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuizStore } from "@/store/useQuizStore";
import {
  Trophy,
  Clock,
  RotateCcw,
  Trash2,
  CheckCircle,
  FileText,
  Calendar,
  CloudCheck,
} from "lucide-react";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const { guestAttempts, setGuestAttempts, startQuiz, currentUser } = useQuizStore();
  const [filterDomain, setFilterDomain] = useState<string>("all");

  const domains = Array.from(new Set(guestAttempts.map((a) => a.domain))).filter(Boolean);

  const filteredAttempts =
    filterDomain === "all"
      ? guestAttempts
      : guestAttempts.filter((a) => a.domain === filterDomain);

  const totalTaken = guestAttempts.length;
  const avgScore =
    totalTaken > 0
      ? Math.round(guestAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / totalTaken)
      : 0;
  const perfectRuns = guestAttempts.filter((a) => a.percentage === 100).length;

  const handleRetake = (snapshot: any) => {
    if (snapshot) {
      startQuiz(snapshot, true);
      onClose();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your local quiz history?")) {
      setGuestAttempts([]);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Practice History & Performance"
      description="Review past exam sessions, analyze retention scores, and retake previous quizzes."
      className="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Analytics Top Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-3.5 text-center">
            <span className="block text-2xl font-bold text-white">{totalTaken}</span>
            <span className="text-xs text-slate-400">Quizzes Taken</span>
          </div>
          <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-3.5 text-center">
            <span className="block text-2xl font-bold text-indigo-400">{avgScore}%</span>
            <span className="text-xs text-slate-400">Average Accuracy</span>
          </div>
          <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-3.5 text-center">
            <span className="block text-2xl font-bold text-amber-400">{perfectRuns}</span>
            <span className="text-xs text-slate-400">100% Masteries</span>
          </div>
        </div>

        {/* Domain Filter Pills */}
        {domains.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setFilterDomain("all")}
              className={`px-3 py-1 rounded-full border transition-colors ${
                filterDomain === "all"
                  ? "bg-indigo-600 text-white border-indigo-500"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
              }`}
            >
              All Domains
            </button>
            {domains.map((d) => (
              <button
                key={d}
                onClick={() => setFilterDomain(d)}
                className={`px-3 py-1 rounded-full border transition-colors whitespace-nowrap ${
                  filterDomain === d
                    ? "bg-indigo-600 text-white border-indigo-500"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {/* Attempts List */}
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {filteredAttempts.length === 0 ? (
            <div className="text-center py-12 rounded-xl bg-slate-800/30 border border-slate-800">
              <FileText className="h-10 w-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm text-slate-300 font-medium">No quiz attempts recorded yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Generate a practice quiz from notes, URLs, or preset certs to see your history!
              </p>
            </div>
          ) : (
            filteredAttempts.map((attempt) => {
              const isPassing = attempt.percentage >= 70;
              const dateStr = new Date(attempt.completedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 transition-all"
                >
                  <div className="space-y-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">
                        {attempt.quizTitle}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {attempt.domain}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {dateStr}
                      </span>
                      {attempt.timeSpentSeconds > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {Math.floor(attempt.timeSpentSeconds / 60)}m{" "}
                          {attempt.timeSpentSeconds % 60}s
                        </span>
                      )}
                      <span>
                        {attempt.score} / {attempt.totalQuestions} Correct
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div
                      className={`text-right px-3 py-1 rounded-lg font-bold text-sm ${
                        isPassing
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {attempt.percentage}%
                    </div>

                    {attempt.quizSnapshot && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRetake(attempt.quizSnapshot)}
                        className="h-8 text-xs border-slate-700 hover:border-slate-600"
                        title="Retake this quiz"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        <span>Retake</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        {guestAttempts.length > 0 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
            <span className="text-slate-500">
              {currentUser ? "Synced with Supabase Cloud" : "Stored locally in browser storage"}
            </span>
            <button
              onClick={handleClearHistory}
              className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>
    </Dialog>
  );
}

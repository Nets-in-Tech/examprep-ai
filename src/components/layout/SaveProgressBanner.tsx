"use client";

import React, { useState } from "react";
import { useQuizStore } from "@/store/useQuizStore";
import { Cloud, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SaveProgressBannerProps {
  onOpenAuth: () => void;
}

export function SaveProgressBanner({ onOpenAuth }: SaveProgressBannerProps) {
  const { currentUser, guestAttempts } = useQuizStore();
  const [isDismissed, setIsDismissed] = useState(false);

  // If user is logged in or banner manually dismissed, don't show
  if (currentUser || isDismissed) return null;

  return (
    <div className="relative isolate flex items-center justify-between gap-x-4 overflow-hidden bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/80 px-4 py-2.5 sm:px-6 border-b border-indigo-500/20 backdrop-blur-md">
      <div className="flex items-center gap-3 text-sm text-slate-200">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 shrink-0">
          <Cloud className="h-4 w-4" />
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold text-white">Guest Session Active</span>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-xs sm:text-sm text-slate-300">
            {guestAttempts.length > 0 ? (
              <>
                You have{" "}
                <span className="text-indigo-400 font-semibold">
                  {guestAttempts.length} saved quiz session(s)
                </span>{" "}
                stored locally.
              </>
            ) : (
              "Your quizzes are saved on this device."
            )}{" "}
            Create a free account to back up and sync progress across devices.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant="primary"
          onClick={onOpenAuth}
          className="text-xs font-semibold px-3 py-1.5 h-8 bg-indigo-600 hover:bg-indigo-500 border-none shadow-sm"
        >
          <span>Save Progress</span>
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
        <button
          onClick={() => setIsDismissed(true)}
          className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { useQuizStore } from "@/store/useQuizStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  History,
  CloudCheck,
  User,
  LogOut,
  Sparkles,
  RotateCcw,
  PlusCircle,
} from "lucide-react";

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenHistory: () => void;
}

export function Navbar({ onOpenAuth, onOpenHistory }: NavbarProps) {
  const {
    currentUser,
    setCurrentUser,
    status,
    resetToHome,
    guestAttempts,
    isSyncing,
  } = useQuizStore();

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={resetToHome}
          role="button"
          tabIndex={0}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                ExamPrep<span className="text-indigo-400">AI</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block -mt-0.5">
              Smart Quiz Builder with Deep Explanations
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* If currently in quiz or results, provide quick button to start new quiz */}
          {status !== "idle" && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetToHome}
              className="text-xs h-9 border-slate-700 hover:border-slate-600 hidden md:flex items-center gap-1.5"
            >
              <PlusCircle className="h-3.5 w-3.5 text-indigo-400" />
              <span>New Quiz</span>
            </Button>
          )}

          {/* History & Past Attempts Trigger */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenHistory}
            className="text-xs h-9 relative bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200"
          >
            <History className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">History</span>
            {guestAttempts.length > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                {guestAttempts.length}
              </span>
            )}
          </Button>

          {/* User Auth Status */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-semibold">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : "U"}
                </div>
                <span className="text-xs font-medium text-slate-300 max-w-[120px] truncate">
                  {currentUser.name || currentUser.email}
                </span>
                {isSyncing && (
                  <span className="text-[10px] text-indigo-400 animate-pulse">Syncing...</span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="h-9 px-2.5 text-slate-400 hover:text-rose-400"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAuth}
              className="h-9 text-xs font-semibold border-indigo-500/30 text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20"
            >
              <User className="h-3.5 w-3.5 mr-1" />
              <span>Sign In</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

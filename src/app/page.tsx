"use client";

import React, { useState } from "react";
import { useQuizStore } from "@/store/useQuizStore";
import { Navbar } from "@/components/layout/Navbar";
import { SaveProgressBanner } from "@/components/layout/SaveProgressBanner";
import { GeneratorContainer } from "@/components/generator/GeneratorContainer";
import { QuizPlayerContainer } from "@/components/player/QuizPlayerContainer";
import { QuizResultsContainer } from "@/components/results/QuizResultsContainer";
import { AuthModal } from "@/components/auth/AuthModal";
import { HistoryModal } from "@/components/history/HistoryModal";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Zap,
  Sliders,
  BrainCircuit,
  ShieldCheck,
  CheckCircle,
  X,
  FileCheck2,
} from "lucide-react";

export default function Home() {
  const { status, syncNotification, clearSyncNotification } = useQuizStore();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">

      {/* Main Navigation */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {status === "idle" && (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20 shadow-inner">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>Next-Gen Psychometric</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight sm:leading-tight">
                Turn Any Material Into{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  Certification Practice Exams
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
                Paste study notes, public documentation URLs, or choose standard cloud certifications
                like AZ-900. Powered by Google Gemini with instant, deep explanations for every
                single option.
              </p>
            </div>

            {/* Quiz Generator Core */}
            <GeneratorContainer />

            {/* Feature Highlights Grid */}
            <div className="pt-8 border-t border-slate-900 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-5 space-y-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-white text-base">Distractor Explanations</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real exams test subtle traps. ExamPrep AI generates in-depth rationales for why
                  each wrong option is incorrect, accelerating concept mastery.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-5 space-y-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  <Sliders className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-white text-base">Flexible</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Exams with difficulty of your own chosen level, explanatory, and shows results as marked.
                  can store history if the user has an account, which enables to see there last exam history
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-5 space-y-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-white text-base">Reliable</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Start practicing instantly with zero friction. Quizzes and scores persist locally
                  and sync automatically to Supabase when you decide to sign up.
                </p>
              </div>
            </div>
          </div>
        )}

        {status === "playing" && <QuizPlayerContainer />}

        {status === "completed" && (
          <QuizResultsContainer onOpenAuth={() => setIsAuthOpen(true)} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-400">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">ExamPrep AI</span>
            <span>—</span>
            <span>High-Yield Practice Ai made exams</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>unofficial student made tool</span>
            <span>•</span>
            <span>@2026</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />

      {/* Floating Cloud Sync Notification Toast */}
      {syncNotification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 p-4 rounded-2xl bg-emerald-950 border border-emerald-500/50 shadow-2xl shadow-black text-emerald-200 text-xs animate-scale-in">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{syncNotification}</span>
          <button
            onClick={clearSyncNotification}
            className="p-1 text-emerald-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

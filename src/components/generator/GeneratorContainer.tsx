"use client";

import React, { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NotesInput } from "./NotesInput";
import { UrlInput } from "./UrlInput";
import { DomainSelector } from "./DomainSelector";
import { QuizConfigPanel } from "./QuizConfigPanel";
import { QuizDifficulty, QuizMode } from "@/types/quiz";
import { useQuizStore } from "@/store/useQuizStore";
import {
  FileText,
  Globe,
  Award,
  Sparkles,
  Zap,
  AlertCircle,
  Cpu,
} from "lucide-react";

export function GeneratorContainer() {
  const { startQuiz } = useQuizStore();

  const [mode, setMode] = useState<QuizMode>("domain");
  const [notesContent, setNotesContent] = useState("");
  const [url, setUrl] = useState("");
  const [domain, setDomain] = useState("AZ-900");
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("exam_simulation");
  const [practiceMode, setPracticeMode] = useState(true);

  // Loading & generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const tabs = [
    {
      id: "domain",
      label: "Preset Certifications",
      icon: <Award className="h-4 w-4 text-indigo-400" />,
      badge: "AZ-900 / AWS / Sec+",
    },
    {
      id: "notes",
      label: "Direct Notes Ingestion",
      icon: <FileText className="h-4 w-4 text-violet-400" />,
      badge: "Paste Markdown",
    },
    {
      id: "url",
      label: "Web / Documentation URL",
      icon: <Globe className="h-4 w-4 text-emerald-400" />,
      badge: "Scraper",
    },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setStatusMessage("Calculating SHA-256 fingerprint of input...");

    if (mode === "notes" && (!notesContent || notesContent.trim().length < 15)) {
      setErrorMessage("Please enter at least a few sentences of study notes, or click one of the 1-click sample presets below.");
      setIsGenerating(false);
      return;
    }

    if (mode === "url" && (!url || !url.trim().startsWith("http"))) {
      setErrorMessage("Please enter a valid webpage URL starting with http:// or https://, or click one of the sample presets below.");
      setIsGenerating(false);
      return;
    }

    console.log("[ExamPrep AI] Generating quiz:", { mode, domain, questionCount, difficulty });

    try {
      // Step feedback animation
      setTimeout(() => {
        setStatusMessage("Checking Upstash Redis cache (SHA-256)...");
      }, 500);

      setTimeout(() => {
        setStatusMessage("Enforcing Gemini Structured JSON Schema with distractor rationales...");
      }, 1200);

      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          notesContent,
          url,
          domain: mode === "domain" ? domain : (mode === "url" ? "Web Resource" : "Custom Notes"),
          questionCount,
          difficulty,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate quiz");
      }

      const quiz = data.quiz;
      if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        throw new Error("Received empty quiz data from server. Please try again.");
      }

      // Start quiz session in Zustand
      startQuiz(quiz, practiceMode);
    } catch (err: unknown) {
      console.error("Quiz generation failed:", err);
      const msg = err instanceof Error ? err.message : "An error occurred while generating the quiz.";
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
      setStatusMessage("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex justify-center">
        <Tabs tabs={tabs} activeTab={mode} onChange={(newTab) => setMode(newTab as QuizMode)} />
      </div>

      {/* Main Generator Card */}
      <Card className="border-slate-800 bg-slate-900/70 p-6 md:p-8">
        <CardContent className="p-0 space-y-6">
          {mode === "domain" && (
            <DomainSelector selectedDomain={domain} onSelectDomain={setDomain} />
          )}

          {mode === "notes" && (
            <NotesInput value={notesContent} onChange={setNotesContent} />
          )}

          {mode === "url" && (
            <UrlInput value={url} onChange={setUrl} />
          )}

          {/* Config Parameters: Count, Difficulty, Mode */}
          <QuizConfigPanel
            questionCount={questionCount}
            onQuestionCountChange={setQuestionCount}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            practiceMode={practiceMode}
            onPracticeModeChange={setPracticeMode}
          />

          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Button & Architecture Details */}
          <div className="pt-2 space-y-3">
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full text-base font-bold py-4 h-14 rounded-2xl shadow-xl shadow-indigo-600/25 cursor-pointer"
              onClick={handleGenerate}
              isLoading={isGenerating}
            >
              <Sparkles className="h-5 w-5 mr-2 text-indigo-200" />
              <span>{isGenerating ? statusMessage || "Generating Practice Exam..." : "Generate AI Practice Quiz"}</span>
            </Button>

            {/* Architecture indicators */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                <span>Exam generated by AI</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>Deep Distractor Explanations</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

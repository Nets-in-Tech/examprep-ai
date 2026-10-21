"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Quiz } from "@/types/quiz";
import { Copy, Download, Printer, Check } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: Quiz;
}

export function ExportModal({ isOpen, onClose, quiz }: ExportModalProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const generateMarkdown = () => {
    let md = `# ${quiz.title}\n\n`;
    md += `**Domain:** ${quiz.domain} | **Difficulty:** ${quiz.difficulty} | **Questions:** ${quiz.questions.length}\n\n`;
    md += `${quiz.description}\n\n---\n\n`;

    quiz.questions.forEach((q, idx) => {
      md += `### Question ${idx + 1}\n\n`;
      if (q.scenario) {
        md += `> **Scenario:** ${q.scenario}\n\n`;
      }
      md += `${q.question}\n\n`;

      q.options.forEach((opt) => {
        md += `- [${opt.isCorrect ? "x" : " "}] **(${opt.id})** ${opt.text}\n`;
      });

      md += `\n**Deep Explanation & Rationale:**\n${q.correctExplanation}\n\n`;
      md += `**Distractor Explanations:**\n`;
      q.options.forEach((opt) => {
        md += `- **Option ${opt.id}**: ${opt.explanation}\n`;
      });
      md += `\n---\n\n`;
    });

    return md;
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdown();
    navigator.clipboard.writeText(md);
    setCopiedFormat("markdown");
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(quiz, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${quiz.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Export Practice Quiz"
      description="Download your generated exam material for offline study, LMS import, or printing."
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCopyMarkdown}
            className="flex flex-col items-center justify-center h-24 p-3 text-center bg-slate-800 hover:bg-slate-700"
          >
            {copiedFormat === "markdown" ? (
              <Check className="h-6 w-6 text-emerald-400 mb-1" />
            ) : (
              <Copy className="h-6 w-6 text-indigo-400 mb-1" />
            )}
            <span className="text-xs font-bold text-white">
              {copiedFormat === "markdown" ? "Copied!" : "Copy Markdown"}
            </span>
            <span className="text-[10px] text-slate-400">Obsidian / Notion</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={handleDownloadJSON}
            className="flex flex-col items-center justify-center h-24 p-3 text-center bg-slate-800 hover:bg-slate-700"
          >
            <Download className="h-6 w-6 text-cyan-400 mb-1" />
            <span className="text-xs font-bold text-white">Download JSON</span>
            <span className="text-[10px] text-slate-400">Structured Data</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={handlePrint}
            className="flex flex-col items-center justify-center h-24 p-3 text-center bg-slate-800 hover:bg-slate-700"
          >
            <Printer className="h-6 w-6 text-amber-400 mb-1" />
            <span className="text-xs font-bold text-white">Print / Save PDF</span>
            <span className="text-[10px] text-slate-400">Hardcopy Exam Sheet</span>
          </Button>
        </div>

        <div className="rounded-xl bg-slate-800/50 p-3 text-xs text-slate-400 font-mono max-h-36 overflow-y-auto">
          <pre className="whitespace-pre-wrap">{generateMarkdown().slice(0, 400)}...</pre>
        </div>
      </div>
    </Dialog>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import QueryProvider from "@/components/providers/QueryProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "ExamPrep AI - Smart Quiz Builder & Certification Practice",
  description:
    "Transform study notes, technical documentation URLs, and standard cert topics (AZ-900, AWS, CompTIA) into AI-powered practice quizzes with instant distractor rationales.",
  keywords: [
    "Exam Prep",
    "Quiz Builder",
    "AZ-900",
    "AWS Certified Cloud Practitioner",
    "CompTIA Security+",
    "AI Quiz Generator",
    "Gemini AI",
    "Supabase Auth",
  ],
  authors: [{ name: "ExamPrep AI Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body
        className={`${inter.variable} min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

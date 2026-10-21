export type QuizMode = "notes" | "url" | "domain";
export type QuizDifficulty = "beginner" | "intermediate" | "advanced" | "exam_simulation";

export interface QuizOption {
  id: string; // e.g. "A", "B", "C", "D"
  text: string;
  isCorrect: boolean;
  explanation: string; // Detailed distractor rationale or why it is right
}

export interface QuizQuestion {
  id: string;
  order: number;
  question: string;
  scenario?: string; // Optional real-world exam vignette/scenario
  options: QuizOption[];
  correctExplanation: string; // Comprehensive summary explanation
  topic?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  domain: string;
  mode: QuizMode;
  difficulty: QuizDifficulty;
  questions: QuizQuestion[];
  createdAt: string;
  sourceUrl?: string;
  contentHash?: string;
  cached?: boolean;
}

export interface GenerateQuizRequest {
  mode: QuizMode;
  notesContent?: string;
  url?: string;
  domain?: string;
  questionCount: number;
  difficulty: QuizDifficulty;
}

export interface UserAnswerRecord {
  selectedOptionId: string;
  isCorrect: boolean;
  timeSpentSeconds?: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  domain: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: Record<string, UserAnswerRecord>;
  timeSpentSeconds: number;
  completedAt: string;
  isGuest: boolean;
  syncedToCloud: boolean;
  quizSnapshot?: Quiz;
}

export interface PresetDomain {
  id: string;
  title: string;
  code: string;
  badge: string;
  category: "cloud" | "security" | "devops" | "coding";
  description: string;
  sampleTopics: string[];
}

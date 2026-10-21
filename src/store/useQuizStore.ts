import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Quiz, QuizAttempt, UserAnswerRecord } from "@/types/quiz";

interface QuizState {
  // Current active quiz session
  currentQuiz: Quiz | null;
  currentIndex: number;
  userAnswers: Record<string, UserAnswerRecord>;
  eliminatedOptions: Record<string, string[]>; // questionId -> optionIds
  bookmarkedQuestionIds: string[];
  status: "idle" | "generating" | "playing" | "completed";
  practiceMode: boolean; // true: immediate rationale display; false: exam mode

  // Timer
  timeElapsedSeconds: number;
  isTimerRunning: boolean;

  // Guest & Cloud History (Persisted)
  guestAttempts: QuizAttempt[];
  currentUser: { id: string; email: string; name?: string } | null;
  isSyncing: boolean;
  syncNotification: string | null;

  // Actions
  startQuiz: (quiz: Quiz, practiceMode?: boolean) => void;
  selectOption: (questionId: string, optionId: string) => void;
  toggleEliminateOption: (questionId: string, optionId: string) => void;
  toggleBookmark: (questionId: string) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  tickTimer: () => void;
  finishQuiz: () => void;
  retakeCurrentQuiz: () => void;
  resetToHome: () => void;
  setCurrentUser: (user: { id: string; email: string; name?: string } | null) => void;
  setGuestAttempts: (attempts: QuizAttempt[]) => void;
  clearSyncNotification: () => void;
  syncToSupabase: () => Promise<void>;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      currentQuiz: null,
      currentIndex: 0,
      userAnswers: {},
      eliminatedOptions: {},
      bookmarkedQuestionIds: [],
      status: "idle",
      practiceMode: true,
      timeElapsedSeconds: 0,
      isTimerRunning: false,
      guestAttempts: [],
      currentUser: null,
      isSyncing: false,
      syncNotification: null,

      startQuiz: (quiz: Quiz, practiceMode = true) => {
        set({
          currentQuiz: quiz,
          currentIndex: 0,
          userAnswers: {},
          eliminatedOptions: {},
          bookmarkedQuestionIds: [],
          status: "playing",
          practiceMode,
          timeElapsedSeconds: 0,
          isTimerRunning: true,
        });
      },

      selectOption: (questionId: string, optionId: string) => {
        const { currentQuiz, userAnswers } = get();
        if (!currentQuiz) return;

        // If already answered in practice mode, prevent modifying
        if (userAnswers[questionId]) return;

        const question = currentQuiz.questions.find((q) => q.id === questionId);
        if (!question) return;

        const chosenOption = question.options.find((opt) => opt.id === optionId);
        const isCorrect = chosenOption ? chosenOption.isCorrect : false;

        const updatedAnswers = {
          ...userAnswers,
          [questionId]: {
            selectedOptionId: optionId,
            isCorrect,
          },
        };

        set({ userAnswers: updatedAnswers });
      },

      toggleEliminateOption: (questionId: string, optionId: string) => {
        const { eliminatedOptions } = get();
        const currentList = eliminatedOptions[questionId] || [];
        const exists = currentList.includes(optionId);

        set({
          eliminatedOptions: {
            ...eliminatedOptions,
            [questionId]: exists
              ? currentList.filter((id) => id !== optionId)
              : [...currentList, optionId],
          },
        });
      },

      toggleBookmark: (questionId: string) => {
        const { bookmarkedQuestionIds } = get();
        const exists = bookmarkedQuestionIds.includes(questionId);

        set({
          bookmarkedQuestionIds: exists
            ? bookmarkedQuestionIds.filter((id) => id !== questionId)
            : [...bookmarkedQuestionIds, questionId],
        });
      },

      goToQuestion: (index: number) => {
        const { currentQuiz } = get();
        if (!currentQuiz) return;
        if (index >= 0 && index < currentQuiz.questions.length) {
          set({ currentIndex: index });
        }
      },

      nextQuestion: () => {
        const { currentIndex, currentQuiz } = get();
        if (!currentQuiz) return;
        if (currentIndex < currentQuiz.questions.length - 1) {
          set({ currentIndex: currentIndex + 1 });
        } else {
          get().finishQuiz();
        }
      },

      prevQuestion: () => {
        const { currentIndex } = get();
        if (currentIndex > 0) {
          set({ currentIndex: currentIndex - 1 });
        }
      },

      tickTimer: () => {
        const { isTimerRunning, timeElapsedSeconds } = get();
        if (isTimerRunning) {
          set({ timeElapsedSeconds: timeElapsedSeconds + 1 });
        }
      },

      finishQuiz: () => {
        const { currentQuiz, userAnswers, timeElapsedSeconds, guestAttempts, currentUser } = get();
        if (!currentQuiz) return;

        let correctCount = 0;
        const total = currentQuiz.questions.length;

        currentQuiz.questions.forEach((q) => {
          if (userAnswers[q.id]?.isCorrect) {
            correctCount++;
          }
        });

        const percentage = Math.round((correctCount / total) * 100);

        const newAttempt: QuizAttempt = {
          id: `attempt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          quizId: currentQuiz.id,
          quizTitle: currentQuiz.title,
          domain: currentQuiz.domain,
          score: correctCount,
          totalQuestions: total,
          percentage,
          answers: userAnswers,
          timeSpentSeconds: timeElapsedSeconds,
          completedAt: new Date().toISOString(),
          isGuest: !currentUser,
          syncedToCloud: false,
          quizSnapshot: currentQuiz,
        };

        const updatedGuestAttempts = [newAttempt, ...guestAttempts];

        set({
          status: "completed",
          isTimerRunning: false,
          guestAttempts: updatedGuestAttempts,
        });

        // Trigger optimistic cloud sync if user is signed in
        if (currentUser) {
          get().syncToSupabase();
        }
      },

      retakeCurrentQuiz: () => {
        const { currentQuiz, practiceMode } = get();
        if (currentQuiz) {
          get().startQuiz(currentQuiz, practiceMode);
        }
      },

      resetToHome: () => {
        set({
          status: "idle",
          currentQuiz: null,
          currentIndex: 0,
          userAnswers: {},
          eliminatedOptions: {},
          bookmarkedQuestionIds: [],
          isTimerRunning: false,
        });
      },

      setCurrentUser: (user) => {
        set({ currentUser: user });
      },

      setGuestAttempts: (attempts) => {
        set({ guestAttempts: attempts });
      },

      clearSyncNotification: () => {
        set({ syncNotification: null });
      },

      syncToSupabase: async () => {
        const { currentUser, guestAttempts } = get();
        if (!currentUser) return;

        const unsyncedAttempts = guestAttempts.filter((a) => !a.syncedToCloud);
        if (unsyncedAttempts.length === 0) return;

        set({ isSyncing: true });

        try {
          const res = await fetch("/api/sync-history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: currentUser.id,
              attempts: unsyncedAttempts,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const syncedIds = new Set(unsyncedAttempts.map((a) => a.id));
            const updated = guestAttempts.map((a) =>
              syncedIds.has(a.id) ? { ...a, syncedToCloud: true } : a
            );

            set({
              guestAttempts: updated,
              isSyncing: false,
              syncNotification: `Saved ${data.syncedCount || unsyncedAttempts.length} quizzes to your cloud account!`,
            });
          } else {
            set({ isSyncing: false });
          }
        } catch (e) {
          console.warn("Cloud sync error:", e);
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: "examprep_ai_state_v1",
      partialize: (state) => ({
        guestAttempts: state.guestAttempts,
        currentUser: state.currentUser,
      }),
    }
  )
);

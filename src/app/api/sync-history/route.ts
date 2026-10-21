import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { QuizAttempt } from "@/types/quiz";

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase server client is not configured on this instance." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const attempts = (body.attempts as QuizAttempt[]) || [];
    const userId = body.userId as string;

    if (!userId) {
      return NextResponse.json({ error: "Missing authenticated user ID" }, { status: 400 });
    }

    if (attempts.length === 0) {
      return NextResponse.json({ syncedCount: 0, message: "No attempts to sync" });
    }

    let syncedCount = 0;

    for (const attempt of attempts) {
      // 1. Insert or check quiz
      let quizId = attempt.quizId;
      if (attempt.quizSnapshot) {
        const { data: quizData } = await supabase
          .from("quizzes")
          .insert({
            title: attempt.quizSnapshot.title,
            description: attempt.quizSnapshot.description,
            domain: attempt.quizSnapshot.domain,
            mode: attempt.quizSnapshot.mode,
            difficulty: attempt.quizSnapshot.difficulty,
            total_questions: attempt.quizSnapshot.questions.length,
            user_id: userId,
          })
          .select("id")
          .single();

        if (quizData?.id) {
          quizId = quizData.id;
        }
      }

      // 2. Insert attempt
      const { data: attemptRecord, error: attemptErr } = await supabase
        .from("quiz_attempts")
        .insert({
          quiz_id: quizId.startsWith("quiz-") || quizId.startsWith("sample-") ? null : quizId,
          user_id: userId,
          guest_id: attempt.id,
          score: attempt.score,
          total_questions: attempt.totalQuestions,
          percentage: attempt.percentage,
          time_spent_seconds: attempt.timeSpentSeconds,
          completed_at: attempt.completedAt,
        })
        .select("id")
        .single();

      if (attemptRecord?.id && !attemptErr) {
        syncedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      syncedCount,
      message: `Successfully synced ${syncedCount} guest quiz attempts to your account.`,
    });
  } catch (err: unknown) {
    console.error("Sync history error:", err);
    const msg = err instanceof Error ? err.message : "Sync error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { GenerateQuizRequest, QuizDifficulty, QuizMode } from "@/types/quiz";
import { extractTextFromUrl } from "@/lib/scraper/urlExtractor";
import { generateCacheKey, getCachedQuiz, setCachedQuiz } from "@/lib/redis/client";
import { generateQuizWithGemini } from "@/lib/ai/gemini";

export const maxDuration = 60; // Allow sufficient time for AI generation & scraping

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const mode = (body.mode as QuizMode) || "domain";
    const difficulty = (body.difficulty as QuizDifficulty) || "intermediate";
    const rawCount = Number(body.questionCount) || 5;
    const questionCount = Math.min(Math.max(rawCount, 3), 20); // Clamp 3 - 20

    let payloadForHash = "";
    let extractedContent: string | undefined;

    // Validate inputs per mode
    if (mode === "notes") {
      const notes = (body.notesContent || "").trim();
      if (!notes || notes.length < 15) {
        return NextResponse.json(
          { error: "Please enter at least a few sentences of study notes to generate a quiz." },
          { status: 400 }
        );
      }
      payloadForHash = notes;
    } else if (mode === "url") {
      const targetUrl = (body.url || "").trim();
      if (!targetUrl) {
        return NextResponse.json(
          { error: "Please provide a valid web or documentation URL." },
          { status: 400 }
        );
      }

      // Extract text using cheerio scraper
      try {
        const extraction = await extractTextFromUrl(targetUrl);
        extractedContent = extraction.content;
        payloadForHash = `${targetUrl}:${extractedContent.slice(0, 500)}`;
      } catch (scrapingErr: unknown) {
        const msg = scrapingErr instanceof Error ? scrapingErr.message : "Failed to read target URL.";
        return NextResponse.json({ error: msg }, { status: 422 });
      }
    } else if (mode === "domain") {
      const domain = (body.domain || "AZ-900").trim();
      payloadForHash = domain;
    } else {
      return NextResponse.json({ error: "Invalid quiz generation mode." }, { status: 400 });
    }

    // Step 2: Compute SHA-256 hash
    const cacheKey = generateCacheKey({
      mode,
      payload: payloadForHash,
      questionCount,
      difficulty,
    });

    // Step 3: Check Upstash Redis cache
    const cachedQuiz = await getCachedQuiz(cacheKey);
    if (cachedQuiz) {
      return NextResponse.json({
        quiz: cachedQuiz,
        cached: true,
        cacheKey,
        message: "Returned from Upstash Redis cache (zero latency)",
      });
    }

    // Step 4: Generate new quiz with Gemini Structured JSON output
    const generationRequest: GenerateQuizRequest = {
      mode,
      notesContent: body.notesContent,
      url: body.url,
      domain: body.domain,
      questionCount,
      difficulty,
    };

    const newQuiz = await generateQuizWithGemini(generationRequest, extractedContent);
    newQuiz.contentHash = cacheKey;

    // Step 5: Store in Upstash Redis with 24-hour TTL (86400s)
    await setCachedQuiz(cacheKey, newQuiz, 86400);

    const hasApiKey = Boolean(
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY.trim() !== "" &&
      process.env.GEMINI_API_KEY !== "your-gemini-api-key-here"
    );

    return NextResponse.json({
      quiz: newQuiz,
      cached: false,
      cacheKey,
      hasApiKey,
      message: hasApiKey
        ? "Generated via Gemini AI & cached in Upstash Redis (24h TTL)"
        : "GEMINI_API_KEY is not set in .env.local. Add your key to .env.local to enable live AI generation.",
    });
  } catch (error: unknown) {
    console.error("API /api/generate-quiz error:", error);
    const message = error instanceof Error ? error.message : "An unexpected server error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

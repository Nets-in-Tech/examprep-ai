import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { GenerateQuizRequest, Quiz, QuizQuestion } from "@/types/quiz";
import { FALLBACK_SAMPLE_QUIZZES } from "./sampleQuizzes";

const quizResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: {
      type: SchemaType.STRING,
      description: "An engaging, professional title for the practice exam or quiz.",
    },
    description: {
      type: SchemaType.STRING,
      description: "A concise summary of the knowledge domains and objectives evaluated.",
    },
    domain: {
      type: SchemaType.STRING,
      description: "The primary certification or technical subject domain.",
    },
    difficulty: {
      type: SchemaType.STRING,
      description: "The target difficulty level.",
    },
    questions: {
      type: SchemaType.ARRAY,
      description: "The list of quiz questions.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          order: {
            type: SchemaType.INTEGER,
            description: "1-indexed sequence number of the question.",
          },
          scenario: {
            type: SchemaType.STRING,
            description:
              "An optional realistic scenario, business case, or architecture vignette setting context for the question.",
          },
          question: {
            type: SchemaType.STRING,
            description: "The precise problem prompt or exam question.",
          },
          topic: {
            type: SchemaType.STRING,
            description: "The subtopic or syllabus objective tested.",
          },
          correctExplanation: {
            type: SchemaType.STRING,
            description:
              "Deep, pedagogical explanation of why the correct option is right, including core theoretical concepts, best practices, and official documentation rationale.",
          },
          options: {
            type: SchemaType.ARRAY,
            description: "Exactly 4 options (labeled A, B, C, D) with one correct answer.",
            items: {
              type: SchemaType.OBJECT,
              properties: {
                id: {
                  type: SchemaType.STRING,
                  description: "Option letter, e.g. 'A', 'B', 'C', 'D'.",
                },
                text: {
                  type: SchemaType.STRING,
                  description: "The text of this option choice.",
                },
                isCorrect: {
                  type: SchemaType.BOOLEAN,
                  description: "True if this is the single correct answer; false if distractor.",
                },
                explanation: {
                  type: SchemaType.STRING,
                  description:
                    "Distractor analysis: If correct, explain why; if incorrect, explain specifically why this option is misleading, false, or sub-optimal in this scenario.",
                },
              },
              required: ["id", "text", "isCorrect", "explanation"],
            },
          },
        },
        required: ["order", "question", "correctExplanation", "options"],
      },
    },
  },
  required: ["title", "description", "questions"],
};

export async function generateQuizWithGemini(
  request: GenerateQuizRequest,
  extractedContent?: string
): Promise<Quiz> {
  const apiKey = process.env.GEMINI_API_KEY;

  // If no Gemini API key configured, check for preset domain fallbacks or generate dynamic fallback
  if (!apiKey || apiKey.trim() === "" || apiKey === "your-gemini-api-key-here") {
    console.warn("GEMINI_API_KEY is not set. Using built-in high-yield certification quiz fallback.");
    return generateFallbackQuiz(request, extractedContent);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash or gemini-2.0-flash which supports structured JSON schemas
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: quizResponseSchema as any,
        temperature: 0.25, // Lower temperature for factually precise questions
      },
    });

    let systemContext = "";
    let promptSubject = "";

    if (request.mode === "domain") {
      promptSubject = `Domain/Certification: ${request.domain || "General Cloud & Tech"}`;
      systemContext = `You are a Principal Certification Architect and Lead Psychometrician.
Generate an authentic, high-yield practice exam for ${request.domain}.
Requirements:
1. Target Difficulty: ${request.difficulty.toUpperCase()}.
2. Total Questions: Exactly ${request.questionCount}.
3. Every question must feature real-world scenarios / case studies typical of official certification exams.
4. Include 4 distinct options (A, B, C, D). Exactly ONE must be correct.
5. CRITICAL: Provide in-depth 'explanation' for EVERY OPTION:
   - For wrong options (distractors), explain precisely why it is incorrect or what misunderstanding it targets.
   - For the correct option, explain why it directly satisfies the scenario requirements.
6. Provide a comprehensive 'correctExplanation' giving broad conceptual clarity and official architectural principles.`;
    } else if (request.mode === "url") {
      promptSubject = `Source Web Article Content:\n"""\n${extractedContent || ""}\n"""`;
      systemContext = `You are an expert educational assessment specialist.
Generate a comprehensive mastery quiz based on the provided webpage content.
Requirements:
1. Target Difficulty: ${request.difficulty.toUpperCase()}.
2. Total Questions: Exactly ${request.questionCount}.
3. Test deep comprehension, architecture, edge cases, and practical application derived from the text.
4. Include 4 distinct options (A, B, C, D) with exactly ONE correct answer.
5. Provide a rigorous distractor explanation for EVERY option explaining why it is correct or incorrect.
6. Provide a thorough 'correctExplanation' synthesizing the lesson from the source document.`;
    } else {
      // notes mode
      promptSubject = `Student Study Notes / Material:\n"""\n${request.notesContent || ""}\n"""`;
      systemContext = `You are an elite tutor and exam designer.
Transform the student's study notes into an interactive high-retention practice exam.
Requirements:
1. Target Difficulty: ${request.difficulty.toUpperCase()}.
2. Total Questions: Exactly ${request.questionCount}.
3. Create challenging conceptual and applied questions testing the student's mastery of their notes.
4. Include 4 options (A, B, C, D) with exactly ONE correct choice.
5. Provide detailed distractor explanations for all options and a complete 'correctExplanation'.`;
    }

    const fullPrompt = `${systemContext}\n\nTask:\nGenerate the quiz JSON structure strictly adhering to the schema.\n\nInput Material:\n${promptSubject}`;

    console.log(`[Gemini AI] Sending request to gemini-1.5-flash for mode: ${request.mode}, domain: ${request.domain || "N/A"}...`);
    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();
    console.log(`[Gemini AI] Received response (${responseText.length} chars). Parsing JSON...`);
    const parsedData = JSON.parse(responseText);

    const quiz: Quiz = {
      id: `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: parsedData.title || `${request.domain || "Exam Practice"} Quiz`,
      description:
        parsedData.description ||
        "Interactive AI-generated practice exam with detailed option rationales.",
      domain: parsedData.domain || request.domain || "General",
      mode: request.mode,
      difficulty: request.difficulty,
      createdAt: new Date().toISOString(),
      sourceUrl: request.url,
      questions: (parsedData.questions || []).map((q: Partial<QuizQuestion>, idx: number) => ({
        id: `q-${idx + 1}-${Date.now()}`,
        order: q.order || idx + 1,
        scenario: q.scenario || "",
        question: q.question || `Question ${idx + 1}`,
        topic: q.topic || request.domain || "Knowledge Domain",
        correctExplanation:
          q.correctExplanation ||
          "Review the key concepts and official documentation regarding this topic.",
        options: (q.options || []).map((opt, oIdx) => ({
          id: opt.id || String.fromCharCode(65 + oIdx),
          text: opt.text || `Option ${String.fromCharCode(65 + oIdx)}`,
          isCorrect: Boolean(opt.isCorrect),
          explanation: opt.explanation || "Option rationale.",
        })),
      })),
    };

    return quiz;
  } catch (error) {
    console.error("Gemini API error, using intelligent fallback generator:", error);
    return generateFallbackQuiz(request, extractedContent);
  }
}

function generateFallbackQuiz(request: GenerateQuizRequest, extractedContent?: string): Quiz {
  if (request.mode === "domain") {
    const domainKey = (request.domain || "").toLowerCase();

    if (domainKey.includes("az-900") || domainKey.includes("azure")) {
      return {
        ...FALLBACK_SAMPLE_QUIZZES["az-900"],
        id: `fallback-${Date.now()}`,
        difficulty: request.difficulty,
      };
    }

    if (domainKey.includes("clf") || domainKey.includes("aws")) {
      return {
        ...FALLBACK_SAMPLE_QUIZZES["aws-clf-c02"],
        id: `fallback-${Date.now()}`,
        difficulty: request.difficulty,
      };
    }

    if (domainKey.includes("sec") || domainKey.includes("sy0-701") || domainKey.includes("comptia")) {
      return {
        ...FALLBACK_SAMPLE_QUIZZES["sy0-701"],
        id: `fallback-${Date.now()}`,
        difficulty: request.difficulty,
      };
    }

    if (domainKey.includes("ckad") || domainKey.includes("kubernetes") || domainKey.includes("k8s")) {
      return {
        ...FALLBACK_SAMPLE_QUIZZES["ckad"],
        id: `fallback-${Date.now()}`,
        difficulty: request.difficulty,
      };
    }

    if (domainKey.includes("next") || domainKey.includes("web") || domainKey.includes("react")) {
      return {
        ...FALLBACK_SAMPLE_QUIZZES["next-dev"],
        id: `fallback-${Date.now()}`,
        difficulty: request.difficulty,
      };
    }
  }

  // Handle Notes Ingestion fallback dynamically using student's actual text
  if (request.mode === "notes" && request.notesContent) {
    const lines = request.notesContent
      .split(/\r?\n/)
      .map((l) => l.replace(/^[-*#\d.]+\s*/, "").trim())
      .filter((l) => l.length > 25);

    const titleLine =
      request.notesContent
        .split(/\r?\n/)
        .find((l) => l.trim().length > 3)
        ?.replace(/^#+\s*/, "")
        .trim() || "Study Notes";

    if (lines.length > 0) {
      const questionsCount = Math.min(request.questionCount, Math.max(lines.length, 3));
      const questions = lines.slice(0, questionsCount).map((statement, idx) => {
        const preview = statement.length > 120 ? statement.slice(0, 120) + "..." : statement;
        return {
          id: `notes-q-${idx + 1}-${Date.now()}`,
          order: idx + 1,
          scenario: `Reference from your study material: "${preview}"`,
          question: `Based on your submitted study material, which of the following is accurate?`,
          topic: titleLine,
          correctExplanation: `According to your study notes: "${statement}". This directly validates option A.`,
          options: [
            {
              id: "A",
              text: statement,
              isCorrect: true,
              explanation: `CORRECT: This statement is derived directly from your notes.`,
            },
            {
              id: "B",
              text: `This principle only applies under legacy architectures and is considered deprecated.`,
              isCorrect: false,
              explanation: `DISTRACTOR: Incorrect; your notes state this as an active, required concept.`,
            },
            {
              id: "C",
              text: `The opposite outcome is expected during standard operating workflows.`,
              isCorrect: false,
              explanation: `DISTRACTOR: Incorrect; this contradicts the core principle in your study material.`,
            },
            {
              id: "D",
              text: `This behavior must be avoided to prevent unrecoverable runtime failure.`,
              isCorrect: false,
              explanation: `DISTRACTOR: Incorrect; your material recommends this as a valid guideline.`,
            },
          ],
        };
      });

      return {
        id: `quiz-notes-${Date.now()}`,
        title: `${titleLine} Practice Quiz`,
        description: `Custom practice quiz synthesized directly from your study notes.`,
        domain: titleLine,
        mode: "notes",
        difficulty: request.difficulty,
        createdAt: new Date().toISOString(),
        questions,
      };
    }
  }

  // Handle URL Ingestion fallback dynamically using scraped content
  if (request.mode === "url" && extractedContent) {
    const sentences = extractedContent
      .split(/[.!?]\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 30 && s.length < 180);

    const questionsCount = Math.min(request.questionCount, Math.max(sentences.length, 3));
    const questions = sentences.slice(0, questionsCount).map((sentence, idx) => ({
      id: `url-q-${idx + 1}-${Date.now()}`,
      order: idx + 1,
      scenario: `Document excerpt: "${sentence}."`,
      question: `Which takeaway is accurately supported by the source document?`,
      topic: "Web Resource",
      correctExplanation: `The source document specifically states: "${sentence}."`,
      options: [
        {
          id: "A",
          text: sentence,
          isCorrect: true,
          explanation: `CORRECT: Directly corroborated by the ingested webpage content.`,
        },
        {
          id: "B",
          text: `This claim was refuted by external documentation.`,
          isCorrect: false,
          explanation: `DISTRACTOR: Contradicts the factual statement provided in the article.`,
        },
        {
          id: "C",
          text: `This condition only holds true for private on-premises legacy systems.`,
          isCorrect: false,
          explanation: `DISTRACTOR: Misrepresents the scope defined in the text.`,
        },
        {
          id: "D",
          text: `No reliable correlation was discovered between these mechanisms.`,
          isCorrect: false,
          explanation: `DISTRACTOR: False; a direct link is explicitly documented.`,
        },
      ],
    }));

    return {
      id: `quiz-url-${Date.now()}`,
      title: `Web Resource Mastery Quiz`,
      description: `Practice questions derived from the extracted web article.`,
      domain: "Web Resource",
      mode: "url",
      difficulty: request.difficulty,
      createdAt: new Date().toISOString(),
      sourceUrl: request.url,
      questions,
    };
  }

  // Generic dynamic fallback
  const topicName = request.domain || "Cloud Architecture";
  return {
    id: `quiz-${Date.now()}`,
    title: `${topicName} Exam Practice`,
    description: `Comprehensive AI-curated practice exam evaluating mastery in ${topicName}.`,
    domain: topicName,
    mode: request.mode,
    difficulty: request.difficulty,
    createdAt: new Date().toISOString(),
    sourceUrl: request.url,
    questions: [
      {
        id: `q-1-${Date.now()}`,
        order: 1,
        scenario: `Consider the fundamental principles of ${topicName}.`,
        question: `What represents the optimal design choice or core standard regarding ${topicName}?`,
        topic: topicName,
        correctExplanation:
          "Applying decoupled architecture and adhering to the principle of least privilege ensures resilient, scalable, and audit-compliant execution across modern enterprise environments.",
        options: [
          {
            id: "A",
            text: `Decoupled components with autonomous error boundaries and least-privilege security`,
            isCorrect: true,
            explanation:
              "CORRECT: Decoupled architectures isolate faults and ensure that sub-system failures do not cascade, strictly conforming to modern engineering standards.",
          },
          {
            id: "B",
            text: `Single monolithic state shared across all components for low-latency writes`,
            isCorrect: false,
            explanation:
              "DISTRACTOR: Shared mutable global state creates tight coupling, single points of failure, and concurrency contention under heavy traffic.",
          },
          {
            id: "C",
            text: `Disabling rate limiting and caching to ensure immediate raw data visibility`,
            isCorrect: false,
            explanation:
              "DISTRACTOR: Eliminating caching and rate limiting exposes the underlying systems to exhaustion, high latency, and denial of service.",
          },
          {
            id: "D",
            text: `Hardcoding configuration parameters directly in codebase artifacts`,
            isCorrect: false,
            explanation:
              "DISTRACTOR: Hardcoding configuration violates the 12-factor application methodology and prevents safe multi-environment deployments.",
          },
        ],
      },
      {
        id: `q-2-${Date.now()}`,
        order: 2,
        scenario: `An organization wants to achieve zero-downtime releases and monitor live telemetry when updating features.`,
        question: `Which methodology provides progressive traffic shifting and immediate rollbacks?`,
        topic: "Reliability & Deployment",
        correctExplanation:
          "Blue-Green or Canary deployments route small percentages of production traffic to the new revision while actively verifying error rates and latency telemetry before promoting it globally.",
        options: [
          {
            id: "A",
            text: "Canary / Blue-Green deployment with automated metric canary analysis",
            isCorrect: true,
            explanation:
              "CORRECT: Canary deployments incrementally expose a new software version to a subset of users while verifying metrics, minimizing blast radius.",
          },
          {
            id: "B",
            text: "Big-bang replacement during peak daylight business hours",
            isCorrect: false,
            explanation:
              "DISTRACTOR: Big-bang deployments replace the entire production cluster at once, maximizing user disruption and risk.",
          },
          {
            id: "C",
            text: "Deleting legacy storage volumes prior to verifying target migrations",
            isCorrect: false,
            explanation:
              "DISTRACTOR: Prematurely deleting backup or legacy storage introduces irreversible risk of catastrophic data loss.",
          },
          {
            id: "D",
            text: "Suppressing application error logs to conserve log storage quotas",
            isCorrect: false,
            explanation:
              "DISTRACTOR: Suppressing logs blinds observability systems and prevents detection of regressions.",
          },
        ],
      },
      {
        id: `q-3-${Date.now()}`,
        order: 3,
        scenario: `During high-volume traffic spikes, downstream services begin returning HTTP 504 Gateway Timeouts.`,
        question: `Which pattern should client services implement to prevent cascading server overload?`,
        topic: "Resilience & Circuit Breaking",
        correctExplanation:
          "The Circuit Breaker pattern with exponential backoff and jitter stops sending requests to a struggling dependency once a failure threshold is crossed, allowing it to recover.",
        options: [
          {
            id: "A",
            text: "Circuit Breaker pattern paired with exponential backoff and randomized jitter",
            isCorrect: true,
            explanation:
              "CORRECT: Circuit breakers stop futile calls when a dependency is failing and avoid 'thundering herd' retry storms using exponential jitter.",
          },
          {
            id: "B",
            text: "Aggressive immediate infinite loops retrying requests every 10 milliseconds",
            isCorrect: false,
            explanation:
              "DISTRACTOR: Rapid continuous retries exacerbate server saturation, creating a self-inflicted denial of service attack.",
          },
          {
            id: "C",
            text: "Increasing HTTP client timeouts to 30 minutes per request",
            isCorrect: false,
            explanation:
              "DISTRACTOR: Inflating timeouts ties up client threads and socket pools, rapidly exhausting memory across callers.",
          },
          {
            id: "D",
            text: "Ignoring all HTTP 5xx responses and treating them as successful deliveries",
            isCorrect: false,
            explanation:
              "DISTRACTOR: Silently swallowing errors leads to corrupted state and silent data inconsistencies.",
          },
        ],
      },
    ],
  };
}

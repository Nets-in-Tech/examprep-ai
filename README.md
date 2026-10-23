# 🎓 ExamPrep AI — Smart Quiz Builder & Exam Simulation

ExamPrep AI is a high-performance, web-based exam prep platform that transforms study materials (notes, public URLs, or preset cert topics like AZ-900) into interactive, AI-powered practice quizzes with **instant, deep explanations for every option**.

---

## ⚡ Tech Stack & Architecture

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS + `tailwind-merge` + `clsx` + `lucide-react`
- **Component Architecture:** Modular atomic UI components in `/components/ui` (`Button`, `Card`, `Badge`, `Dialog`, `Input`, `Textarea`, `Tabs`, `Progress`)
- **Backend & Database:** Supabase (PostgreSQL, Supabase Auth, Row Level Security)
- **AI Engine:** Google Gemini API (`@google/generative-ai` & `@google/genai`) with **responseSchema Structured JSON enforcement**
- **Caching Layer:** Upstash Redis (`@upstash/redis`) with SHA-256 prompt hashing and 24-hour TTL
- **State Management:** Zustand (with local persistence) + TanStack React Query
- **Scraper:** `cheerio` / `jsdom` for web resource extraction

---

## 🚀 Key Features

### 1. Ingestion Modes
- **Mode 1: Direct Notes Ingestion:** Paste notes, lecture outlines, or Markdown with 1-click test templates.
- **Mode 2: Web / Resource URL Ingestion:** Paste any documentation or article URL; backend extracts sanitized text using Cheerio.
- **Mode 3: Preset Cloud & Tech Domains:** Direct syllabus coverage for certifications:
  - Microsoft Azure Fundamentals (AZ-900)
  - AWS Certified Cloud Practitioner (CLF-C02)
  - CompTIA Security+ (SY0-701)
  - Certified Kubernetes Application Developer (CKAD)
  - Modern Web & Next.js Architecture

### 2. Smart Quiz Player
- **Deep Explanations:** Immediate pedagogical rationales for the correct answer AND distractor analyses for every wrong option.
- **Option Elimination Tool:** Strikethrough mode allowing students to eliminate choices like real test-takers.
- **Exam Vignettes:** Real-world scenario context and business vignettes.
- **Question Bookmarking & Matrix Jump:** Flag questions and navigate via the Question Overview Grid.
- **Active Timer:** Real-time exam simulation clock.

### 3. Guest-First Architecture & Cloud Sync
- **Instant Guest Access:** Generate and take quizzes immediately with zero friction.
- **Local Persistence:** Attempts and bookmarks are saved in `localStorage`.
- **Supabase Cloud Sync:** Automatic synchronization of guest attempts to Supabase upon sign-up or sign-in.

### 4. Results & Export
- Comprehensive score card with percentage, letter grade, and celebration confetti.
- Filter questions by All, Incorrect, or Bookmarked.
- 1-click Export to Markdown, JSON, or browser Print/PDF.

---

## 🗄️ Supabase Database Schema

The database schema is provided in [`supabase/schema.sql`](supabase/schema.sql). 

### How to apply:
1. Open your project in the [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor**.
3. Copy and paste the contents of [`supabase/schema.sql`](supabase/schema.sql).
4. Click **Run**.

Tables created:
- `profiles`: Synced user profiles with Supabase Auth trigger.
- `quizzes`: Quiz sets with domain, difficulty, and content hash.
- `questions`: Question text, order, scenario, and conceptual explanation.
- `options`: 4 options (A-D) with distractor explanations.
- `quiz_attempts`: Scores, percentages, duration, and guest IDs.
- `user_answers`: Selected options and accuracy per attempt.

---

## 🔑 Environment Variables Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure your credentials:

```env
# 1. Supabase (https://supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 2. Google Gemini API (https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your-gemini-api-key

# 3. Upstash Redis (https://console.upstash.com)
UPSTASH_REDIS_REST_URL=https://your-upstash-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
```

*Note: The app is equipped with smart built-in fallbacks and development mocks, allowing full interactive testing out of the box even before API keys are populated.*

---

## 🛠️ Running Locally

```bash
# Navigate to project directory
cd examprep-ai

# Install dependencies (already completed)
npm install

# Start development server
npm run dev

# Or build for production
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

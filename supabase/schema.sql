-- =========================================================================
-- ExamPrep AI ("Smart Quiz Builder") - Supabase Database Schema
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor)
-- =========================================================================

-- Enable UUID extension if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

COMMENT ON TABLE public.profiles IS 'Stores user profile details synchronized with Supabase Auth.';

-- 2. QUIZZES TABLE (Stores generated quiz structures)
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL if generated anonymously or public
    title TEXT NOT NULL,
    description TEXT,
    domain TEXT NOT NULL DEFAULT 'General',
    mode TEXT NOT NULL CHECK (mode IN ('notes', 'url', 'domain')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'exam_simulation')),
    total_questions INTEGER NOT NULL DEFAULT 0,
    source_url TEXT,
    content_hash TEXT, -- SHA-256 hash for Upstash Redis caching & deduplication
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

COMMENT ON TABLE public.quizzes IS 'Holds generated quiz sets, whether created by guests or registered users.';

-- 3. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL,
    scenario TEXT, -- Real-world context / case study / exam vignette
    question_text TEXT NOT NULL,
    correct_explanation TEXT NOT NULL, -- In-depth rationale explaining why the correct choice is right
    topic TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

COMMENT ON TABLE public.questions IS 'Individual questions belonging to a quiz, with deep pedagogical rationales.';

-- 4. OPTIONS TABLE (with distractor explanations for every single option!)
CREATE TABLE IF NOT EXISTS public.options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    option_label TEXT NOT NULL, -- e.g. "A", "B", "C", "D"
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    explanation TEXT NOT NULL, -- Distractor rationale explaining why this option is right or wrong
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

COMMENT ON TABLE public.options IS 'Options for each question, including detailed distractor explanations.';

-- 5. QUIZ_ATTEMPTS TABLE (Stores performance, scores, and timestamps)
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    guest_id TEXT, -- Guest identifier when syncing from local storage
    score INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    time_spent_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

COMMENT ON TABLE public.quiz_attempts IS 'Quiz completion records for both authenticated users and synced guest attempts.';

-- 6. USER_ANSWERS TABLE (Individual question responses within an attempt)
CREATE TABLE IF NOT EXISTS public.user_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option_id TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

COMMENT ON TABLE public.user_answers IS 'Records individual user selections during a quiz attempt.';

-- =========================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON public.quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_content_hash ON public.quizzes(content_hash);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON public.questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_options_question_id ON public.options(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_guest_id ON public.quiz_attempts(guest_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_attempt_id ON public.user_answers(attempt_id);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are readable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- QUIZZES POLICIES
CREATE POLICY "Anyone can read public quizzes or their own"
    ON public.quizzes FOR SELECT
    USING (is_public = true OR auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can create quizzes (guest or authenticated)"
    ON public.quizzes FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Owners can update their own quizzes"
    ON public.quizzes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete their own quizzes"
    ON public.quizzes FOR DELETE
    USING (auth.uid() = user_id);

-- QUESTIONS POLICIES
CREATE POLICY "Anyone can view questions of readable quizzes"
    ON public.questions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.quizzes
        WHERE public.quizzes.id = public.questions.quiz_id
        AND (public.quizzes.is_public = true OR public.quizzes.user_id = auth.uid() OR public.quizzes.user_id IS NULL)
    ));

CREATE POLICY "Anyone can insert questions for quizzes they create"
    ON public.questions FOR INSERT
    WITH CHECK (true);

-- OPTIONS POLICIES
CREATE POLICY "Anyone can view options of readable questions"
    ON public.options FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert options"
    ON public.options FOR INSERT
    WITH CHECK (true);

-- QUIZ_ATTEMPTS POLICIES
CREATE POLICY "Users can view their own attempts or attempts matching guest_id"
    ON public.quiz_attempts FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can insert quiz attempts"
    ON public.quiz_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- USER_ANSWERS POLICIES
CREATE POLICY "Users can view user answers of readable attempts"
    ON public.user_answers FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.quiz_attempts
        WHERE public.quiz_attempts.id = public.user_answers.attempt_id
        AND (public.quiz_attempts.user_id = auth.uid() OR public.quiz_attempts.user_id IS NULL)
    ));

CREATE POLICY "Anyone can insert user answers"
    ON public.user_answers FOR INSERT
    WITH CHECK (true);

-- =========================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger for profiles
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

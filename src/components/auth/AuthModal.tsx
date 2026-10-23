"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useQuizStore } from "@/store/useQuizStore";
import { Lock, Sparkles, CheckCircle, AlertCircle } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { setCurrentUser, syncToSupabase, guestAttempts } = useQuizStore();
  const hasSupabase = isSupabaseConfigured();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      // Development simulated login when Supabase credentials are not configured
      setTimeout(() => {
        const dummyUser = {
          id: `simulated-user-${Date.now()}`,
          email: email || "student@examprep.ai",
          name: name || email.split("@")[0] || "Exam Student",
        };
        setCurrentUser(dummyUser);
        setIsLoading(false);
        setSuccessMsg("Signed in (Dev mode). Your local guest quizzes are now marked as active!");
        setTimeout(() => {
          onClose();
        }, 1200);
      }, 700);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        });
        if (error) throw error;
        if (data.user) {
          setCurrentUser({
            id: data.user.id,
            email: data.user.email || email,
            name: name || data.user.user_metadata?.full_name,
          });
          setSuccessMsg("Account created! Automatically syncing your local quizzes to Supabase...");
          await syncToSupabase();
          setTimeout(() => onClose(), 1500);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          setCurrentUser({
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.full_name,
          });
          setSuccessMsg("Signed in! Syncing your quiz progress...");
          await syncToSupabase();
          setTimeout(() => onClose(), 1200);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setTimeout(() => {
        setCurrentUser({
          id: `google-user-${Date.now()}`,
          email: "cloud.learner@gmail.com",
          name: "Cloud Learner",
        });
        setIsLoading(false);
        setSuccessMsg("Signed in with Google (Dev mode). Guest history connected!");
        setTimeout(() => onClose(), 1200);
      }, 800);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google OAuth failed.";
      setErrorMsg(msg);
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isSignUp ? "Create an ExamPrep Account" : "Sign In to ExamPrep AI"}
      description="Save your practice exam attempts, track weak knowledge domains, and sync your scores across all devices."
    >
      <div className="space-y-4">
        {guestAttempts.length > 0 && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
            <Sparkles className="h-4 w-4 shrink-0 text-indigo-400" />
            <span>
              <strong>{guestAttempts.length} guest quiz session(s)</strong> ready to automatically sync to your cloud account upon signing in!
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <Button
          type="button"
          variant="secondary"
          className="w-full flex items-center justify-center gap-3 py-2.5 bg-slate-800 hover:bg-slate-700 border-slate-700"
          onClick={handleGoogleLogin}
          isLoading={isLoading}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </Button>

        <div className="relative my-4 flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-xs text-slate-500 uppercase tracking-wider absolute">
            Or with email
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <Input
                type="text"
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isSignUp}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <Input
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
            <Lock className="h-4 w-4 mr-1.5" />
            <span>{isSignUp ? "Sign Up & Sync Progress" : "Sign In & Continue"}</span>
          </Button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account yet? Create one"}
          </button>
        </div>

        {!hasSupabase && (
          <p className="text-[11px] text-slate-500 text-center border-t border-slate-800/80 pt-2">
            Supabase keys not configured yet: Interactive simulated auth will persist session locally. Add Supabase keys to .env.local for full cloud sync.
          </p>
        )}
      </div>
    </Dialog>
  );
}

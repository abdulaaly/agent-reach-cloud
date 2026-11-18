"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { loginWithGoogle, loginWithGithub, loginWithEmail, signupWithEmail } from "@/lib/firebase";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mode = searchParams.get("mode");
  const redirectUri = searchParams.get("redirect_uri");
  const state = searchParams.get("state");
  const clientId = searchParams.get("client_id") || "ChatGPT / Claude Web";

  const isOauthConsent = mode === "oauth_consent" && Boolean(redirectUri);

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthSuccess = async (userEmail: string, userName?: string) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, name: userName }),
      });
      const data = await res.json();
      const userId = data.user?.id || "user_demo_01";

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "agent_reach_session",
          JSON.stringify({
            userId,
            email: userEmail,
            name: userName || userEmail.split("@")[0],
          })
        );
      }

      if (isOauthConsent && redirectUri) {
        window.location.href = `/api/oauth/authorize?userId=${encodeURIComponent(
          userId
        )}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(
          state || ""
        )}`;
        return;
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to initialize session");
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const res = await signupWithEmail(email, password, name);
        if (res?.user?.email) {
          await handleAuthSuccess(res.user.email, name);
        }
      } else {
        const res = await loginWithEmail(email, password);
        if (res?.user?.email) {
          await handleAuthSuccess(res.user.email);
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginWithGoogle();
      if (res?.user?.email) {
        await handleAuthSuccess(res.user.email, res.user.displayName || undefined);
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginWithGithub();
      if (res?.user?.email) {
        await handleAuthSuccess(res.user.email, res.user.displayName || undefined);
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    await handleAuthSuccess("demo@agent-reach.cloud", "Enterprise Demo User");
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4 sm:p-6">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <Link href="/" className="inline-flex items-center justify-center gap-2 mb-3 group">
          <div className="w-8 h-8 rounded-lg bg-[#5e6ad2]/15 border border-[#5e6ad2]/30 flex items-center justify-center p-1 group-hover:border-[#5e6ad2] transition">
            <img src="/logo.svg" alt="Agent Reach Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-semibold text-sm text-slate-900 dark:text-[#f7f8f8]">
            Agent-Reach Cloud
          </span>
        </Link>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-[#f7f8f8] tracking-tight">
          {isOauthConsent ? `Authorize ${clientId}` : isSignUp ? "Create Account" : "Sign In"}
        </h1>
        <p className="text-xs text-slate-500 dark:text-[#8a8f98] mt-1 max-w-xs mx-auto">
          {isOauthConsent
            ? `Grant ${clientId} tool execution permissions with your compute quota.`
            : "Access your personal Remote MCP endpoint & API tokens."}
        </p>
      </div>

      {/* Main Form Box */}
      <div className="rounded-xl p-6 border border-slate-200 dark:border-[#23252a] bg-white dark:bg-[#0f1011] shadow-sm">
        {error && (
          <div className="mb-4 p-2.5 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-red-700 dark:text-red-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* OAuth Consent Details */}
        {isOauthConsent && (
          <div className="mb-5 p-3 rounded-lg bg-slate-50 dark:bg-[#141516] border border-slate-200 dark:border-[#23252a] text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#5e6ad2] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Permission Request</span>
            </div>
            <p className="text-slate-600 dark:text-[#8a8f98] text-[11px] leading-relaxed">
              <strong>{clientId}</strong> will receive read-only tool invocation permissions for 16 web platforms using your personal compute quota.
            </p>
          </div>
        )}

        {/* Third-Party Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-medium border border-slate-200 dark:border-[#23252a] bg-white dark:bg-[#141516] hover:bg-slate-50 dark:hover:bg-[#191a1b] text-slate-800 dark:text-[#f7f8f8] transition"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={handleGithubLogin}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-medium border border-slate-200 dark:border-[#23252a] bg-white dark:bg-[#141516] hover:bg-slate-50 dark:hover:bg-[#191a1b] text-slate-800 dark:text-[#f7f8f8] transition"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>GitHub</span>
          </button>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-[#23252a]"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-white dark:bg-[#0f1011] px-2 text-slate-500 dark:text-[#62666d]">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="block text-[11px] font-medium text-slate-700 dark:text-[#d0d6e0] mb-1">
                Your Name
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-md bg-slate-50 dark:bg-[#141516] border border-slate-200 dark:border-[#23252a] text-slate-900 dark:text-[#f7f8f8] placeholder-slate-400 focus:outline-none focus:border-[#5e6ad2]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-[#d0d6e0] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-md bg-slate-50 dark:bg-[#141516] border border-slate-200 dark:border-[#23252a] text-slate-900 dark:text-[#f7f8f8] placeholder-slate-400 focus:outline-none focus:border-[#5e6ad2]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-[#d0d6e0] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-md bg-slate-50 dark:bg-[#141516] border border-slate-200 dark:border-[#23252a] text-slate-900 dark:text-[#f7f8f8] placeholder-slate-400 focus:outline-none focus:border-[#5e6ad2]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium rounded-md text-white bg-[#5e6ad2] hover:bg-[#828fff] disabled:opacity-60 transition"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : isOauthConsent ? (
              <>
                <span>Confirm & Connect {clientId}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : isSignUp ? (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#141516]">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2 px-3 rounded-md text-xs font-medium bg-slate-100 dark:bg-[#141516] hover:bg-slate-200 dark:hover:bg-[#191a1b] text-slate-700 dark:text-[#d0d6e0] border border-slate-200 dark:border-[#23252a] transition flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#5e6ad2]" />
            <span>Fast 1-Click Demo Login (500 Credits Included)</span>
          </button>
        </div>

        {/* Toggle Sign Up / Sign In */}
        {!isOauthConsent && (
          <div className="mt-4 text-center text-xs text-slate-500 dark:text-[#8a8f98]">
            {isSignUp ? (
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => setIsSignUp(false)}
                  className="text-[#5e6ad2] hover:underline font-medium"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{" "}
                <button
                  onClick={() => setIsSignUp(true)}
                  className="text-[#5e6ad2] hover:underline font-medium"
                >
                  Create One Free
                </button>
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-[#8a8f98]">
        <Link href="/" className="hover:text-slate-900 dark:hover:text-white">Home</Link>
        <span>&bull;</span>
        <ThemeToggle />
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#010102] text-[#08090A] dark:text-[#F7F8F8] flex items-center justify-center relative overflow-hidden transition-colors duration-200">
      <Suspense fallback={<div className="text-slate-500 text-xs">Loading authentication...</div>}>
        <AuthContent />
      </Suspense>
    </div>
  );
}

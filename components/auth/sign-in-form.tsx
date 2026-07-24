"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

function getSiteUrl() {
  const fallbackUrl = window.location.origin;
  return fallbackUrl.endsWith("/") ? fallbackUrl.slice(0, -1) : fallbackUrl;
}

function safeNextPath(nextPath?: string) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) return "/dashboard";
  return nextPath;
}

export function SignInForm({ nextPath }: { nextPath?: string }) {
  const destination = safeNextPath(nextPath);
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePasswordReset() {
    setMessage(null);
    setError(null);
    if (!email.trim()) {
      setError("Enter the account email address first.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent("/update-password")}`,
    });
    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }
    setMessage("Password reset email sent. Use the newest link in your inbox.");
  }

  async function handleMagicLink() {
    setMessage(null);
    setError(null);
    if (!email.trim()) {
      setError("Enter the account email address first.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: magicLinkError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(destination)}`,
      },
    });
    setLoading(false);

    if (magicLinkError) {
      setError(magicLinkError.message);
      return;
    }

    setMessage("Secure sign-in link sent. Open the newest email on this device.");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const supabase = createClient();
      if (mode === "sign-up") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName || email.split("@")[0],
              username: email.split("@")[0],
            },
            emailRedirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(destination)}`,
          },
        });

        if (signUpError) throw signUpError;
        if (data.session) {
          window.location.assign(destination);
          return;
        }
        setMessage("Account created. Check your email to confirm your TBX account.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        window.location.assign(destination);
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex rounded-xl bg-slate-100 p-1">
        <button type="button" onClick={() => setMode("sign-in")} className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${mode === "sign-in" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>Sign in</button>
        <button type="button" onClick={() => setMode("sign-up")} className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${mode === "sign-up" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>Create account</button>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {mode === "sign-up" ? (
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Display name</span>
            <input className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Warren O'Leary" autoComplete="name" />
          </label>
        ) : null}

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400" value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@example.com" autoComplete="email" required />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400" value={password} onChange={(event) => setPassword(event.target.value)} type="password" minLength={8} autoComplete={mode === "sign-up" ? "new-password" : "current-password"} required={mode === "sign-up"} />
        </label>

        {mode === "sign-in" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button type="button" disabled={loading} onClick={handlePasswordReset} className="text-sm font-semibold text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline">Forgot your password?</button>
            <button type="button" disabled={loading} onClick={handleMagicLink} className="inline-flex items-center gap-2 text-sm font-semibold text-yellow-700 underline-offset-4 hover:text-yellow-600 hover:underline"><Mail className="h-4 w-4" /> Email me a sign-in link</button>
          </div>
        ) : null}

        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        {message ? <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}

        <Button disabled={loading || (mode === "sign-in" && !password)} className="h-12 w-full rounded-xl bg-yellow-400 font-semibold text-slate-950 hover:bg-yellow-300">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {mode === "sign-up" ? "Create TBX account" : "Enter TBX"}
          {!loading ? <ArrowRight className="h-4 w-4" /> : null}
        </Button>
      </form>
    </div>
  );
}

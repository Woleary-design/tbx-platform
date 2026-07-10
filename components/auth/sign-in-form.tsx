"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function SignInForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (signUpError) throw signUpError;

        if (data.session) {
          router.push("/dashboard");
          router.refresh();
          return;
        }

        setMessage("Account created. Check your email to confirm your TBX account.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        router.push("/dashboard");
        router.refresh();
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
        <button
          type="button"
          onClick={() => setMode("sign-in")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${mode === "sign-in" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("sign-up")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${mode === "sign-up" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}
        >
          Create account
        </button>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {mode === "sign-up" ? (
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Display name</span>
            <input
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Warren O'Leary"
              autoComplete="name"
            />
          </label>
        ) : null}

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            minLength={8}
            autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
            required
          />
        </label>

        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        {message ? <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}

        <Button disabled={loading} className="h-12 w-full rounded-xl bg-yellow-400 font-semibold text-slate-950 hover:bg-yellow-300">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {mode === "sign-up" ? "Create TBX account" : "Enter TBX"}
          {!loading ? <ArrowRight className="h-4 w-4" /> : null}
        </Button>
      </form>
    </div>
  );
}

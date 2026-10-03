"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [firstEntry, setFirstEntry] = useState("");
  const [secondEntry, setSecondEntry] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function restoreSession() {
      try {
        // The browser SDK owns URL-code exchange and strips the one-use code.
        // Calling exchangeCodeForSession again races its automatic initialization.
        const { error: initializationError } = await supabase.auth.initialize();
        if (initializationError) throw initializationError;
        const { data, error: userError } = await supabase.auth.getUser();
        if (userError || !data.user) throw userError ?? new Error("Missing session");
        if (active) setHasSession(true);
      } catch {
        if (active) {
          setHasSession(false);
          setError("This recovery link is invalid or has expired. Request a new password reset email and open the newest link on the device you used to request it.");
        }
      } finally {
        if (active) setCheckingSession(false);
      }
    }

    void restoreSession();
    return () => { active = false; };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!hasSession) {
      setError("Your recovery session is unavailable. Request a new password reset email.");
      return;
    }

    if (firstEntry.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }

    if (firstEntry !== secondEntry) {
      setError("The entries do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const result = await supabase.auth.updateUser({ password: firstEntry });
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    await supabase.auth.signOut();
    router.replace("/sign-in?password=updated");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">New password</span>
        <input type="password" autoComplete="new-password" minLength={8} required value={firstEntry} onChange={(event) => setFirstEntry(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Confirm new password</span>
        <input type="password" autoComplete="new-password" minLength={8} required value={secondEntry} onChange={(event) => setSecondEntry(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400" />
      </label>
      {checkingSession ? <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">Verifying your secure recovery link…</p> : null}
      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <Button disabled={loading || checkingSession || !hasSession} className="h-12 w-full rounded-xl bg-yellow-400 font-semibold text-slate-950 hover:bg-yellow-300">
        {loading || checkingSession ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Save new password
      </Button>
    </form>
  );
}

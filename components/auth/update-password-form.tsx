"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [firstEntry, setFirstEntry] = useState("");
  const [secondEntry, setSecondEntry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

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
      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <Button disabled={loading} className="h-12 w-full rounded-xl bg-yellow-400 font-semibold text-slate-950 hover:bg-yellow-300">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Save new password
      </Button>
    </form>
  );
}

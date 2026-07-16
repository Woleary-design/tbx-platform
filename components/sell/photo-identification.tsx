"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, ImagePlus, Loader2, Search, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Candidate = {
  id: string;
  set_number: string;
  name: string;
  theme?: string | null;
  image_url?: string | null;
  year_released?: number | null;
  piece_count?: number | null;
  confidence: number;
  reason?: string | null;
};

export function PhotoIdentification() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  function chooseFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []).slice(0, 6);
    setFiles(selected);
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls(selected.map((file) => URL.createObjectURL(file)));
    setCandidates([]);
    setSummary(null);
    setError(null);
  }

  async function analyse() {
    if (!files.length) return;
    setWorking(true);
    setError(null);
    const supabase = createClient();

    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) throw new Error("Please sign in before uploading photos.");

      const { data: session, error: sessionError } = await supabase
        .from("identification_sessions")
        .insert({ user_id: auth.user.id, status: "uploading" })
        .select("id")
        .single();
      if (sessionError || !session) throw sessionError ?? new Error("Could not start photo identification.");

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        if (!file.type.startsWith("image/")) throw new Error("Only image files can be uploaded.");
        if (file.size > 10 * 1024 * 1024) throw new Error(`${file.name} is larger than 10 MB.`);
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = `${auth.user.id}/${session.id}/${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from("identification-photos").upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;
        const { error: photoError } = await supabase.from("identification_photos").insert({
          session_id: session.id,
          user_id: auth.user.id,
          storage_path: path,
          mime_type: file.type,
          byte_size: file.size,
          sort_order: index,
        });
        if (photoError) throw photoError;
      }

      const response = await fetch("/api/identification/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Photo identification failed.");
      setSummary(payload.summary ?? null);
      setCandidates(Array.isArray(payload.candidates) ? payload.candidates : []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Photo identification failed.");
    } finally {
      setWorking(false);
    }
  }

  function useCandidate(candidate: Candidate) {
    router.replace(`/sell?set=${encodeURIComponent(candidate.set_number)}#manual-search`);
    window.setTimeout(() => document.getElementById("manual-search")?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  return (
    <section className="space-y-6 rounded-[2rem] border border-[#eadfce] bg-white p-6 shadow-[0_24px_80px_rgba(43,30,18,0.08)] md:p-8">
      <div>
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-700"><Camera className="h-4 w-4" /> Identify from photos</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-950">Photograph the box, instructions or built set</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">For the best result, include any visible set number, barcode or instruction-booklet cover. TBX will suggest matches for you to confirm.</p>
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center hover:border-slate-400 hover:bg-white">
        <ImagePlus className="h-8 w-8 text-slate-500" />
        <span className="mt-3 font-semibold text-slate-950">Choose up to 6 photos</span>
        <span className="mt-1 text-xs text-slate-500">JPEG, PNG or WebP · maximum 10 MB each</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={chooseFiles} />
      </label>

      {previewUrls.length ? <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">{previewUrls.map((url) => <img key={url} src={url} alt="Seller upload preview" className="aspect-square w-full rounded-xl border border-slate-200 object-cover" />)}</div> : null}

      <button type="button" disabled={!files.length || working} onClick={analyse} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 font-semibold text-slate-950 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50">
        {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        {working ? "Checking your photos…" : "Identify my item"}
      </button>

      {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {summary ? <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-900">{summary}</p> : null}

      {candidates.length ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Confirm the correct match</div>
          {candidates.map((candidate) => (
            <button key={candidate.id} type="button" onClick={() => useCandidate(candidate)} className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left hover:border-slate-400 hover:bg-slate-50">
              <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100 text-xs font-semibold text-slate-500">{candidate.image_url ? <img src={candidate.image_url} alt="" className="h-full w-full object-contain" /> : candidate.set_number}</span>
              <span className="min-w-0 flex-1"><span className="block font-semibold text-slate-950">{candidate.name}</span><span className="mt-1 block text-sm text-slate-500">LEGO {candidate.set_number}{candidate.theme ? ` · ${candidate.theme}` : ""}</span>{candidate.reason ? <span className="mt-1 block text-xs text-slate-500">{candidate.reason}</span> : null}</span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{Math.round(candidate.confidence)}%</span>
              <Check className="h-4 w-4 text-slate-400" />
            </button>
          ))}
        </div>
      ) : summary && !working ? <p className="text-sm text-slate-600">We could not confirm a catalogue match. Try a clearer photo of the set number or use manual search below.</p> : null}
    </section>
  );
}
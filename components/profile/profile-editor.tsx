"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { Loader2, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type CollectorProfile = {
  id: string;
  display_name: string | null;
  username: string | null;
  city: string | null;
  country: string | null;
  bio: string | null;
  avatar_url: string | null;
  profile_public: boolean;
};

export function ProfileEditor({ profile }: { profile: CollectorProfile }) {
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [username, setUsername] = useState(profile.username ?? "");
  const [city, setCity] = useState(profile.city ?? "");
  const [country, setCountry] = useState(profile.country ?? "South Africa");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [profilePublic, setProfilePublic] = useState(profile.profile_public);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();
      const extension = file.name.split(".").pop() || "jpg";
      const path = `${profile.id}/avatar-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("Avatar")
        .upload(path, file, { upsert: true, cacheControl: "3600" });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("Avatar").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
      setMessage("Photo uploaded. Save your profile to apply it.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Avatar upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");

      const { error: updateError } = await supabase
        .from("collectors")
        .update({
          display_name: displayName.trim(),
          username: cleanUsername,
          city: city.trim(),
          country: country.trim() || "South Africa",
          bio: bio.trim(),
          avatar_url: avatarUrl || null,
          profile_public: profilePublic,
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      setUsername(cleanUsername);
      setMessage("Collector profile saved.");
      window.location.reload();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Profile update failed.");
    } finally {
      setSaving(false);
    }
  }

  const initials = (displayName || username || "TBX")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <form onSubmit={saveProfile} className="rounded-[2rem] border border-[#eadfce] bg-white p-6 shadow-[0_24px_80px_rgba(43,30,18,0.08)]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Collector avatar" className="h-20 w-20 rounded-2xl object-cover ring-1 ring-slate-200" />
          ) : (
            <div className="grid h-20 w-20 place-items-center rounded-2xl bg-yellow-400 text-xl font-semibold text-slate-950">{initials}</div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-600">Profile settings</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">Build your collector identity.</h2>
          </div>
        </div>
        <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#eadfce] bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-[#fffaf1]">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload photo
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadAvatar} className="hidden" disabled={uploading} />
        </label>
      </div>

      <div className="mt-7 grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Display name</span>
          <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Username</span>
          <div className="relative mt-2">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">@</span>
            <input value={username} onChange={(event) => setUsername(event.target.value)} required className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-4 text-sm outline-none focus:border-slate-400" />
          </div>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">City</span>
          <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Johannesburg" className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Country</span>
          <input value={country} onChange={(event) => setCountry(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-400" />
        </label>
      </div>

      <label className="mt-5 block">
        <span className="text-sm font-medium text-slate-700">Collector bio</span>
        <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={4} maxLength={500} placeholder="Tell collectors what you collect and what matters to you." className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400" />
        <span className="mt-1 block text-right text-xs text-slate-400">{bio.length}/500</span>
      </label>

      <label className="mt-5 flex items-start gap-3 rounded-2xl border border-[#eadfce] bg-[#fffaf1] p-4">
        <input type="checkbox" checked={profilePublic} onChange={(event) => setProfilePublic(event.target.checked)} className="mt-1 h-4 w-4" />
        <span>
          <span className="block text-sm font-semibold text-slate-950">Public collector profile</span>
          <span className="mt-1 block text-sm text-slate-600">Allow other collectors to view your public reputation and showcased sets.</span>
        </span>
      </label>

      {error ? <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}

      <Button disabled={saving} className="mt-6 h-12 rounded-xl bg-yellow-400 px-6 font-semibold text-slate-950 hover:bg-yellow-300">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save profile
      </Button>
    </form>
  );
}

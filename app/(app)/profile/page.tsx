import { CalendarDays, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { createClient } from "@/lib/supabase/server";

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("collectors")
    .select("id, tbx_id, username, display_name, avatar_url, bio, city, country, collector_level, confidence_score, completed_trades, disputes, average_dispatch_days, profile_public, created_at")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-white">
        <h1 className="text-2xl font-semibold">Profile unavailable</h1>
        <p className="mt-2 text-slate-400">We could not load your TBX profile right now.</p>
      </div>
    );
  }

  const displayName = profile.display_name || profile.username || user.email?.split("@")[0] || "Collector";
  const joinedYear = new Date(profile.created_at).getFullYear();
  const dispatch = profile.average_dispatch_days ? `${profile.average_dispatch_days}d` : "New";
  const location = [profile.city, profile.country].filter(Boolean).join(", ") || "South Africa";
  const bio = profile.bio || "Add a short bio to tell the TBX community what you collect.";

  const stats = [
    { label: "TBX Score", value: String(profile.confidence_score ?? 50), detail: profile.collector_level || "Collector" },
    { label: "Completed trades", value: String(profile.completed_trades ?? 0), detail: `${profile.disputes ?? 0} disputes` },
    { label: "TBX ID", value: profile.tbx_id || "Pending", detail: `@${profile.username || "collector"}` },
    { label: "Dispatch average", value: dispatch, detail: profile.completed_trades ? "Trading history" : "No completed trades yet" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#07101d] shadow-[0_28px_100px_rgba(0,0,0,0.24)]">
        <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
          <div className="p-7 text-white md:p-10">
            <div className="flex flex-wrap items-center gap-4">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="h-20 w-20 rounded-2xl object-cover ring-1 ring-white/20" />
              ) : (
                <span className="grid h-20 w-20 place-items-center rounded-2xl bg-[#e8c86a] text-xl font-semibold text-[#050912]">{initialsFor(displayName)}</span>
              )}
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-sm font-medium text-[#e8c86a]">
                  <ShieldCheck className="h-4 w-4" /> {profile.collector_level || "Collector"}
                </p>
                <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-6xl">{displayName}</h1>
              </div>
            </div>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/65">{bio}</p>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/60">
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[#e8c86a]" /> {location}</span>
              <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#e8c86a]" /> Member since {joinedYear}</span>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <p className="text-xs text-white/45">{stat.label}</p>
                  <p className="mt-2 break-words text-2xl font-semibold text-white">{stat.value}</p>
                  <p className="mt-1 text-xs text-white/45">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex min-h-[300px] flex-col justify-between border-t border-white/10 bg-[radial-gradient(circle_at_top,rgba(139,92,246,.14),transparent_58%)] p-7 text-white lg:border-l lg:border-t-0 md:p-8">
            <span className="grid h-14 w-14 place-items-center rounded-2xl border border-violet-300/15 bg-violet-400/10 text-violet-300"><UserRound className="h-7 w-7" /></span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Your TBX identity</p>
              <p className="mt-3 text-2xl font-semibold">{profile.profile_public ? "Visible to the community" : "Private to you"}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">Your profile, trading history and trust signals help buyers and sellers know who they are dealing with.</p>
            </div>
          </div>
        </div>
      </section>

      <ProfileEditor
        profile={{
          id: profile.id,
          display_name: profile.display_name,
          username: profile.username,
          city: profile.city,
          country: profile.country,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          profile_public: profile.profile_public,
        }}
      />
    </div>
  );
}

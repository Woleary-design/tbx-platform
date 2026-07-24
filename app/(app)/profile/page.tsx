import { CalendarDays, MapPin, ShieldCheck } from "lucide-react";
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
      <div className="rounded-[2rem] border border-[#eadfce] bg-white p-8">
        <h1 className="text-2xl font-semibold text-slate-950">Collector profile unavailable</h1>
        <p className="mt-2 text-slate-600">Your authentication account exists, but the collector record could not be loaded.</p>
      </div>
    );
  }

  const displayName = profile.display_name || profile.username || user.email?.split("@")[0] || "Collector";
  const joinedYear = new Date(profile.created_at).getFullYear();
  const dispatch = profile.average_dispatch_days ? `${profile.average_dispatch_days}d` : "New";
  const location = [profile.city, profile.country].filter(Boolean).join(", ") || "South Africa";
  const bio = profile.bio || "Add a collector bio to tell the TBX community what you collect and what matters to you.";

  const stats = [
    { label: "TBX Score", value: String(profile.confidence_score ?? 50), detail: profile.collector_level || "Collector" },
    { label: "Completed Trades", value: String(profile.completed_trades ?? 0), detail: `${profile.disputes ?? 0} disputes` },
    { label: "TBX ID", value: profile.tbx_id || "Pending", detail: `@${profile.username || "collector"}` },
    { label: "Dispatch Avg", value: dispatch, detail: profile.completed_trades ? "Trading history" : "No completed trades yet" },
  ];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-[#eadfce] bg-slate-950 shadow-[0_28px_100px_rgba(15,23,42,0.16)]">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="p-7 text-white md:p-10">
            <div className="flex flex-wrap items-center gap-4">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="h-20 w-20 rounded-2xl object-cover ring-1 ring-white/20" />
              ) : (
                <span className="grid h-20 w-20 place-items-center rounded-2xl bg-yellow-400 text-xl font-semibold text-slate-950">{initialsFor(displayName)}</span>
              )}
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-yellow-300">
                  <ShieldCheck className="h-4 w-4" /> {profile.collector_level || "Collector"}
                </p>
                <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-6xl">{displayName}</h1>
              </div>
            </div>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/70">{bio}</p>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/70">
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-yellow-300" /> {location}</span>
              <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-yellow-300" /> Member since {joinedYear}</span>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                  <p className="text-xs text-white/55">{stat.label}</p>
                  <p className="mt-2 break-words text-2xl font-semibold text-white">{stat.value}</p>
                  <p className="mt-1 text-xs text-white/55">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[360px] bg-[#f6f1e8]">
            <img src="https://the-block-exchange-landing-page.vercel.app/hero-cabinet.png" alt="Collector cabinet" className="h-full w-full object-cover" />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-yellow-600">Collector Passport</p>
              <p className="mt-1 text-xl font-semibold text-slate-950">Your live TBX identity.</p>
              <p className="mt-1 text-sm text-slate-600">Your name, location, reputation and collector details now load directly from Supabase.</p>
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

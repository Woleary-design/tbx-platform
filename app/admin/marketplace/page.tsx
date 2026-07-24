import { Boxes, Filter, Search, ShieldAlert } from "lucide-react";

export default function AdminMarketplacePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-[#ffd84d]">Marketplace</p>
        <h1 className="mt-2 text-3xl font-semibold">Listing control centre</h1>
        <p className="mt-2 text-slate-400">Review, approve, feature, pause and investigate every TBX listing.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3">
          <Search className="h-4 w-4 text-slate-500" />
          <input className="w-full border-0 bg-transparent p-0 text-sm outline-none" placeholder="Search listings, set numbers or sellers" />
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-semibold">
          <Filter className="h-4 w-4" /> Filters
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {["Pending", "Live", "Draft", "Flagged", "Sold"].map((label) => (
          <button key={label} className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-left hover:border-[#ffd84d]/25">
            <p className="text-2xl font-semibold">0</p>
            <p className="mt-1 text-xs text-slate-500">{label}</p>
          </button>
        ))}
      </div>

      <div className="tbx-surface overflow-hidden rounded-2xl">
        <div className="grid min-h-[360px] place-items-center px-6 py-16 text-center">
          <div>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#ffd84d]/10 text-[#ffd84d]">
              <Boxes className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-lg font-semibold">Marketplace data connection next</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">The moderation workspace is ready. The next step connects it to TBX listing records and action logging.</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-400">
              <ShieldAlert className="h-3.5 w-3.5" /> Admin actions will be audited
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

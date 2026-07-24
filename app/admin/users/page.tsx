import { Search, ShieldCheck, UserCog, Users } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-[#ffd84d]">Users</p>
        <h1 className="mt-2 text-3xl font-semibold">Community management</h1>
        <p className="mt-2 text-slate-400">Manage accounts, trust signals, roles, reports and internal notes.</p>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3">
        <Search className="h-4 w-4 text-slate-500" />
        <input className="w-full border-0 bg-transparent p-0 text-sm outline-none" placeholder="Search by name, email or account ID" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Registered users", "0", Users],
          ["Verified sellers", "0", ShieldCheck],
          ["Admin users", "1", UserCog],
        ].map(([label, value, Icon]) => {
          const CardIcon = Icon as typeof Users;
          return (
            <div key={label as string} className="tbx-surface rounded-2xl p-5">
              <CardIcon className="h-5 w-5 text-[#ffd84d]" />
              <p className="mt-4 text-3xl font-semibold">{value as string}</p>
              <p className="mt-1 text-sm text-slate-500">{label as string}</p>
            </div>
          );
        })}
      </div>

      <div className="tbx-surface grid min-h-[360px] place-items-center rounded-2xl p-8 text-center">
        <div>
          <Users className="mx-auto h-8 w-8 text-[#ffd84d]" />
          <h2 className="mt-4 text-lg font-semibold">User directory ready for data</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">This view will connect to Supabase profiles, seller activity and role-management actions.</p>
        </div>
      </div>
    </div>
  );
}

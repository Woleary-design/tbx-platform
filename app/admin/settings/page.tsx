import { CreditCard, Percent, Settings, Truck } from "lucide-react";

export default function AdminSettingsPage() {
  const settings = [
    { label: "Marketplace fee", value: "10%", detail: "Applied to successful sales", icon: Percent },
    { label: "Buyer payments", value: "Not connected", detail: "Provider decision still pending", icon: CreditCard },
    { label: "Seller payouts", value: "Not connected", detail: "Managed payout provider required", icon: Settings },
    { label: "Delivery", value: "Seller ships", detail: "Courier integration comes after payments", icon: Truck },
  ];

  return (
    <div className="space-y-6">
      <div><p className="text-sm font-semibold text-violet-300">Settings</p><h1 className="mt-2 text-3xl font-semibold">Platform settings</h1><p className="mt-2 text-slate-400">A clear operational view of the rules currently governing TBX.</p></div>
      <div className="grid gap-4 sm:grid-cols-2">{settings.map(({ label, value, detail, icon: Icon }) => <div key={label} className="tbx-surface rounded-2xl p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-xl font-semibold">{value}</p><p className="mt-2 text-sm text-slate-400">{detail}</p></div><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-400/[0.08] text-violet-300"><Icon className="h-5 w-5" /></span></div></div>)}</div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><h2 className="font-semibold">Safe by default</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">This first admin release is read-only for sensitive marketplace data. Edit, suspend, refund and payout actions should only be added with explicit audit logging and the correct payment-provider controls.</p></div>
    </div>
  );
}

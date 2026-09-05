"use client";

import { useState } from "react";
import { Loader2, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export type StaffMember = {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
};

const roles = [
  ["operations", "Operations", "Orders, shipping, listings and customers"],
  ["technical", "Technical", "Atlas, integrations and platform settings"],
  ["support", "Support", "Customer, listing and order assistance"],
  ["finance", "Finance", "Orders, reports and seller payouts"],
] as const;

export function StaffRoleManager({ initialStaff }: { initialStaff: StaffMember[] }) {
  const [staff, setStaff] = useState(initialStaff);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("operations");
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function saveStaff(targetEmail: string, targetRole: string, remove = false) {
    setPending(remove ? `remove:${targetEmail}` : targetEmail);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/staff", {
        method: remove ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, role: targetRole }),
      });
      const body = (await response.json().catch(() => null)) as { staff?: StaffMember[]; error?: string } | null;
      if (!response.ok) throw new Error(body?.error || "Staff access could not be updated.");
      setStaff(body?.staff ?? []);
      if (!remove) setEmail("");
      setMessage(remove ? "Staff access removed." : "Staff access updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Staff access could not be updated.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-violet-300/15 bg-violet-400/[0.05] p-5">
        <div className="flex items-start gap-3"><UserPlus className="mt-1 h-5 w-5 text-violet-300" /><div><h2 className="font-semibold">Add or update a staff member</h2><p className="mt-1 text-sm text-slate-400">They must first create a normal TBX account using this email address.</p></div></div>
        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_260px_auto]">
          <label><span className="mb-2 block text-xs font-semibold text-slate-400">TBX account email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="staff@example.com" className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm outline-none focus:border-violet-400" /></label>
          <label><span className="mb-2 block text-xs font-semibold text-slate-400">Role</span><select value={role} onChange={(event) => setRole(event.target.value)} className="h-11 w-full rounded-xl border border-white/10 bg-[#0a1020] px-4 text-sm outline-none focus:border-violet-400">{roles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <Button disabled={!email.trim() || pending !== null} onClick={() => saveStaff(email.trim(), role)} className="mt-auto h-11 rounded-xl bg-violet-500 font-semibold hover:bg-violet-400">{pending === email.trim() ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Save access</Button>
        </div>
        {message ? <p role="status" className="mt-4 text-sm text-violet-200">{message}</p> : null}
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
        <div className="border-b border-white/10 px-5 py-4"><h2 className="font-semibold">Current staff</h2><p className="mt-1 text-xs text-slate-500">Owner access can only be changed directly by the Owner.</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Staff member</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Last sign-in</th><th className="px-5 py-4">Added</th><th className="px-5 py-4" /></tr></thead><tbody className="divide-y divide-white/10">{staff.map((member) => { const isOwner = member.role === "super_admin"; return <tr key={member.id}><td className="px-5 py-4"><p className="font-medium text-white">{member.display_name || member.email}</p><p className="mt-1 text-xs text-slate-500">{member.email}</p></td><td className="px-5 py-4"><span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs capitalize"><ShieldCheck className="h-3.5 w-3.5 text-violet-300" />{isOwner ? "Owner" : member.role}</span></td><td className="px-5 py-4 text-slate-400">{member.last_sign_in_at ? new Date(member.last_sign_in_at).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" }) : "Never"}</td><td className="px-5 py-4 text-slate-400">{new Date(member.created_at).toLocaleDateString("en-ZA")}</td><td className="px-5 py-4 text-right">{isOwner ? <span className="text-xs text-slate-600">Protected</span> : <Button variant="outline" size="sm" disabled={pending !== null} onClick={() => saveStaff(member.email, member.role, true)} className="border-red-300/20 text-red-300 hover:bg-red-400/10 hover:text-red-200">{pending === `remove:${member.email}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Remove</Button>}</td></tr>;})}</tbody></table></div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">{roles.map(([value, label, detail]) => <div key={value} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><p className="font-semibold text-white">{label}</p><p className="mt-1 text-sm text-slate-500">{detail}</p></div>)}</div>
    </div>
  );
}

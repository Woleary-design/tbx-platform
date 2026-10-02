import { StaffRoleManager, type StaffMember } from "@/components/admin/staff-role-manager";
import { requireAdmin } from "@/lib/admin";

export default async function AdminStaffPage() {
  const { supabase } = await requireAdmin("staff");
  const { data } = await supabase.rpc("list_admin_staff");

  return (
    <div className="space-y-6">
      <div><p className="text-sm font-semibold text-violet-300">Owner controls</p><h1 className="mt-2 text-3xl font-semibold">Staff &amp; roles</h1><p className="mt-2 max-w-3xl text-slate-400">Give each employee only the access they need. Staff use their own TBX login; developer tools remain separate.</p></div>
      <StaffRoleManager initialStaff={(data ?? []) as StaffMember[]} />
    </div>
  );
}

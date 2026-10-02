import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

const STAFF_ROLES = new Set(["operations", "technical", "support", "finance"]);

async function updateStaff(request: Request, removeAccess: boolean) {
  const { supabase } = await requireAdmin("staff");
  const body = (await request.json().catch(() => null)) as { email?: string; role?: string } | null;
  const email = body?.email?.trim().toLowerCase();
  const role = body?.role?.trim().toLowerCase();
  if (!email || (!removeAccess && (!role || !STAFF_ROLES.has(role)))) return NextResponse.json({ error: "Enter a valid TBX email and staff role." }, { status: 400 });

  const { error } = await supabase.rpc("manage_admin_staff", { target_email: email, target_role: role ?? "operations", remove_access: removeAccess });
  if (error) {
    const safeMessage = ["TBX account not found", "You cannot remove your own Owner access"].find((message) => error.message.includes(message));
    return NextResponse.json({ error: safeMessage ?? "Staff access could not be updated." }, { status: 409 });
  }
  const { data: staff } = await supabase.rpc("list_admin_staff");
  return NextResponse.json({ staff: staff ?? [] });
}

export async function POST(request: Request) { return updateStaff(request, false); }
export async function DELETE(request: Request) { return updateStaff(request, true); }

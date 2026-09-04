import Link from "next/link";
import { redirect } from "next/navigation";
import { DispatchAddressForm } from "@/components/settings/dispatch-address-form";
import { createClient } from "@/lib/supabase/server";

export default async function DeliverySettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/settings/delivery");
  const { data: address } = await supabase.from("shipping_addresses")
    .select("id,label,recipient_name,mobile_number,company,street_address,local_area,city,province,postal_code,address_type")
    .eq("user_id", user.id).eq("is_default_dispatch", true).maybeSingle();
  return <div className="mx-auto max-w-4xl space-y-5"><Link href="/settings" className="text-sm font-semibold text-slate-400 hover:text-white">← Back to settings</Link><DispatchAddressForm userId={user.id} address={address as Parameters<typeof DispatchAddressForm>[0]["address"]} /></div>;
}

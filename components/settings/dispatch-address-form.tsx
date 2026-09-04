"use client";

import { FormEvent, useState } from "react";
import { Loader2, MapPin, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Address = {
  id: string;
  label: string;
  recipient_name: string;
  mobile_number: string;
  company: string | null;
  street_address: string;
  local_area: string;
  city: string;
  province: string;
  postal_code: string;
  address_type: "residential" | "business";
} | null;

const provinces = ["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape"];

export function DispatchAddressForm({ userId, address }: { userId: string; address: Address }) {
  const [form, setForm] = useState({
    label: address?.label ?? "Home",
    recipient_name: address?.recipient_name ?? "",
    mobile_number: address?.mobile_number ?? "",
    company: address?.company ?? "",
    street_address: address?.street_address ?? "",
    local_area: address?.local_area ?? "",
    city: address?.city ?? "",
    province: address?.province ?? "Gauteng",
    postal_code: address?.postal_code ?? "",
    address_type: address?.address_type ?? "residential",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function field(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const supabase = createClient();
      const values = {
        user_id: userId,
        label: form.label.trim(),
        recipient_name: form.recipient_name.trim(),
        mobile_number: form.mobile_number.trim(),
        company: form.company.trim() || null,
        street_address: form.street_address.trim(),
        local_area: form.local_area.trim(),
        city: form.city.trim(),
        province: form.province,
        postal_code: form.postal_code.trim(),
        address_type: form.address_type,
        is_default_dispatch: true,
        updated_at: new Date().toISOString(),
      };
      const request = address
        ? supabase.from("shipping_addresses").update(values).eq("id", address.id).eq("user_id", userId)
        : supabase.from("shipping_addresses").insert(values);
      const { error: saveError } = await request;
      if (saveError) throw saveError;
      setMessage("Dispatch address saved. Buyers will never see your full address.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The address could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none focus:border-slate-400";
  return (
    <form onSubmit={save} className="rounded-[2rem] border border-[#eadfce] bg-white p-6 shadow-[0_24px_80px_rgba(43,30,18,0.08)] sm:p-8">
      <div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-yellow-100 text-yellow-700"><MapPin className="h-6 w-6" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-700">Private address</p><h1 className="mt-1 text-3xl font-semibold text-slate-950">Where should the courier collect?</h1><p className="mt-2 text-sm leading-6 text-slate-600">Save this once and TBX will reuse it when you sell. Buyers see only your city or suburb—not your street address.</p></div></div>
      <div className="mt-7 grid gap-5 md:grid-cols-2">
        <label className="block"><span className="text-sm font-medium text-slate-700">Address label</span><input required maxLength={40} value={form.label} onChange={(e) => field("label", e.target.value)} placeholder="Home" className={inputClass} /></label>
        <label className="block"><span className="text-sm font-medium text-slate-700">Collection type</span><select value={form.address_type} onChange={(e) => field("address_type", e.target.value)} className={inputClass}><option value="residential">Home / residential</option><option value="business">Business</option></select></label>
        <label className="block"><span className="text-sm font-medium text-slate-700">Contact name</span><input required value={form.recipient_name} onChange={(e) => field("recipient_name", e.target.value)} autoComplete="name" className={inputClass} /></label>
        <label className="block"><span className="text-sm font-medium text-slate-700">Mobile number</span><input required value={form.mobile_number} onChange={(e) => field("mobile_number", e.target.value)} autoComplete="tel" inputMode="tel" placeholder="082 123 4567" className={inputClass} /></label>
        {form.address_type === "business" ? <label className="block md:col-span-2"><span className="text-sm font-medium text-slate-700">Company</span><input value={form.company} onChange={(e) => field("company", e.target.value)} autoComplete="organization" className={inputClass} /></label> : null}
        <label className="block md:col-span-2"><span className="text-sm font-medium text-slate-700">Street address</span><input required value={form.street_address} onChange={(e) => field("street_address", e.target.value)} autoComplete="street-address" placeholder="Street number and name" className={inputClass} /></label>
        <label className="block"><span className="text-sm font-medium text-slate-700">Suburb / local area</span><input required value={form.local_area} onChange={(e) => field("local_area", e.target.value)} placeholder="Sandton" className={inputClass} /></label>
        <label className="block"><span className="text-sm font-medium text-slate-700">City</span><input required value={form.city} onChange={(e) => field("city", e.target.value)} autoComplete="address-level2" className={inputClass} /></label>
        <label className="block"><span className="text-sm font-medium text-slate-700">Province</span><select value={form.province} onChange={(e) => field("province", e.target.value)} autoComplete="address-level1" className={inputClass}>{provinces.map((province) => <option key={province}>{province}</option>)}</select></label>
        <label className="block"><span className="text-sm font-medium text-slate-700">Postal code</span><input required maxLength={12} value={form.postal_code} onChange={(e) => field("postal_code", e.target.value)} autoComplete="postal-code" inputMode="numeric" className={inputClass} /></label>
      </div>
      {error ? <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}
      <Button disabled={saving} className="mt-6 h-12 rounded-xl bg-yellow-400 px-6 font-semibold text-slate-950 hover:bg-yellow-300">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? "Saving…" : "Save dispatch address"}</Button>
    </form>
  );
}

import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export default function UpdatePasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f9fc] px-6 py-12">
      <section className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_90px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-600">TBX Secure</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Choose a new password</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Enter a new password for your collector account.</p>
        <div className="mt-7"><UpdatePasswordForm /></div>
      </section>
    </main>
  );
}

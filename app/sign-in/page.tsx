import Link from "next/link";
import { LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { SignInForm } from "@/components/auth/sign-in-form";

function FourDotLogo() {
  return (
    <span className="grid h-12 w-12 grid-cols-2 gap-1 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
      <span className="rounded bg-slate-950" />
      <span className="rounded bg-slate-950" />
      <span className="rounded bg-slate-950" />
      <span className="rounded bg-yellow-400" />
    </span>
  );
}

type SignInPageProps = {
  searchParams?: Promise<{ next?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = searchParams ? await searchParams : undefined;

  return (
    <main className="min-h-screen bg-[#f6f9fc] text-slate-950">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-10 px-6 py-8 lg:grid-cols-[1fr_460px] lg:items-center lg:px-8">
        <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 text-white shadow-[0_34px_110px_rgba(15,23,42,0.18)] md:p-12">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 opacity-70 lg:block">
            <img src="https://the-block-exchange-landing-page.vercel.app/hero-cabinet.png" alt="Collector cabinet" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/50 to-transparent" />
          </div>
          <div className="relative max-w-xl">
            <Link href="/" aria-label="Return to TBX home"><FourDotLogo /></Link>
            <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-medium text-yellow-300">
              <ShieldCheck className="h-4 w-4" /> TBX Secure access
            </p>
            <h1 className="mt-6 text-5xl font-semibold leading-tight tracking-tight md:text-6xl">Sign in to your collector vault.</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/70">
              Manage your vault, track condition evidence, view protected orders and keep your collector reputation visible.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-sm font-semibold">Vault AI</div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-sm font-semibold">TBX Secure</div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-sm font-semibold">Collector profile</div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_24px_90px_rgba(15,23,42,0.08)]">
          <Link href="/" className="flex items-center gap-3" aria-label="Return to TBX home">
            <FourDotLogo />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-yellow-600">The</p>
              <h2 className="text-xl font-semibold">Block Exchange</h2>
            </div>
          </Link>
          <h3 className="mt-8 text-3xl font-semibold tracking-tight">Welcome to TBX.</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Sign in to an existing collector account or create your passport and vault.</p>

          <div className="mt-7">
            <SignInForm nextPath={params?.next} />
          </div>

          <div className="mt-6 grid gap-3 text-sm text-slate-600">
            <div className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-yellow-500" /> Protected checkout and vault data stay private.</div>
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-yellow-500" /> Your collector record is created automatically after registration.</div>
          </div>
        </section>
      </div>
    </main>
  );
}

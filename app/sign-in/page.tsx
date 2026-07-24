import Link from "next/link";
import { redirect } from "next/navigation";
import { LockKeyhole, Sparkles } from "lucide-react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { createClient } from "@/lib/supabase/server";

function FourDotLogo() {
  return (
    <span className="grid h-12 w-12 grid-cols-2 gap-1 rounded-2xl border border-white/15 bg-[#09111f] p-2 shadow-sm">
      <span className="rounded bg-white/10" />
      <span className="rounded bg-white/10" />
      <span className="rounded bg-white/10" />
      <span className="rounded bg-yellow-400" />
    </span>
  );
}

function safeNextPath(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

type SignInPageProps = {
  searchParams?: Promise<{ next?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const destination = safeNextPath(params?.next);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect(destination);

  return (
    <main className="min-h-screen bg-[#050912] px-5 py-8 text-white sm:grid sm:place-items-center sm:py-12">
      <section className="mx-auto w-full max-w-md rounded-[2rem] border border-white/[0.09] bg-[#09111f] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:p-8">
        <Link href="/" className="inline-flex items-center gap-3" aria-label="Return to TBX home">
          <FourDotLogo />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#e8c86a]">TBX</p>
            <p className="text-sm font-semibold text-white/55">Collector access</p>
          </div>
        </Link>

        <h1 className="mt-8 text-4xl font-black tracking-[-0.05em]">Welcome to TBX.</h1>
        <p className="mt-3 text-sm leading-6 text-white/50">
          Sign in to your collector account or create one to manage your collection, listings and protected orders.
        </p>

        <div className="mt-7">
          <SignInForm nextPath={destination} />
        </div>

        <div className="mt-7 grid gap-3 border-t border-white/[0.07] pt-6 text-sm text-white/45">
          <div className="flex items-start gap-3">
            <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#e8c86a]" />
            <span>Protected checkout and account data stay private.</span>
          </div>
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#e8c86a]" />
            <span>Your collector record is created automatically after registration.</span>
          </div>
        </div>
      </section>
    </main>
  );
}

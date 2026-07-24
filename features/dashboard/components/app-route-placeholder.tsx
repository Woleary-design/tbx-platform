import { ArrowRight, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type AppRoutePlaceholderProps = {
  title: string;
  description: string;
  items: string[];
};

export function AppRoutePlaceholder({ title, description, items }: AppRoutePlaceholderProps) {
  return (
    <div className="space-y-7">
      <section className="grid gap-8 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:grid-cols-[1fr_340px] lg:items-stretch">
        <div className="space-y-5">
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-blue-700">
            <ShieldCheck className="h-4 w-4" />
            Collector-grade workspace
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">{title}</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">{description}</p>
        </div>
        <div className="rounded-[1.4rem] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-200 p-5">
          <div className="flex h-full min-h-56 flex-col justify-end rounded-2xl border border-white/80 bg-white/75 p-5 backdrop-blur-sm">
            <p className="text-sm font-medium text-slate-500">TBX standard</p>
            <p className="mt-3 text-2xl font-semibold leading-tight text-slate-950">
              Trust, provenance and value remain visible at every step.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <Card key={item} className="group border-slate-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_60px_rgba(15,23,42,0.10)]">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-slate-950">{item}</p>
              <p className="mt-10 flex items-center gap-2 text-xs font-medium text-blue-700">
                Refined collector workflow
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

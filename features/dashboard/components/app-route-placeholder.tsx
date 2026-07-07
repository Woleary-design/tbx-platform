import { ArrowRight, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type AppRoutePlaceholderProps = {
  title: string;
  description: string;
  items: string[];
};

export function AppRoutePlaceholder({ title, description, items }: AppRoutePlaceholderProps) {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[1.75rem] border bg-card shadow-[0_28px_80px_rgba(15,23,42,0.08)]">
        <div className="grid gap-6 p-6 md:p-8 lg:grid-cols-[1fr_320px] lg:items-stretch">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              <ShieldCheck className="h-4 w-4" />
              TBX private workspace
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal">{title}</h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>
          </div>
          <div className="rounded-[1.4rem] border bg-gradient-to-br from-stone-50 via-emerald-50 to-stone-200 p-5">
            <div className="flex h-full min-h-48 flex-col justify-end rounded-2xl border bg-card/75 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-muted-foreground">Designed for verified collectors</p>
              <p className="mt-3 text-2xl font-semibold leading-tight">Every surface keeps trust, provenance and value in view.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <Card key={item} className="group transition-all duration-200 hover:-translate-y-1 hover:border-primary/40">
            <CardContent className="p-5">
              <p className="text-sm font-medium">{item}</p>
              <p className="mt-8 flex items-center gap-2 text-xs font-medium text-primary">
                Collector-grade workflow
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";

type AppRoutePlaceholderProps = {
  title: string;
  description: string;
  items: string[];
};

export function AppRoutePlaceholder({ title, description, items }: AppRoutePlaceholderProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card p-6">
        <p className="text-sm font-medium text-primary">TBX workspace</p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <Card key={item}>
            <CardContent className="p-5">
              <p className="text-sm font-medium">{item}</p>
              <p className="mt-2 text-sm text-muted-foreground">Mock placeholder prepared for future backend wiring.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

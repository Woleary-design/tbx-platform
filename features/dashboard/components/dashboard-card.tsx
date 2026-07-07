import { Card, CardContent } from "@/components/ui/card";

type DashboardCardProps = {
  label: string;
  value: string;
  detail: string;
  trend: string;
};

export function DashboardCard({ label, value, detail, trend }: DashboardCardProps) {
  return (
    <Card className="group overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-primary/40">
      <CardContent className="relative p-6">
        <div className="absolute right-5 top-5 h-16 w-16 rounded-full bg-primary/10 transition-transform duration-300 group-hover:scale-110" />
        <p className="relative text-sm font-medium text-muted-foreground">{label}</p>
        <p className="relative mt-4 text-4xl font-semibold tracking-normal">{value}</p>
        <p className="relative mt-3 text-sm leading-6 text-muted-foreground">{detail}</p>
        <p className="relative mt-5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}

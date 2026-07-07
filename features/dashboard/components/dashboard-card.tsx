import { Card, CardContent } from "@/components/ui/card";

type DashboardCardProps = {
  label: string;
  value: string;
  detail: string;
  trend: string;
};

export function DashboardCard({ label, value, detail, trend }: DashboardCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-3 text-3xl font-semibold">{value}</p>
        <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
        <p className="mt-4 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">{trend}</p>
      </CardContent>
    </Card>
  );
}

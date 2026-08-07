import { ManualValueClient, type IntakeType } from "./manual-value-client";

type SearchParams = Promise<{ type?: string; resume?: string }>;

function resolveFlow(type?: string): IntakeType {
  if (type === "mixed" || type === "minifigures" || type === "instructions") return type;
  return "unknown";
}

export default async function ManualValuePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return <ManualValueClient flow={resolveFlow(params.type)} resume={params.resume} />;
}

import { KnownValueClient } from "./known-value-client";
import { type IntakeType } from "./manual-value-smart-client";
import { MinifigureValueClient } from "./minifigure-value-client";
import { BulkValueClient } from "./bulk-value-client";

type SearchParams = Promise<{ type?: string; resume?: string }>;

function resolveFlow(type?: string): IntakeType {
  if (type === "mixed" || type === "minifigures" || type === "instructions") return type;
  return "instructions";
}

export default async function ManualValuePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const flow = resolveFlow(params.type);
  if (flow === "mixed") return <BulkValueClient resume={params.resume} />;
  if (flow === "minifigures") return <MinifigureValueClient resume={params.resume} />;
  return <KnownValueClient flow="instructions" resume={params.resume} />;
}

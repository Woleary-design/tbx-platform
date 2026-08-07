import { KnownValueClient } from "./known-value-client";
import { type IntakeType } from "./manual-value-smart-client";
import { MinifigureValueClient } from "./minifigure-value-client";
import { AtlasDescribeClient } from "./atlas-describe-client";

type SearchParams = Promise<{ type?: string; resume?: string }>;

function resolveFlow(type?: string): IntakeType {
  if (type === "mixed" || type === "minifigures" || type === "instructions") return type;
  return "unknown";
}

export default async function ManualValuePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const flow = resolveFlow(params.type);
  if (flow === "unknown") return <AtlasDescribeClient resume={params.resume} />;
  if (flow === "minifigures") return <MinifigureValueClient resume={params.resume} />;
  return <KnownValueClient flow={flow} resume={params.resume} />;
}

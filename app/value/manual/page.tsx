import { redirect } from "next/navigation";
import { MinifigureValueClient } from "./minifigure-value-client";
import { BulkValueClient } from "./bulk-value-client";
import { InstructionsValueClient } from "./instructions-value-client";
import { AtlasDescribeClient } from "./atlas-describe-client";

type SearchParams = Promise<{ type?: string; resume?: string }>;

export default async function ManualValuePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  if (params.type === "mixed") return <BulkValueClient resume={params.resume} />;
  if (params.type === "minifigures") return <MinifigureValueClient resume={params.resume} />;
  if (params.type === "instructions") return <InstructionsValueClient resume={params.resume} />;
  if (params.type === "unknown") return <AtlasDescribeClient resume={params.resume} />;

  redirect("/value");
}

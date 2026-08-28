import { redirect } from "next/navigation";

type LegacyWantsPageProps = {
  searchParams?: Promise<{ q?: string; set?: string }>;
};

export default async function LegacyWantsPage({ searchParams }: LegacyWantsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const setNumber = params?.set?.trim();
  const query = params?.q?.trim();

  if (setNumber) {
    redirect(`/atlas/${encodeURIComponent(setNumber)}`);
  }

  if (query) {
    redirect(`/atlas?theme=${encodeURIComponent(query)}`);
  }

  redirect("/wishlist");
}

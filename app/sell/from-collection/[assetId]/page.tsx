"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SellFromCollectionPage() {
  const params = useParams<{ assetId: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const assetId = params.assetId;
    if (!assetId) return;

    void (async () => {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace(`/sign-in?next=${encodeURIComponent(`/sell/from-collection/${assetId}`)}`);
        return;
      }

      const { data: asset, error: assetError } = await supabase
        .from("assets")
        .select("id, set_number, set_name, condition, estimated_value, instructions_complete, minifigures_complete, sealed, notes")
        .eq("id", assetId)
        .eq("owner_id", userData.user.id)
        .maybeSingle();

      if (assetError || !asset) {
        setError("This collection item could not be loaded.");
        return;
      }

      const included = asset.sealed
        ? "Factory sealed in the original packaging"
        : [
            asset.instructions_complete ? "Instructions" : null,
            asset.minifigures_complete ? "Complete minifigures" : null,
          ].filter(Boolean).join(", ") || "Collection details recorded in TBX";

      window.localStorage.setItem("tbx-listing-draft", JSON.stringify({
        itemKind: "known-set",
        title: `${asset.set_number} · ${asset.set_name}`,
        condition: asset.condition,
        included,
        description: asset.notes ?? "",
        weight: "",
        price: asset.estimated_value ? String(Math.round(Number(asset.estimated_value))) : "",
        shippingMethods: ["courier-guy", "paxi", "pargo"],
        sourceAssetId: asset.id,
      }));

      router.replace("/sell/create?source=collection");
    })();
  }, [params.assetId, router]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#050912] px-5 text-white">
      <div className="max-w-md text-center">
        {error ? (
          <>
            <h1 className="text-3xl font-black">Unable to start this listing.</h1>
            <p className="mt-3 text-white/45">{error}</p>
            <Link href="/collection" className="mt-6 inline-flex items-center gap-2 font-bold text-[#e8c86a]"><ArrowLeft className="h-4 w-4" /> Back to Collection</Link>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#e8c86a]" />
            <h1 className="mt-5 text-3xl font-black">Preparing your listing</h1>
            <p className="mt-3 text-white/45">TBX is carrying the item identity, condition and Atlas value across from your collection record.</p>
          </>
        )}
      </div>
    </main>
  );
}

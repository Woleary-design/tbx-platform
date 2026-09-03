"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  Camera,
  Check,
  Loader2,
  Scale,
  Tag,
  Truck,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ShippingMethod = "courier-guy" | "pudo";
type ListingDraft = {
  title?: string;
  condition?: string;
  included?: string;
  description?: string;
  price?: string;
  delivery?: string;
  shippingMethods?: ShippingMethod[];
  itemKind?: string;
  weight?: string;
  legoSetId?: string | null;
  legoMinifigureId?: string | null;
  setNumber?: string;
  theme?: string;
  sourceAssetId?: string;
  atlasLow?: number | null;
  atlasRecommended?: number | null;
  atlasHigh?: number | null;
  atlasEvidenceCount?: number | null;
  atlasBasis?: string | null;
};
type MinifigureQuote = {
  status?: string;
  low?: number | null;
  recommended?: number | null;
  high?: number | null;
  evidenceCount?: number | null;
  basis?: string | null;
};
type PhotoCheckResult = {
  accepted: boolean;
  reason?: string;
};
const setStages = ["Confirm", "Details", "Delivery", "Photos", "Preview"];
const looseStages = ["Price", "Delivery", "Photos", "Preview"];
const money = (value: number) =>
  `R${Math.round(value || 0).toLocaleString("en-ZA")}`;
const shippingOptions: {
  id: ShippingMethod;
  label: string;
  detail: string;
  estimate: number;
}[] = [
  {
    id: "courier-guy",
    label: "The Courier Guy",
    detail: "Courier collection / drop-off",
    estimate: 125,
  },
  {
    id: "pudo",
    label: "PUDO",
    detail: "Drop the parcel at a PUDO locker",
    estimate: 69,
  },
];

function normaliseCondition(value?: string) {
  const v = (value || "").toLowerCase();
  if (v.includes("open box")) return "New Open Box";
  if (v.includes("sealed") || v.includes("new")) return "New Sealed";
  if (v.includes("incomplete") || v.includes("damaged"))
    return "Used Incomplete";
  if (
    v.includes("complete") ||
    v.includes("clean") ||
    v.includes("usable") ||
    v.includes("excellent") ||
    v === "good"
  )
    return "Used Complete";
  return "Unknown";
}
function isLooseDraft(draft: ListingDraft) {
  return (
    draft.itemKind === "loose" ||
    draft.itemKind === "mixed-box" ||
    /loose lego|bulk lego/i.test(draft.title || "")
  );
}
function titleIdentity(draft: ListingDraft) {
  if (isLooseDraft(draft))
    return { setNumber: "BULK", setName: draft.title?.trim() || "Loose LEGO" };
  const match = (draft.title || "").match(/^\s*([A-Za-z0-9-]+)\s*[·-]\s*(.+)$/);
  return {
    setNumber:
      draft.setNumber ||
      match?.[1] ||
      (draft.itemKind === "minifigure" ? "MINIFIG" : "ATLAS"),
    setName: match?.[2]?.trim() || draft.title?.trim() || "LEGO item",
  };
}

export default function AtlasSellPage() {
  const [stage, setStage] = useState(0);
  const [draft, setDraft] = useState<ListingDraft>({
    delivery: "TBX delivery",
    shippingMethods: [],
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [photosConfirmed, setPhotosConfirmed] = useState(false);
  const [checkingPhotos, setCheckingPhotos] = useState(false);
  const [atlasPrice, setAtlasPrice] = useState<number | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingChecked, setPricingChecked] = useState(false);
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  useEffect(() => {
    const saved = window.localStorage.getItem("tbx-listing-draft");
    let restoredDraft: ListingDraft | null = null;
    if (saved)
      try {
        restoredDraft = JSON.parse(saved) as ListingDraft;
        setDraft({
          delivery: "TBX delivery",
          ...restoredDraft,
          shippingMethods: restoredDraft.shippingMethods || [],
        });
        const initial = Number(
          restoredDraft.atlasRecommended ?? restoredDraft.price ?? 0,
        );
        setAtlasPrice(Number.isFinite(initial) && initial > 0 ? initial : null);
      } catch {}
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        const authenticated = Boolean(data.user);
        setSignedIn(authenticated);
        if (
          authenticated &&
          restoredDraft &&
          new URLSearchParams(window.location.search).get("resume") === "photos"
        )
          setStage(isLooseDraft(restoredDraft) ? 2 : 3);
        setReady(true);
      });
  }, []);
  useEffect(() => {
    if (ready)
      window.localStorage.setItem("tbx-listing-draft", JSON.stringify(draft));
  }, [draft, ready]);
  useEffect(() => {
    if (
      !ready ||
      pricingChecked ||
      draft.itemKind !== "minifigure" ||
      !draft.legoMinifigureId
    )
      return;
    if (draft.atlasRecommended && draft.atlasRecommended > 0) {
      setAtlasPrice(draft.atlasRecommended);
      if (!draft.price)
        setDraft((c) => ({ ...c, price: String(c.atlasRecommended ?? "") }));
      setPricingChecked(true);
      return;
    }
    const controller = new AbortController();
    setPricingLoading(true);
    void (async () => {
      try {
        const supabase = createClient();
        const { data: figure } = await supabase
          .from("lego_minifigures")
          .select("catalogue_id")
          .eq("id", draft.legoMinifigureId)
          .maybeSingle();
        if (!figure?.catalogue_id) return;
        const response = await fetch(
          `/api/value/minifigure/${encodeURIComponent(figure.catalogue_id)}?condition=${encodeURIComponent(draft.condition || "Not sure")}`,
          { signal: controller.signal },
        );
        const payload = await response.json();
        if (!response.ok) return;
        const quote = (payload?.quote ?? {}) as MinifigureQuote;
        const recommended = Number(quote.recommended ?? 0);
        if (
          quote.status !== "available" ||
          !Number.isFinite(recommended) ||
          recommended <= 0
        )
          return;
        setAtlasPrice(Math.round(recommended));
        setDraft((c) => ({
          ...c,
          price: c.price || String(Math.round(recommended)),
          atlasLow: quote.low ?? null,
          atlasRecommended: Math.round(recommended),
          atlasHigh: quote.high ?? null,
          atlasEvidenceCount: quote.evidenceCount ?? 0,
          atlasBasis: quote.basis ?? null,
        }));
      } catch {
      } finally {
        if (!controller.signal.aborted) {
          setPricingLoading(false);
          setPricingChecked(true);
        }
      }
    })();
    return () => controller.abort();
  }, [
    ready,
    pricingChecked,
    draft.itemKind,
    draft.legoMinifigureId,
    draft.atlasRecommended,
    draft.condition,
    draft.price,
  ]);
  const loose = isLooseDraft(draft);
  const stages = loose ? looseStages : setStages;
  const photoStage = loose ? 2 : 3;
  const previewStage = loose ? 3 : 4;
  const finalStage = stages.length - 1;
  const weightKg = Number(
    draft.weight || draft.title?.match(/([\d.]+)\s*kg/i)?.[1] || 0,
  );
  const bulkLow = weightKg > 0 ? Math.round(weightKg * 150) : 0;
  const bulkHigh = weightKg > 0 ? Math.round(weightKg * 250) : 0;
  const bulkMid = weightKg > 0 ? Math.round(weightKg * 200) : 0;
  const price = Number(draft.price || 0),
    fee = price * 0.1;
  const enabledShipping = shippingOptions.filter((option) =>
    (draft.shippingMethods || []).includes(option.id),
  );
  const shippingEstimate = enabledShipping.length
    ? Math.max(...enabledShipping.map((option) => option.estimate))
    : 0;
  const payout = Math.max(0, price - fee - shippingEstimate);
  const deliveryLabel =
    enabledShipping.map((option) => option.label).join(" + ") ||
    "No delivery method selected";
  function update(field: keyof ListingDraft, value: string) {
    setDraft((c) => ({ ...c, [field]: value }));
  }
  function toggleShipping(method: ShippingMethod) {
    setDraft((c) => {
      const current = c.shippingMethods || [];
      const shippingMethods = current.includes(method)
        ? current.filter((item) => item !== method)
        : [...current, method];
      return { ...c, delivery: "TBX delivery", shippingMethods };
    });
  }
  async function choosePhotos(files: File[]) {
    setPhotos([]);
    setPhotosConfirmed(false);
    setPublishError("");
    if (!files.length) return;
    setCheckingPhotos(true);
    try {
      const accepted: File[] = [];
      for (const file of files) {
        const body = new FormData();
        body.append("photo", file);
        if (draft.legoSetId) body.append("legoSetId", draft.legoSetId);
        if (draft.legoMinifigureId)
          body.append("legoMinifigureId", draft.legoMinifigureId);
        const response = await fetch("/api/sell/photo-check", {
          method: "POST",
          body,
        });
        const result = (await response.json()) as PhotoCheckResult;
        if (!response.ok || !result.accepted)
          throw new Error(
            result.reason || "TBX could not check that photo. Try another one.",
          );
        accepted.push(file);
      }
      setPhotos(accepted);
    } catch (error) {
      setPublishError(
        error instanceof Error
          ? error.message
          : "TBX could not check those photos. Try again.",
      );
    } finally {
      setCheckingPhotos(false);
    }
  }
  async function uploadPhotos(
    supabase: ReturnType<typeof createClient>,
    userId: string,
    assetId: string,
  ) {
    for (let index = 0; index < photos.length; index += 1) {
      const file = photos[index];
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/${assetId}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("Asset-images")
        .upload(path, file, { upsert: false });
      if (uploadError) throw uploadError;
      const { error: evidenceError } = await supabase
        .from("asset_evidence")
        .insert({
          asset_id: assetId,
          owner_id: userId,
          evidence_type: index === 0 ? "Front Photo" : "Other",
          storage_bucket: "Asset-images",
          storage_path: path,
        });
      if (evidenceError) throw evidenceError;
    }
  }
  async function publish() {
    if (!signedIn) {
      window.location.href = `/sign-in?next=${encodeURIComponent("/sell/atlas?resume=photos")}`;
      return;
    }
    if (!draft.title?.trim() || !Number.isFinite(price) || price <= 0) {
      setPublishError("Add a valid price before publishing.");
      return;
    }
    if (!draft.shippingMethods?.length) {
      setPublishError("Choose at least one delivery option before publishing.");
      return;
    }
    if (!photos.length) {
      setPublishError("Add at least one current seller photo before publishing.");
      return;
    }
    if (!photosConfirmed) {
      setPublishError("Confirm that the photos are yours before publishing.");
      return;
    }
    setPublishing(true);
    setPublishError("");
    try {
      const supabase = createClient();
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData.user)
        throw new Error("Your session has expired. Please sign in again.");
      const identity = titleIdentity(draft);
      let assetId = draft.sourceAssetId || null;
      if (assetId) {
        const { data: owned } = await supabase
          .from("assets")
          .select("id")
          .eq("id", assetId)
          .eq("owner_id", authData.user.id)
          .maybeSingle();
        if (!owned) assetId = null;
      }
      if (!assetId) {
        let legoSetId = draft.legoSetId ?? null;
        if (
          !loose &&
          !legoSetId &&
          identity.setNumber !== "ATLAS" &&
          identity.setNumber !== "MINIFIG"
        ) {
          const { data: set } = await supabase
            .from("lego_sets")
            .select("id")
            .eq("set_number", identity.setNumber)
            .maybeSingle();
          legoSetId = set?.id ?? null;
        }
        const assetValues = {
          owner_id: authData.user.id,
          lego_set_id: loose ? null : legoSetId,
          lego_minifigure_id: draft.legoMinifigureId ?? null,
          set_number: identity.setNumber,
          set_name: identity.setName,
          theme: loose
            ? "Loose LEGO"
            : draft.theme ||
              (draft.itemKind === "minifigure" ? "Minifigures" : "LEGO"),
          condition: normaliseCondition(draft.condition),
          sealed: loose
            ? false
            : normaliseCondition(draft.condition) === "New Sealed",
          estimated_value: loose ? price : (draft.atlasRecommended ?? price),
          passport_status: "Draft",
          is_public: true,
          lifecycle_status: "listed",
          notes: draft.description || draft.included || null,
        };
        const { data: asset, error: assetError } = await supabase
          .from("assets")
          .insert(assetValues)
          .select("id")
          .single();
        if (assetError || !asset)
          throw (
            assetError ?? new Error("TBX could not create the item record.")
          );
        assetId = asset.id;
      } else {
        const { error } = await supabase
          .from("assets")
          .update({
            condition: normaliseCondition(draft.condition),
            estimated_value: loose ? price : (draft.atlasRecommended ?? price),
            is_public: true,
            lifecycle_status: "listed",
          })
          .eq("id", assetId)
          .eq("owner_id", authData.user.id);
        if (error) throw error;
      }

      if (!assetId) throw new Error("TBX could not create the item record.");
      await uploadPhotos(supabase, authData.user.id, assetId);
      const deliveryData = {
        delivery: "TBX delivery",
        shippingMethods: draft.shippingMethods,
        shippingAllowance: shippingEstimate,
        shippingAllowanceType: "provisional",
        sellerFundsShipping: true,
        tbxFeeRate: 0.1,
      };
      const listingValues = {
        asset_id: assetId,
        seller_id: authData.user.id,
        title: draft.title.trim(),
        description: draft.description?.trim() || draft.included || null,
        asking_price: price,
        currency: "ZAR",
        status: "Active",
        published_at: new Date().toISOString(),
        lifecycle_state: "listed",
        value_quote: loose
          ? {
              source: "TBX bulk guide",
              condition: draft.condition || "Not sure",
              ...deliveryData,
              weightKg: weightKg || null,
              low: bulkLow || null,
              recommended: bulkMid || null,
              high: bulkHigh || null,
              basis:
                "Provisional loose LEGO guide of R150–R250 per kg before fees and delivery",
            }
          : {
              source: "Atlas",
              condition: draft.condition || "Not sure",
              ...deliveryData,
              low: draft.atlasLow ?? null,
              recommended: draft.atlasRecommended ?? null,
              high: draft.atlasHigh ?? null,
              evidenceCount: draft.atlasEvidenceCount ?? null,
              basis: draft.atlasBasis ?? null,
            },
      };
      const { data: existing } = await supabase
        .from("listings")
        .select("id")
        .eq("asset_id", assetId)
        .in("status", ["Draft", "Active"])
        .limit(1)
        .maybeSingle();
      const request = existing
        ? supabase
            .from("listings")
            .update(listingValues)
            .eq("id", existing.id)
            .select("id")
            .single()
        : supabase.from("listings").insert(listingValues).select("id").single();
      const { data: listing, error: listingError } = await request;
      if (listingError || !listing)
        throw listingError ?? new Error("TBX could not publish the listing.");
      window.localStorage.removeItem("tbx-listing-draft");
      window.localStorage.removeItem("tbx-listing-ready-to-publish");
      window.location.href = `/marketplace?published=${listing.id}`;
    } catch (error) {
      setPublishError(
        error instanceof Error
          ? error.message
          : "TBX could not publish this listing. Please try again.",
      );
      setPublishing(false);
    }
  }
  const deliveryStage = (loose && stage === 1) || (!loose && stage === 2);
  const canContinue =
    stage === 0
      ? Boolean(draft.title?.trim() && price > 0)
      : deliveryStage
        ? Boolean(price > 0 && draft.shippingMethods?.length)
        : true;
  return (
    <main className="min-h-screen bg-[#050912] text-white">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex h-20 max-w-[980px] items-center justify-between px-5 lg:px-10">
          <Link href="/" className="flex items-center gap-3 font-black">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-400/25 bg-[#09101d] text-emerald-300">
              <Boxes className="h-5 w-5" />
            </span>
            TBX
          </Link>
          <Link
            href="/value"
            className="inline-flex items-center gap-2 text-sm font-bold text-white/55"
          >
            <ArrowLeft className="h-4 w-4" /> Start over
          </Link>
        </div>
      </header>
      <section className="mx-auto max-w-[900px] px-4 py-7 sm:px-5 sm:py-10 lg:px-10">
        <div className="mb-6 flex items-center gap-2">
          {stages.map((label, index) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <span
                className={`grid h-7 w-7 place-items-center rounded-full text-xs font-black ${index <= stage ? "bg-emerald-400 text-[#050912]" : "bg-white/[0.07] text-white/30"}`}
              >
                {index + 1}
              </span>
              <span
                className={`hidden text-xs font-bold sm:block ${index <= stage ? "text-white/75" : "text-white/25"}`}
              >
                {label}
              </span>
              {index < stages.length - 1 ? (
                <span className="h-px flex-1 bg-white/10" />
              ) : null}
            </div>
          ))}
        </div>
        <div className="rounded-[1.75rem] border border-emerald-400/15 bg-[#09111f] p-5 sm:p-8">
          {stage === 0 && loose ? (
            <div>
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                  <Scale className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                    Loose LEGO
                  </p>
                  <h1 className="mt-1 text-3xl font-black sm:text-4xl">
                    Set your selling price
                  </h1>
                  <p className="mt-2 text-sm text-white/45">
                    Choose the total price the buyer will pay. Fees and delivery
                    are deducted from this amount.
                  </p>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.045] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
                  Your loose LEGO
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  {draft.title || "Loose LEGO"}
                </h2>
                <p className="mt-2 text-sm text-white/45">
                  {draft.condition || "Condition not specified"}
                </p>
              </div>
              <div className="mt-6 border-t border-white/[0.07] pt-6">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-emerald-300" />
                  <h2 className="text-2xl font-black">Price</h2>
                </div>
                {weightKg > 0 ? (
                  <div className="mt-3 rounded-xl border border-white/10 bg-[#050912] p-4">
                    <p className="text-sm leading-6 text-white/55">
                      Similar loose-LEGO listings are typically priced at{" "}
                      <strong className="text-white">
                        R150–R250/kg before fees and delivery
                      </strong>
                      .
                    </p>
                    <p className="mt-1 text-sm text-white/45">
                      For {weightKg} kg, that is{" "}
                      <strong className="text-white">
                        {money(bulkLow)}–{money(bulkHigh)}
                      </strong>
                      . We started your listing at the R200/kg midpoint:{" "}
                      {money(bulkMid)}.
                    </p>
                  </div>
                ) : null}
                <label className="mt-5 block">
                  <span className="text-sm font-bold text-white/65">
                    Price the buyer pays
                  </span>
                  <div className="mt-2 flex h-16 items-center rounded-2xl border border-white/10 bg-[#050912] px-4">
                    <span className="mr-2 text-xl font-black text-white/35">
                      R
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={draft.price || ""}
                      onChange={(e) => update("price", e.target.value)}
                      className="h-full min-w-0 flex-1 bg-transparent text-2xl font-black outline-none"
                    />
                    <span className="text-xs font-bold text-white/30">ZAR</span>
                  </div>
                </label>
                <p className="mt-2 text-xs text-white/35">
                  You’ll see your estimated payout after choosing delivery.
                </p>
              </div>
              {price > 0 ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Summary label="Buyer price" value={money(price)} />
                  <Summary label="TBX fee (10%)" value={`-${money(fee)}`} />
                </div>
              ) : null}
            </div>
          ) : null}
          {stage === 0 && !loose ? (
            <div>
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                  <Check className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                    Atlas result
                  </p>
                  <h1 className="mt-1 text-3xl font-black sm:text-4xl">
                    We found your set!
                  </h1>
                  <p className="mt-2 text-sm text-white/45">
                    Atlas has identified your LEGO item.
                  </p>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.045] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
                  Match confirmed
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  {draft.title || "LEGO item"}
                </h2>
                <p className="mt-2 text-sm text-white/45">
                  {draft.condition || "Condition not specified"}
                </p>
              </div>
              <div className="mt-6 border-t border-white/[0.07] pt-6">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-emerald-300" />
                  <h2 className="text-2xl font-black">Set your price</h2>
                </div>
                {pricingLoading ? (
                  <p className="mt-3 flex items-center gap-2 text-sm text-white/45">
                    <Loader2 className="h-4 w-4 animate-spin" /> Checking for a
                    suggested price…
                  </p>
                ) : atlasPrice ? (
                  <p className="mt-2 text-sm leading-6 text-white/45">
                    Atlas suggests{" "}
                    <strong className="text-white">{money(atlasPrice)}</strong>.
                    Use it or choose the delivered price that works for you.
                  </p>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-white/45">
                    Choose a fair delivered price that works for you.
                  </p>
                )}
                <label className="mt-5 block">
                  <span className="text-sm font-bold text-white/65">
                    Delivered price (ZAR)
                  </span>
                  <div className="mt-2 flex h-16 items-center rounded-2xl border border-white/10 bg-[#050912] px-4">
                    <span className="mr-2 text-xl font-black text-white/35">
                      R
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={draft.price || ""}
                      onChange={(e) => update("price", e.target.value)}
                      className="h-full min-w-0 flex-1 bg-transparent text-2xl font-black outline-none"
                    />
                    <span className="text-xs font-bold text-white/30">ZAR</span>
                  </div>
                </label>
              </div>
              {price > 0 ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <Summary label="Buyer price" value={money(price)} />
                  <Summary label="TBX fee (10%)" value={`-${money(fee)}`} />
                  <Summary
                    label="Before shipping"
                    value={money(price - fee)}
                    highlight
                  />
                </div>
              ) : null}
            </div>
          ) : null}
          {!loose && stage === 1 ? (
            <div>
              <h1 className="text-3xl font-black">Quick check</h1>
              <p className="mt-3 text-white/45">
                Atlas already knows the item. Confirm the condition and
                continue.
              </p>
              <label className="mt-6 block">
                <span className="text-sm font-bold text-white/65">
                  Condition
                </span>
                <select
                  value={normaliseCondition(draft.condition)}
                  onChange={(e) => update("condition", e.target.value)}
                  className="mt-2 h-14 w-full rounded-xl border border-white/10 bg-[#050912] px-4"
                >
                  <option value="Unknown">Not sure</option>
                  <option value="New Sealed">New / sealed</option>
                  <option value="New Open Box">New / open box</option>
                  <option value="Used Complete">Complete used</option>
                  <option value="Used Incomplete">Incomplete</option>
                </select>
              </label>
            </div>
          ) : null}
          {deliveryStage ? (
            <div>
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                  <Truck className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                    Delivery
                  </p>
                  <h1 className="mt-1 text-3xl font-black">
                    How can you send it?
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-white/45">
                    {enabledShipping.length
                      ? "Choose another method if you want to give buyers more delivery options. Local collection is not available."
                      : "Choose at least one method. Nothing is selected yet, and local collection is not available."}
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {shippingOptions.map((option) => {
                  const selected = (draft.shippingMethods || []).includes(
                    option.id,
                  );
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleShipping(option.id)}
                      className={`rounded-2xl border p-5 text-left transition ${selected ? "border-emerald-400/35 bg-emerald-400/[0.08]" : "border-white/10 bg-[#050912] hover:border-white/20"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-black">{option.label}</p>
                          <p className="mt-1 text-sm text-white/45">
                            {option.detail}
                          </p>
                        </div>
                        <span
                          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border ${selected ? "border-emerald-300 bg-emerald-400 text-[#050912]" : "border-white/20 text-transparent"}`}
                        >
                          <Check className="h-4 w-4" />
                        </span>
                      </div>
                      <p className="mt-4 text-xs font-bold text-white/35">
                        Estimated delivery cost: {money(option.estimate)}
                      </p>
                      {selected ? (
                        <p className="mt-2 text-xs font-bold text-emerald-300">
                          Selected
                        </p>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-xs leading-5 text-white/35">
                Delivery is currently estimated. Your final payout may change if
                the actual courier cost differs. If you enable both methods,
                this estimate uses the higher cost.
              </p>
              {enabledShipping.length ? (
                <div className="mt-6">
                  <label className="block">
                    <span className="text-sm font-bold text-white/65">
                      Adjust buyer price
                    </span>
                    <div className="mt-2 flex h-14 items-center rounded-2xl border border-white/10 bg-[#050912] px-4">
                      <span className="mr-2 font-black text-white/35">R</span>
                      <input
                        type="number"
                        min="0"
                        value={draft.price || ""}
                        onChange={(e) => update("price", e.target.value)}
                        className="h-full min-w-0 flex-1 bg-transparent text-xl font-black outline-none"
                      />
                      <span className="text-xs font-bold text-white/30">
                        ZAR
                      </span>
                    </div>
                  </label>
                  <p className="mt-2 text-xs text-white/35">
                    Adjust this until the estimated payout works for you.
                  </p>
                  {price > 0 ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <Summary label="TBX fee (10%)" value={`-${money(fee)}`} />
                      <Summary
                        label="Estimated delivery cost"
                        value={`-${money(shippingEstimate)}`}
                      />
                      <Summary
                        label="Estimated payout"
                        value={`${money(payout)} (${weightKg > 0 ? money(payout / weightKg) + "/kg" : "after deductions"})`}
                        highlight
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
          {stage === photoStage ? (
            <div>
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                  <Camera className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                    Photos
                  </p>
                  <h1 className="mt-1 text-3xl font-black">
                    Show buyers the actual LEGO
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-white/45">
                    Add at least one clear, current photo of the item you are
                    selling. The first photo becomes the main marketplace
                    image; Atlas imagery is shown separately as a reference.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-amber-200/70">
                    Use a photo you took of the actual item—not an Atlas or LEGO
                    product image, screenshot or AI-generated image.
                  </p>
                </div>
              </div>
              {!signedIn ? (
                <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-5">
                  <p className="font-bold">
                    Your price and delivery choices are saved.
                  </p>
                  <p className="mt-2 text-sm text-white/45">
                    Sign in before adding photos so they stay securely linked to
                    your private Collection Record.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = `/sign-in?next=${encodeURIComponent("/sell/atlas?resume=photos")}`;
                    }}
                    className="mt-4 rounded-xl bg-emerald-400 px-5 py-3 font-black text-[#050912]"
                  >
                    Sign in to add photos
                  </button>
                </div>
              ) : (
                <>
                  <label className="mt-6 grid cursor-pointer place-items-center rounded-2xl border border-dashed border-white/20 bg-[#050912] p-8 text-center hover:border-emerald-400/40">
                    <Camera className="h-8 w-8 text-emerald-300" />
                    <span className="mt-3 font-black">Choose photos</span>
                    <span className="mt-1 text-sm text-white/40">
                      {checkingPhotos ? "Checking photos…" : "JPG, PNG or WebP"}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="sr-only"
                      disabled={checkingPhotos}
                      onChange={(e) =>
                        void choosePhotos(Array.from(e.target.files || []))
                      }
                    />
                  </label>
                  {photos.length ? (
                    <div className="mt-4 space-y-2">
                      {photos.map((photo, index) => (
                        <div
                          key={`${photo.name}-${photo.size}`}
                          className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                        >
                          <span className="min-w-0 truncate text-sm">
                            <strong>
                              {index === 0 ? "Main photo · " : ""}
                            </strong>
                            {photo.name}
                          </span>
                          <button
                            type="button"
                            aria-label={`Remove ${photo.name}`}
                            onClick={() =>
                              setPhotos((current) =>
                                current.filter(
                                  (_, itemIndex) => itemIndex !== index,
                                ),
                              )
                            }
                            className="ml-3 rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {photos.length ? (
                    <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-[#050912] p-4">
                      <input
                        type="checkbox"
                        checked={photosConfirmed}
                        onChange={(event) =>
                          setPhotosConfirmed(event.target.checked)
                        }
                        className="mt-0.5 h-5 w-5 accent-emerald-400"
                      />
                      <span className="text-sm leading-6 text-white/65">
                        I took these photos and they show the actual item I am
                        selling.
                      </span>
                    </label>
                  ) : null}
                </>
              )}
            </div>
          ) : null}
          {stage === previewStage ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                Listing preview
              </p>
              <h1 className="mt-3 text-3xl font-black">
                {draft.title || "Atlas item"}
              </h1>
              <p className="mt-2 text-white/45">{draft.condition}</p>
              <p className="mt-5 text-4xl font-black text-emerald-300">
                {money(price)}{" "}
                <span className="text-base text-white/35">buyer price</span>
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <Summary
                  label={loose ? "Pricing basis" : "Identified by"}
                  value={
                    loose
                      ? weightKg > 0
                        ? `${weightKg} kg bulk guide`
                        : "Loose LEGO"
                      : "Atlas"
                  }
                />
                <Summary label="Delivery" value={deliveryLabel} />
                <Summary label="TBX fee (10%)" value={`-${money(fee)}`} />
                <Summary
                  label="Estimated delivery cost"
                  value={`-${money(shippingEstimate)}`}
                />
                <Summary
                  label="Estimated payout"
                  value={money(payout)}
                  highlight
                />
              </div>
              <div className="mt-5 rounded-xl border border-white/10 bg-[#050912] p-4">
                <p className="text-sm font-bold text-white/70">
                  Ready to publish as a fixed-price listing.
                </p>
                <p className="mt-1 text-sm leading-6 text-white/40">
                  Publishing creates or updates your private Collection Record
                  and makes only the listing visible in Marketplace. Your name
                  and Collection details stay private.
                </p>
              </div>
            </div>
          ) : null}
          {publishError ? (
            <p className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.08] px-4 py-3 text-sm text-red-200">
              {publishError}
            </p>
          ) : null}
          <div className="mt-7 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-5">
            {stage === 0 ? (
              <Link
                href="/value"
                className="px-2 py-3 text-sm font-bold text-white/45"
              >
                Start over
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setStage((v) => Math.max(0, v - 1))}
                className="rounded-xl border border-white/10 px-5 py-3 font-bold"
              >
                Back
              </button>
            )}
            {stage < finalStage ? (
              <button
                type="button"
                disabled={
                  !canContinue ||
                  (stage === photoStage &&
                    (!signedIn ||
                      !photos.length ||
                      !photosConfirmed ||
                      checkingPhotos))
                }
                onClick={() => setStage((v) => Math.min(finalStage, v + 1))}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 font-black text-[#050912] disabled:opacity-40 sm:flex-none"
              >
                {stage === 0
                  ? loose
                    ? "Continue to delivery"
                    : "Continue to details"
                  : deliveryStage
                    ? "Continue to photos"
                    : stage === photoStage
                      ? "Review listing"
                      : "Continue to delivery"}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={
                  !ready ||
                  publishing ||
                  checkingPhotos ||
                  !photos.length ||
                  !photosConfirmed
                }
                onClick={publish}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 font-black text-[#050912] disabled:opacity-40 sm:flex-none"
              >
                {publishing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {publishing ? "Publishing…" : "Publish listing"}
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
function Summary({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${highlight ? "border-emerald-400/25 bg-emerald-400/[0.07]" : "border-white/10 bg-white/[0.025]"}`}
    >
      <p className="text-xs text-white/35">{label}</p>
      <p
        className={`mt-2 font-black ${highlight ? "text-emerald-300" : "text-white"}`}
      >
        {value}
      </p>
    </div>
  );
}

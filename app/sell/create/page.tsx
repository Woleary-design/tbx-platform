"use client";

import Link from "next/link";
import { KeyboardEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  Check,
  CircleHelp,
  Gauge,
  Loader2,
  LockKeyhole,
  PackageOpen,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { legoCatalogue, type LegoCatalogueSet } from "@/lib/lego/catalog";

type ItemKind = "known-set" | "mixed-box" | "unknown";
type Draft = {
  itemKind: ItemKind;
  title: string;
  condition: string;
  included: string;
  description: string;
  weight: string;
  price: string;
  delivery: string;
};
type Pricing = {
  fast: number;
  recommended: number;
  premium: number;
  low: number;
  high: number;
  confidence: "High" | "Medium" | "Early estimate";
  evidence: string;
};
type AtlasSet = LegoCatalogueSet & {
  id?: string;
  pieceCount?: number | null;
  minifigureCount?: number | null;
  imageUrl?: string | null;
};

const emptyDraft: Draft = {
  itemKind: "known-set",
  title: "",
  condition: "Complete with box and instructions",
  included: "Original box, instructions and minifigures",
  description: "",
  weight: "",
  price: "",
  delivery: "Seller ships",
};

const steps = ["Item", "Details", "Photos", "Price", "Delivery", "Preview"];
const money = (value: number) => `R${Math.round(value).toLocaleString("en-ZA")}`;
const roundPrice = (value: number) => Math.max(50, Math.round(value / 50) * 50);

function localMatches(query: string) {
  const clean = query.trim().toLowerCase();
  return legoCatalogue
    .filter(
      (set) =>
        set.setNumber.toLowerCase().includes(clean) ||
        set.name.toLowerCase().includes(clean) ||
        set.theme.toLowerCase().includes(clean),
    )
    .slice(0, 8);
}

function starterPricing(draft: Draft): Pricing {
  const weight = Number(draft.weight || 0);
  const conditionFactor = draft.condition.includes("New")
    ? 1.2
    : draft.condition.includes("Incomplete")
      ? 0.72
      : draft.condition.includes("Loose") || draft.itemKind !== "known-set"
        ? 0.85
        : 1;
  const base = weight > 0 ? weight * 180 * conditionFactor : 850 * conditionFactor;
  const recommended = roundPrice(base);
  return {
    fast: roundPrice(recommended * 0.9),
    recommended,
    premium: roundPrice(recommended * 1.12),
    low: roundPrice(recommended * 0.82),
    high: roundPrice(recommended * 1.18),
    confidence: "Early estimate",
    evidence:
      weight > 0
        ? `Starter bulk estimate using ${weight} kg and the selected condition`
        : "Starter estimate until more item details or Atlas evidence are available",
  };
}

export default function CreateListingPage() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [atlasMatches, setAtlasMatches] = useState<AtlasSet[]>([]);
  const [selectedSet, setSelectedSet] = useState<AtlasSet | null>(null);
  const [atlasSearching, setAtlasSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const saved = window.localStorage.getItem("tbx-listing-draft");
    if (saved) setDraft({ ...emptyDraft, ...JSON.parse(saved) });
    createClient().auth.getUser().then(({ data }) => {
      setSignedIn(Boolean(data.user));
      setReady(true);
    });
  }, []);

  useEffect(() => {
    window.localStorage.setItem("tbx-listing-draft", JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    if (
      step !== 0 ||
      draft.itemKind !== "known-set" ||
      selectedSet ||
      draft.title.trim().length < 2
    ) {
      setAtlasMatches([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setAtlasSearching(true);
      try {
        const response = await fetch(
          `/api/catalogue/search?q=${encodeURIComponent(draft.title.trim())}`,
          { signal: controller.signal },
        );
        const payload = await response.json();
        const results = response.ok && Array.isArray(payload.results)
          ? (payload.results as AtlasSet[])
          : [];
        setAtlasMatches(results.length ? results.slice(0, 8) : localMatches(draft.title));
        setActiveIndex(0);
      } catch {
        if (!controller.signal.aborted) setAtlasMatches(localMatches(draft.title));
      } finally {
        if (!controller.signal.aborted) setAtlasSearching(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [draft.itemKind, draft.title, selectedSet, step]);

  useEffect(() => {
    if (step !== 3) return;
    if (draft.itemKind !== "known-set") {
      setPricing(starterPricing(draft));
      return;
    }

    const setNumber = draft.title.match(/\b(\d{4,6})\b/)?.[1];
    if (!setNumber) {
      setPricing(starterPricing(draft));
      return;
    }

    const controller = new AbortController();
    void (async () => {
      setPricingLoading(true);
      try {
        const response = await fetch(
          `/api/value/${setNumber}?condition=${encodeURIComponent(draft.condition)}`,
          { signal: controller.signal },
        );
        const data = await response.json();
        const quote = data?.quote;
        const market = data?.market;
        const recommended = Number(quote?.recommended ?? quote?.estimated_value ?? 0);
        if (!response.ok || !recommended) throw new Error("No exact price");
        const low = Number(quote?.quick_sale ?? market?.lowestAsking ?? recommended * 0.9);
        const high = Number(quote?.premium ?? market?.highestAsking ?? recommended * 1.12);
        setPricing({
          fast: roundPrice(low),
          recommended: roundPrice(recommended),
          premium: roundPrice(high),
          low: roundPrice(Math.min(low, recommended * 0.88)),
          high: roundPrice(Math.max(high, recommended * 1.12)),
          confidence: Number(quote?.confidence ?? 0) >= 0.75 ? "High" : "Medium",
          evidence: `${Number(quote?.verified_sales ?? 0)} verified sales · ${Number(quote?.active_listings ?? market?.activeListingCount ?? 0)} active listings`,
        });
      } catch {
        if (!controller.signal.aborted) setPricing(starterPricing(draft));
      } finally {
        if (!controller.signal.aborted) setPricingLoading(false);
      }
    })();

    return () => controller.abort();
  }, [step, draft.itemKind, draft.title, draft.condition, draft.weight]);

  const update = (field: keyof Draft, value: string) =>
    setDraft((current) => ({ ...current, [field]: value }));

  const price = Number(draft.price || 0);
  const fee = price * 0.1;
  const payout = Math.max(0, price - fee);
  const marketPosition = useMemo(() => {
    if (!pricing || !price) return 50;
    return Math.max(
      0,
      Math.min(100, ((price - pricing.low) / Math.max(1, pricing.high - pricing.low)) * 100),
    );
  }, [price, pricing]);

  const priceMessage =
    !pricing || !price
      ? "Choose a TBX price or enter your own."
      : price < pricing.low
        ? "Below the current range — likely to sell quickly."
        : price > pricing.high
          ? "Above the current range — expect a longer selling time."
          : "Priced competitively within the current market.";

  function chooseItemKind(kind: ItemKind) {
    setSelectedSet(null);
    setAtlasMatches([]);
    setDraft((current) => ({
      ...current,
      itemKind: kind,
      title:
        kind === "mixed-box"
          ? "Mixed box of LEGO"
          : kind === "unknown"
            ? "Unidentified LEGO collection"
            : "",
      condition: kind === "known-set" ? "Complete with box and instructions" : "Loose or mixed",
      included:
        kind === "mixed-box"
          ? "Loose bricks, parts and any visible minifigures"
          : kind === "unknown"
            ? "Contents not yet identified"
            : "Original box, instructions and minifigures",
      price: "",
    }));
  }

  function selectAtlasSet(set: AtlasSet) {
    setSelectedSet(set);
    update("title", `${set.setNumber} · ${set.name}`);
    setAtlasMatches([]);
    setActiveIndex(0);
    (document.activeElement as HTMLElement | null)?.blur();
  }

  function handleAtlasKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!atlasMatches.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % atlasMatches.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + atlasMatches.length) % atlasMatches.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      selectAtlasSet(atlasMatches[activeIndex]);
    } else if (event.key === "Escape") {
      setAtlasMatches([]);
    }
  }

  function choosePrice(value: number) {
    update("price", String(value));
  }

  function publish() {
    if (!signedIn) {
      window.location.href = `/sign-in?next=${encodeURIComponent("/sell/create?publish=1")}`;
      return;
    }
    window.localStorage.setItem("tbx-listing-ready-to-publish", "true");
    alert("Your listing draft is complete. The final marketplace database publish action is the next integration step.");
  }

  const itemReady =
    draft.itemKind === "known-set"
      ? Boolean(selectedSet)
      : Boolean(draft.title.trim() && (draft.weight.trim() || draft.description.trim()));

  return (
    <main className="min-h-screen bg-[#050912] text-white">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between px-5 lg:px-10">
          <Link href="/" className="flex items-center gap-3 font-black">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#e8c86a]/25 bg-[#09101d] text-[#e8c86a]">
              <Boxes className="h-5 w-5" />
            </span>
            TBX
          </Link>
          <Link href="/value" className="inline-flex items-center gap-2 text-sm font-bold text-white/55">
            <ArrowLeft className="h-4 w-4" /> Back to Value
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1200px] px-5 py-14 lg:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#e8c86a]">Create a listing</p>
        <h1 className="mt-4 max-w-5xl text-5xl font-black tracking-[-0.055em]">
          Tell us what you have. TBX will guide the rest.
        </h1>

        <div className="mt-10 grid gap-2 sm:grid-cols-6">
          {steps.map((label, index) => (
            <div
              key={label}
              className={`rounded-xl border px-3 py-3 text-center text-xs font-bold ${
                index <= step
                  ? "border-[#e8c86a]/30 bg-[#e8c86a]/[0.08] text-[#e8c86a]"
                  : "border-white/10 text-white/30"
              }`}
            >
              {index + 1}. {label}
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[2rem] border border-white/[0.09] bg-[#09111f] p-6 sm:p-8">
          {step === 0 ? (
            <div className="space-y-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e8c86a]">Start here</p>
                <h2 className="mt-2 text-3xl font-black">What are you selling?</h2>
                <p className="mt-2 text-white/45">Choose the option that best matches what is in front of you.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    kind: "known-set" as ItemKind,
                    title: "A known LEGO set",
                    text: "Search by set number or name.",
                    icon: Search,
                  },
                  {
                    kind: "mixed-box" as ItemKind,
                    title: "A mixed box or loose LEGO",
                    text: "No set number or sorting required.",
                    icon: PackageOpen,
                  },
                  {
                    kind: "unknown" as ItemKind,
                    title: "I am not sure what I have",
                    text: "Describe it roughly and continue.",
                    icon: CircleHelp,
                  },
                ].map(({ kind, title, text, icon: Icon }) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => chooseItemKind(kind)}
                    className={`rounded-2xl border p-5 text-left transition ${
                      draft.itemKind === kind
                        ? "border-[#e8c86a] bg-[#e8c86a]/10"
                        : "border-white/10 bg-white/[0.025] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e8c86a]/10 text-[#e8c86a]">
                        <Icon className="h-5 w-5" />
                      </span>
                      {draft.itemKind === kind ? <Check className="h-5 w-5 text-[#e8c86a]" /> : null}
                    </div>
                    <p className="mt-5 font-black">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-white/42">{text}</p>
                  </button>
                ))}
              </div>

              {draft.itemKind === "known-set" ? (
                <div className="relative">
                  <Field label="Find the set">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" />
                      <input
                        autoFocus
                        value={draft.title}
                        onChange={(event) => {
                          update("title", event.target.value);
                          setSelectedSet(null);
                        }}
                        onKeyDown={handleAtlasKeyDown}
                        placeholder="Search 75192 or Millennium Falcon"
                        autoComplete="off"
                        aria-autocomplete="list"
                        className="input !pl-12 !pr-12"
                      />
                      {atlasSearching ? (
                        <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-white/35" />
                      ) : null}
                    </div>
                  </Field>

                  {atlasMatches.length > 0 && !selectedSet ? (
                    <div className="absolute left-0 right-0 top-full z-30 -mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#050912] shadow-[0_24px_70px_rgba(0,0,0,0.65)]">
                      {atlasMatches.map((set, index) => (
                        <button
                          key={`${set.id ?? "atlas"}-${set.setNumber}`}
                          type="button"
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => selectAtlasSet(set)}
                          className={`flex w-full items-center gap-4 border-b border-white/[0.06] px-4 py-3 text-left last:border-b-0 ${
                            index === activeIndex ? "bg-[#e8c86a]/10" : "hover:bg-white/[0.04]"
                          }`}
                        >
                          <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/[0.06] text-xs font-bold text-white/45">
                            {set.imageUrl ? <img src={set.imageUrl} alt="" className="h-full w-full object-contain" /> : set.setNumber}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-bold">{set.name}</span>
                            <span className="mt-1 block truncate text-xs text-white/42">
                              LEGO {set.setNumber} · {set.theme}
                            </span>
                          </span>
                          <ArrowRight className="h-4 w-4 text-[#e8c86a]" />
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {selectedSet ? (
                    <div className="-mt-3 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.07] p-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/[0.06]">
                        {selectedSet.imageUrl ? <img src={selectedSet.imageUrl} alt="" className="h-full w-full object-contain" /> : <Check className="h-5 w-5 text-emerald-300" />}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-bold">{selectedSet.name}</p>
                        <p className="truncate text-xs text-white/45">Matched by Atlas · LEGO {selectedSet.setNumber}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={draft.itemKind === "mixed-box" ? "What should we call it?" : "Give it a simple title"}>
                    <input
                      value={draft.title}
                      onChange={(event) => update("title", event.target.value)}
                      placeholder={draft.itemKind === "mixed-box" ? "Mixed LEGO box" : "Unknown LEGO collection"}
                      className="input"
                    />
                  </Field>
                  <Field label="Approximate weight">
                    <div className="relative">
                      <input
                        value={draft.weight}
                        onChange={(event) => update("weight", event.target.value)}
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="e.g. 8"
                        className="input !pr-14"
                      />
                      <span className="absolute right-4 top-1/2 mt-1 -translate-y-1/2 text-sm text-white/40">kg</span>
                    </div>
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Tell us anything you can see">
                      <textarea
                        value={draft.description}
                        onChange={(event) => update("description", event.target.value)}
                        rows={4}
                        placeholder="For example: mostly loose bricks, some wheels, a few minifigures, instruction books, possible incomplete sets..."
                        className="input"
                      />
                    </Field>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {step === 1 ? (
            <div>
              <h2 className="text-3xl font-black">Describe what is included</h2>
              <p className="mt-2 text-white/45">This helps buyers understand the listing and improves the price guide.</p>
              <Field label="Overall condition">
                <select value={draft.condition} onChange={(event) => update("condition", event.target.value)} className="input">
                  {draft.itemKind === "known-set" ? (
                    <>
                      <option>New and sealed</option>
                      <option>Complete with box and instructions</option>
                      <option>Complete without box</option>
                      <option>Incomplete</option>
                      <option>Not sure</option>
                    </>
                  ) : (
                    <>
                      <option>Loose or mixed</option>
                      <option>Mostly clean and usable</option>
                      <option>Mixed condition</option>
                      <option>Needs cleaning or sorting</option>
                      <option>Not sure</option>
                    </>
                  )}
                </select>
              </Field>
              <Field label="What is included?">
                <textarea value={draft.included} onChange={(event) => update("included", event.target.value)} rows={4} className="input" />
              </Field>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <h2 className="text-3xl font-black">Photos</h2>
              <p className="mt-3 text-white/45">Photos are required before publication, especially for mixed or unidentified LEGO.</p>
              <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-10 text-center text-white/35">
                Photo upload connection coming next. Your draft can continue without losing progress.
              </div>
              <Field label="Seller description">
                <textarea
                  value={draft.description}
                  onChange={(event) => update("description", event.target.value)}
                  rows={5}
                  placeholder="Mention marks, missing pieces, sorting, storage and anything useful to a buyer."
                  className="input"
                />
              </Field>
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e8c86a]">TBX pricing engine</p>
                  <h2 className="mt-2 text-3xl font-black">What should you list it for?</h2>
                  <p className="mt-2 text-sm text-white/42">{pricingLoading ? "Reading current market data…" : pricing?.evidence}</p>
                </div>
                {pricing ? <div className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-4 py-2 text-xs font-bold text-emerald-300">{pricing.confidence} confidence</div> : null}
              </div>

              {pricing ? (
                <div className="mt-7 grid gap-4 lg:grid-cols-3">
                  {[
                    { label: "Sell fast", value: pricing.fast, copy: "Priced to attract buyers quickly.", icon: Zap },
                    { label: "Recommended", value: pricing.recommended, copy: "Best balance of value and speed.", icon: Sparkles },
                    { label: "Maximise value", value: pricing.premium, copy: "Higher return, potentially longer wait.", icon: Gauge },
                  ].map(({ label, value, copy, icon: Icon }) => (
                    <button
                      type="button"
                      key={label}
                      onClick={() => choosePrice(value)}
                      className={`rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 ${
                        price === value
                          ? "border-[#e8c86a] bg-[#e8c86a]/10"
                          : "border-white/10 bg-white/[0.025] hover:border-[#e8c86a]/35"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8c86a]/10 text-[#e8c86a]">
                          <Icon className="h-5 w-5" />
                        </span>
                        {price === value ? <Check className="h-5 w-5 text-[#e8c86a]" /> : null}
                      </div>
                      <p className="mt-5 text-sm font-bold text-white/55">{label}</p>
                      <p className="mt-1 text-3xl font-black">{money(value)}</p>
                      <p className="mt-2 text-sm leading-5 text-white/38">{copy}</p>
                    </button>
                  ))}
                </div>
              ) : null}

              <Field label="Or set your own price (ZAR)">
                <input value={draft.price} onChange={(event) => update("price", event.target.value)} type="number" min="0" placeholder="Enter your listing price" className="input" />
              </Field>

              {pricing ? (
                <div className="rounded-2xl border border-white/10 bg-[#050912] p-5">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/35">
                    <span>Lower</span><span>Market position</span><span>Higher</span>
                  </div>
                  <div className="relative mt-4 h-2 rounded-full bg-gradient-to-r from-emerald-400/70 via-[#e8c86a]/80 to-red-400/70">
                    <span className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#09111f] bg-white shadow" style={{ left: `${marketPosition}%` }} />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-white/65">{priceMessage}</p>
                </div>
              ) : null}

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <Summary label="Listing price" value={money(price)} />
                <Summary label="TBX fee (10%)" value={`-${money(fee)}`} />
                <Summary label="Estimated payout" value={money(payout)} highlight />
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <Field label="Delivery option">
              <select value={draft.delivery} onChange={(event) => update("delivery", event.target.value)} className="input">
                <option>Seller ships</option>
                <option>Collection only</option>
                <option>TBX-managed delivery</option>
              </select>
            </Field>
          ) : null}

          {step === 5 ? (
            <div>
              <div className="flex items-center justify-between gap-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e8c86a]">Listing preview</p>
                  <h2 className="mt-2 text-3xl font-black">{draft.title || "Untitled listing"}</h2>
                </div>
                <p className="text-3xl font-black">{money(price)}</p>
              </div>
              <div className="mt-7 grid gap-4 sm:grid-cols-3">
                <Summary label="Type" value={draft.itemKind === "known-set" ? "Known set" : draft.itemKind === "mixed-box" ? "Mixed box" : "Unidentified collection"} />
                <Summary label="Condition" value={draft.condition} />
                <Summary label="Delivery" value={draft.delivery} />
              </div>
              <p className="mt-6 leading-7 text-white/50">{draft.description || draft.included}</p>
              <div className="mt-8 rounded-2xl border border-white/10 bg-[#050912] p-5">
                <div className="flex items-center gap-3">
                  <LockKeyhole className="h-5 w-5 text-[#e8c86a]" />
                  <div>
                    <p className="font-bold">Publishing requires a free TBX account</p>
                    <p className="text-sm text-white/38">Your complete draft remains saved on this device.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex items-center justify-between border-t border-white/[0.07] pt-6">
            <button onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0} className="rounded-xl border border-white/10 px-5 py-3 font-bold disabled:opacity-30">Back</button>
            {step < 5 ? (
              <button onClick={() => setStep((value) => Math.min(5, value + 1))} disabled={(step === 0 && !itemReady) || (step === 3 && !price)} className="inline-flex items-center gap-2 rounded-xl bg-[#e8c86a] px-5 py-3 font-bold text-[#050912] disabled:cursor-not-allowed disabled:opacity-40">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={publish} disabled={!ready} className="inline-flex items-center gap-2 rounded-xl bg-[#e8c86a] px-6 py-3 font-bold text-[#050912] disabled:opacity-50">
                {signedIn ? "Finish publishing" : "Create account to publish"} <Check className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      <style jsx>{`.input{margin-top:.5rem;width:100%;border-radius:.75rem;border:1px solid rgba(255,255,255,.1);background:#050912;padding:.9rem 1rem;color:white;outline:none}.input:focus{border-color:rgba(232,200,106,.45)}`}</style>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="mb-6 mt-6 block"><span className="text-sm font-bold text-white/70">{label}</span>{children}</label>;
}

function Summary({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${highlight ? "border-[#e8c86a]/25 bg-[#e8c86a]/[0.07]" : "border-white/10 bg-white/[0.025]"}`}>
      <p className="text-sm text-white/40">{label}</p>
      <p className={`mt-2 text-xl font-black ${highlight ? "text-[#e8c86a]" : "text-white"}`}>{value}</p>
    </div>
  );
}

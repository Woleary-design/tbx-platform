"use client";

import { useEffect, useState, type ReactNode } from "react";

function normaliseAtlasDraft() {
  const raw = window.localStorage.getItem("tbx-listing-draft");
  if (!raw) return;

  try {
    const draft = JSON.parse(raw) as Record<string, unknown>;
    const included = String(draft.included ?? "");
    const originalKind = String(draft.itemKind ?? "");

    let itemKind: "mixed-box" | "unknown" = "unknown";
    if (
      originalKind === "manual" &&
      /mixed box|loose brick|loose lego|bulk|other lego collection/i.test(included)
    ) {
      itemKind = "mixed-box";
    }

    window.localStorage.setItem(
      "tbx-listing-draft",
      JSON.stringify({ ...draft, itemKind }),
    );
  } catch {
    // Leave the existing draft untouched if it cannot be parsed.
  }
}

export default function CreateListingLayout({ children }: { children: ReactNode }) {
  const [atlasHandoff, setAtlasHandoff] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromAtlas = params.get("source") === "manual";

    if (!fromAtlas) {
      setReady(true);
      return;
    }

    normaliseAtlasDraft();
    setAtlasHandoff(true);
  }, []);

  useEffect(() => {
    if (!atlasHandoff) return;

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      const continueButton = [...document.querySelectorAll<HTMLButtonElement>("button")].find(
        (button) => button.textContent?.trim().startsWith("Continue") && !button.disabled,
      );

      if (continueButton) {
        continueButton.click();
        window.clearInterval(timer);
        setAtlasHandoff(false);
        setReady(true);
        return;
      }

      if (attempts >= 60) {
        window.clearInterval(timer);
        setAtlasHandoff(false);
        setReady(true);
      }
    }, 50);

    return () => window.clearInterval(timer);
  }, [atlasHandoff]);

  if (!ready) {
    return (
      <>
        <div className="fixed inset-0 z-[100] grid place-items-center bg-[#050912] text-white">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e8c86a]">Atlas</p>
            <p className="mt-3 text-lg font-black">Preparing your listing…</p>
            <p className="mt-2 text-sm text-white/40">Your item details are already carried across.</p>
          </div>
        </div>
        <div className="invisible">{children}</div>
      </>
    );
  }

  return children;
}

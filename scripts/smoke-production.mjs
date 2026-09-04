const baseUrl = (process.env.TBX_SMOKE_URL || "https://tbx-platform.vercel.app").replace(/\/$/, "");

async function checkPage(path, expectedText) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "follow" });
  const body = await response.text();
  if (!response.ok) throw new Error(`${path} returned HTTP ${response.status}`);
  if (!body.includes(expectedText)) throw new Error(`${path} did not contain ${JSON.stringify(expectedText)}`);
  console.log(`PASS ${path}`);
}

async function checkCatalogue() {
  const response = await fetch(`${baseUrl}/api/catalogue/search?q=42110&limit=8`);
  const payload = await response.json();
  const exact = payload.results?.find((set) => set.setNumber === "42110");
  if (!response.ok || !exact || exact.name !== "Land Rover Defender") {
    throw new Error("Known-set search did not return LEGO 42110 · Land Rover Defender");
  }
  console.log("PASS /api/catalogue/search known-set result");
}

await checkPage("/", "TBX");
await checkPage("/marketplace", "Marketplace");
await checkPage("/sell/quick", "What LEGO have you got?");
await checkCatalogue();


import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type VisionResult = {
  summary?: string;
  detectedText?: string;
  candidates?: Array<{ setNumber?: string; name?: string; confidence?: number; reason?: string }>;
};

function extractOutputText(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const response = payload as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  if (response.output_text) return response.output_text;
  return response.output?.flatMap((item) => item.content ?? []).map((item) => item.text ?? "").join("\n") ?? "";
}

function parseVisionJson(text: string): VisionResult {
  const clean = text.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  try { return JSON.parse(clean) as VisionResult; } catch { return { summary: text, candidates: [] }; }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  if (!sessionId) return NextResponse.json({ error: "Missing identification session" }, { status: 400 });

  const { data: session } = await supabase.from("identification_sessions").select("id,status").eq("id", sessionId).eq("user_id", auth.user.id).maybeSingle();
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const { data: photos, error: photoError } = await supabase.from("identification_photos").select("storage_path").eq("session_id", sessionId).eq("user_id", auth.user.id).order("sort_order");
  if (photoError) return NextResponse.json({ error: photoError.message }, { status: 500 });
  if (!photos?.length) return NextResponse.json({ error: "Upload at least one photo" }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Photo analysis is not configured yet" }, { status: 503 });

  await supabase.from("identification_sessions").update({ status: "analysing" }).eq("id", sessionId);

  const signedImages: string[] = [];
  for (const photo of photos.slice(0, 6)) {
    const { data } = await supabase.storage.from("identification-photos").createSignedUrl(photo.storage_path, 300);
    if (data?.signedUrl) signedImages.push(data.signedUrl);
  }

  const prompt = `Identify the LEGO product shown in these seller photos. Prioritise visible box text, instruction-booklet text, barcodes and printed set numbers. Do not claim certainty when evidence is weak. Return JSON only with this shape: {"summary":"brief description","detectedText":"important visible text","candidates":[{"setNumber":"canonical LEGO set number without -1 suffix","name":"likely product name","confidence":0-100,"reason":"short evidence"}]}. Return at most 5 candidates, sorted strongest first.`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_VISION_MODEL ?? "gpt-5-mini",
        input: [{ role: "user", content: [{ type: "input_text", text: prompt }, ...signedImages.map((image_url) => ({ type: "input_image", image_url, detail: "high" }))] }],
      }),
    });
    if (!response.ok) throw new Error(`Vision service returned ${response.status}`);
    const vision = parseVisionJson(extractOutputText(await response.json()));
    const proposed = (vision.candidates ?? []).filter((item) => item.setNumber).slice(0, 5);
    const numbers = proposed.map((item) => String(item.setNumber).replace(/-1$/, ""));

    const { data: sets } = numbers.length
      ? await supabase.from("lego_sets").select("id,set_number,name,theme,image_url,year_released,piece_count").in("set_number", numbers)
      : { data: [] as Array<Record<string, unknown>> };

    const byNumber = new Map((sets ?? []).map((set) => [String(set.set_number), set]));
    const matched = proposed.flatMap((candidate) => {
      const setNumber = String(candidate.setNumber).replace(/-1$/, "");
      const set = byNumber.get(setNumber);
      return set ? [{ set, candidate }] : [];
    });

    await supabase.from("identification_candidates").delete().eq("session_id", sessionId);
    if (matched.length) {
      await supabase.from("identification_candidates").insert(matched.map(({ set, candidate }, index) => ({
        session_id: sessionId,
        lego_set_id: set.id,
        rank: index + 1,
        confidence: Math.max(0, Math.min(100, Math.round(candidate.confidence ?? 0))),
        reason: candidate.reason ?? null,
      })));
    }

    const confidence = matched[0]?.candidate.confidence ?? 0;
    await supabase.from("identification_sessions").update({ status: "needs_review", detected_text: vision.detectedText ?? null, analysis_summary: vision.summary ?? null, confidence }).eq("id", sessionId);

    return NextResponse.json({ sessionId, summary: vision.summary ?? null, detectedText: vision.detectedText ?? null, candidates: matched.map(({ set, candidate }) => ({ ...set, confidence: candidate.confidence ?? 0, reason: candidate.reason ?? null })) });
  } catch (error) {
    await supabase.from("identification_sessions").update({ status: "failed", analysis_summary: error instanceof Error ? error.message : "Analysis failed" }).eq("id", sessionId);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Analysis failed" }, { status: 502 });
  }
}
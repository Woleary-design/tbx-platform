import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_PHOTO_BYTES = 12 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function sha256(bytes: ArrayBuffer) {
  return createHash("sha256").update(Buffer.from(bytes)).digest("hex");
}

function looksLikeImage(bytes: Uint8Array, type: string) {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8;
  if (type === "image/png")
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    );
  if (type === "image/webp")
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  return false;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user)
    return NextResponse.json(
      { accepted: false, reason: "Sign in before adding seller photos." },
      { status: 401 },
    );

  const form = await request.formData();
  const photo = form.get("photo");
  if (!(photo instanceof File))
    return NextResponse.json(
      { accepted: false, reason: "Choose a photo to continue." },
      { status: 400 },
    );
  if (!allowedTypes.has(photo.type) || photo.size > MAX_PHOTO_BYTES)
    return NextResponse.json(
      {
        accepted: false,
        reason: "Choose a JPG, PNG or WebP photo smaller than 12 MB.",
      },
      { status: 400 },
    );

  const photoBytes = await photo.arrayBuffer();
  if (!looksLikeImage(new Uint8Array(photoBytes), photo.type))
    return NextResponse.json(
      { accepted: false, reason: "That file is not a valid photo." },
      { status: 400 },
    );

  const legoSetId = form.get("legoSetId");
  const legoMinifigureId = form.get("legoMinifigureId");
  let referenceUrl: string | null = null;
  if (typeof legoSetId === "string" && legoSetId) {
    const { data } = await supabase
      .from("lego_sets")
      .select("image_url")
      .eq("id", legoSetId)
      .maybeSingle();
    referenceUrl = data?.image_url ?? null;
  } else if (typeof legoMinifigureId === "string" && legoMinifigureId) {
    const { data } = await supabase
      .from("lego_minifigures")
      .select("image_url")
      .eq("id", legoMinifigureId)
      .maybeSingle();
    referenceUrl = data?.image_url ?? null;
  }

  if (referenceUrl) {
    try {
      const reference = await fetch(referenceUrl, { cache: "force-cache" });
      if (reference.ok) {
        const referenceBytes = await reference.arrayBuffer();
        if (sha256(photoBytes) === sha256(referenceBytes))
          return NextResponse.json(
            {
              accepted: false,
              reason:
                "This is the Atlas reference image. Upload a photo you took of the actual item.",
            },
            { status: 422 },
          );
      }
    } catch {
      // A temporary reference-image failure must not block a genuine seller.
    }
  }

  return NextResponse.json({ accepted: true });
}

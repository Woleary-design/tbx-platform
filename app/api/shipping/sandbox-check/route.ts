import { NextResponse } from "next/server";
import { getCourierQuotes, ShipLogicError } from "@/lib/shipping/shiplogic";

export async function GET() {
  if (process.env.VERCEL_ENV !== "preview" || process.env.SHIPLOGIC_ENVIRONMENT !== "sandbox") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  try {
    const quotes = await getCourierQuotes({
      collectionAddress: {
        type: "business",
        company: "TBX sandbox test",
        streetAddress: "194 Bancor Avenue",
        localArea: "Menlyn",
        city: "Pretoria",
        zone: "Gauteng",
        code: "0181",
        country: "ZA",
      },
      deliveryAddress: {
        type: "business",
        company: "Two Oceans Aquarium",
        streetAddress: "Dock Road",
        localArea: "Victoria & Alfred Waterfront",
        city: "Cape Town",
        zone: "Western Cape",
        code: "8002",
        country: "ZA",
      },
      parcels: [{ description: "Sandbox collectible", lengthCm: 20, widthCm: 20, heightCm: 10, weightKg: 2 }],
      declaredValueZar: 1_000,
    });
    return NextResponse.json({ ok: true, quoteCount: quotes.length, quotes });
  } catch (error) {
    const message = error instanceof ShipLogicError ? error.message : "Sandbox check failed";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}

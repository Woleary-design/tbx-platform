import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { courierIntegrationConfigured, getCourierQuotes, ShipLogicError, type CourierQuoteRequest, type ShipLogicAddress, type ShipLogicParcel } from "@/lib/shipping/shiplogic";

function validText(value: unknown, max = 160): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}

function validNumber(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function validAddress(value: unknown): value is ShipLogicAddress {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const address = value as Record<string, unknown>;
  return validText(address.streetAddress) && validText(address.localArea) && validText(address.city)
    && validText(address.zone) && validText(address.code, 12);
}

function validParcel(value: unknown): value is ShipLogicParcel {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const parcel = value as Record<string, unknown>;
  return validNumber(parcel.lengthCm, 1, 300) && validNumber(parcel.widthCm, 1, 300)
    && validNumber(parcel.heightCm, 1, 300) && validNumber(parcel.weightKg, 0.01, 1000);
}

function validRequest(value: unknown): value is CourierQuoteRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const request = value as Record<string, unknown>;
  return validAddress(request.collectionAddress)
    && (validAddress(request.deliveryAddress) || validText(request.deliveryPickupPointId, 100))
    && Array.isArray(request.parcels) && request.parcels.length > 0 && request.parcels.length <= 20
    && request.parcels.every(validParcel)
    && (request.declaredValueZar === undefined || validNumber(request.declaredValueZar, 0, 1_000_000));
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (!courierIntegrationConfigured()) return NextResponse.json({ error: "Live courier quotes are not configured." }, { status: 503 });

  const body = await request.json().catch(() => null);
  if (!validRequest(body)) return NextResponse.json({ error: "Valid collection, delivery and parcel details are required." }, { status: 400 });

  try {
    return NextResponse.json({ quotes: await getCourierQuotes(body) });
  } catch (error) {
    if (error instanceof ShipLogicError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Courier quotes are temporarily unavailable." }, { status: 502 });
  }
}

import "server-only";

const DEFAULT_SANDBOX_URL = "https://api.shiplogic.com";
const DEFAULT_PRODUCTION_URL = "https://api.portal.thecourierguy.co.za";

export type ShipLogicAddress = {
  type?: "residential" | "business" | "counter" | "locker" | "unknown";
  company?: string;
  streetAddress: string;
  localArea: string;
  city: string;
  zone: string;
  country?: "ZA";
  code: string;
  lat?: number;
  lng?: number;
};

export type ShipLogicParcel = {
  description?: string;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  weightKg: number;
};

export type CourierQuoteRequest = {
  collectionAddress: ShipLogicAddress;
  deliveryAddress?: ShipLogicAddress;
  deliveryPickupPointId?: string;
  parcels: ShipLogicParcel[];
  declaredValueZar?: number;
  collectionDate?: string;
  deliveryDate?: string;
};

export type CourierQuote = {
  quoteId: string;
  serviceCode: string;
  serviceName: string;
  priceZar: number;
  vatZar: number | null;
  estimatedDeliveryFrom: string | null;
  estimatedDeliveryTo: string | null;
  method: "courier-guy" | "pudo";
};

type JsonRecord = Record<string, unknown>;

function configuration() {
  const token = process.env.SHIPLOGIC_API_TOKEN?.trim();
  const providerId = Number(process.env.SHIPLOGIC_PROVIDER_ID);
  const accountId = Number(process.env.SHIPLOGIC_ACCOUNT_ID);
  if (!token || !Number.isInteger(providerId) || providerId <= 0 || !Number.isInteger(accountId) || accountId <= 0) {
    throw new ShipLogicError("Courier integration is not configured.", 503);
  }
  const environment = process.env.SHIPLOGIC_ENVIRONMENT === "production" ? "production" : "sandbox";
  const configuredUrl = process.env.SHIPLOGIC_API_URL?.trim();
  return {
    token,
    providerId,
    accountId,
    baseUrl: (configuredUrl || (environment === "production" ? DEFAULT_PRODUCTION_URL : DEFAULT_SANDBOX_URL)).replace(/\/$/, ""),
  };
}

export class ShipLogicError extends Error {
  constructor(message: string, public readonly status = 502, public readonly details?: unknown) {
    super(message);
    this.name = "ShipLogicError";
  }
}

function apiAddress(address: ShipLogicAddress) {
  return {
    type: address.type ?? "unknown",
    company: address.company ?? "",
    street_address: address.streetAddress,
    local_area: address.localArea,
    city: address.city,
    zone: address.zone,
    country: address.country ?? "ZA",
    code: address.code,
    ...(address.lat === undefined ? {} : { lat: address.lat }),
    ...(address.lng === undefined ? {} : { lng: address.lng }),
  };
}

function apiParcels(parcels: ShipLogicParcel[]) {
  return parcels.map((parcel) => ({
    parcel_description: parcel.description ?? "Collectible item",
    submitted_length_cm: parcel.lengthCm,
    submitted_width_cm: parcel.widthCm,
    submitted_height_cm: parcel.heightCm,
    submitted_weight_kg: parcel.weightKg,
  }));
}

async function shipLogicFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { token, baseUrl } = configuration();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const record = payload && typeof payload === "object" ? payload as JsonRecord : null;
    const message = typeof record?.message === "string" ? record.message : "The courier service could not complete the request.";
    throw new ShipLogicError(message, response.status >= 500 ? 502 : response.status, payload);
  }
  return payload as T;
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function stringValue(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function quoteRecords(payload: unknown): JsonRecord[] {
  if (Array.isArray(payload)) return payload.filter((value): value is JsonRecord => Boolean(value) && typeof value === "object");
  if (!payload || typeof payload !== "object") return [];
  const record = payload as JsonRecord;
  for (const key of ["rates", "quotes", "data"]) {
    if (Array.isArray(record[key])) return (record[key] as unknown[]).filter((value): value is JsonRecord => Boolean(value) && typeof value === "object");
  }
  return [];
}

export async function getCourierQuotes(request: CourierQuoteRequest): Promise<CourierQuote[]> {
  const { providerId, accountId } = configuration();
  const payload = await shipLogicFetch<unknown>("/rates", {
    method: "POST",
    body: JSON.stringify({
      provider_id: providerId,
      account_id: accountId,
      collection_address: apiAddress(request.collectionAddress),
      ...(request.deliveryAddress ? { delivery_address: apiAddress(request.deliveryAddress) } : {}),
      ...(request.deliveryPickupPointId ? { delivery_pickup_point_id: request.deliveryPickupPointId } : {}),
      parcels: apiParcels(request.parcels),
      ...(request.declaredValueZar === undefined ? {} : { declared_value: request.declaredValueZar }),
      ...(request.collectionDate ? { collection_min_date: request.collectionDate } : {}),
      ...(request.deliveryDate ? { delivery_min_date: request.deliveryDate } : {}),
    }),
  });

  return quoteRecords(payload).map((rate, index) => {
    const serviceCode = String(rate.service_level_code ?? rate.code ?? "");
    const serviceName = String(rate.service_level_name ?? rate.name ?? serviceCode) || "Courier delivery";
    const pickupPoint = /locker|pudo|pickup|counter/i.test(`${serviceCode} ${serviceName}`);
    return {
      quoteId: String(rate.id ?? rate.rate_id ?? `${serviceCode}-${index}`),
      serviceCode,
      serviceName,
      priceZar: numberValue(rate.rate ?? rate.total ?? rate.price),
      vatZar: rate.vat === undefined || rate.vat === null ? null : numberValue(rate.vat),
      estimatedDeliveryFrom: stringValue(rate.delivery_min_date ?? rate.estimated_delivery_from),
      estimatedDeliveryTo: stringValue(rate.delivery_max_date ?? rate.estimated_delivery_to),
      method: pickupPoint ? "pudo" : "courier-guy",
    };
  });
}

export async function getPickupPoints(lat: number, lng: number) {
  const query = new URLSearchParams({ lat: String(lat), lng: String(lng), order_closest: "true" });
  return shipLogicFetch<unknown>(`/pickup-points?${query}`);
}

export async function createCourierShipment(payload: JsonRecord) {
  const { providerId, accountId } = configuration();
  return shipLogicFetch<unknown>("/shipments", {
    method: "POST",
    body: JSON.stringify({ ...payload, provider_id: providerId, account_id: accountId }),
  });
}

export async function getCourierTracking(trackingReference: string) {
  const query = new URLSearchParams({ tracking_reference: trackingReference });
  return shipLogicFetch<unknown>(`/tracking/shipments?${query}`);
}

export async function getCourierProofOfDelivery(trackingReference: string) {
  const query = new URLSearchParams({ tracking_reference: trackingReference, include_digital_pod: "true" });
  return shipLogicFetch<unknown>(`/shipments/pod?${query}`);
}

export function courierIntegrationConfigured() {
  return Boolean(
    process.env.SHIPLOGIC_API_TOKEN?.trim()
    && Number(process.env.SHIPLOGIC_PROVIDER_ID) > 0
    && Number(process.env.SHIPLOGIC_ACCOUNT_ID) > 0,
  );
}

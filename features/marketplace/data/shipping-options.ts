export const courierCodes = ["courier-guy", "paxi", "pargo"] as const;

export type CourierCode = (typeof courierCodes)[number];

export type ShippingMethod = {
  code: CourierCode;
  name: string;
  service: string;
  deliveryType: "door-to-door" | "counter-to-counter" | "point-to-point";
  priceZar: number;
  estimate: string;
  sellerHandoff: string;
  bookingNote: string;
};

export const shippingMethods: Record<CourierCode, ShippingMethod> = {
  "courier-guy": {
    code: "courier-guy",
    name: "The Courier Guy",
    service: "PUDO locker or door delivery",
    deliveryType: "door-to-door",
    priceZar: 125,
    estimate: "1–3 business days",
    sellerHandoff: "Drop at a PUDO locker or await collection",
    bookingNote: "TBX will issue the booking PIN and tracking details.",
  },
  paxi: {
    code: "paxi",
    name: "PAXI",
    service: "PEP-to-PEP collection",
    deliveryType: "counter-to-counter",
    priceZar: 89,
    estimate: "3–5 business days",
    sellerHandoff: "Drop at the selected PEP store",
    bookingNote: "TBX will issue the token and bag voucher.",
  },
  pargo: {
    code: "pargo",
    name: "Pargo",
    service: "Pickup-point delivery",
    deliveryType: "point-to-point",
    priceZar: 109,
    estimate: "2–4 business days",
    sellerHandoff: "Drop at the selected Pargo point",
    bookingNote: "TBX will issue the drop-off PIN and tracking details.",
  },
};

export function getShippingMethod(code: string | undefined) {
  return courierCodes.includes(code as CourierCode)
    ? shippingMethods[code as CourierCode]
    : null;
}

export function getEnabledShippingMethods(codes: CourierCode[]) {
  return codes.map((code) => shippingMethods[code]);
}

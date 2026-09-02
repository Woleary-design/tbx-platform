export const courierCodes = ["courier-guy", "pudo"] as const;

export type CourierCode = (typeof courierCodes)[number];

export type ShippingMethod = {
  code: CourierCode;
  name: string;
  service: string;
  deliveryType: "door-to-door" | "point-to-point";
  priceZar: number;
  estimate: string;
  sellerHandoff: string;
  bookingNote: string;
};

export const shippingMethods: Record<CourierCode, ShippingMethod> = {
  "courier-guy": {
    code: "courier-guy",
    name: "The Courier Guy",
    service: "Courier delivery",
    deliveryType: "door-to-door",
    priceZar: 125,
    estimate: "Provisional allowance",
    sellerHandoff: "Drop at a supported point or await collection",
    bookingNote: "Provisional TBX allowance until live courier quoting is connected.",
  },
  pudo: {
    code: "pudo",
    name: "PUDO",
    service: "Locker or door delivery",
    deliveryType: "point-to-point",
    priceZar: 69,
    estimate: "Provisional allowance",
    sellerHandoff: "Drop at a supported PUDO locker or point",
    bookingNote: "Provisional TBX allowance until live courier quoting is connected.",
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

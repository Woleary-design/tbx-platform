export type SandboxDelivery = {
 quote_cents?: number | null; quote_size?: string | null;
 reservation_id: string; method: 'locker' | 'door'; destination: string; origin: string | null;
 parcel: { lengthCm: number; widthCm: number; heightCm: number; weightKg: number };
 status: 'selected' | 'booked' | 'in_transit' | 'awaiting_collection' | 'received';
 booking_reference: string | null; dropoff_deadline: string | null; collection_deadline: string | null; received_at: string | null;
};
export function deliveryStage(delivery: SandboxDelivery, now = Date.now()) {
 if (delivery.status === 'booked' && delivery.dropoff_deadline && Date.parse(delivery.dropoff_deadline) <= now) return 'Test booking expired';
 if (delivery.status === 'awaiting_collection' && delivery.collection_deadline && Date.parse(delivery.collection_deadline) <= now) return 'Collection overdue — admin review';
 return { selected:'Delivery selected', booked:'Ready for handover — test booking', in_transit:'Test parcel in transit', awaiting_collection:'Ready for locker collection — test', received:'Test parcel received' }[delivery.status];
}
export function lockerFits(parcel: SandboxDelivery['parcel']) {
 const sides = [parcel.lengthCm,parcel.widthCm,parcel.heightCm].sort((a,b)=>a-b);
 return Object.values(parcel).every(n=>Number.isFinite(n)&&n>0) && parcel.weightKg<=20 && sides[0]<=41 && sides[1]<=60 && sides[2]<=69;
}

// Agreed sample sandbox rates only; never used for live courier checkout.
export const sandboxLockerRates = [
 {size:'XS',dimensions:[60,17,8],weightKg:2,cents:4900},
 {size:'Small',dimensions:[60,41,8],weightKg:5,cents:5900},
 {size:'Medium',dimensions:[60,41,19],weightKg:10,cents:6900},
 {size:'Large',dimensions:[60,41,41],weightKg:15,cents:8900},
 {size:'XL',dimensions:[60,41,69],weightKg:20,cents:11900},
] as const;
export function sandboxLockerQuote(parcel: SandboxDelivery['parcel']) {
 if (!Object.values(parcel).every(n=>Number.isFinite(n)&&n>0)) return null;
 const sides=[parcel.lengthCm,parcel.widthCm,parcel.heightCm].sort((a,b)=>a-b);
 return sandboxLockerRates.find(rate=>{
  const limits=[...rate.dimensions].sort((a,b)=>a-b);
  return parcel.weightKg<=rate.weightKg && sides.every((side,index)=>side<=limits[index]);
 })??null;
}

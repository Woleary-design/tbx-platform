export type SandboxDelivery = {
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

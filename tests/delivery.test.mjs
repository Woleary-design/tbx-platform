import test from 'node:test';
import assert from 'node:assert/strict';
import { lockerFits, deliveryStage } from '../lib/shipping/delivery.ts';
test('locker checks allow rotations but reject oversize, overweight and invalid parcels',()=>{
 assert.equal(lockerFits({lengthCm:69,widthCm:41,heightCm:60,weightKg:20}),true);
 for(const parcel of [{lengthCm:70,widthCm:10,heightCm:10,weightKg:1},{lengthCm:60,widthCm:42,heightCm:69,weightKg:1},{lengthCm:10,widthCm:10,heightCm:10,weightKg:21},{lengthCm:0,widthCm:10,heightCm:10,weightKg:1}]) assert.equal(lockerFits(parcel),false);
});
test('booking expiry and collection expiry have different next steps',()=>{
 const d={status:'booked',dropoff_deadline:'2026-10-06T12:00:00Z'};
 assert.match(deliveryStage(d,Date.parse('2026-10-06T12:00:00Z')),/booking expired/);
 assert.match(deliveryStage({...d,status:'awaiting_collection',collection_deadline:d.dropoff_deadline},Date.parse(d.dropoff_deadline)),/admin review/);
 assert.match(deliveryStage({...d,status:'received'}),/received/);
});

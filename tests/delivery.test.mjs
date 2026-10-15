import test from 'node:test';
import assert from 'node:assert/strict';
import { lockerFits, deliveryStage, sandboxLockerQuote } from '../lib/shipping/delivery.ts';
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

test('sample locker quotes select the smallest fitting size using dimensions and weight',()=>{
 for (const [lengthCm,widthCm,heightCm,weightKg,size,cents] of [[60,17,8,2,'XS',4900],[60,41,8,5,'Small',5900],[30,20,10,1,'Medium',6900],[60,41,41,15,'Large',8900],[69,60,41,20,'XL',11900],[8,17,60,2,'XS',4900],[60,17,8,3,'Small',5900]]) {
  const quote=sandboxLockerQuote({lengthCm,widthCm,heightCm,weightKg});
  assert.equal(quote?.size,size);assert.equal(quote?.cents,cents);
 }
 for(const weightKg of [0,-1,21,NaN,Infinity])assert.equal(sandboxLockerQuote({lengthCm:30,widthCm:20,heightCm:10,weightKg}),null);
 assert.equal(sandboxLockerQuote({lengthCm:70,widthCm:10,heightCm:10,weightKg:1}),null);
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {hotWheelsCar,browseHotWheels,hotWheelsCatalogue,hotWheelsCopyError} from '../lib/atlas/hot-wheels.ts';
import {catalogueFields} from '../lib/atlas/collectible-catalogue.ts';
import pilot from '../lib/atlas/hot-wheels-pilot.json' with {type:'json'};
import {collectibleError} from '../lib/marketplace/categories.ts';
test('expanded catalogue preserves pilot identities and exact toy-number variants',()=>{
  assert.equal(hotWheelsCatalogue.records.length,3679);
  assert.equal(new Set(hotWheelsCatalogue.records.map(r=>r.id)).size,3679);
  for(const old of pilot.records){const car=hotWheelsCar(old.id);assert.ok(car);assert.equal(car.identifier,old.identifier);assert.equal(car.variant,old.variant);assert.ok(car.memberships.some(m=>m.series===old.series));}
  assert.deepEqual(hotWheelsCatalogue.audit.unresolvedIds,[]);
  assert.deepEqual(hotWheelsCatalogue.audit.conflictingIds,[]);
});
test('year and series browsing uses reference memberships and paginates unique identities',()=>{
  const browse=browseHotWheels({year:'2025',series:'Hot Wheels Mainline - HW J-Imports'});
  assert.equal(browse.total,10);assert.equal(browse.results.length,10);
  assert.ok(browse.results.some(r=>r.identifier==='JBC25'));
  const exact=browseHotWheels({q:'JBC25'});assert.equal(exact.total,1);
  const first=browseHotWheels({year:'2026'});const second=browseHotWheels({year:'2026',page:2});
  assert.equal(first.results.length,24);assert.equal(second.results.length,24);
  assert.ok(first.results.every(a=>!second.results.some(b=>b.id===a.id)));
  assert.equal(browseHotWheels({q:'no such toy xyzzzz'}).total,0);
  assert.equal(hotWheelsCar('../../secret'),null);
});
test('catalogue provenance is pinned and private/price/image fields are excluded',()=>{
  for(const car of hotWheelsCatalogue.records){assert.match(car.sourceRevision,/^[a-f0-9]{40}$/);assert.ok(car.sourceUrl.includes(car.sourceRevision));assert.ok(car.name&&car.variant);assert.equal('price' in car,false);assert.equal('image' in car,false);assert.equal('owner_id' in car,false);}
});
test('car collection details satisfy the existing seller requirements',()=>{
  const car=hotWheelsCar('aa253fce-c1de-4b2d-ba17-1de28ae097c2');
  for(const packaging of ['Sealed','Opened packaging','Loose']){
    const copy={packaging,condition:'Good',packagingCondition:'Fair'};
    assert.equal(hotWheelsCopyError(copy),null);
    assert.equal(collectibleError('Hot Wheels','Single cars',{...catalogueFields(car),'Sealed or loose':packaging,Condition:copy.condition,'Packaging condition':packaging==='Loose'?'Not applicable':copy.packagingCondition}),null);
  }
  assert.ok(hotWheelsCopyError({packaging:'fake',condition:'Good'}));
  assert.ok(hotWheelsCopyError({packaging:'Sealed',condition:'Good'}));
});

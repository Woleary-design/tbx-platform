import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pokemonMatch, catalogueFields } from '../lib/atlas/collectible-catalogue.ts';
test('Pokémon detail preserves exact printing, number and available finishes without price assertions', () => {
  const match = pokemonMatch({id:'pl4-1',name:'Charizard',localId:'1',set:{name:'Arceus',cardCount:{official:99}},variants:{normal:false,holo:true,reverse:true},pricing:{USD:999}});
  assert.deepEqual(catalogueFields(match), {Name:'Charizard',Set:'Arceus',Language:'English','Card number':'1/99'});
  assert.deepEqual(match.variants,['holo','reverse']);
  assert.equal('pricing' in match,false);
  assert.equal(pokemonMatch({id:'../../secret',name:'Card',localId:'1'}),null);
  const detailed = pokemonMatch({id:'pl4-1',name:'Charizard',localId:'1',variants_detailed:[{type:'reverse',size:'standard'},{type:'reverse',size:'standard',foil:'cracked-ice'}]});
  assert.deepEqual(detailed.variants,['reverse · standard','reverse · cracked-ice · standard']);
});
test('brief search results carry a stable ID until the detail is selected', () => {
  const match = pokemonMatch({id:'swsh3-136',name:'Furret',localId:'136'});
  assert.equal(match.series,'swsh3');
  assert.equal(match.sourceUrl,'https://api.tcgdex.net/v2/en/cards/swsh3-136');
  assert.equal(pokemonMatch({name:'Missing identity'}),null);
  assert.equal(pokemonMatch({id:'sm7.5-3',name:'Charizard',localId:'3'}).id,'sm7.5-3');
});
test('Hot Wheels pilot retains variants, provenance and ODbL export metadata', () => {
  const pilot = JSON.parse(readFileSync(new URL('../lib/atlas/hot-wheels-pilot.json',import.meta.url)));
  assert.equal(pilot.records.length,10);
  assert.equal(new Set(pilot.records.map(row=>row.id)).size,10);
  assert.equal(pilot.license,'ODbL-1.0');
  const skyline = pilot.records.filter(row=>row.name.includes('Skyline'));
  assert.equal(skyline.length,3);
  assert.equal(new Set(skyline.map(row=>row.identifier)).size,3);
  for(const row of pilot.records) {
    assert.ok(row.sourceRevision && row.recordSourceRevision && row.variant);
    assert.equal(catalogueFields(row).Year,'2025');
    assert.equal('price' in row,false);
  }
});

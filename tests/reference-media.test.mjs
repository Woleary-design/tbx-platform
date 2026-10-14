import {test} from 'node:test';import assert from 'node:assert/strict';
import {pokemonImage,pokemonReferences,parseUsdZar,convertedReference} from '../lib/atlas/reference-media.ts';
const now=Date.parse('2026-10-14T08:00:00Z');
const variant=(id,subtype='unlimited',price=100)=>({type:'holo',subtype,size:'standard',thirdParty:{tcgplayer:id},pricing:{tcgplayer:{unit:'USD',updated:'2026-10-13T08:00:00Z',holofoil:{productId:id,marketPrice:price}}}});
test('reference images only use the documented image host and never arbitrary URLs',()=>{
 assert.equal(pokemonImage('https://assets.tcgdex.net/en/base/base1/4'),'https://assets.tcgdex.net/en/base/base1/4/low.webp');assert.ok(pokemonImage('https://assets.tcgdex.net/en/base/base1/4','high').endsWith('/high.webp'));
 for(const value of ['http://assets.tcgdex.net/en/a','https://evil.test/en/a','https://assets.tcgdex.net.evil.test/en/a','https://user@assets.tcgdex.net/en/a','https://assets.tcgdex.net/en/a?redirect=1',null])assert.equal(pokemonImage(value),null);
});
test('overseas price references require an exact fresh product match, reject collisions and stale prices',()=>{
 assert.equal(pokemonReferences({variants_detailed:[variant(42)]},now)[0].amount,100);
 assert.equal(pokemonReferences({pricing:{tcgplayer:{marketPrice:100}}},now).length,0);
 assert.equal(pokemonReferences({variants_detailed:[variant(42),variant(42,'shadowless')]},now).length,0);
 const wrong=variant(42);wrong.pricing.tcgplayer.holofoil.productId=43;assert.equal(pokemonReferences({variants_detailed:[wrong]},now).length,0);
 const stale=variant(42);stale.pricing.tcgplayer.updated='2020-01-01';assert.equal(pokemonReferences({variants_detailed:[stale]},now).length,0);
 assert.equal(pokemonReferences({variants_detailed:[variant(42,'unlimited',0)]},now).length,0);
 assert.equal(pokemonReferences({variants_detailed:[variant(42),variant(42)]},now).length,1);
});
test('rand conversion uses only a valid dated USD/ZAR rate with no fallback guess',()=>{
 const rate=parseUsdZar({base:'USD',quote:'ZAR',rate:17.5,date:'2026-10-13'},now);assert.equal(convertedReference(100,rate),1750);assert.equal(convertedReference(100,null),null);
 for(const value of [{base:'EUR',quote:'ZAR',rate:20,date:'2026-10-13'},{base:'USD',quote:'ZAR',rate:17,date:'2020-01-01'},{base:'USD',quote:'ZAR',rate:17,date:'2027-01-01'}])assert.equal(parseUsdZar(value,now),null);
});

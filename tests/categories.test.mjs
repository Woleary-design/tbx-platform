import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectibleError, listingCategory } from '../lib/marketplace/categories.ts';
test('existing listings default to LEGO; new categories keep their identity', () => {
  assert.equal(listingCategory(undefined), 'LEGO');
  assert.equal(listingCategory('Pokémon'), 'Pokémon');
  assert.equal(listingCategory('Hot Wheels'), 'Hot Wheels');
  assert.equal(listingCategory('untrusted'), 'LEGO');
});
test('graded Pokémon cards require card identity and certification', () => {
  const details = { Name: 'Pikachu', Set: 'Base', Language: 'English', Condition: 'Near mint', 'Card number': '58/102' };
  assert.match(collectibleError('Pokémon', 'Graded cards', details), /grading company/);
  assert.equal(collectibleError('Pokémon', 'Graded cards', {...details, 'Grading company':'PSA', Grade:'9', 'Certification number':'12345'}), null);
  assert.equal(collectibleError('Pokémon', 'Sealed packs and boxes', {Name:'Booster box',Set:'Base',Language:'English',Condition:'Factory sealed'}), null);
  assert.match(collectibleError('Pokémon', 'Single cars', details), /listing type/);
});
test('Hot Wheels requires model, year and packaging disclosures', () => {
  const details = { Model:'Porsche 911',Series:'Premium',Year:'2026',Condition:'Excellent','Sealed or loose':'Loose','Packaging condition':'No packaging' };
  assert.equal(collectibleError('Hot Wheels','Premium cars',details), null);
  assert.match(collectibleError('Hot Wheels','Premium cars',{...details,Year:'26'}), /four-digit/);
  assert.match(collectibleError('Hot Wheels','Premium cars',{...details,'Packaging condition':''}), /packaging condition/);
});

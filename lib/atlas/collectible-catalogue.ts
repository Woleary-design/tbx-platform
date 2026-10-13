export type CatalogueMatch = {
  id: string; name: string; identifier: string; series: string; language: string;
  year?: string; variant?: string; variants?: string[];
  source: 'TCGdex' | 'collectdb'; sourceUrl: string; license: string;
};
export function pokemonMatch(value: unknown): CatalogueMatch | null {
  if (!value || typeof value !== 'object') return null;
  const card = value as Record<string, unknown>;
  if (typeof card.id !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9.-]{0,79}$/.test(card.id) || typeof card.name !== 'string' || typeof card.localId !== 'string') return null;
  const set = card.set && typeof card.set === 'object' ? card.set as Record<string,unknown> : {};
  const count = set.cardCount && typeof set.cardCount === 'object' ? set.cardCount as Record<string,unknown> : {};
  const variants = card.variants && typeof card.variants === 'object' ? card.variants as Record<string,unknown> : {};
  const detailed = Array.isArray(card.variants_detailed) ? card.variants_detailed.flatMap(value => {
    if (!value || typeof value !== 'object') return [];
    const variant = value as Record<string,unknown>;
    if (typeof variant.type !== 'string') return [];
    return [[variant.type, variant.foil, variant.size].filter(value => typeof value === 'string').join(' · ')];
  }) : [];
  return {
    id: card.id, name: card.name.slice(0,120), identifier: card.localId + (typeof count.official === 'number' ? `/${count.official}` : ''),
    series: typeof set.name === 'string' ? set.name : card.id.slice(0,card.id.lastIndexOf('-')),
    language: 'English', variants: detailed.length ? [...new Set(detailed)] : Object.entries(variants).filter(([,available]) => available === true).map(([name]) => name),
    source: 'TCGdex', sourceUrl: `https://api.tcgdex.net/v2/en/cards/${card.id}`, license: 'MIT (database)',
  };
}
export function catalogueFields(match: CatalogueMatch): Record<string,string> {
  return match.source === 'TCGdex'
    ? {Name:match.name,Set:match.series,Language:match.language,'Card number':match.identifier}
    : {Model:match.name,Series:match.series,Year:match.year || '', 'Toy number':match.identifier,Variant:match.variant || ''};
}

import {pokemonImage,pokemonReferences,parseUsdZar} from './reference-media';
import { pokemonMatch } from './collectible-catalogue';
export type PokemonSet = { id: string; name: string; count: number; releaseDate?: string; series?: string };
export function catalogueId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9.-]{0,79}$/.test(value);
}
export function pokemonSet(value: unknown): PokemonSet | null {
  if (!value || typeof value !== 'object') return null;
  const set = value as Record<string, unknown>;
  if (!catalogueId(set.id) || typeof set.name !== 'string') return null;
  const count = set.cardCount as { total?: unknown } | undefined;
  const series = set.serie as { name?: unknown } | undefined;
  return { id: set.id, name: set.name.slice(0,120), count: typeof count?.total === 'number' ? count.total : 0,
    releaseDate: typeof set.releaseDate === 'string' ? set.releaseDate : undefined,
    series: typeof series?.name === 'string' ? series.name : undefined };
}
export async function pokemonFetch(path: string): Promise<unknown> {
  const response = await fetch(`https://api.tcgdex.net/v2/en/${path}`, {next:{revalidate:86400},signal:AbortSignal.timeout(12000)});
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('The Pokémon catalogue is temporarily unavailable. Please try again.');
  return response.json();
}
export async function pokemonCard(id: string) {
  if (!catalogueId(id)) return null;
  const data = await pokemonFetch(`cards/${encodeURIComponent(id)}`);
  const match = pokemonMatch(data);
  if (!match) return null;
  const card = data as Record<string,unknown>;
  const set = card.set as {id?:string} | undefined;
  return { ...match, imageUrl:pokemonImage(card.image,'high'),priceReferences:pokemonReferences(card), setId: catalogueId(set?.id) ? set.id : undefined,
    rarity: typeof card.rarity === 'string' ? card.rarity : 'Not recorded',
    illustrator: typeof card.illustrator === 'string' ? card.illustrator : 'Not recorded',
    hp: typeof card.hp === 'number' ? String(card.hp) : '—',
    types: Array.isArray(card.types) ? card.types.filter((v): v is string=>typeof v==='string') : [] };
}

export async function usdZarRate() {
  try {const response=await fetch('https://api.frankfurter.dev/v2/rate/usd/zar',{next:{revalidate:86400},signal:AbortSignal.timeout(8000)});return response.ok?parseUsdZar(await response.json()):null;}catch{return null;}
}

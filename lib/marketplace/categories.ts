export const categories = ['LEGO', 'Pokémon', 'Hot Wheels'] as const;
export type Category = typeof categories[number];
export const subcategories = {
  'LEGO': ['Sets', 'Minifigures', 'Loose bricks'],
  'Pokémon': ['Individual cards', 'Sealed packs and boxes', 'Graded cards', 'Bundles'],
  'Hot Wheels': ['Single cars', 'Multipacks', 'Premium cars', 'Treasure Hunts', 'Tracks and playsets'],
} as const;
export function listingCategory(value: unknown): Category {
  return value === 'Pokémon' || value === 'Hot Wheels' ? value : 'LEGO';
}
export type CollectibleDetails = Record<string, string>;
export function collectibleError(category: Category, type: string, details: CollectibleDetails): string | null {
  if (category === 'LEGO') return null;
  if (!(subcategories[category] as readonly string[]).includes(type)) return 'Choose a listing type.';
  const required = category === 'Pokémon'
    ? ['Name', 'Set', 'Language', 'Condition', ...(type === 'Individual cards' || type === 'Graded cards' ? ['Card number'] : []), ...(type === 'Graded cards' ? ['Grading company', 'Grade', 'Certification number'] : [])]
    : ['Model', 'Series', 'Year', 'Sealed or loose', 'Packaging condition', 'Condition'];
  for (const key of required) if (!details[key]?.trim()) return `Enter ${key.toLowerCase()}.`;
  if (category === 'Hot Wheels' && !/^\d{4}$/.test(details.Year)) return 'Enter a four-digit model/series year.';
  return null;
}

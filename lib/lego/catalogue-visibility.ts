export type CatalogueVisibilityRecord = {
  name: string;
  theme: string | null;
  subtheme?: string | null;
  piece_count?: number | null;
  image_url?: string | null;
  atlas_visibility?: string | null;
};

const EXCLUDED_THEMES = new Set(["books", "gear", "storage"]);
const EXCLUDED_NAME_PATTERNS = [
  /\b(usb power adapter|power adapter type|store display|retail display|sticker sheet|pencil case|backpack|rucksack|wallet|key chain|keychain|luggage tag|storage box|watch|clock|magnet set|notebook|journal|sticker book|activity book|colouring book|coloring book|calendar|poster|shirt|t-shirt|hoodie|cap|hat|costume|mask|plush|cushion|duvet|bedding|lunch box|lunchbox|water bottle|mug|cup|plate|bowl|cutlery|umbrella)\b/i,
];

export function isCollectorCatalogueRecord(record: CatalogueVisibilityRecord) {
  if (record.atlas_visibility && record.atlas_visibility !== "public") return false;
  const theme = (record.theme ?? "").trim().toLowerCase();
  if (EXCLUDED_THEMES.has(theme)) return false;
  if (record.piece_count !== null && record.piece_count !== undefined && record.piece_count <= 0) return false;
  if (EXCLUDED_NAME_PATTERNS.some((pattern) => pattern.test(record.name))) return false;
  return true;
}

export function normalizeCatalogueTheme(theme: string | null) {
  if (!theme) return null;
  if (theme.trim().toLowerCase() === "ninjago") return "NINJAGO";
  return theme.trim();
}

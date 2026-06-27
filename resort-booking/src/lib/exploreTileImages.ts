import type { ExploreTile } from '../types/site';

/** Reliable explore-tile backgrounds (Unsplash, hotlink-safe). */
export const EXPLORE_TILE_IMAGES: Record<string, string> = {
  '/villas':
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop&auto=format&q=80',
  '/for-sale':
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop&auto=format&q=80',
  '/facilities':
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&auto=format&q=80',
  '/contact':
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop&auto=format&q=80',
};

/** Legacy seed URLs that often fail to load in the browser. */
const STALE_EXPLORE_PHOTO_IDS = [
  'photo-1520250497591',
  'photo-1564013799919',
  'photo-1544551763',
  'photo-1600585154340',
];

/** Tiles that always use the canonical image above (ignores stale CMS URLs). */
const CANONICAL_EXPLORE_PATHS = new Set(['/for-sale', '/facilities']);

export function resolveExploreTileImage(tile: ExploreTile): string {
  if (CANONICAL_EXPLORE_PATHS.has(tile.path)) {
    return EXPLORE_TILE_IMAGES[tile.path] ?? '';
  }
  const fallback = EXPLORE_TILE_IMAGES[tile.path] ?? '';
  const trimmed = tile.image?.trim() ?? '';
  if (!trimmed) return fallback;
  if (STALE_EXPLORE_PHOTO_IDS.some((id) => trimmed.includes(id))) return fallback;
  return trimmed;
}

export function normalizeExploreTiles(tiles: ExploreTile[]): ExploreTile[] {
  return tiles.map((tile) => ({
    ...tile,
    image: resolveExploreTileImage(tile),
  }));
}

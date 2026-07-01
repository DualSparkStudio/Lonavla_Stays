/** Display label such as "4 BHK" from room type text. */
export function formatBhkLabel(roomType: string): string | null {
  const match = roomType.match(/(\d+(?:[½\u00BD]|\.5)?)\s*BHK/i);
  if (!match) return null;
  const num = match[1].replace('½', '.5').replace('\u00BD', '.5');
  return `${num} BHK`;
}

/** Parse bedroom count from room type labels like "4 BHK Private Pool Villa". */
export function parseBedroomsFromRoomType(roomType: string): number | null {
  const match = roomType.match(/(\d+(?:[½\u00BD])?)\s*BHK/i);
  if (!match) return null;
  const raw = match[1].replace('½', '.5').replace('\u00BD', '.5');
  const value = Number(raw);
  return Number.isFinite(value) ? Math.ceil(value) : null;
}

/** Estimate bathrooms from amenity labels. */
export function parseBathroomsFromAmenities(amenities: string[]): number | null {
  let total = 0;
  for (const amenity of amenities) {
    const attached = amenity.match(/(\d+)\s+Attached\s+Bathrooms?/i);
    const common = amenity.match(/(\d+)\s+Common\s+Bathrooms?/i);
    if (attached) total += Number(attached[1]);
    if (common) total += Number(common[1]);
    if (/private bathroom/i.test(amenity)) total += 1;
  }
  return total > 0 ? total : null;
}

export function hasPrivatePool(amenities: string[]): boolean {
  return amenities.some((a) => /private\s+(swimming\s+)?pool/i.test(a));
}

/** Approximate star-rating distribution bars from the average rating. */
export function ratingDistribution(rating: number, reviewCount: number): { stars: number; percent: number }[] {
  const clamped = Math.min(5, Math.max(1, rating));
  const weights = [5, 4, 3, 2, 1].map((stars) => {
    const distance = Math.abs(stars - clamped);
    return Math.max(0.05, 1.4 - distance * 0.45);
  });
  const sum = weights.reduce((a, b) => a + b, 0);
  return [5, 4, 3, 2, 1].map((stars, index) => ({
    stars,
    percent: reviewCount > 0 ? Math.round((weights[index] / sum) * 100) : 0,
  }));
}

export function truncateText(text: string, maxLength: number): { preview: string; isTruncated: boolean } {
  if (text.length <= maxLength) return { preview: text, isTruncated: false };
  const cut = text.slice(0, maxLength).replace(/\s+\S*$/, '');
  return { preview: `${cut}…`, isTruncated: true };
}

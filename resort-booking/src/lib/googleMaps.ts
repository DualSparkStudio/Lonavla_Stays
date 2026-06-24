export function buildGoogleMapsSearchUrl(query: string): string {
  const q = query.trim();
  if (!q) return '';
  // Simple maps?q= format — works in browsers/apps and avoids embed API errors in email links.
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}`;
}

/** Small map preview iframe when admin has not pasted an embed code. */
export function buildGoogleMapsEmbedPreviewUrl(query: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query.trim())}&output=embed&hl=en&z=15`;
}

function isGoogleMapsLink(value: string): boolean {
  return /google\.(com|[a-z]{2,3})\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/i.test(value);
}

/** Embed URLs open only inside iframes — never use them as href targets. */
function isGoogleMapsEmbedUrl(value: string): boolean {
  return /\/maps\/embed\b|[?&]output=embed\b/i.test(value);
}

function isOpenableMapsLink(value: string): boolean {
  if (!value || isGoogleMapsEmbedUrl(value)) return false;
  if (/^https?:\/\/(www\.)?google\.[a-z.]+\/maps\?pb=/i.test(value)) return false;
  return isGoogleMapsLink(value);
}

/** URL guests can open in a browser tab (search, place, or share link). */
export function resolveGoogleMapsOpenUrl(
  mapEmbedUrl: string | undefined,
  address: string,
  location: string,
  mapsLink?: string,
): string | null {
  const saved = mapsLink?.trim();
  if (saved && isOpenableMapsLink(saved)) {
    return saved;
  }

  const query = [address, location].filter(Boolean).join(', ');
  if (query) {
    return buildGoogleMapsSearchUrl(query);
  }

  const parsed = parseMapEmbedInput(mapEmbedUrl);
  if (parsed.mapsUrl && isOpenableMapsLink(parsed.mapsUrl)) {
    return parsed.mapsUrl;
  }

  return null;
}

/** Accept embed iframe code, embed URL, or Google Maps share link from admin. */
export function parseMapEmbedInput(raw?: string): {
  embedUrl: string | null;
  mapsUrl: string | null;
} {
  const input = raw?.trim() ?? '';
  if (!input) return { embedUrl: null, mapsUrl: null };

  const iframeMatch = input.match(/src=["']([^"']+)["']/i);
  if (iframeMatch?.[1]) {
    const src = iframeMatch[1];
    const isEmbed = isGoogleMapsEmbedUrl(src);
    return {
      embedUrl: isEmbed ? src : null,
      mapsUrl: isGoogleMapsLink(src) && !isEmbed ? src : null,
    };
  }

  if (isGoogleMapsEmbedUrl(input)) {
    return { embedUrl: input, mapsUrl: null };
  }

  if (isGoogleMapsLink(input) && !isGoogleMapsEmbedUrl(input)) {
    return {
      embedUrl: buildGoogleMapsEmbedPreviewUrl(input),
      mapsUrl: isOpenableMapsLink(input) ? input : null,
    };
  }

  return { embedUrl: null, mapsUrl: null };
}

export function resolveMapsDisplay(
  mapEmbedUrl: string | undefined,
  address: string,
  location: string,
  mapsLink?: string,
): { embedUrl: string | null; mapsUrl: string | null; hasMap: boolean } {
  const parsed = parseMapEmbedInput(mapEmbedUrl);
  const query = [address, location].filter(Boolean).join(', ');
  const mapsUrl = resolveGoogleMapsOpenUrl(mapEmbedUrl, address, location, mapsLink);
  const embedUrl =
    parsed.embedUrl || (query ? buildGoogleMapsEmbedPreviewUrl(query) : null);

  return {
    embedUrl,
    mapsUrl,
    hasMap: Boolean(embedUrl || mapsUrl),
  };
}

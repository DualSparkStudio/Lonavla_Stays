const DRIVE_FILE_ID_PATTERNS = [
  /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i,
  /[?&]id=([a-zA-Z0-9_-]+)/i,
];

function extractDriveFileId(url: string): string | null {
  for (const pattern of DRIVE_FILE_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

/** Converts common share links into image-renderable URLs. */
export function normalizeImageUrl(url?: string): string {
  const raw = (url || '').trim();
  if (!raw) return '';

  if (/drive\.google\.com|docs\.google\.com|drive\.usercontent\.google\.com/i.test(raw)) {
    const fileId = extractDriveFileId(raw);
    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
    }
  }

  return raw;
}

export function getPrimaryImage(urls?: string[], fallback = 'https://via.placeholder.com/800x600?text=Image'): string {
  if (!urls?.length) return fallback;
  return normalizeImageUrl(urls[0]) || fallback;
}

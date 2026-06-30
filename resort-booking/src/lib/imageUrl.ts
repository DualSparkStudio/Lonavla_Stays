const DRIVE_FILE_ID_PATTERNS = [
  /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i,
  /drive\.google\.com\/open\?[^#]*\bid=([a-zA-Z0-9_-]+)/i,
  /[?&]id=([a-zA-Z0-9_-]+)/i,
];

function extractDriveFileId(url: string): string | null {
  for (const pattern of DRIVE_FILE_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function driveEmbedUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

function driveThumbnailUrl(fileId: string, width = 240): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${width}`;
}

/** Small preview URL for gallery thumbnails (Google Drive uses the thumbnail API). */
export function galleryThumbnailUrl(url?: string, width = 240): string {
  const raw = (url || '').trim();
  if (!raw) return '';

  const fileId = extractDriveFileId(raw);
  if (fileId) {
    return driveThumbnailUrl(fileId, width);
  }

  return normalizeImageUrl(raw);
}

/** Converts common share links into image-renderable URLs. */
export function normalizeImageUrl(url?: string): string {
  const raw = (url || '').trim();
  if (!raw) return '';

  if (/drive\.google\.com|docs\.google\.com|drive\.usercontent\.google\.com/i.test(raw)) {
    const fileId = extractDriveFileId(raw);
    if (fileId) {
      return driveEmbedUrl(fileId);
    }
  }

  // Cloudinary: use optimized delivery when a transform URL is not already present
  if (/res\.cloudinary\.com/i.test(raw) && !/\/upload\/[^/]+\//.test(raw)) {
    return raw.replace('/upload/', '/upload/f_auto,q_auto/');
  }

  return raw;
}

export function normalizeImageUrls(urls?: string[]): string[] {
  if (!urls?.length) return [];
  return urls.map(normalizeImageUrl).filter(Boolean);
}

export function getPrimaryImage(urls?: string[], fallback = 'https://via.placeholder.com/800x600?text=Image'): string {
  const normalized = normalizeImageUrls(urls);
  return normalized[0] || fallback;
}

/** Alternate Google Drive URLs when the primary embed fails to load. */
export function driveImageFallbackUrls(url?: string): string[] {
  const raw = (url || '').trim();
  const fileId = extractDriveFileId(raw);
  if (!fileId) return [];
  return [
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w1920`,
    `https://lh3.googleusercontent.com/d/${fileId}=w1920`,
  ];
}

/** @deprecated use driveImageFallbackUrls */
export function driveImageFallbackUrl(url?: string): string | undefined {
  return driveImageFallbackUrls(url)[0];
}

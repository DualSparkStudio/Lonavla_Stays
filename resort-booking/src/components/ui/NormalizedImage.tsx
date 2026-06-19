import React from 'react';
import { driveImageFallbackUrl, getPrimaryImage, normalizeImageUrl } from '../../lib/imageUrl';

type NormalizedImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  /** Single image URL (share link or direct URL). */
  src?: string;
  /** Image URL list — first valid entry is used when `src` is omitted. */
  urls?: string[];
  fallback?: string;
};

/**
 * Renders external images (Google Drive, Cloudinary, etc.) with URL normalization
 * and a Drive thumbnail fallback when the primary embed URL fails.
 */
const NormalizedImage: React.FC<NormalizedImageProps> = ({
  src,
  urls,
  fallback = 'https://via.placeholder.com/800x600?text=Image',
  onError,
  ...props
}) => {
  const original = (src || urls?.find((u) => u.trim()) || '').trim();
  const displaySrc = src ? normalizeImageUrl(src) || fallback : getPrimaryImage(urls, fallback);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const alternate = driveImageFallbackUrl(original);
    if (alternate && img.src !== alternate) {
      img.src = alternate;
      return;
    }
    onError?.(e);
  };

  return (
    <img
      {...props}
      src={displaySrc || fallback}
      referrerPolicy="no-referrer"
      onError={handleError}
    />
  );
};

export default NormalizedImage;

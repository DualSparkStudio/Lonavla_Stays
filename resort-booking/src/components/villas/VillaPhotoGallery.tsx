import React, { useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, Squares2X2Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { driveImageFallbackUrls, galleryThumbnailUrl, normalizeImageUrl } from '../../lib/imageUrl';
import { cn } from '../../utils/cn';

type VillaPhotoGalleryProps = {
  images: string[];
  originals: string[];
  alt: string;
};

const VillaPhotoGallery: React.FC<VillaPhotoGalleryProps> = ({ images, originals, alt }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const displayImages = images.length > 0 ? images : ['https://via.placeholder.com/1200x800?text=Villa'];
  const slots = Array.from({ length: 5 }, (_, i) => displayImages[i] ?? displayImages[displayImages.length - 1]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, originalUrl: string) => {
    const img = e.currentTarget;
    const fallbacks = driveImageFallbackUrls(originalUrl);
    const current = img.src;
    const next = fallbacks.find((url) => url !== current);
    if (next) {
      img.src = next;
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const lightboxSrc = normalizeImageUrl(originals[lightboxIndex] || displayImages[lightboxIndex] || '');

  useEffect(() => {
    if (!lightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxOpen]);

  const goPrev = () => {
    setLightboxIndex((i) => (i - 1 + displayImages.length) % displayImages.length);
  };

  const goNext = () => {
    setLightboxIndex((i) => (i + 1) % displayImages.length);
  };

  return (
    <>
      <div className="relative hidden md:grid md:grid-cols-4 md:grid-rows-2 gap-2 h-[22rem] lg:h-[28rem] rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="col-span-2 row-span-2 relative overflow-hidden group"
        >
          <img
            src={slots[0]}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={(e) => handleImageError(e, originals[0] || '')}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <span className="absolute top-4 left-4 rounded-md bg-white/95 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-gray-900 shadow">
            Superhost
          </span>
        </button>
        {slots.slice(1, 5).map((img, idx) => (
          <button
            key={`gallery-${idx + 1}`}
            type="button"
            onClick={() => openLightbox(idx + 1)}
            className="relative overflow-hidden group"
          >
            <img
              src={img}
              alt=""
              referrerPolicy="no-referrer"
              onError={(e) => handleImageError(e, originals[idx + 1] || originals[0] || '')}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </button>
        ))}
        {displayImages.length > 1 && (
          <button
            type="button"
            onClick={() => openLightbox(0)}
            className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg border border-gray-900 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow hover:bg-gray-50"
          >
            <Squares2X2Icon className="h-4 w-4" />
            Show all photos
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => openLightbox(0)}
        className="md:hidden relative w-full h-64 rounded-2xl overflow-hidden"
      >
        <img
          src={displayImages[0]}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={(e) => handleImageError(e, originals[0] || '')}
          className="h-full w-full object-cover"
        />
        <span className="absolute top-3 left-3 rounded-md bg-white/95 px-2 py-0.5 text-xs font-bold uppercase text-gray-900">
          Superhost
        </span>
        {displayImages.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold shadow">
            1 / {displayImages.length}
          </span>
        )}
      </button>

      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 text-white shrink-0">
            <span className="text-sm font-medium">
              {lightboxIndex + 1} / {displayImages.length}
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="rounded-full p-2 hover:bg-white/10"
              aria-label="Close gallery"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="relative flex-1 min-h-0 flex items-center justify-center px-12 sm:px-16">
            {displayImages.length > 1 && (
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 sm:left-4 z-10 rounded-full bg-white/90 p-2 text-gray-900 shadow hover:bg-white"
                aria-label="Previous photo"
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </button>
            )}

            <img
              src={lightboxSrc}
              alt={alt}
              referrerPolicy="no-referrer"
              onError={(e) => handleImageError(e, originals[lightboxIndex] || '')}
              className="block max-h-[72dvh] max-w-[min(90vw,960px)] w-auto h-auto object-contain rounded-sm"
            />

            {displayImages.length > 1 && (
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 sm:right-4 z-10 rounded-full bg-white/90 p-2 text-gray-900 shadow hover:bg-white"
                aria-label="Next photo"
              >
                <ChevronRightIcon className="h-6 w-6" />
              </button>
            )}
          </div>

          {displayImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto px-4 py-4 shrink-0">
              {displayImages.map((img, idx) => {
                const original = originals[idx] || img;
                const thumbSrc = galleryThumbnailUrl(original, 240) || img;
                return (
                <button
                  key={`thumb-${idx}`}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className={cn(
                    'shrink-0 h-16 w-24 rounded-lg overflow-hidden border-2 bg-gray-800',
                    idx === lightboxIndex ? 'border-white opacity-100' : 'border-transparent opacity-60 hover:opacity-90',
                  )}
                >
                  <img
                    src={thumbSrc}
                    alt=""
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={(e) => handleImageError(e, original)}
                    className="h-full w-full object-cover"
                  />
                </button>
              );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default VillaPhotoGallery;

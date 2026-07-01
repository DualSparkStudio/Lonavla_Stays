import React, { useMemo } from 'react';
import { HomeModernIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import type { Room } from '../../data/resort';
import { formatPrice } from '../../data/resort';
import type { VillaCardPriceDisplay } from '../../lib/bookingPricing';
import {
  formatBhkLabel,
  parseBathroomsFromAmenities,
  parseBedroomsFromRoomType,
} from '../../lib/villaDetailHelpers';
import NormalizedImage from '../ui/NormalizedImage';

type VillaListingCardProps = {
  room: Room;
  priceDisplay: VillaCardPriceDisplay;
  onClick: () => void;
  showPopular?: boolean;
  imageLoading?: 'eager' | 'lazy';
};

function BedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12V7a2 2 0 012-2h2m10 0h2a2 2 0 012 2v5M3 12h18M5 12v5h14v-5M7 7v3m10-3v3" />
    </svg>
  );
}

function BathIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 14h16v2a3 3 0 01-3 3H7a3 3 0 01-3-3v-2zm0 0V9a2 2 0 012-2h1m11 3V7a2 2 0 00-2-2h-1M8 7h8" />
    </svg>
  );
}

function resolveCardPrice(display: VillaCardPriceDisplay): number {
  if (display.kind === 'single') return display.amount;
  return Math.min(display.weekdayAmount, display.weekendAmount);
}

const VillaListingCard: React.FC<VillaListingCardProps> = ({
  room,
  priceDisplay,
  onClick,
  showPopular = false,
  imageLoading = 'lazy',
}) => {
  const bhkLabel = useMemo(() => formatBhkLabel(room.room_type), [room.room_type]);
  const bedrooms = useMemo(() => parseBedroomsFromRoomType(room.room_type), [room.room_type]);
  const bathrooms = useMemo(() => parseBathroomsFromAmenities(room.amenities), [room.amenities]);
  const beds = bedrooms ?? Math.max(1, Math.ceil(room.max_guests / 3));
  const baths = bathrooms ?? bedrooms ?? Math.max(1, Math.ceil(room.max_guests / 4));
  const nightlyPrice = resolveCardPrice(priceDisplay);

  return (
    <article
      className="villa-listing-card group w-[272px] sm:w-[300px] shrink-0 cursor-pointer"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-card transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-card-hover">
        <div className="relative aspect-[4/3] overflow-hidden">
          <NormalizedImage
            urls={room.images}
            fallback="https://via.placeholder.com/800x600?text=Villa"
            alt={room.name}
            loading={imageLoading}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {showPopular && (
            <span className="absolute top-3 left-3 rounded-full bg-airbnb-red px-3 py-1 text-xs font-semibold text-white shadow-sm">
              Popular
            </span>
          )}
        </div>

        <div className="p-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <h3 className="font-heading text-base text-airbnb-red uppercase tracking-wide leading-snug line-clamp-1">{room.name}</h3>
            {bhkLabel && (
              <span className="inline-flex shrink-0 items-center gap-1 font-ui text-sm text-gray-600">
                <HomeModernIcon className="h-4 w-4" />
                {bhkLabel}
              </span>
            )}
          </div>

          <div className="mb-4 flex items-center gap-4 font-ui text-sm text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <UserGroupIcon className="h-4 w-4" />
              {room.max_guests} Guests
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BedIcon className="h-4 w-4" />
              {beds} Beds
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BathIcon className="h-4 w-4" />
              {baths} Baths
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="font-ui leading-none">
              <span className="text-lg font-bold text-airbnb-red">{formatPrice(nightlyPrice)}</span>
              <span className="text-sm font-normal text-gray-500"> / night</span>
            </p>
            {room.review_count > 0 && (
              <p className="inline-flex items-center gap-1 font-ui text-sm text-gray-900 shrink-0">
                <StarIcon className="h-4 w-4 text-airbnb-red" />
                <span className="font-semibold">{room.rating.toFixed(1)}</span>
                <span className="text-gray-500">({room.review_count})</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default VillaListingCard;

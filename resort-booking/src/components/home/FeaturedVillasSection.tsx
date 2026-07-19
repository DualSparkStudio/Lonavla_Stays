import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import AnimatedSection from '../ui/AnimatedSection';
import VillaListingCard from '../villas/VillaListingCard';
import { getVillaCardPriceDisplay, getBrowseRateMode } from '../../lib/bookingPricing';
import type { Room } from '../../data/resort';
import type { SiteSettings } from '../../types/site';

type FeaturedVillasSectionProps = {
  rooms: Room[];
  settings: SiteSettings;
};

const FeaturedVillasSection: React.FC<FeaturedVillasSectionProps> = ({ rooms, settings }) => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const browseRateMode = useMemo(
    () => getBrowseRateMode(settings.pricingHolidays),
    [settings.pricingHolidays],
  );

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(maxScrollLeft - el.scrollLeft > 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();

    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [rooms.length, updateScrollState]);

  const scrollPrev = () => {
    scrollRef.current?.scrollBy({ left: -320, behavior: 'smooth' });
  };

  const scrollNext = () => {
    scrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' });
  };

  if (rooms.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-heading text-4xl font-normal tracking-wide mb-2">Featured villas</h2>
            <p className="section-lead text-2xl max-w-2xl">
              Explore our collection of private pool villas in Lonavala. Compare amenities, locations, photos, and rates to find the perfect stay.
            </p>
          </div>
          <Link
            to="/villas"
            className="inline-flex shrink-0 items-center gap-1 font-ui text-sm sm:text-base font-semibold text-airbnb-red hover:text-airbnb-red-dark transition-colors sm:pt-2"
          >
            View all villas
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </AnimatedSection>

      <div className="relative">
        <div
          ref={scrollRef}
          className="villa-carousel flex gap-5 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory"
        >
          {rooms.map((room, index) => (
            <div key={room.id} className="snap-start">
              <VillaListingCard
                room={room}
                priceDisplay={getVillaCardPriceDisplay(
                  room.price_per_night,
                  room.weekend_price_per_night,
                  browseRateMode,
                )}
                onClick={() => navigate(`/villas/${room.id}`)}
                showPopular={index === 0}
                imageLoading={index < 2 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>

        {canScrollLeft && (
          <button
            type="button"
            aria-label="Scroll to previous villas"
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 -translate-x-1/2 items-center justify-center rounded-full border border-gray-200 bg-white p-3 text-gray-900 shadow-floating transition hover:shadow-card-hover sm:flex"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
        )}

        {canScrollRight && (
          <button
            type="button"
            aria-label="Scroll to next villas"
            onClick={scrollNext}
            className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-gray-200 bg-white p-3 text-gray-900 shadow-floating transition hover:shadow-card-hover sm:flex"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default FeaturedVillasSection;

import React from 'react';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import Button from '../ui/Button';
import VillaCardPrice from './VillaCardPrice';
import { BOOKING_ADVANCE_PAYMENT_PERCENT, calcAmountDueNow, type VillaCardPriceDisplay } from '../../lib/bookingPricing';
import { formatPrice } from '../../data/resort';

type VillaDetailMobileBarProps = {
  priceDisplay: VillaCardPriceDisplay;
  rating: number;
  total: number;
  canBook: boolean;
  onBook: () => void;
  onContact: () => void;
};

const VillaDetailMobileBar: React.FC<VillaDetailMobileBarProps> = ({
  priceDisplay,
  rating,
  total,
  canBook,
  onBook,
  onContact,
}) => {
  const advance = canBook ? calcAmountDueNow(total) : 0;

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        <div className="min-w-0">
          <div className="flex items-baseline gap-1">
            <VillaCardPrice display={priceDisplay} compact />
          </div>
          <p className="flex items-center gap-1 text-xs text-gray-600">
            <StarSolid className="h-3.5 w-3.5" />
            {rating}
            {canBook && (
              <span className="ml-1">
                · {BOOKING_ADVANCE_PAYMENT_PERCENT}% advance ({formatPrice(advance)})
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" className="rounded-lg !px-3" onClick={onContact}>
            Message
          </Button>
          <Button
            size="sm"
            className="rounded-lg !bg-airbnb-red !px-4"
            disabled={!canBook}
            onClick={onBook}
          >
            Book now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VillaDetailMobileBar;

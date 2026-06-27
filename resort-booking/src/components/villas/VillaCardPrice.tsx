import React from 'react';
import { formatPrice } from '../../data/resort';
import type { VillaCardPriceDisplay } from '../../lib/bookingPricing';
import { cn } from '../../utils/cn';

type VillaCardPriceProps = {
  display: VillaCardPriceDisplay;
  className?: string;
  compact?: boolean;
};

const VillaCardPrice: React.FC<VillaCardPriceProps> = ({ display, className, compact = false }) => {
  if (display.kind === 'single') {
    return (
      <div className={className}>
        <span className="villa-card-price">{formatPrice(display.amount)}</span>
        <span className="villa-card-suffix"> / night</span>
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      <p className={cn(compact ? 'text-base' : 'text-lg', 'leading-snug')}>
        <span className="villa-card-price">{formatPrice(display.weekdayAmount)}</span>
        <span className="villa-card-suffix"> / night</span>
        <span className="villa-card-body text-sm text-gray-700 ml-1">(weekday)</span>
      </p>
      <p className={cn(compact ? 'text-base' : 'text-lg', 'leading-snug')}>
        <span className="villa-card-price">{formatPrice(display.weekendAmount)}</span>
        <span className="villa-card-suffix"> / night</span>
        <span className="villa-card-body text-sm text-gray-700 ml-1">(weekend)</span>
      </p>
    </div>
  );
};

export default VillaCardPrice;

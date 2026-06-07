import React from 'react';
import { formatPrice } from '../data/resort';
import type { PriceBreakdownLine } from '../lib/bookingPricing';

type PriceBreakdownProps = {
  lines: PriceBreakdownLine[];
  className?: string;
  totalClassName?: string;
  subtotalClassName?: string;
};

const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  lines,
  className = '',
  totalClassName = 'border-gray-300 text-gray-900',
  subtotalClassName = 'border-gray-200',
}) => (
  <div className={`space-y-2 text-base ${className}`}>
    {lines.map((line) => {
      if (line.variant === 'total') {
        return (
          <div
            key={line.key}
            className={`flex justify-between items-center gap-3 text-xl font-bold pt-2 border-t ${totalClassName}`}
          >
            <span>{line.label}</span>
            <span>{formatPrice(line.amount)}</span>
          </div>
        );
      }

      if (line.variant === 'subtotal') {
        return (
          <div
            key={line.key}
            className={`flex justify-between items-center gap-3 pt-1 border-t font-medium ${subtotalClassName}`}
          >
            <span>{line.label}</span>
            <span className="font-semibold">{formatPrice(line.amount)}</span>
          </div>
        );
      }

      return (
        <div key={line.key} className="flex justify-between items-center gap-3 text-gray-900">
          <span className="shrink-0">{line.label}</span>
          {line.detail ? (
            <span className="flex-1 text-center text-gray-500 text-xs sm:text-sm">{line.detail}</span>
          ) : (
            <span className="flex-1" />
          )}
          <span className="font-semibold shrink-0">{formatPrice(line.amount)}</span>
        </div>
      );
    })}
  </div>
);

export default PriceBreakdown;

import React from 'react';
import { BRAND_LOGO_URL, RESORT_NAME } from '../../data/resort';
import { cn } from '../../utils/cn';

type BrandLogoProps = {
  className?: string;
  /** Resort name shown beside the logo mark (header/footer). */
  name?: string;
  showName?: boolean;
  /** `mark` = icon + optional name; `full` = entire logo image. */
  variant?: 'mark' | 'full';
  size?: 'header' | 'footer';
};

const markImageSize = {
  header: 'h-12 sm:h-14 lg:h-16 w-auto',
  footer: 'h-14 sm:h-16 w-auto',
};

const nameSize = {
  header: 'text-base sm:text-lg lg:text-xl',
  footer: 'text-lg sm:text-xl',
};

const fullSize = {
  header: 'h-[3.25rem] sm:h-[3.75rem] lg:h-[4.25rem] w-auto max-w-[min(100%,300px)]',
  footer: 'h-20 sm:h-24 w-auto max-w-[min(100%,340px)]',
};

const BrandLogo: React.FC<BrandLogoProps> = ({
  className,
  name = RESORT_NAME,
  showName = false,
  variant = 'mark',
  size = 'header',
}) => {
  if (variant === 'full') {
    return (
      <span className={cn('inline-flex items-center shrink-0', className)}>
        <img
          src={BRAND_LOGO_URL}
          alt={name}
          className={cn('object-contain', fullSize[size])}
          decoding="async"
        />
      </span>
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-2 sm:gap-2.5 shrink-0', className)}>
      <img
        src={BRAND_LOGO_URL}
        alt=""
        aria-hidden
        className={cn('shrink-0 object-contain object-center', markImageSize[size])}
        decoding="async"
      />
      {showName ? (
        <span
          className={cn(
            'font-display text-[#FF385C] tracking-wide leading-tight whitespace-nowrap',
            nameSize[size],
          )}
        >
          {name}
        </span>
      ) : (
        <span className="sr-only">{name}</span>
      )}
    </span>
  );
};

export default BrandLogo;

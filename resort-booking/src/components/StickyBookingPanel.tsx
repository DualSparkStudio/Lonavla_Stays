import React from 'react';

type StickyBookingPanelProps = {
  children: React.ReactNode;
  className?: string;
};

/** Desktop sidebar — native CSS sticky (no scroll listeners). */
const StickyBookingPanel: React.FC<StickyBookingPanelProps> = ({ children, className = '' }) => (
  <div className={`w-full lg:sticky lg:top-24 lg:self-start ${className}`}>{children}</div>
);

export default StickyBookingPanel;

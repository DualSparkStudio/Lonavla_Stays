import React, { useEffect, useRef, useState } from 'react';

const TOP_OFFSET_PX = 88;

type StickyBookingPanelProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Fixed booking sidebar on desktop — works when CSS sticky is blocked (overflow-x, transforms, grid).
 */
const StickyBookingPanel: React.FC<StickyBookingPanelProps> = ({ children, className = '' }) => {
  const slotRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState(0);
  const [fixed, setFixed] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties | undefined>(undefined);

  useEffect(() => {
    const slot = slotRef.current;
    const panel = panelRef.current;
    if (!slot || !panel) return;

    let rafId = 0;

    const update = () => {
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
      if (!isDesktop) {
        setFixed(false);
        setStyle(undefined);
        return;
      }

      const slotRect = slot.getBoundingClientRect();
      const panelH = panel.offsetHeight;
      setPanelHeight(panelH);

      if (slotRect.top >= TOP_OFFSET_PX) {
        setFixed(false);
        setStyle(undefined);
        return;
      }

      let top = TOP_OFFSET_PX;
      if (slotRect.bottom < panelH + TOP_OFFSET_PX) {
        top = Math.max(slotRect.bottom - panelH, 8);
      }

      setFixed(true);
      setStyle({
        position: 'fixed',
        top,
        left: slotRect.left,
        width: slotRect.width,
        maxHeight: `calc(100dvh - ${top}px - 8px)`,
        overflowY: 'auto',
        zIndex: 30,
      });
    };

    const scheduleUpdate = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };

    scheduleUpdate();

    const ro = new ResizeObserver(scheduleUpdate);
    ro.observe(panel);
    if (slot) ro.observe(slot);

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, []);

  return (
    <div ref={slotRef} className="w-full" style={{ minHeight: fixed ? panelHeight : undefined }}>
      <div ref={panelRef} className={className} style={style}>
        {children}
      </div>
    </div>
  );
};

export default StickyBookingPanel;

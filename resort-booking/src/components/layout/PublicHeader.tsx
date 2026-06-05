import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import NavLink from './NavLink';
import { mainNavConfig } from './NavIcons';
import { useSiteSettings } from '../../context/SiteDataContext';
import { cn } from '../../utils/cn';

type PublicHeaderProps = {
  currentPage?: string;
};

const PublicHeader: React.FC<PublicHeaderProps> = ({ currentPage = 'home' }) => {
  const settings = useSiteSettings();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const isActive = (page: string, href: string) => {
    if (currentPage === page) return true;
    if (href === '/') return location.pathname === '/';
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  return (
    <header
      className={cn(
        'nav-header',
        scrolled ? 'nav-header-scrolled' : 'nav-header-top',
        'motion-safe:animate-slide-down'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between min-h-[4.5rem] py-2 lg:py-0 lg:h-20 gap-3">
          <Link
            to="/"
            className="nav-link-enter relative z-10 flex items-center min-w-0 max-w-[58%] sm:max-w-[48%] lg:max-w-[28%] shrink-0 transition-transform duration-300 hover:scale-[1.02]"
            style={{ animationDelay: '80ms' }}
          >
            <svg
              viewBox="0 0 32 32"
              className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 motion-safe:animate-nav-pop"
              style={{ animationDelay: '120ms' }}
              aria-hidden
            >
              <circle cx="16" cy="16" r="16" fill="#FF385C" />
              <path
                fill="#fff"
                d="M16 7c-4.5 3.5-9 7.2-9 12.2a4.5 4.5 0 109 0c0-1.2-.4-2.3-1-3.2.6 2.2 2.5 3.8 4.8 3.8a4.8 4.8 0 100-9.6c-1.2 0-2.3.4-3.2 1.1.9-3.5 3.5-6.2 6.4-7.3z"
              />
            </svg>
            <span className="font-heading ml-2 text-sm sm:text-lg lg:text-xl text-[#FF385C] uppercase tracking-wide truncate">
              {settings.resortName}
            </span>
          </Link>

          <nav
            className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1 xl:gap-3 pointer-events-none"
            aria-label="Main"
          >
            <div className="flex items-center gap-1 xl:gap-3 pointer-events-auto">
              {mainNavConfig.map((item, index) => (
                <NavLink
                  key={item.page}
                  index={index}
                  label={item.label}
                  href={item.href}
                  Icon={item.Icon}
                  active={isActive(item.page, item.href)}
                  compact
                />
              ))}
            </div>
          </nav>

          <div className="relative z-10 flex items-center justify-end gap-2 sm:gap-3 shrink-0">
            <Link
              to="/villas"
              className="hidden md:inline-flex items-center justify-center rounded-full bg-airbnb-red px-4 py-2 lg:px-6 lg:py-2.5 text-sm lg:text-base font-bold text-white shadow-sm transition-all duration-200 hover:bg-airbnb-red-dark hover:shadow-md active:scale-95 btn-primary-motion whitespace-nowrap"
            >
              Book Now
            </Link>

            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center h-11 w-11 rounded-full border border-gray-200 bg-white text-gray-800 shadow-sm"
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav
            className="lg:hidden border-t border-gray-200 py-4 max-h-[calc(100vh-5rem)] overflow-y-auto"
            aria-label="Mobile and tablet"
          >
            <div className="space-y-1">
              {mainNavConfig.map((item) => (
                <Link
                  key={item.page}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-3 text-base font-bold transition-colors',
                    isActive(item.page, item.href)
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-airbnb-red'
                  )}
                >
                  <item.Icon className="h-9 w-9 shrink-0" />
                  {item.label}
                </Link>
              ))}
              <Link
                to="/villas"
                className="mt-2 flex items-center justify-center rounded-full bg-airbnb-red px-6 py-3 text-base font-bold text-white md:hidden"
              >
                Book Now
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default PublicHeader;

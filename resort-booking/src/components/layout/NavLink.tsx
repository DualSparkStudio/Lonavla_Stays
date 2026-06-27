import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { navIconClassName, type NavIconComponent } from './NavIcons';

type NavLinkProps = {
  label: string;
  href: string;
  active: boolean;
  Icon: NavIconComponent;
  onClick?: () => void;
  className?: string;
  index?: number;
  /** Icon above label, tighter spacing for header center nav */
  compact?: boolean;
};

const NavLink: React.FC<NavLinkProps> = ({
  label,
  href,
  active,
  Icon,
  onClick,
  className,
  index = 0,
  compact = false,
}) => (
  <Link
    to={href}
    onClick={onClick}
    style={{ animationDelay: `${200 + index * 110}ms` }}
    className={cn(
      'nav-link-item nav-link-enter group inline-flex flex-col items-center px-2 xl:px-3 pb-0.5 transition-colors duration-300',
      active
        ? 'text-[#222222]'
        : 'text-[#717171]',
      'hover:text-airbnb-red',
      className
    )}
  >
    <span
      className={cn(
        'inline-flex items-center',
        compact ? 'flex-col gap-0.5' : 'flex-row gap-2'
      )}
    >
      <span className="nav-icon-wrap">
        <Icon
          className={cn(
            compact ? 'h-8 w-8 xl:h-10 xl:w-10' : navIconClassName,
            'nav-icon-motion shrink-0 drop-shadow-sm motion-safe:animate-nav-pop'
          )}
        />
      </span>
      <span
        className={cn(
          'nav-link-label leading-none font-bold transition-transform duration-300',
          compact ? 'text-xs xl:text-sm' : 'text-base'
        )}
      >
        {label}
      </span>
    </span>
    <span
      className={cn(
        'mt-2 h-0.5 w-full rounded-full transition-all duration-300',
        active
          ? 'bg-[#222222] opacity-100 group-hover:bg-airbnb-red'
          : 'bg-transparent opacity-0 group-hover:opacity-100 group-hover:bg-airbnb-red group-hover:scale-x-110'
      )}
      aria-hidden
    />
  </Link>
);

export default NavLink;

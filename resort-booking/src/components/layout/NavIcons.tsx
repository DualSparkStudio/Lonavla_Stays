import React from 'react';
import { isForSaleEnabled } from '../../lib/featureFlags';

type NavIconProps = {
  className?: string;
  style?: React.CSSProperties;
};

export const navIconClassName = 'h-11 w-11 shrink-0';
const iconClass = navIconClassName;

export const NavIconHome: React.FC<NavIconProps> = ({ className }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className ?? iconClass}
    aria-hidden
  >
    <defs>
      <linearGradient id="home-roof" x1="16" y1="5" x2="16" y2="15" gradientUnits="userSpaceOnUse">
        <stop stopColor="#E8E8E8" />
        <stop offset="1" stopColor="#C4C4C4" />
      </linearGradient>
    </defs>
    <ellipse cx="25.5" cy="19" rx="3.2" ry="3.8" fill="#3D9A50" />
    <path d="M25.5 15.5v2.8M23.8 17h3.4" stroke="#2B7A3D" strokeWidth="0.7" strokeLinecap="round" />
    <path
      d="M7 15.2 16 7.8 25 15.2V24.5a.8.8 0 01-.8.8H7.8a.8.8 0 01-.8-.8V15.2z"
      fill="#F7F7F7"
      stroke="#D3D3D3"
      strokeWidth="0.6"
    />
    <path d="M5.5 15.2 16 6.5 26.5 15.2" fill="url(#home-roof)" />
    <path d="M5.5 15.2h21" stroke="#A8A8A8" strokeWidth="0.9" strokeLinecap="round" />
    <rect x="13.2" y="17.5" width="5.6" height="7.8" rx="0.4" fill="#FF385C" />
    <circle cx="16" cy="21" r="0.55" fill="#FF9CAD" />
    <rect x="9.2" y="14.8" width="3.2" height="2.8" rx="0.35" fill="#A8D4F5" stroke="#8BBDE8" strokeWidth="0.35" />
  </svg>
);

export const NavIconRooms: React.FC<NavIconProps> = ({ className }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className ?? iconClass}
    aria-hidden
  >
    <rect x="4.5" y="13.5" width="3.2" height="11" rx="0.6" fill="#7A4E2D" />
    <rect x="24.3" y="13.5" width="3.2" height="11" rx="0.6" fill="#7A4E2D" />
    <rect x="6" y="14.5" width="20" height="9.5" rx="1.2" fill="#9A6B43" />
    <rect x="7.5" y="16" width="17" height="6" rx="0.8" fill="#FF385C" />
    <ellipse cx="11.5" cy="17.2" rx="2.8" ry="2" fill="#FFFFFF" />
    <ellipse cx="20.5" cy="17.2" rx="2.8" ry="2" fill="#FFFFFF" />
    <path d="M5 24.5h22" stroke="#5E3D24" strokeWidth="1.1" strokeLinecap="round" />
    <rect x="7.5" y="7.5" width="5" height="6.5" rx="0.5" fill="#EFEFEF" stroke="#D0D0D0" strokeWidth="0.45" />
    <rect x="8.5" y="9" width="3" height="2" rx="0.25" fill="#7EC8E3" />
  </svg>
);

export const NavIconFacilities: React.FC<NavIconProps> = ({ className }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className ?? iconClass}
    aria-hidden
  >
    <defs>
      <linearGradient id="bell-metal" x1="16" y1="8" x2="16" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F5F5F5" />
        <stop offset="0.5" stopColor="#D4D4D4" />
        <stop offset="1" stopColor="#A8A8A8" />
      </linearGradient>
    </defs>
    <ellipse cx="16" cy="24" rx="7" ry="1.5" fill="#E0E0E0" />
    <rect x="10" y="22" width="12" height="2" rx="0.5" fill="#BDBDBD" />
    <path
      d="M10.5 22c0-6.5 2.5-11 5.5-11s5.5 4.5 5.5 11"
      fill="url(#bell-metal)"
      stroke="#9E9E9E"
      strokeWidth="0.5"
    />
    <circle cx="16" cy="9.5" r="1.8" fill="#E8E8E8" stroke="#B0B0B0" strokeWidth="0.4" />
    <path d="M16 11.3v1.2" stroke="#9E9E9E" strokeWidth="0.7" strokeLinecap="round" />
    <ellipse cx="16" cy="14" rx="5.5" ry="1" fill="#FFFFFF" opacity="0.45" />
  </svg>
);

export const NavIconAbout: React.FC<NavIconProps> = ({ className }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className ?? iconClass}
    aria-hidden
  >
    <path
      d="M9 8.5h14l-2 3.5H11L9 8.5z"
      fill="#C9A227"
      stroke="#A6851F"
      strokeWidth="0.4"
    />
    <rect x="7" y="12" width="18" height="14" rx="1.5" fill="#FFF9E6" stroke="#F0D78C" strokeWidth="0.6" />
    <path d="M10 15.5h12M10 19h9M10 22.5h10" stroke="#E8C547" strokeWidth="1" strokeLinecap="round" />
    <circle cx="22" cy="20" r="4.5" fill="#FF385C" />
    <rect x="21.1" y="16.8" width="1.8" height="5.2" rx="0.4" fill="white" />
    <circle cx="22" cy="23.2" r="1" fill="white" />
  </svg>
);

export const NavIconContact: React.FC<NavIconProps> = ({ className }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className ?? iconClass}
    aria-hidden
  >
    <path
      d="M5.5 11.5a3.2 3.2 0 013.2-3.2h14.6a3.2 3.2 0 013.2 3.2v7.4a3.2 3.2 0 01-3.2 3.2H12.8L6 26v-5.1a3.2 3.2 0 01-.5-1.76v-7.74z"
      fill="white"
      stroke="#484848"
      strokeWidth="1.15"
      strokeLinejoin="round"
    />
    <circle cx="11.5" cy="15.2" r="1.15" fill="#717171" />
    <circle cx="16" cy="15.2" r="1.15" fill="#717171" />
    <circle cx="20.5" cy="15.2" r="1.15" fill="#717171" />
  </svg>
);

export const NavIconForSale: React.FC<NavIconProps> = ({ className }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className ?? iconClass}
    aria-hidden
  >
    <rect x="5" y="14" width="14" height="12" rx="1" fill="#F7F7F7" stroke="#D3D3D3" strokeWidth="0.6" />
    <path d="M4 14 12 8l8 6" fill="#E8E8E8" stroke="#A8A8A8" strokeWidth="0.7" strokeLinejoin="round" />
    <rect x="9" y="18" width="3" height="4" rx="0.3" fill="#FF385C" />
    <rect x="14" y="17" width="2.5" height="2.5" rx="0.3" fill="#A8D4F5" stroke="#8BBDE8" strokeWidth="0.35" />
    <circle cx="24" cy="11" r="6" fill="#FF385C" />
    <path d="M21.5 11h5M24 8.5v5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
    <rect x="20" y="22" width="8" height="2.5" rx="0.5" fill="#C4C4C4" />
  </svg>
);

export type NavIconComponent = React.FC<NavIconProps>;

export const mainNavConfig: {
  label: string;
  href: string;
  page: string;
  Icon: NavIconComponent;
}[] = [
  { label: 'Home', href: '/', page: 'home', Icon: NavIconHome },
  { label: 'Villas', href: '/villas', page: 'villas', Icon: NavIconRooms },
  { label: 'For Sale', href: '/for-sale', page: 'for-sale', Icon: NavIconForSale },
  { label: 'Facilities', href: '/facilities', page: 'facilities', Icon: NavIconFacilities },
  { label: 'About', href: '/about', page: 'about', Icon: NavIconAbout },
  { label: 'Contact', href: '/contact', page: 'contact', Icon: NavIconContact },
].filter((item) => isForSaleEnabled || item.page !== 'for-sale');

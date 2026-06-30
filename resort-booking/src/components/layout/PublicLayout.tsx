import React from 'react';
import { useLocation } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

function resolveCurrentPage(pathname: string): string {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/villas')) return 'villas';
  if (pathname.startsWith('/for-sale')) return 'for-sale';
  if (pathname.startsWith('/facilities')) return 'facilities';
  if (pathname.startsWith('/about')) return 'about';
  if (pathname.startsWith('/contact')) return 'contact';
  if (pathname.startsWith('/bookings')) return 'bookings';
  return '';
}

type PublicLayoutProps = {
  children: React.ReactNode;
  currentPage?: string;
};

const PublicLayout: React.FC<PublicLayoutProps> = ({ children, currentPage }) => {
  const { pathname } = useLocation();
  const page = currentPage ?? resolveCurrentPage(pathname);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicHeader currentPage={page} />
      <main className="flex-1 min-w-0">{children}</main>
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;

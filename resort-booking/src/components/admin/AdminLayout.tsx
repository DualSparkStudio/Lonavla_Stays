import React, { useEffect, useState } from 'react';
import { useSiteData, useSiteSettings } from '../../context/SiteDataContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  HomeIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { adminLogout } from '../../lib/adminAuth';
<<<<<<< HEAD
import { getAdminInitials } from '../../lib/adminProfile';

const adminNavLinks = [
  { to: '/admin', page: 'dashboard', label: 'Dashboard', icon: Squares2X2Icon },
  { to: '/admin/rooms', page: 'rooms', label: 'Villas', icon: BuildingOffice2Icon },
  { to: '/admin/for-sale', page: 'for-sale', label: 'For sale', icon: ShoppingBagIcon },
  { to: '/admin/bookings', page: 'bookings', label: 'Bookings', icon: CalendarDaysIcon },
  { to: '/admin/calendar', page: 'calendar', label: 'Calendar', icon: ChartBarIcon },
  { to: '/admin/other', page: 'other', label: 'Other', icon: Cog6ToothIcon },
] as const;
=======
import { getAdminInitials, loadAdminProfile } from '../../lib/adminProfile';
import { isForSaleEnabled } from '../../lib/featureFlags';

const adminNavLinks = [
  { to: '/admin', page: 'dashboard', label: 'Dashboard' },
  { to: '/admin/settings', page: 'settings', label: 'Site content' },
  { to: '/admin/rooms', page: 'rooms', label: 'Villas' },
  { to: '/admin/for-sale', page: 'for-sale', label: 'For sale' },
  { to: '/admin/bookings', page: 'bookings', label: 'Bookings' },
  { to: '/admin/calendar', page: 'calendar', label: 'Calendar' },
  { to: '/admin/other', page: 'other', label: 'Other' },
].filter((item) => isForSaleEnabled || item.page !== 'for-sale');
>>>>>>> 805dc69fbf809cd1c9a5cc0c9aa751eea74d184d

type AdminLayoutProps = {
  currentPage: string;
  children: React.ReactNode;
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ currentPage, children }) => {
  const navigate = useNavigate();
  const { ensureAdminData } = useSiteData();
  const settings = useSiteSettings();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    ensureAdminData();
  }, [ensureAdminData]);

  const displayName = settings.contactName.trim() || 'Admin';
  const initials = getAdminInitials(displayName);

  const linkClass = (page: string) =>
    currentPage === page
      ? 'bg-red-50 text-red-600 font-semibold border-red-500'
      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-transparent';

  const sidebarContent = (
    <>
      <Link to="/admin" className="flex items-center gap-3 px-4 py-5 border-b border-gray-200" onClick={() => setMobileOpen(false)}>
        <div className="h-9 w-9 shrink-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">⚙️</span>
        </div>
        <span className="text-lg font-bold text-gray-900">
          Resort<span className="text-red-500">Admin</span>
        </span>
      </Link>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Admin">
        {adminNavLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.page}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg border-l-4 px-3 py-2.5 text-sm transition-colors ${linkClass(item.page)}`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-3 space-y-1">
        <Link
          to="/admin/profile"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${linkClass('profile')}`}
        >
          <span className="h-8 w-8 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </span>
          <span className="truncate font-medium">{displayName}</span>
        </Link>
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <HomeIcon className="h-5 w-5 shrink-0" />
          View site
        </Link>
        <button
          type="button"
          onClick={() => {
            adminLogout();
            navigate('/admin/login', { replace: true });
            setMobileOpen(false);
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200 z-40">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            className="fixed inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex flex-col w-72 max-w-[85vw] h-full bg-white shadow-xl">
            <button
              type="button"
              className="absolute top-4 right-4 inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-gray-200"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <span className="text-lg font-bold text-gray-900">
            Resort<span className="text-red-500">Admin</span>
          </span>
          <Link to="/admin/profile" className="h-9 w-9 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </Link>
        </header>

        <main className="flex-1 min-w-0 overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;

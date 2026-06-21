import React, { useEffect, useState } from 'react';
import { useSiteData } from '../../context/SiteDataContext';
import { Link, useNavigate } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { adminLogout } from '../../lib/adminAuth';
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

type AdminLayoutProps = {
  currentPage: string;
  children: React.ReactNode;
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ currentPage, children }) => {
  const navigate = useNavigate();
  const { ensureAdminData } = useSiteData();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    ensureAdminData();
  }, [ensureAdminData]);
  const profile = loadAdminProfile();
  const initials = getAdminInitials(profile.displayName);

  const linkClass = (page: string) =>
    currentPage === page ? 'text-red-500' : 'text-gray-900 hover:text-gray-900';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center min-h-16 py-2 md:py-0">
            <Link to="/admin" className="flex items-center min-w-0">
              <div className="h-8 w-8 shrink-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">⚙️</span>
              </div>
              <span className="ml-2 text-xl sm:text-2xl font-bold text-gray-900 truncate">
                Resort<span className="text-red-500">Admin</span>
              </span>
            </Link>

            <nav className="hidden lg:flex flex-wrap justify-end gap-x-4 gap-y-1 max-w-3xl" aria-label="Admin">
              {adminNavLinks.map((item) => (
                <Link
                  key={item.page}
                  to={item.to}
                  className={`${linkClass(item.page)} transition-colors text-base whitespace-nowrap`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3 shrink-0">
              <Link
                to="/admin/profile"
                className={`flex items-center gap-2 rounded-full px-2 py-1 transition-colors ${
                  currentPage === 'profile' ? 'text-red-500' : 'text-gray-900 hover:text-gray-900'
                }`}
                title="Profile"
              >
                <span className="h-8 w-8 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </span>
                <span className="text-base font-medium max-w-[8rem] truncate hidden xl:inline">{profile.displayName}</span>
              </Link>
              <Link to="/" className="text-gray-900 hover:text-gray-900 font-medium text-base">
                View Site
              </Link>
              <button
                type="button"
                onClick={() => {
                  adminLogout();
                  navigate('/admin/login', { replace: true });
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-full text-base font-medium"
              >
                Logout
              </button>
            </div>

            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg border border-gray-200"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>

          {mobileOpen && (
            <nav className="lg:hidden border-t border-gray-200 py-3 space-y-1">
              {adminNavLinks.map((item) => (
                <Link
                  key={item.page}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 font-medium ${linkClass(item.page)}`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/admin/profile"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium ${linkClass('profile')}`}
              >
                <span className="h-8 w-8 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </span>
                Profile
              </Link>
              <Link to="/" className="block rounded-lg px-3 py-2.5 font-medium text-gray-900">
                View Site
              </Link>
              <button
                type="button"
                onClick={() => {
                  adminLogout();
                  navigate('/admin/login', { replace: true });
                  setMobileOpen(false);
                }}
                className="block w-full text-left rounded-lg px-3 py-2.5 font-medium text-gray-900"
              >
                Logout
              </button>
            </nav>
          )}
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
    </div>
  );
};

export default AdminLayout;

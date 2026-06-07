import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Bars3Icon, 
  UserCircleIcon, 
  HomeIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';
import NavLink from './NavLink';
import { mainNavConfig, navIconClassName } from './NavIcons';

interface HeaderProps {
  user?: any;
  onLogin: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogin, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isNavActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#EBEBEB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gradient-airbnb rounded-lg flex items-center justify-center">
                  <HomeIcon className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-2xl font-bold text-gray-900">
                  Resort<span className="text-airbnb-red">Stay</span>
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {mainNavConfig.map((item) => (
              <NavLink
                key={item.page}
                label={item.label}
                href={item.href}
                Icon={item.Icon}
                active={isNavActive(item.href)}
              />
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center p-2 border border-gray-300 rounded-full hover:shadow-md transition-shadow duration-200">
                  <Bars3Icon className="h-4 w-4 text-gray-900" />
                  <div className="ml-2">
                    {user.avatar ? (
                      <img
                        className="h-6 w-6 rounded-full"
                        src={user.avatar}
                        alt={`${user.firstName} ${user.lastName}`}
                      />
                    ) : (
                      <UserCircleIcon className="h-6 w-6 text-gray-900" />
                    )}
                  </div>
                </Menu.Button>

                <Transition
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white border border-gray-200 rounded-lg shadow-lg py-1 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={cn(
                            'block px-4 py-2 text-base',
                            active ? 'bg-gray-100' : ''
                          )}
                        >
                          Profile
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/bookings"
                          className={cn(
                            'block px-4 py-2 text-base',
                            active ? 'bg-gray-100' : ''
                          )}
                        >
                          My Bookings
                        </Link>
                      )}
                    </Menu.Item>
                    {user.role === 'admin' && (
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/admin"
                            className={cn(
                              'block px-4 py-2 text-base',
                              active ? 'bg-gray-100' : ''
                            )}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                      </Menu.Item>
                    )}
                    <div className="border-t border-gray-200 my-1" />
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={onLogout}
                          className={cn(
                            'block w-full text-left px-4 py-2 text-base',
                            active ? 'bg-gray-100' : ''
                          )}
                        >
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : null}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-900 hover:text-gray-900"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-1">
              {mainNavConfig.map((item) => (
                <Link
                  key={item.page}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-lg font-bold transition-colors duration-200',
                    isNavActive(item.href)
                      ? 'text-[#222222] bg-gray-50 hover:text-airbnb-red'
                      : 'text-[#717171] hover:text-airbnb-red'
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.Icon className={navIconClassName} />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowTopRightOnSquareIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  EyeIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '../../components/admin/AdminLayout';
import { useSiteData, useSiteSettings } from '../../context/SiteDataContext';
import { formatPrice } from '../../data/resort';
import { endOfMonth, isBefore, isWithinInterval, parseISO, startOfDay, startOfMonth, subMonths } from 'date-fns';
import type { AdminBooking } from '../../lib/siteStorage';

const paidStatuses = new Set(['confirmed', 'completed']);

const parseBookingDate = (value: string) => {
  try {
    return parseISO(value.length > 10 ? value : `${value}T12:00:00`);
  } catch {
    return null;
  }
};

/** Check-in is today or later — excludes cancelled and past stays. */
const isUpcomingBooking = (booking: AdminBooking) => {
  if (booking.status === 'cancelled') return false;
  const checkIn = parseBookingDate(booking.checkIn);
  if (!checkIn) return false;
  return !isBefore(checkIn, startOfDay(new Date()));
};

const percentChange = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

const bookingBookedDate = (bookedAt: string) => parseBookingDate(bookedAt);

const AdminDashboardPage: React.FC = () => {
  const { rooms, bookings, settings, refreshSiteData, loading } = useSiteData();
  const siteSettings = useSiteSettings();
  const firstName = siteSettings.contactName.split(/\s+/)[0] || 'Admin';

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const inMonth = (start: Date, end: Date) =>
      bookings.filter((b) => {
        const d = bookingBookedDate(b.bookedAt);
        return d ? isWithinInterval(d, { start, end }) : false;
      });

    const thisMonthBookings = inMonth(thisMonthStart, thisMonthEnd);
    const lastMonthBookings = inMonth(lastMonthStart, lastMonthEnd);

    const revenue = (list: typeof bookings) =>
      list.filter((b) => paidStatuses.has(b.status)).reduce((sum, b) => sum + b.total, 0);

    const thisMonthRevenue = revenue(thisMonthBookings);
    const lastMonthRevenue = revenue(lastMonthBookings);

    const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
    const pending = bookings.filter((b) => b.status === 'pending').length;
    const completed = bookings.filter((b) => b.status === 'completed').length;
    const upcomingBookings = bookings.filter(isUpcomingBooking);
    const active = upcomingBookings.length;
    const pendingUpcoming = upcomingBookings.filter((b) => b.status === 'pending').length;

    return {
      totalBookings: bookings.length,
      bookingTrend: percentChange(thisMonthBookings.length, lastMonthBookings.length),
      revenue: revenue(bookings),
      revenueTrend: percentChange(thisMonthRevenue, lastMonthRevenue),
      active,
      pendingUpcoming,
      pending,
      totalRooms: rooms.length,
      confirmed,
      completed,
    };
  }, [bookings, rooms]);

  const trendLabel = (value: number) => {
    if (value === 0) return 'No change this month';
    const abs = Math.abs(value);
    return value > 0 ? `+${abs}% this month` : `-${abs}% this month`;
  };

  return (
    <AdminLayout currentPage="dashboard">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back, {firstName}!</h1>
          <p className="text-gray-600 mt-1">
            Here&apos;s what&apos;s happening at {settings.resortName || 'Resort Booking System'} today
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <button
            type="button"
            onClick={() => refreshSiteData()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
          >
            <ArrowTrendingUpIcon className="h-4 w-4" />
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
          >
            <EyeIcon className="h-4 w-4" />
            View Website
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Bookings',
            value: String(stats.totalBookings),
            trend: stats.bookingTrend,
            icon: CalendarDaysIcon,
            iconBg: 'bg-blue-100 text-blue-600',
          },
          {
            label: 'Revenue Generated',
            value: formatPrice(stats.revenue),
            trend: stats.revenueTrend,
            icon: CurrencyRupeeIcon,
            iconBg: 'bg-green-100 text-green-600',
          },
          {
            label: 'Active Bookings',
            value: String(stats.active),
            sub: stats.pendingUpcoming > 0 ? `${stats.pendingUpcoming} pending` : 'Upcoming check-ins',
            subDown: stats.pendingUpcoming > 0,
            icon: CheckCircleIcon,
            iconBg: 'bg-purple-100 text-purple-600',
          },
          {
            label: 'Total Rooms',
            value: String(stats.totalRooms),
            icon: BuildingOffice2Icon,
            iconBg: 'bg-orange-100 text-orange-600',
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-600">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                  {card.trend !== undefined && (
                    <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${card.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {card.trend >= 0 ? <ArrowTrendingUpIcon className="h-3.5 w-3.5" /> : <ArrowTrendingDownIcon className="h-3.5 w-3.5" />}
                      {trendLabel(card.trend)}
                    </p>
                  )}
                  {card.sub && (
                    <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${card.subDown ? 'text-red-600' : 'text-gray-500'}`}>
                      {card.subDown && <ArrowTrendingDownIcon className="h-3.5 w-3.5" />}
                      {card.sub}
                    </p>
                  )}
                </div>
                <div className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 ${card.iconBg}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          <p className="text-sm text-gray-600 mt-1 mb-6">Manage your resort operations efficiently</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: 'Manage Bookings',
                description: 'View, update, and track all guest reservations',
                to: '/admin/bookings',
                icon: CalendarDaysIcon,
                iconBg: 'bg-blue-100 text-blue-600',
                linkClass: 'text-blue-600',
              },
              {
                title: 'Room Management',
                description: 'Update room details, availability, and pricing',
                to: '/admin/rooms',
                icon: BuildingOffice2Icon,
                iconBg: 'bg-green-100 text-green-600',
                linkClass: 'text-green-600',
              },
              {
                title: 'Guest Reviews',
                description: 'Monitor ratings and respond to guest enquiries',
                to: '/admin/profile',
                icon: StarIcon,
                iconBg: 'bg-amber-100 text-amber-600',
                linkClass: 'text-amber-600',
              },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <div key={action.title} className="rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-4 ${action.iconBg}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-600 mt-2 mb-4 leading-relaxed">{action.description}</p>
                  <Link to={action.to} className={`inline-flex items-center gap-1 text-sm font-semibold ${action.linkClass} hover:underline`}>
                    Manage now
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Booking Status</h2>
            <ul className="space-y-3">
              {[
                { label: 'Confirmed', count: stats.confirmed, dot: 'bg-green-500' },
                { label: 'Pending', count: stats.pending, dot: 'bg-amber-400' },
                { label: 'Completed', count: stats.completed, dot: 'bg-blue-500' },
              ].map((row) => (
                <li key={row.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-700">
                    <span className={`h-2.5 w-2.5 rounded-full ${row.dot}`} />
                    {row.label}
                  </span>
                  <span className="font-bold text-gray-900">{row.count}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <ClockIcon className="h-5 w-5 text-blue-600" />
              Today&apos;s Priority
            </h2>
            <ul className="space-y-3 text-sm text-gray-700">
              {['Check new bookings', 'Review room availability', 'Respond to reviews'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 text-blue-600 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">System Status</h2>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Website Status', value: 'Online' },
                { label: 'Booking System', value: 'Active' },
                { label: 'Payment Gateway', value: 'Connected' },
              ].map((row) => (
                <li key={row.label} className="flex items-center justify-between">
                  <span className="text-gray-700">{row.label}</span>
                  <span className="flex items-center gap-1.5 font-semibold text-green-700">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    {row.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;

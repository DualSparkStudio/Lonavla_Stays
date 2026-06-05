import React, { Fragment, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import type { AdminBooking } from '../types/site';
import PriceBreakdown from './PriceBreakdown';
import { useSiteData } from '../context/SiteDataContext';
import { loadBookingConfirmation } from '../lib/bookingConfirmation';
import {
  breakdownFromConfirmation,
  breakdownFromStoredBooking,
  buildBookingPriceBreakdown,
} from '../lib/bookingPricing';

type BookingDetailsModalProps = {
  booking: AdminBooking | null;
  roomName?: string;
  onClose: () => void;
};

const formatDisplayDate = (value: string) => {
  try {
    return format(parseISO(value), 'MMM d, yyyy');
  } catch {
    return value;
  }
};

const formatBookedAt = (value: string) => {
  try {
    return format(parseISO(value), "MMM d, yyyy");
  } catch {
    return value;
  }
};

const statusBadgeClass = (status: AdminBooking['status']) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'pending':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const paymentStatus = (status: AdminBooking['status']) => {
  if (status === 'confirmed' || status === 'completed') return 'paid';
  if (status === 'cancelled') return 'refunded';
  return 'pending';
};

const paymentBadgeClass = (status: AdminBooking['status']) => {
  const pay = paymentStatus(status);
  if (pay === 'paid') return 'bg-green-100 text-green-800 border-green-200';
  if (pay === 'refunded') return 'bg-gray-100 text-gray-700 border-gray-200';
  return 'bg-amber-100 text-amber-800 border-amber-200';
};

type FieldProps = { label: string; value: React.ReactNode; className?: string };

const Field: React.FC<FieldProps> = ({ label, value, className }) => (
  <div className={className}>
    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1">{label}</p>
    <div className="bg-white rounded-lg border border-gray-100 px-3 py-2.5 text-sm font-semibold text-gray-900 shadow-sm">
      {value}
    </div>
  </div>
);

type SectionProps = {
  title: string;
  icon: React.ReactNode;
  tint: string;
  border: string;
  children: React.ReactNode;
};

const Section: React.FC<SectionProps> = ({ title, icon, tint, border, children }) => (
  <section className={`rounded-xl border ${border} ${tint} p-4`}>
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h4 className="font-bold text-gray-900">{title}</h4>
    </div>
    {children}
  </section>
);

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, roomName, onClose }) => {
  const { settings } = useSiteData();

  const priceLines = useMemo(() => {
    if (!booking) return [];
    const confirmation = loadBookingConfirmation(booking.bookingRef);
    const breakdownInput = confirmation
      ? breakdownFromConfirmation(confirmation, settings)
      : breakdownFromStoredBooking(
          {
            ...booking,
            nights:
              booking.nights ??
              (() => {
                try {
                  return differenceInCalendarDays(parseISO(booking.checkOut), parseISO(booking.checkIn));
                } catch {
                  return undefined;
                }
              })(),
          },
          settings,
        );
    return buildBookingPriceBreakdown(breakdownInput);
  }, [booking, settings]);

  if (!booking) return null;

  const villa = roomName ?? booking.roomName;
  const nights = (() => {
    try {
      return differenceInCalendarDays(parseISO(booking.checkOut), parseISO(booking.checkIn));
    } catch {
      return null;
    }
  })();
  const payStatus = paymentStatus(booking.status);
  const isWebsiteBooking = booking.status === 'confirmed' || booking.status === 'completed';

  return (
    <Transition appear show as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto p-4">
          <div className="flex min-h-full items-center justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-11 w-11 shrink-0 rounded-full bg-white/20 flex items-center justify-center">
                      <DocumentTextIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <Dialog.Title className="font-heading text-2xl text-white tracking-wide">
                        Booking Details
                      </Dialog.Title>
                      <p className="text-white/90 text-sm font-medium mt-0.5 uppercase tracking-wide">
                        {booking.status} • {isWebsiteBooking ? 'Website booking' : 'Manual booking'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="shrink-0 rounded-full p-1.5 text-white/90 hover:bg-white/20 transition-colors"
                    aria-label="Close"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                  <Section
                    title="Customer information"
                    icon={<UserIcon className="h-5 w-5 text-red-500" />}
                    tint="bg-red-50/60"
                    border="border-red-100"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Name" value={booking.guestName} />
                      <Field label="Email" value={booking.guestEmail} />
                      <Field label="Booking reference" value={<span className="font-mono text-xs">{booking.bookingRef}</span>} className="sm:col-span-2" />
                    </div>
                  </Section>

                  <Section
                    title="Booking information"
                    icon={<CalendarDaysIcon className="h-5 w-5 text-pink-600" />}
                    tint="bg-pink-50/60"
                    border="border-pink-100"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Villa" value={villa} className="sm:col-span-2" />
                      <Field label="Check-in" value={formatDisplayDate(booking.checkIn)} />
                      <Field label="Check-out" value={formatDisplayDate(booking.checkOut)} />
                      <Field label="Guests" value={booking.guests} />
                      <Field label="Nights" value={nights != null && nights > 0 ? nights : '—'} />
                    </div>
                  </Section>

                  <Section
                    title="Status & payment"
                    icon={<CheckCircleIcon className="h-5 w-5 text-green-600" />}
                    tint="bg-green-50/60"
                    border="border-green-100"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <Field
                        label="Booking status"
                        value={
                          <span className={`inline-flex capitalize px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadgeClass(booking.status)}`}>
                            {booking.status}
                          </span>
                        }
                      />
                      <Field
                        label="Payment status"
                        value={
                          <span className={`inline-flex capitalize px-2.5 py-0.5 rounded-full text-xs font-bold border ${paymentBadgeClass(booking.status)}`}>
                            {payStatus}
                          </span>
                        }
                      />
                    </div>

                    <div className="rounded-xl border border-green-200 bg-white p-4 mb-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">
                        Price breakdown
                      </p>
                      <PriceBreakdown
                        lines={priceLines}
                        subtotalClassName="border-green-100"
                        totalClassName="border-green-200 text-green-800"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Payment gateway" value={isWebsiteBooking ? 'Razorpay' : 'Manual / offline'} />
                      <Field label="Booking date" value={formatBookedAt(booking.bookedAt)} />
                    </div>
                  </Section>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-2.5 rounded-lg font-semibold transition-colors"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default BookingDetailsModal;

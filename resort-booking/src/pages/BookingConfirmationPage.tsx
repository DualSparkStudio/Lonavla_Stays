import React, { useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  CreditCardIcon,
  HomeIcon,
  InformationCircleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import PublicLayout from '../components/layout/PublicLayout';
import Button from '../components/ui/Button';
import NormalizedImage from '../components/ui/NormalizedImage';
import PriceBreakdown from '../components/PriceBreakdown';
import { useSiteData } from '../context/SiteDataContext';
import { loadBookingConfirmation, type BookingConfirmationData } from '../lib/bookingConfirmation';
import { getPrimaryImage } from '../lib/imageUrl';
import {
  breakdownFromConfirmation,
  breakdownFromStoredBooking,
  buildBookingPriceBreakdown,
} from '../lib/bookingPricing';

const formatDisplayDate = (iso: string) => format(parseISO(iso), 'MMM d, yyyy');

const BookingConfirmationPage: React.FC = () => {
  const { bookingRef } = useParams<{ bookingRef: string }>();
  const location = useLocation();
  const { bookings, getRoomById, settings } = useSiteData();

  const data = useMemo((): BookingConfirmationData | null => {
    const fromState = location.state as BookingConfirmationData | null;
    if (fromState?.bookingRef) return fromState;

    const fromStorage = loadBookingConfirmation(bookingRef);
    if (fromStorage) return fromStorage;

    const stored = bookings.find((b) => b.bookingRef === bookingRef);
    if (!stored) return null;

    const room = getRoomById(stored.roomId);
    const pricing = breakdownFromStoredBooking(stored, settings);

    return {
      bookingRef: stored.bookingRef,
      guestName: stored.guestName,
      guestEmail: stored.guestEmail,
      guestPhone: '',
      roomId: stored.roomId,
      roomName: stored.roomName,
      roomImage: getPrimaryImage(room?.images),
      checkIn: stored.checkIn,
      checkOut: stored.checkOut,
      guests: stored.guests,
      nights: pricing.nights,
      basePrice: pricing.basePrice,
      extraAdults: pricing.extraAdults,
      children: pricing.children,
      extraAdultsCharge: pricing.extraAdultsCharge,
      childrenCharge: pricing.childrenCharge,
      subtotal: pricing.subtotal,
      gst: pricing.gst,
      gstPercent: pricing.gstPercent,
      total: pricing.total,
      paymentCompleted: stored.status === 'confirmed',
    };
  }, [location.state, bookingRef, bookings, getRoomById, settings]);

  const priceLines = useMemo(() => {
    if (!data) return [];
    return buildBookingPriceBreakdown(breakdownFromConfirmation(data, settings));
  }, [data, settings]);

  if (!data) {
    return (
      <PublicLayout currentPage="villas">
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <h1 className="font-heading text-3xl text-gray-900 mb-4">Booking not found</h1>
          <p className="text-gray-900 mb-6">
            We could not find confirmation details for this booking.
          </p>
          <Link to="/villas">
            <Button size="lg" className="rounded-lg">
              Browse villas
            </Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const room = getRoomById(data.roomId);
  const villaImage = data.roomImage || getPrimaryImage(room?.images);
  const displayId = data.bookingRef.replace(/^LON/i, '') || data.bookingRef;
  return (
    <PublicLayout currentPage="villas">
      <div className="bg-stone-100 min-h-[calc(100vh-5rem)] py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Success header */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 py-10 text-center text-white">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30">
                <CheckCircleIcon className="h-10 w-10" />
              </div>
              <h1 className="font-heading text-3xl md:text-4xl tracking-wide mb-2">Booking Confirmed!</h1>
              <p className="text-emerald-50 text-lg md:text-xl">
                Your reservation has been successfully created.
              </p>
              <span className="inline-block mt-4 rounded-full bg-white/20 px-5 py-2 text-base font-bold tracking-wide">
                Booking ID: #{displayId}
              </span>
            </div>

            <div className="p-6 md:p-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Guest */}
                <section className="rounded-xl border border-sky-100 bg-sky-50/80 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <UserIcon className="h-5 w-5 text-sky-700" />
                    <h2 className="font-bold text-gray-900">Guest Information</h2>
                  </div>
                  <dl className="space-y-3 text-base">
                    <div>
                      <dt className="text-gray-900 font-medium">Name</dt>
                      <dd className="font-semibold text-gray-900">{data.guestName}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-900 font-medium">Email</dt>
                      <dd className="font-semibold text-gray-900 break-all">{data.guestEmail}</dd>
                    </div>
                    {data.guestPhone && (
                      <div>
                        <dt className="text-gray-900 font-medium">Phone</dt>
                        <dd className="font-semibold text-gray-900">{data.guestPhone}</dd>
                      </div>
                    )}
                  </dl>
                </section>

                {/* Booking details */}
                <section className="rounded-xl border border-violet-100 bg-violet-50/80 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarDaysIcon className="h-5 w-5 text-violet-700" />
                    <h2 className="font-bold text-gray-900">Booking Details</h2>
                  </div>
                  <dl className="space-y-3 text-base">
                    <div>
                      <dt className="text-gray-900 font-medium">Status</dt>
                      <dd>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                          <CheckCircleIcon className="h-3.5 w-3.5" />
                          Confirmed
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-900 font-medium">Check-in</dt>
                      <dd className="font-semibold text-gray-900">{formatDisplayDate(data.checkIn)}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-900 font-medium">Check-out</dt>
                      <dd className="font-semibold text-gray-900">{formatDisplayDate(data.checkOut)}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-900 font-medium">Nights</dt>
                      <dd className="font-semibold text-gray-900">
                        {data.nights} Night{data.nights !== 1 ? 's' : ''}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-900 font-medium">Total guests</dt>
                      <dd className="font-semibold text-gray-900">{data.guests}</dd>
                    </div>
                  </dl>
                </section>
              </div>

              {/* Villa */}
              <section className="rounded-xl border border-amber-100 bg-amber-50/80 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <HomeIcon className="h-5 w-5 text-amber-800" />
                  <h2 className="font-bold text-gray-900">Villa Details</h2>
                </div>
                <div className="flex gap-4 items-center">
                  {(villaImage || room?.images?.length) ? (
                    <NormalizedImage
                      src={villaImage}
                      urls={room?.images}
                      alt={data.roomName}
                      className="h-20 w-28 rounded-lg object-cover shrink-0 border border-amber-200"
                    />
                  ) : null}
                  <div>
                    <p className="font-bold text-gray-900 text-xl">{data.roomName}</p>
                    <p className="text-base text-gray-900 mt-1">
                      {settings.resortName} — private villa stay in {settings.resortLocation}
                    </p>
                  </div>
                </div>
              </section>

              {/* Payment */}
              <section className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCardIcon className="h-5 w-5 text-emerald-800" />
                  <h2 className="font-bold text-gray-900">Payment Summary</h2>
                </div>
                <div className="max-w-md">
                  <PriceBreakdown
                    lines={priceLines}
                    subtotalClassName="border-emerald-200"
                    totalClassName="border-emerald-300 text-emerald-800"
                  />
                </div>
                {data.paymentCompleted && (
                  <span className="inline-flex items-center gap-1.5 mt-4 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white">
                    <CheckCircleIcon className="h-4 w-4" />
                    Payment completed
                  </span>
                )}
                {data.paymentId && (
                  <p className="mt-3 text-xs text-gray-500 font-mono">Payment ref: {data.paymentId}</p>
                )}
              </section>

              <div className="text-center pt-2">
                <Link to="/">
                  <Button
                    size="lg"
                    className="rounded-lg min-w-[200px] !bg-sky-600 hover:!bg-sky-700 text-white font-bold"
                  >
                    Back to home
                  </Button>
                </Link>
              </div>

              {/* Important info */}
              <section className="rounded-xl bg-sky-600 text-white p-5 md:p-6">
                <div className="flex items-start gap-3">
                  <InformationCircleIcon className="h-6 w-6 shrink-0 mt-0.5" />
                  <div>
                    <h2 className="font-bold text-xl mb-3">Important information</h2>
                    <ul className="list-disc pl-5 space-y-2 text-base text-sky-50">
                      <li>Check-in from 2:00 PM · Check-out by 11:00 AM</li>
                      <li>Please carry a valid government-issued photo ID for all guests</li>
                      <li>No smoking inside the villa</li>
                      <li>
                        For changes or cancellations, contact us at least 24 hours before check-in:{' '}
                        <span className="font-semibold text-white">{settings.resortPhone}</span>
                      </li>
                      <li>
                        Email: <span className="font-semibold text-white">{settings.resortEmail}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default BookingConfirmationPage;

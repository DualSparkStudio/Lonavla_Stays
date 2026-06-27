import React, { Suspense, lazy, useCallback, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  CreditCardIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import PublicLayout from '../components/layout/PublicLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import NormalizedImage from '../components/ui/NormalizedImage';
import LocationMapSection from '../components/maps/LocationMapSection';
import { notifyBookingByEmail } from '../lib/bookingEmail';
import { saveBookingConfirmation } from '../lib/bookingConfirmation';
import { checkRoomAvailability } from '../lib/availability';
import { verifyRoomAvailabilityRemote } from '../lib/availabilityApi';
import PriceBreakdown from '../components/PriceBreakdown';
import { formatPrice, checkInLabelFromTime, checkOutLabelFromTime, checkInOutSummaryFromTimes } from '../data/resort';
import { applyBookingTimesToPolicyItem } from '../lib/policySections';
import { useSiteBookings, useSiteData } from '../context/SiteDataContext';
import { isSupabaseConfigured } from '../lib/supabase';

const AvailabilityCalendar = lazy(() => import('../components/AvailabilityCalendar'));
import { buildBookingPriceBreakdown, computeStayPricing, BOOKING_ADVANCE_PAYMENT_PERCENT } from '../lib/bookingPricing';
import { getPrimaryImage } from '../lib/imageUrl';
import {
  createRazorpayOrder,
  getPaymentModeLabel,
  handleRazorpayError,
  isPaymentDemoMode,
  isRazorpayTestKey,
  openRazorpayCheckout,
  verifyRazorpayPayment,
} from '../lib/razorpay';

const bookingSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  specialRequests: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, 'You must agree to the terms'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const toDateInputValue = (date: Date) => format(date, 'yyyy-MM-dd');

const formatDateRangeLabel = (checkIn: string, checkOut: string) => {
  if (!checkIn) return 'Select dates';
  if (!checkOut || checkOut <= checkIn) {
    return `${format(parseISO(checkIn), 'd/M/yyyy')} — select check-out`;
  }
  return `${format(parseISO(checkIn), 'd/M/yyyy')} - ${format(parseISO(checkOut), 'd/M/yyyy')}`;
};

const BookingPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getRoomById, settings, addBooking } = useSiteData();
  const { bookings, blockedDates } = useSiteBookings();
  const villa = roomId ? getRoomById(roomId) : undefined;

  const initialCheckIn = searchParams.get('checkIn') ?? toDateInputValue(addDays(new Date(), 1));
  const initialCheckOut = searchParams.get('checkOut') ?? toDateInputValue(addDays(new Date(), 3));

  const guestParam = Number(searchParams.get('guests'));
  const initialGuestInput =
    Number.isFinite(guestParam) && guestParam > 0 ? String(Math.floor(guestParam)) : '';

  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [showCalendar, setShowCalendar] = useState(false);
  const [guestInput, setGuestInput] = useState(initialGuestInput);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dateError, setDateError] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const paymentInFlight = useRef(false);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { agreeToTerms: false },
  });

  const nights = useMemo(() => {
    if (!checkOut || checkOut <= checkIn) return 0;
    return differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn));
  }, [checkIn, checkOut]);

  const guestsIncluded = villa?.max_guests ?? 1;
  const extraPersonCharge = settings.extraPersonCharge ?? 1500;
  const guestCount = useMemo(() => {
    const parsed = Number(guestInput);
    if (!Number.isFinite(parsed) || parsed < 1) return 1;
    return Math.floor(parsed);
  }, [guestInput]);

  const pricing = useMemo(() => {
    if (!villa || nights < 1) {
      return computeStayPricing({
        pricePerNight: 0,
        weekendPricePerNight: 0,
        checkInDate: checkIn,
        pricingHolidays: settings.pricingHolidays,
        nights: 0,
        guestCount: 1,
        guestsIncluded: 1,
        extraPersonCharge,
      });
    }
    return computeStayPricing({
      pricePerNight: villa.price_per_night,
      weekendPricePerNight: villa.weekend_price_per_night,
      checkInDate: checkIn,
      pricingHolidays: settings.pricingHolidays,
      nights,
      guestCount,
      guestsIncluded: villa.max_guests,
      extraPersonCharge,
    });
  }, [villa, nights, guestCount, extraPersonCharge, checkIn, settings.pricingHolidays]);

  const priceLines = useMemo(
    () =>
      buildBookingPriceBreakdown({
        nights: pricing.nights,
        basePrice: pricing.basePrice,
        guestCount: pricing.guestCount,
        guestsIncluded: pricing.guestsIncluded,
        extraGuests: pricing.extraGuests,
        extraGuestsCharge: pricing.extraGuestsCharge,
        extraPersonCharge: pricing.extraPersonCharge,
        total: pricing.total,
        amountDueNow: pricing.amountDueNow,
        balanceDue: pricing.balanceDue,
        showPaymentSplit: true,
      }),
    [pricing],
  );

  const validateDates = () => {
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      setDateError('Please select check-in and check-out dates.');
      return false;
    }
    const parsedGuests = Number(guestInput);
    if (!Number.isFinite(parsedGuests) || parsedGuests < 1) {
      setDateError('Please enter at least 1 guest.');
      return false;
    }
    if (villa) {
      const availability = checkRoomAvailability(villa.id, checkIn, checkOut, bookings, blockedDates);
      if (!availability.available) {
        setDateError(availability.reason ?? 'Selected dates are not available.');
        return false;
      }
    }
    setDateError('');
    return true;
  };

  const handleDateSelect = useCallback((start: string, end: string) => {
    setCheckIn(start);
    setCheckOut(end);
    setDateError('');
    if (end && end > start) setShowCalendar(false);
  }, []);

  const handleBooking = async (data: BookingFormData) => {
    if (!villa || !validateDates() || paymentInFlight.current || isProcessing) return;

    if (isSupabaseConfigured) {
      try {
        const remote = await verifyRoomAvailabilityRemote({
          roomId: villa.id,
          checkIn,
          checkOut,
        });
        if (!remote.available) {
          setDateError(remote.reason ?? 'Selected dates are no longer available.');
          return;
        }
      } catch {
        // Client-side validation already ran; proceed if API is unavailable.
      }
    }

    paymentInFlight.current = true;
    setPaymentError('');
    setIsProcessing(true);
    const receipt = `LON${Date.now().toString().slice(-8)}`;

    try {
      const order = await createRazorpayOrder({
        amountInr: pricing.amountDueNow,
        receipt,
        notes: { villaId: villa.id, villaName: villa.name, checkIn, checkOut },
      });

      const payment = await openRazorpayCheckout({
        order,
        description: `${villa.name} · ${nights} night${nights !== 1 ? 's' : ''}`,
        prefill: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          contact: data.phone,
        },
        notes: { villa: villa.name, guests: String(guestCount) },
      });

      await verifyRazorpayPayment({
        orderId: payment.razorpay_order_id,
        paymentId: payment.razorpay_payment_id,
        signature: payment.razorpay_signature,
      });

      addBooking(
        {
          bookingRef: receipt,
          roomId: villa.id,
          roomName: villa.name,
          guestName: `${data.firstName} ${data.lastName}`,
          guestEmail: data.email,
          checkIn,
          checkOut,
          guests: guestCount,
          total: pricing.total,
          status: 'confirmed',
          nights: pricing.nights,
          basePrice: pricing.basePrice,
          guestsIncluded: pricing.guestsIncluded,
          extraGuests: pricing.extraGuests,
          extraGuestsCharge: pricing.extraGuestsCharge,
          pricingSubtotal: pricing.total,
          amountPaid: pricing.amountDueNow,
        },
        {
          orderId: payment.razorpay_order_id,
          paymentId: payment.razorpay_payment_id,
        },
      );

      const confirmation = {
        bookingRef: receipt,
        paymentId: payment.razorpay_payment_id,
        guestName: `${data.firstName} ${data.lastName}`,
        guestEmail: data.email,
        guestPhone: data.phone,
        roomId: villa.id,
        roomName: villa.name,
        roomImage: getPrimaryImage(villa.images),
        checkIn,
        checkOut,
        guests: guestCount,
        guestsIncluded: pricing.guestsIncluded,
        extraGuests: pricing.extraGuests,
        nights: pricing.nights,
        basePrice: pricing.basePrice,
        extraGuestsCharge: pricing.extraGuestsCharge,
        total: pricing.total,
        amountPaid: pricing.amountDueNow,
        balanceDue: pricing.balanceDue,
        paymentCompleted: true,
      };
      saveBookingConfirmation(confirmation);
      notifyBookingByEmail({
        ...confirmation,
        roomAddress: villa.address,
        roomLocation: villa.location,
        mapEmbedUrl: villa.mapEmbedUrl,
        mapsLink: villa.mapsLink,
        resortName: settings.resortName,
        resortPhone: settings.resortPhone,
        resortEmail: settings.resortEmail,
        resortAddress: settings.resortAddress,
        resortLocation: settings.resortLocation,
        checkInTime: settings.checkInTime,
        checkOutTime: settings.checkOutTime,
        siteUrl: import.meta.env.VITE_APP_URL || window.location.origin,
        houseRuleHighlights: settings.houseRulesSections
          .flatMap((section) => section.items)
          .slice(0, 3)
          .map((item) =>
            applyBookingTimesToPolicyItem(item, settings.checkInTime, settings.checkOutTime),
          ),
      });
      navigate(`/booking/confirmation/${receipt}`, { state: confirmation, replace: true });
    } catch (error) {
      setPaymentError(handleRazorpayError(error));
    } finally {
      setIsProcessing(false);
      paymentInFlight.current = false;
    }
  };

  if (!villa) {
    return (
      <PublicLayout currentPage="villas">
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="font-heading text-3xl mb-4">Villa not found</h1>
          <Link to="/villas" className="text-airbnb-red font-bold hover:underline">
            ← Back to all villas
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const dateRangeLabel = formatDateRangeLabel(checkIn, checkOut);
  const canPay = nights >= 1 && checkOut > checkIn;
  const hasWeekendPricing = Boolean(
    villa.weekend_price_per_night && villa.weekend_price_per_night > 0,
  );
  const selectedNightlyRate =
    pricing.nights > 0 ? Math.round(pricing.basePrice / pricing.nights) : villa.price_per_night;
  const checkInLabel = checkInLabelFromTime(settings.checkInTime);
  const checkOutLabel = checkOutLabelFromTime(settings.checkOutTime);
  const checkInOutSummary = checkInOutSummaryFromTimes(settings.checkInTime, settings.checkOutTime);

  return (
    <PublicLayout currentPage="villas">
      <div className="bg-gray-100 min-h-[calc(100vh-5rem)] py-8 px-3 sm:px-5">
        <div className="max-w-5xl mx-auto">
          <button
            type="button"
            onClick={() => navigate(`/villas/${villa.id}`)}
            className="inline-flex items-center gap-2 text-gray-900 hover:text-airbnb-red font-bold mb-5 transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5" />
            Back to villa
          </button>

          <h1 className="font-heading text-3xl md:text-4xl mb-6">
            Book {villa.name}
          </h1>

          <form onSubmit={form.handleSubmit(handleBooking)}>
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
              {/* Room summary */}
              <div className="p-6 md:p-8 border-b border-gray-100">
                <div className="flex flex-col md:flex-row gap-6">
                  <NormalizedImage
                    urls={villa.images}
                    fallback="https://via.placeholder.com/900x500?text=Villa"
                    alt={villa.name}
                    className="w-full md:w-56 h-44 md:h-40 object-cover rounded-xl shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{villa.name}</h2>
                    <p className="text-gray-900 text-base leading-relaxed mb-4 line-clamp-3">
                      {villa.description}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-center">
                        <p className="text-xs text-gray-500 font-medium">Price per night</p>
                        <p className="text-base font-bold text-gray-900">{formatPrice(villa.price_per_night)}</p>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-center">
                        <p className="text-xs text-gray-500 font-medium">Check-in / Check-out</p>
                        <p className="text-sm font-bold text-gray-900 leading-snug">
                          {checkInLabel}
                          <br />
                          {checkOutLabel}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-center">
                        <p className="text-xs text-gray-500 font-medium">Guests in base price</p>
                        <p className="text-base font-bold text-gray-900">{villa.max_guests}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {villa.amenities.slice(0, 8).map((a) => (
                        <span
                          key={a}
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800"
                        >
                          <CheckCircleIcon className="h-3.5 w-3.5" />
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 md:px-8 pb-6 border-b border-gray-100">
                <LocationMapSection
                  mapEmbedUrl={villa.mapEmbedUrl}
                  mapsLink={villa.mapsLink}
                  address={villa.address}
                  location={villa.location}
                />
              </div>

              {/* Booking form — two columns */}
              <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                {/* Left column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Select dates</h3>
                    <button
                      type="button"
                      onClick={() => setShowCalendar((v) => !v)}
                      className="w-full flex items-center justify-between gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-left font-medium text-gray-900 hover:border-airbnb-red focus:outline-none focus:ring-2 focus:ring-airbnb-red"
                    >
                      <span className={!canPay ? 'text-gray-900' : ''}>{dateRangeLabel}</span>
                      <CalendarDaysIcon className="h-5 w-5 shrink-0 text-gray-900" />
                    </button>
                    {showCalendar && (
                      <div className="mt-3">
                        <Suspense fallback={<p className="text-base text-gray-900">Loading calendar…</p>}>
                          <AvailabilityCalendar
                            embedded
                            roomId={villa.id}
                            selectedStartDate={checkIn}
                            selectedEndDate={checkOut && checkOut > checkIn ? checkOut : undefined}
                            onDateSelect={handleDateSelect}
                          />
                        </Suspense>
                      </div>
                    )}
                    {dateError && <p className="mt-2 text-sm text-red-600 font-medium">{dateError}</p>}
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-base font-bold text-gray-900 mb-1">Villa rate</p>
                    {hasWeekendPricing ? (
                      <>
                        {canPay && (
                          <p className="text-xl font-bold text-gray-900 mb-2">
                            {formatPrice(selectedNightlyRate)}
                            <span className="text-base font-medium text-gray-900"> / night</span>
                            <span className="block text-xs font-normal text-gray-600 mt-0.5">
                              Average for your selected dates
                            </span>
                          </p>
                        )}
                        <p
                          className={`text-sm mt-1 ${
                            canPay && pricing.weekdayNights > 0
                              ? 'font-semibold text-gray-900'
                              : 'text-gray-700'
                          }`}
                        >
                          Weekday (Sun–Fri): {formatPrice(villa.price_per_night)} / night
                        </p>
                        <p
                          className={`text-sm mt-1 ${
                            canPay && pricing.weekendNights > 0
                              ? 'font-semibold text-gray-900'
                              : 'text-gray-700'
                          }`}
                        >
                          Weekend (Sat & holidays): {formatPrice(villa.weekend_price_per_night!)} / night
                        </p>
                        {canPay && (
                          <p className="text-xs text-gray-600 mt-2">
                            Selected stay includes {pricing.weekendNights} weekend/holiday night
                            {pricing.weekendNights !== 1 ? 's' : ''} and {pricing.weekdayNights}{' '}
                            weekday night{pricing.weekdayNights !== 1 ? 's' : ''}.
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-xl font-bold text-gray-900">
                        {formatPrice(villa.price_per_night)}
                        <span className="text-base font-medium text-gray-900"> / night</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-base font-bold text-gray-900 mb-2">Guest count</label>
                    <p className="text-sm text-gray-600 mb-2">
                      {guestsIncluded} guest{guestsIncluded !== 1 ? 's' : ''} included in base price.
                      {pricing.extraGuests > 0
                        ? ` ${pricing.extraGuests} extra at ${formatPrice(extraPersonCharge)}/night each.`
                        : ` Extra guests above ${guestsIncluded} are ${formatPrice(extraPersonCharge)}/night each.`}
                    </p>
                    <input
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={guestInput}
                      onChange={(e) => {
                        const next = e.target.value;
                        if (next === '') {
                          setGuestInput('');
                          return;
                        }
                        if (!/^\d+$/.test(next)) return;
                        setGuestInput(next);
                      }}
                      onBlur={() => {
                        if (!guestInput) return;
                        setGuestInput(String(guestCount));
                      }}
                      className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-red font-medium"
                    />
                  </div>

                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-base text-amber-950">
                    <p className="font-bold mb-2">Booking terms</p>
                    <ul className="list-disc pl-5 space-y-1 text-amber-900">
                      <li>{checkInOutSummary}</li>
                      <li>Valid government ID required at check-in</li>
                      <li>No smoking inside the villa</li>
                      <li>Modifications subject to availability — contact us 24h before arrival</li>
                      <li>Free cancellation up to 24 hours before check-in</li>
                    </ul>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Personal information</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="First name"
                          {...form.register('firstName')}
                          error={form.formState.errors.firstName?.message}
                        />
                        <Input
                          label="Last name"
                          {...form.register('lastName')}
                          error={form.formState.errors.lastName?.message}
                        />
                      </div>
                      <Input
                        label="Email"
                        type="email"
                        startIcon={<EnvelopeIcon className="h-5 w-5" />}
                        {...form.register('email')}
                        error={form.formState.errors.email?.message}
                      />
                      <Input
                        label="Phone"
                        type="tel"
                        className="phone-number"
                        startIcon={<PhoneIcon className="h-5 w-5" />}
                        {...form.register('phone')}
                        error={form.formState.errors.phone?.message}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-base font-bold text-gray-900 mb-2">Special requests</label>
                    <textarea
                      {...form.register('specialRequests')}
                      rows={4}
                      placeholder="Any special requirements or requests..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-red resize-none text-gray-900"
                    />
                  </div>

                  <div className="rounded-xl border border-sky-200 bg-sky-50 p-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Price breakdown</h3>
                    {nights < 1 ? (
                      <p className="text-base text-gray-900">Select dates to see pricing.</p>
                    ) : (
                      <PriceBreakdown
                        lines={priceLines}
                        subtotalClassName="border-sky-200"
                        totalClassName="border-sky-300 text-sky-900"
                      />
                    )}
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      {...form.register('agreeToTerms')}
                      className="mt-1 h-4 w-4 text-airbnb-red focus:ring-airbnb-red border-gray-300 rounded"
                    />
                    <p className="text-base text-gray-900">
                      I agree to the{' '}
                      <Link to="/terms" className="text-airbnb-red font-semibold hover:underline">
                        terms &amp; conditions
                      </Link>{' '}
                      and authorize {settings.resortName} to process this reservation.
                    </p>
                  </div>
                  {form.formState.errors.agreeToTerms && (
                    <p className="text-red-600 text-sm">{form.formState.errors.agreeToTerms.message}</p>
                  )}

                  {(isPaymentDemoMode() || isRazorpayTestKey()) && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                      <p className="font-semibold">{getPaymentModeLabel()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pay button */}
              <div className="px-6 md:px-8 pb-8">
                {paymentError && (
                  <p className="mb-4 text-red-600 text-sm font-medium bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                    {paymentError}
                  </p>
                )}
                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={isProcessing}
                  disabled={!canPay}
                  className="rounded-lg !bg-sky-600 hover:!bg-sky-700 text-white font-bold text-xl py-4 shadow-md"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <CreditCardIcon className="h-5 w-5" />
                    {isProcessing
                      ? 'Processing…'
                      : canPay
                        ? `Pay ${formatPrice(pricing.amountDueNow)} now (${BOOKING_ADVANCE_PAYMENT_PERCENT}% deposit)`
                        : 'Select dates to continue'}
                  </span>
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </PublicLayout>
  );
};

export default BookingPage;

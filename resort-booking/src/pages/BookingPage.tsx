import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addDays, differenceInCalendarDays, format } from 'date-fns';
import {
  ChevronLeftIcon,
  CreditCardIcon,
  MapPinIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import PublicLayout from '../components/layout/PublicLayout';
import AnimatedSection from '../components/ui/AnimatedSection';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { formatPrice } from '../data/resort';
import { useSiteData } from '../context/SiteDataContext';
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

const BookingPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { getRoomById, settings, addBooking } = useSiteData();
  const villa = roomId ? getRoomById(roomId) : undefined;
  const extraGuestLimit = villa?.extra_guest_limit ?? 0;
  const maxTotalGuests = (villa?.max_guests ?? 0) + extraGuestLimit;

  const [checkIn, setCheckIn] = useState(toDateInputValue(addDays(new Date(), 1)));
  const [checkOut, setCheckOut] = useState(toDateInputValue(addDays(new Date(), 3)));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [dateError, setDateError] = useState('');
  const [paymentError, setPaymentError] = useState('');

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { agreeToTerms: false },
  });

  const nights = useMemo(() => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = differenceInCalendarDays(end, start);
    return diff > 0 ? diff : 0;
  }, [checkIn, checkOut]);

  const pricing = useMemo(() => {
    if (!villa || nights < 1) {
      return { base: 0, extraGuest: 0, cleaning: 0, service: 0, taxes: 0, total: 0 };
    }
    const extraGuests = Math.max(0, adults + children - villa.max_guests);
    const extraGuestRate = villa.extra_guest_cost ?? 0;
    const extraGuest = extraGuests * extraGuestRate * nights;
    const base = villa.price_per_night * nights;
    const cleaning = 750;
    const service = Math.round((base + extraGuest) * 0.08);
    const taxes = Math.round((base + extraGuest + cleaning + service) * 0.05);
    const total = base + extraGuest + cleaning + service + taxes;
    return { base, extraGuest, cleaning, service, taxes, total };
  }, [villa, nights, adults, children]);

  const validateDates = () => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setDateError('Please select valid dates.');
      return false;
    }
    if (end <= start) {
      setDateError('Check-out must be after check-in.');
      return false;
    }
    if (adults < 1) {
      setDateError('At least one adult is required.');
      return false;
    }
    if (villa && adults + children > maxTotalGuests) {
      setDateError(`This villa allows up to ${maxTotalGuests} guests.`);
      return false;
    }
    setDateError('');
    return true;
  };

  const handleBooking = async (data: BookingFormData) => {
    if (!villa || !validateDates()) return;

    setPaymentError('');
    setIsProcessing(true);

    const receipt = `LON${Date.now().toString().slice(-8)}`;

    try {
      const order = await createRazorpayOrder({
        amountInr: pricing.total,
        receipt,
        notes: {
          villaId: villa.id,
          villaName: villa.name,
          checkIn,
          checkOut,
        },
      });

      const payment = await openRazorpayCheckout({
        order,
        description: `${villa.name} · ${nights} night${nights !== 1 ? 's' : ''}`,
        prefill: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          contact: data.phone,
        },
        notes: {
          villa: villa.name,
          guests: String(adults + children),
        },
      });

      await verifyRazorpayPayment({
        orderId: payment.razorpay_order_id,
        paymentId: payment.razorpay_payment_id,
        signature: payment.razorpay_signature,
      });

      addBooking({
        bookingRef: receipt,
        roomId: villa.id,
        roomName: villa.name,
        guestName: `${data.firstName} ${data.lastName}`,
        guestEmail: data.email,
        checkIn,
        checkOut,
        guests: adults + children,
        total: pricing.total,
        status: 'confirmed',
      });

      setBookingId(receipt);
      setPaymentId(payment.razorpay_payment_id);
      setShowConfirmation(true);
    } catch (error) {
      setPaymentError(handleRazorpayError(error));
    } finally {
      setIsProcessing(false);
    }
  };

  if (!villa) {
    return (
      <PublicLayout currentPage="villas">
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="font-heading text-3xl text-gray-900 mb-4">Villa not found</h1>
          <Link to="/villas" className="text-airbnb-red font-bold hover:underline">
            ← Back to all villas
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const minCheckOut = toDateInputValue(addDays(new Date(checkIn), 1));
  const today = toDateInputValue(new Date());

  return (
    <PublicLayout currentPage="villas">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          type="button"
          onClick={() => navigate(`/villas/${villa.id}`)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-airbnb-red font-bold mb-6 transition-colors"
        >
          <ChevronLeftIcon className="h-5 w-5" />
          Back to villa
        </button>

        <AnimatedSection>
          <h1 className="font-heading text-4xl md:text-5xl text-gray-900 mb-2">Reserve this villa</h1>
          <p className="text-lg text-gray-600 mb-8">
            Complete your booking for <span className="font-semibold">{villa.name}</span>
          </p>
        </AnimatedSection>

        <form onSubmit={form.handleSubmit(handleBooking)}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              {/* Trip details */}
              <AnimatedSection delay={50}>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <h2 className="font-heading text-2xl text-gray-900 mb-6 uppercase tracking-wide">Your trip</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Check in</label>
                      <input
                        type="date"
                        value={checkIn}
                        min={today}
                        onChange={(e) => {
                          setCheckIn(e.target.value);
                          if (e.target.value >= checkOut) {
                            setCheckOut(toDateInputValue(addDays(new Date(e.target.value), 1)));
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-red font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Check out</label>
                      <input
                        type="date"
                        value={checkOut}
                        min={minCheckOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-red font-medium"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Adults</label>
                      <select
                        value={adults}
                        onChange={(e) => setAdults(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-red font-medium bg-white"
                      >
                        {Array.from({ length: Math.max(1, maxTotalGuests) }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n} adult{n > 1 ? 's' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Children</label>
                      <select
                        value={children}
                        onChange={(e) => setChildren(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-red font-medium bg-white"
                      >
                        {Array.from({ length: Math.max(1, maxTotalGuests + 1) }, (_, i) => i).map((n) => (
                          <option key={n} value={n}>
                            {n} child{n !== 1 ? 'ren' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {nights > 0 && (
                    <p className="mt-4 text-base text-gray-600 font-medium">
                      {nights} night{nights !== 1 ? 's' : ''} · {adults + children} guest
                      {adults + children !== 1 ? 's' : ''} (max {maxTotalGuests})
                    </p>
                  )}
                  {dateError && <p className="mt-3 text-sm text-red-600 font-medium">{dateError}</p>}
                </div>
              </AnimatedSection>

              {/* Guest info */}
              <AnimatedSection delay={100}>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <h2 className="font-heading text-2xl text-gray-900 mb-6 uppercase tracking-wide">
                    Guest details
                  </h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      label="Email address"
                      type="email"
                      {...form.register('email')}
                      error={form.formState.errors.email?.message}
                      helperText="Confirmation will be sent here"
                    />
                    <Input
                      label="Phone number"
                      type="tel"
                      {...form.register('phone')}
                      error={form.formState.errors.phone?.message}
                      helperText="For booking updates and check-in coordination"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special requests (optional)
                      </label>
                      <textarea
                        {...form.register('specialRequests')}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-red resize-none"
                        placeholder="Early check-in, dietary needs, celebration setup…"
                      />
                    </div>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        {...form.register('agreeToTerms')}
                        className="mt-1 h-4 w-4 text-airbnb-red focus:ring-airbnb-red border-gray-300 rounded"
                      />
                      <p className="text-sm text-gray-600">
                        I agree to the cancellation policy and authorize {settings.resortName} to process this
                        reservation request.
                      </p>
                    </div>
                    {form.formState.errors.agreeToTerms && (
                      <p className="text-red-600 text-sm">{form.formState.errors.agreeToTerms.message}</p>
                    )}
                  </div>
                </div>
              </AnimatedSection>

              {/* Payment */}
              <AnimatedSection delay={150}>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <h2 className="font-heading text-2xl text-gray-900 mb-6 uppercase tracking-wide">Payment</h2>

                  {(isPaymentDemoMode || isRazorpayTestKey()) && (
                    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      <p className="font-semibold">{getPaymentModeLabel()}</p>
                      {isPaymentDemoMode ? (
                        <p className="mt-1 text-amber-800">
                          Click pay to confirm a simulated booking — no Razorpay account or card needed.
                        </p>
                      ) : (
                        <p className="mt-1 text-amber-800">
                          Use Razorpay test card <span className="font-mono">4111 1111 1111 1111</span> with any
                          future expiry and CVV.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <CreditCardIcon className="h-6 w-6 text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Pay securely with Razorpay</p>
                        <p className="text-sm text-gray-600">
                          UPI, cards, netbanking, and wallets — powered by Razorpay
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="flex items-center gap-2 mt-4 text-sm text-gray-600">
                    <ShieldCheckIcon className="h-5 w-5 text-green-600 shrink-0" />
                    You will complete payment in the Razorpay secure checkout window
                  </p>
                </div>
              </AnimatedSection>

              {paymentError && (
                <p className="text-red-600 text-sm font-medium bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                  {paymentError}
                </p>
              )}

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={isProcessing}
                disabled={nights < 1}
                className="rounded-full btn-primary-motion"
              >
                {isProcessing
                  ? isPaymentDemoMode
                    ? 'Processing test payment…'
                    : 'Opening Razorpay…'
                  : nights < 1
                    ? 'Select valid dates'
                    : isPaymentDemoMode
                      ? `Complete test booking · ${formatPrice(pricing.total)}`
                      : `Pay ${formatPrice(pricing.total)} with Razorpay`}
              </Button>
            </div>

            {/* Summary */}
            <div className="lg:col-span-2">
              <AnimatedSection delay={80} variant="slide-left">
                <div className="lg:sticky lg:top-24 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                  <img
                    src={getPrimaryImage(villa.images, 'https://via.placeholder.com/900x500?text=Villa')}
                    alt={villa.name}
                    className="w-full h-44 object-cover"
                  />
                  <div className="p-6">
                    <span className="text-xs font-bold uppercase tracking-wide text-airbnb-red">
                      {villa.room_type}
                    </span>
                    <h3 className="font-heading text-xl text-gray-900 mt-1 mb-2">{villa.name}</h3>
                    <p className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                      <MapPinIcon className="h-4 w-4 shrink-0 text-airbnb-red mt-0.5" />
                      {villa.location}
                    </p>
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-800 mb-6">
                      <StarSolidIcon className="h-4 w-4 text-yellow-400" />
                      {villa.rating} · {villa.review_count} reviews
                    </div>

                    <h4 className="font-heading text-lg text-gray-900 mb-4 uppercase tracking-wide">
                      Price details
                    </h4>
                    {nights < 1 ? (
                      <p className="text-gray-500 text-sm">Select check-in and check-out to see pricing.</p>
                    ) : (
                      <div className="space-y-3 text-base">
                        <div className="flex justify-between text-gray-700">
                          <span>
                            {formatPrice(villa.price_per_night)} × {nights} night{nights !== 1 ? 's' : ''}
                          </span>
                          <span className="font-medium text-gray-900">{formatPrice(pricing.base)}</span>
                        </div>
                        {pricing.extraGuest > 0 && (
                          <div className="flex justify-between text-gray-700">
                            <span>
                              Extra guest charge ({Math.max(0, adults + children - villa.max_guests)} guest
                              {Math.max(0, adults + children - villa.max_guests) !== 1 ? 's' : ''})
                            </span>
                            <span className="font-medium text-gray-900">{formatPrice(pricing.extraGuest)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-gray-700">
                          <span>Cleaning fee</span>
                          <span className="font-medium text-gray-900">{formatPrice(pricing.cleaning)}</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                          <span>Service fee</span>
                          <span className="font-medium text-gray-900">{formatPrice(pricing.service)}</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                          <span>GST (5%)</span>
                          <span className="font-medium text-gray-900">{formatPrice(pricing.taxes)}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg text-gray-900">
                          <span>Total</span>
                          <span>{formatPrice(pricing.total)}</span>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 pt-6 border-t border-gray-100 space-y-2 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <UserGroupIcon className="h-4 w-4 text-airbnb-red" />
                        Up to {villa.max_guests} guests included
                        {extraGuestLimit > 0 ? ` (+${extraGuestLimit} extra)` : ''}
                      </p>
                      {villa.check_in_time && villa.check_out_time && (
                        <p className="flex items-center gap-2">
                          <CheckCircleIcon className="h-4 w-4 text-green-600" />
                          Check-in {villa.check_in_time} · Check-out {villa.check_out_time}
                        </p>
                      )}
                      {(villa.refundable_security_deposit ?? 0) > 0 && (
                        <p className="flex items-center gap-2">
                          <ShieldCheckIcon className="h-4 w-4 text-green-600" />
                          Refundable security deposit: {formatPrice(villa.refundable_security_deposit ?? 0)}
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                        Free cancellation up to 24h before check-in
                      </p>
                      <p className="flex items-center gap-2">
                        <ShieldCheckIcon className="h-4 w-4 text-green-600" />
                        Managed by {settings.resortName}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </form>
      </div>

      <Modal isOpen={showConfirmation} onClose={() => navigate('/bookings')} size="lg" showCloseButton={false}>
        <div className="text-center py-6 px-2">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="font-heading text-3xl text-gray-900 mb-2">Booking confirmed</h2>
          <p className="text-gray-600 mb-2">
            Your stay at <strong>{villa.name}</strong> is reserved.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            {format(new Date(checkIn), 'MMM d, yyyy')} – {format(new Date(checkOut), 'MMM d, yyyy')} ·{' '}
            {adults + children} guest{adults + children !== 1 ? 's' : ''}
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Confirmation code</p>
            <p className="font-mono text-xl font-bold text-gray-900">{bookingId}</p>
            <p className="text-sm text-gray-500 mt-2">Total paid: {formatPrice(pricing.total)}</p>
            {paymentId && (
              <p className="text-xs text-gray-400 mt-1 font-mono">Payment ID: {paymentId}</p>
            )}
          </div>
          <div className="space-y-3">
            <Button fullWidth size="lg" className="rounded-full" onClick={() => navigate('/bookings')}>
              View my bookings
            </Button>
            <Button variant="outline" fullWidth size="lg" className="rounded-full" onClick={() => navigate('/')}>
              Back to home
            </Button>
          </div>
        </div>
      </Modal>
    </PublicLayout>
  );
};

export default BookingPage;

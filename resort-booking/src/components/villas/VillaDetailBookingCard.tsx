import React, { useMemo, useState } from 'react';
import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import VillaCardPrice from './VillaCardPrice';
import {
  BOOKING_ADVANCE_PAYMENT_PERCENT,
  calcAmountDueNow,
  computeStayPricing,
  type VillaCardPriceDisplay,
} from '../../lib/bookingPricing';
import { formatPrice } from '../../data/resort';
import type { Room } from '../../data/resort';
import { useSiteBookings } from '../../context/SiteDataContext';
import { notify } from '../../lib/notify';
import {
  checkRoomAvailability,
  getTodayIso,
  isStayRangeAvailable,
  validateCheckInInput,
  validateCheckOutInput,
} from '../../lib/availability';
import { clampGuestCount, getVillaFinalCapacity } from '../../lib/villaCapacity';

type VillaDetailBookingCardProps = {
  room: Room;
  checkIn: string;
  checkOut: string;
  guestInput: string;
  onCheckInChange: (value: string) => void;
  onCheckOutChange: (value: string) => void;
  onGuestChange: (value: string) => void;
  onBook: () => void;
  priceDisplay: VillaCardPriceDisplay;
  extraPersonCharge: number;
  pricingHolidays?: string[];
  onToggleCalendar?: () => void;
};

const VillaDetailBookingCard: React.FC<VillaDetailBookingCardProps> = ({
  room,
  checkIn,
  checkOut,
  guestInput,
  onCheckInChange,
  onCheckOutChange,
  onGuestChange,
  onBook,
  priceDisplay,
  extraPersonCharge,
  pricingHolidays,
  onToggleCalendar,
}) => {
  const { bookings, blockedDates } = useSiteBookings();
  const [dateError, setDateError] = useState('');

  const nights = useMemo(() => {
    if (!checkIn || !checkOut || checkOut <= checkIn) return 0;
    return differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn));
  }, [checkIn, checkOut]);

  const guestCount = useMemo(() => clampGuestCount(room, Number(guestInput)), [room, guestInput]);

  const maxGuestCapacity = getVillaFinalCapacity(room);

  const pricing = useMemo(
    () =>
      computeStayPricing({
        pricePerNight: room.price_per_night,
        weekendPricePerNight: room.weekend_price_per_night,
        checkInDate: checkIn,
        pricingHolidays,
        nights: Math.max(nights, 0),
        guestCount,
        guestsIncluded: room.max_guests,
        extraPersonCharge,
      }),
    [room, checkIn, nights, guestCount, extraPersonCharge, pricingHolidays, checkOut],
  );

  const stayAvailable = useMemo(
    () => isStayRangeAvailable(room.id, checkIn, checkOut, bookings, blockedDates),
    [room.id, checkIn, checkOut, bookings, blockedDates],
  );

  const availabilityMessage = useMemo(() => {
    if (!checkIn || !checkOut || checkOut <= checkIn) return '';
    if (!stayAvailable) {
      return 'Selected dates overlap with existing bookings or blocked dates.';
    }
    return '';
  }, [checkIn, checkOut, stayAvailable]);

  const displayDateError = dateError || availabilityMessage;

  const canBook = nights >= 1 && checkOut > checkIn && stayAvailable;
  const amountDueNow = canBook ? pricing.amountDueNow : calcAmountDueNow(0);
  const balanceDue = canBook ? pricing.balanceDue : 0;

  const maxGuestOptions = maxGuestCapacity;
  const todayIso = getTodayIso();
  const checkOutMin = checkIn ? format(addDays(parseISO(checkIn), 1), 'yyyy-MM-dd') : todayIso;

  const handleCheckInChange = (value: string) => {
    const result = validateCheckInInput(room.id, value, checkOut, bookings, blockedDates);
    if (!result.valid) {
      setDateError(result.reason);
      notify.error(result.reason);
      return;
    }

    setDateError('');
    onCheckInChange(value);

    if (checkOut && value && checkOut > value) {
      const range = checkRoomAvailability(room.id, value, checkOut, bookings, blockedDates);
      if (!range.available) {
        onCheckOutChange('');
      }
    }
  };

  const handleCheckOutChange = (value: string) => {
    const result = validateCheckOutInput(room.id, checkIn, value, bookings, blockedDates);
    if (!result.valid) {
      setDateError(result.reason);
      notify.error(result.reason);
      return;
    }

    setDateError('');
    onCheckOutChange(value);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
      <div className="mb-4">
        <VillaCardPrice display={priceDisplay} />
      </div>

      <div className="rounded-xl border border-gray-300 overflow-hidden mb-4">
        <div className="grid grid-cols-2 divide-x divide-gray-300">
          <label className="p-3 hover:bg-gray-50 cursor-pointer">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-700">Check-in</span>
            <input
              type="date"
              value={checkIn}
              min={todayIso}
              onChange={(e) => handleCheckInChange(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none villa-detail-date"
            />
          </label>
          <label className="p-3 hover:bg-gray-50 cursor-pointer">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-700">Check-out</span>
            <input
              type="date"
              value={checkOut}
              min={checkOutMin}
              onChange={(e) => handleCheckOutChange(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none villa-detail-date"
            />
          </label>
        </div>
        <div className="border-t border-gray-300 p-3">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-1">Guests</span>
          <select
            value={guestInput || String(guestCount)}
            onChange={(e) => onGuestChange(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none cursor-pointer"
          >
            {Array.from({ length: maxGuestOptions }, (_, i) => i + 1).map((n) => (
              <option key={n} value={String(n)}>
                {n} guest{n !== 1 ? 's' : ''}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">Maximum {maxGuestCapacity} guest{maxGuestCapacity !== 1 ? 's' : ''} for this villa</p>
        </div>
      </div>

      {displayDateError && (
        <p className="mb-3 text-sm text-red-600 font-medium" role="alert">
          {displayDateError}
        </p>
      )}

      {onToggleCalendar && (
        <button
          type="button"
          onClick={onToggleCalendar}
          className="mb-4 w-full flex items-center justify-center gap-2 rounded-lg border border-gray-900 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
        >
          <CalendarDaysIcon className="h-4 w-4" />
          Check availability
        </button>
      )}

      {canBook && (
        <div className="space-y-3 mb-5 pb-5 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            Base price includes {room.max_guests} guest{room.max_guests !== 1 ? 's' : ''}
          </p>

          {pricing.weekdayNights > 0 && (
            <div className="flex justify-between text-sm text-gray-900">
              <span>
                {formatPrice(room.price_per_night)} × {pricing.weekdayNights} weekday night
                {pricing.weekdayNights !== 1 ? 's' : ''}
              </span>
              <span className="font-medium">
                {formatPrice(room.price_per_night * pricing.weekdayNights)}
              </span>
            </div>
          )}
          {pricing.weekendNights > 0 && room.weekend_price_per_night && (
            <div className="flex justify-between text-sm text-gray-900">
              <span>
                {formatPrice(room.weekend_price_per_night)} × {pricing.weekendNights} weekend night
                {pricing.weekendNights !== 1 ? 's' : ''}
              </span>
              <span className="font-medium">
                {formatPrice(room.weekend_price_per_night * pricing.weekendNights)}
              </span>
            </div>
          )}
          {pricing.weekdayNights === 0 && pricing.weekendNights === 0 && nights > 0 && (
            <div className="flex justify-between text-sm text-gray-900">
              <span>
                {formatPrice(Math.round(pricing.basePrice / nights))} × {nights} night
                {nights !== 1 ? 's' : ''}
              </span>
              <span className="font-medium">{formatPrice(pricing.basePrice)}</span>
            </div>
          )}
          {pricing.extraGuests > 0 && (
            <div className="flex justify-between text-sm text-gray-900">
              <span>
                Extra guests ({pricing.extraGuests} × {formatPrice(extraPersonCharge)})
              </span>
              <span className="font-medium">{formatPrice(pricing.extraGuestsCharge)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-600">
            <span>Taxes &amp; fees</span>
            <span>Included</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>{formatPrice(pricing.total)}</span>
          </div>
        </div>
      )}

      {canBook && (
        <div className="rounded-xl bg-pink-50 border border-pink-100 p-4 mb-4 space-y-2 text-sm">
          <div className="flex justify-between font-semibold text-gray-900">
            <span>Advance ({BOOKING_ADVANCE_PAYMENT_PERCENT}%)</span>
            <span>{formatPrice(amountDueNow)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Balance ({100 - BOOKING_ADVANCE_PAYMENT_PERCENT}%) payable at check-in</span>
            <span>{formatPrice(balanceDue)}</span>
          </div>
        </div>
      )}

      <Button
        fullWidth
        size="lg"
        className="rounded-lg !bg-airbnb-red hover:!bg-airbnb-red-dark text-base font-bold"
        disabled={!canBook}
        onClick={onBook}
      >
        Book now
      </Button>
      <p className="text-center text-base text-gray-600 mt-3">You won&apos;t be charged yet</p>
    </div>
  );
};

export default VillaDetailBookingCard;

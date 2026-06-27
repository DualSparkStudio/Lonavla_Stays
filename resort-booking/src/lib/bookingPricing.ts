import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { formatPrice } from '../data/resort';
import type { BookingConfirmationData } from './bookingConfirmation';

/** Percentage of booking total collected online at checkout (deposit). */
export const BOOKING_ADVANCE_PAYMENT_PERCENT = 40;

export function calcAmountDueNow(total: number): number {
  return Math.round((total * BOOKING_ADVANCE_PAYMENT_PERCENT) / 100);
}

export function calcBalanceDue(total: number, amountPaid?: number): number {
  return Math.max(0, total - (amountPaid ?? calcAmountDueNow(total)));
}

export function calcExtraGuests(guestCount: number, guestsIncluded: number): number {
  return Math.max(0, guestCount - Math.max(1, guestsIncluded));
}

export type StayPricingInput = {
  pricePerNight: number;
  weekendPricePerNight?: number;
  checkInDate?: string;
  nights: number;
  /** YYYY-MM-DD dates charged at the weekend rate (in addition to Saturdays). */
  pricingHolidays?: string[];
  guestCount: number;
  /** Villa `max_guests` — guests covered by the base nightly rate */
  guestsIncluded: number;
  extraPersonCharge: number;
};

export type StayPricingResult = {
  nights: number;
  weekdayNights: number;
  weekendNights: number;
  basePrice: number;
  guestCount: number;
  guestsIncluded: number;
  extraGuests: number;
  extraGuestsCharge: number;
  total: number;
  amountDueNow: number;
  balanceDue: number;
  extraPersonCharge: number;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SATURDAY = 6;

export function normalizePricingHolidays(dates?: string[]): Set<string> {
  const set = new Set<string>();
  for (const raw of dates ?? []) {
    const d = raw.trim();
    if (ISO_DATE.test(d)) set.add(d);
  }
  return set;
}

/** Weekend rate applies on Saturdays and configured holidays; Sun–Fri are weekdays unless a holiday. */
export function isWeekendRateNight(date: Date, holidays: Set<string>): boolean {
  return date.getDay() === SATURDAY || holidays.has(format(date, 'yyyy-MM-dd'));
}

function splitStayNightsByRate(
  checkInDate: string,
  nights: number,
  holidays: Set<string>,
): {
  weekdayNights: number;
  weekendNights: number;
} {
  let weekendNights = 0;
  const start = parseISO(`${checkInDate}T12:00:00`);
  if (Number.isNaN(start.getTime())) {
    return { weekdayNights: nights, weekendNights: 0 };
  }
  for (let i = 0; i < nights; i += 1) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    if (isWeekendRateNight(current, holidays)) weekendNights += 1;
  }
  return { weekdayNights: nights - weekendNights, weekendNights };
}

export function computeStayPricing(input: StayPricingInput): StayPricingResult {
  const nights = Math.max(1, input.nights);
  const extraPersonCharge = input.extraPersonCharge;
  const weekendRate =
    input.weekendPricePerNight && input.weekendPricePerNight > 0
      ? input.weekendPricePerNight
      : input.pricePerNight;
  const { weekdayNights, weekendNights } =
    input.checkInDate && input.weekendPricePerNight && input.weekendPricePerNight > 0
      ? splitStayNightsByRate(
          input.checkInDate,
          nights,
          normalizePricingHolidays(input.pricingHolidays),
        )
      : { weekdayNights: nights, weekendNights: 0 };
  const basePrice = input.pricePerNight * weekdayNights + weekendRate * weekendNights;
  const extraGuests = calcExtraGuests(input.guestCount, input.guestsIncluded);
  const extraGuestsCharge = extraGuests * extraPersonCharge * nights;
  const total = basePrice + extraGuestsCharge;
  const amountDueNow = calcAmountDueNow(total);
  const balanceDue = total - amountDueNow;

  return {
    nights,
    weekdayNights,
    weekendNights,
    basePrice,
    guestCount: input.guestCount,
    guestsIncluded: input.guestsIncluded,
    extraGuests,
    extraGuestsCharge,
    total,
    amountDueNow,
    balanceDue,
    extraPersonCharge,
  };
}

export type BookingPriceBreakdownInput = {
  nights: number;
  basePrice: number;
  guestCount?: number;
  guestsIncluded?: number;
  extraGuests?: number;
  extraGuestsCharge?: number;
  /** @deprecated use extraGuestsCharge */
  adultsCharge?: number;
  extraPersonCharge?: number;
  total: number;
  amountDueNow?: number;
  balanceDue?: number;
  showPaymentSplit?: boolean;
  /** When true, deposit line reads "Paid 40%" instead of "Pay now (40%)" */
  paymentCompleted?: boolean;
};

export type PriceBreakdownLine = {
  key: string;
  label: string;
  detail?: string;
  amount: number;
  variant?: 'default' | 'subtotal' | 'total' | 'highlight';
};

export function buildBookingPriceBreakdown(input: BookingPriceBreakdownInput): PriceBreakdownLine[] {
  const extraGuestsCharge = input.extraGuestsCharge ?? input.adultsCharge ?? 0;
  const extraGuests = input.extraGuests ?? 0;
  const nights = Math.max(1, input.nights);
  const extraRate = input.extraPersonCharge ?? 0;

  const lines: PriceBreakdownLine[] = [
    { key: 'base', label: 'Villa price', amount: input.basePrice },
  ];

  if (extraGuestsCharge > 0) {
    lines.push({
      key: 'extra-guests',
      label: 'Extra guests',
      detail:
        extraGuests > 0 && extraRate > 0
          ? `${extraGuests} × ${formatPrice(extraRate)} × ${nights} night${nights !== 1 ? 's' : ''}`
          : undefined,
      amount: extraGuestsCharge,
    });
  }

  lines.push({
    key: 'total',
    label: 'Total amount',
    amount: input.total,
    variant: 'total',
  });

  if (input.showPaymentSplit) {
    const amountDueNow = input.amountDueNow ?? calcAmountDueNow(input.total);
    const balanceDue = input.balanceDue ?? calcBalanceDue(input.total, amountDueNow);
    lines.push(
      {
        key: 'pay-now',
        label: input.paymentCompleted
          ? `Paid (${BOOKING_ADVANCE_PAYMENT_PERCENT}%)`
          : `Pay now (${BOOKING_ADVANCE_PAYMENT_PERCENT}%)`,
        amount: amountDueNow,
        variant: input.paymentCompleted ? 'default' : 'highlight',
      },
      {
        key: 'balance',
        label: 'Balance due at check-in',
        amount: balanceDue,
        variant: 'default',
      },
    );
  }

  return lines;
}

export function breakdownFromStoredBooking(
  booking: {
    total: number;
    guests: number;
    checkIn: string;
    checkOut: string;
    basePrice?: number;
    guestsIncluded?: number;
    extraGuests?: number;
    extraGuestsCharge?: number;
    adultsCharge?: number;
    extraAdultsCharge?: number;
    pricingSubtotal?: number;
    amountPaid?: number;
    nights?: number;
  },
  settings: { extraPersonCharge?: number },
): BookingPriceBreakdownInput {
  const extraGuestsCharge =
    booking.extraGuestsCharge ?? booking.adultsCharge ?? booking.extraAdultsCharge ?? 0;
  const total = booking.pricingSubtotal ?? booking.total;
  const basePrice = booking.basePrice ?? Math.max(0, total - extraGuestsCharge);
  const extraPersonCharge = settings.extraPersonCharge ?? 1500;
  const guestsIncluded = booking.guestsIncluded ?? booking.guests;
  const extraGuests =
    booking.extraGuests ?? calcExtraGuests(booking.guests, guestsIncluded);

  let nights = booking.nights ?? 0;
  if (!nights) {
    try {
      nights = differenceInCalendarDays(parseISO(booking.checkOut), parseISO(booking.checkIn));
    } catch {
      nights = 1;
    }
  }

  const amountDueNow = booking.amountPaid ?? calcAmountDueNow(total);

  return {
    nights: Math.max(1, nights),
    basePrice,
    guestCount: booking.guests,
    guestsIncluded,
    extraGuests,
    extraGuestsCharge,
    extraPersonCharge,
    total,
    amountDueNow,
    balanceDue: calcBalanceDue(total, amountDueNow),
    showPaymentSplit: true,
    paymentCompleted: booking.amountPaid != null && booking.amountPaid > 0,
  };
}

export function breakdownFromConfirmation(
  data: BookingConfirmationData,
  settings?: { extraPersonCharge?: number },
): BookingPriceBreakdownInput {
  const extraPersonCharge = settings?.extraPersonCharge ?? 1500;
  const extraGuestsCharge = data.extraGuestsCharge ?? data.adultsCharge ?? 0;
  const guestsIncluded = data.guestsIncluded ?? data.guests;

  return {
    nights: data.nights,
    basePrice: data.basePrice,
    guestCount: data.guests,
    guestsIncluded,
    extraGuests: data.extraGuests ?? calcExtraGuests(data.guests, guestsIncluded),
    extraGuestsCharge,
    extraPersonCharge,
    total: data.total,
    amountDueNow: data.amountPaid ?? calcAmountDueNow(data.total),
    balanceDue: data.balanceDue ?? calcBalanceDue(data.total, data.amountPaid),
    showPaymentSplit: true,
    paymentCompleted: data.paymentCompleted,
  };
}

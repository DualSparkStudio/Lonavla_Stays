import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { formatPrice } from '../data/resort';
import type { BookingConfirmationData } from './bookingConfirmation';
import type { CustomDatePrice } from '../types/site';

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
  /** Custom date-range prices from admin (override weekday/weekend for matching nights). */
  customDatePrices?: CustomDatePrice[];
  /** Villa listing id — required when customDatePrices may apply */
  roomId?: string;
  guestCount: number;
  /** Villa `max_guests` — guests covered by the base nightly rate */
  guestsIncluded: number;
  extraPersonCharge: number;
};

export type StayPricingResult = {
  nights: number;
  weekdayNights: number;
  weekendNights: number;
  /** Nights billed at a custom admin rate */
  specialRateNights: number;
  /** Subtotal for special-rate nights only */
  specialRateSubtotal: number;
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

export function normalizePricingHolidays(dates?: string[]): Set<string> {
  const set = new Set<string>();
  for (const raw of dates ?? []) {
    const d = raw.trim();
    if (ISO_DATE.test(d)) set.add(d);
  }
  return set;
}

/** Best matching custom price for one stay night (villa-specific beats site-wide). */
export function findCustomPriceForNight(
  dateStr: string,
  roomId: string,
  rules: CustomDatePrice[] | undefined,
): CustomDatePrice | null {
  if (!rules?.length || !ISO_DATE.test(dateStr)) return null;

  const matching = rules.filter(
    (rule) =>
      dateStr >= rule.startDate &&
      dateStr <= rule.endDate &&
      rule.pricePerNight > 0 &&
      (!rule.roomId || rule.roomId === roomId),
  );
  if (!matching.length) return null;

  const villaSpecific = matching.filter((rule) => rule.roomId === roomId);
  const pool = villaSpecific.length ? villaSpecific : matching.filter((rule) => !rule.roomId);
  return pool[pool.length - 1] ?? null;
}

function splitStayNightsByRateWithCustom(
  checkInDate: string,
  nights: number,
  roomId: string,
  pricePerNight: number,
  weekendPricePerNight: number | undefined,
  holidays: Set<string>,
  customDatePrices: CustomDatePrice[] | undefined,
): {
  weekdayNights: number;
  weekendNights: number;
  specialRateNights: number;
  specialRateSubtotal: number;
  basePrice: number;
} {
  let weekdayNights = 0;
  let weekendNights = 0;
  let specialRateNights = 0;
  let specialRateSubtotal = 0;
  let basePrice = 0;

  const weekendRate =
    weekendPricePerNight && weekendPricePerNight > 0 ? weekendPricePerNight : pricePerNight;

  const start = parseISO(`${checkInDate}T12:00:00`);
  if (Number.isNaN(start.getTime())) {
    return {
      weekdayNights: nights,
      weekendNights: 0,
      specialRateNights: 0,
      specialRateSubtotal: 0,
      basePrice: pricePerNight * nights,
    };
  }

  for (let i = 0; i < nights; i += 1) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    const dateStr = format(current, 'yyyy-MM-dd');
    const custom = roomId ? findCustomPriceForNight(dateStr, roomId, customDatePrices) : null;

    if (custom) {
      specialRateNights += 1;
      specialRateSubtotal += custom.pricePerNight;
      basePrice += custom.pricePerNight;
    } else if (isWeekendRateNight(current, holidays)) {
      weekendNights += 1;
      basePrice += weekendRate;
    } else {
      weekdayNights += 1;
      basePrice += pricePerNight;
    }
  }

  return { weekdayNights, weekendNights, specialRateNights, specialRateSubtotal, basePrice };
}

function isWeekendDay(date: Date): boolean {
  return date.getDay() === 6;
}

/** Weekend rate applies on Saturdays and configured pricing holidays; Sun–Fri are weekdays unless a holiday. */
export function isWeekendRateNight(date: Date, holidays: Set<string>): boolean {
  return isWeekendDay(date) || holidays.has(format(date, 'yyyy-MM-dd'));
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

export type StayRateDisplayMode = 'none' | 'weekday' | 'weekend' | 'both';

/** Classify selected check-in → check-out nights for listing/booking price display. */
export function analyzeStayRateNights(
  checkIn: string,
  checkOut: string,
  pricingHolidays?: string[],
): { weekdayNights: number; weekendNights: number; mode: StayRateDisplayMode } {
  if (!checkIn || !checkOut || checkOut <= checkIn) {
    return { weekdayNights: 0, weekendNights: 0, mode: 'none' };
  }

  const nights = differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn));
  if (nights < 1) {
    return { weekdayNights: 0, weekendNights: 0, mode: 'none' };
  }

  const { weekdayNights, weekendNights } = splitStayNightsByRate(
    checkIn,
    nights,
    normalizePricingHolidays(pricingHolidays),
  );

  let mode: StayRateDisplayMode = 'none';
  if (weekdayNights > 0 && weekendNights > 0) mode = 'both';
  else if (weekendNights > 0) mode = 'weekend';
  else if (weekdayNights > 0) mode = 'weekday';

  return { weekdayNights, weekendNights, mode };
}

/** Rate mode for browse views when the guest has not picked stay dates yet. */
export function getBrowseRateMode(pricingHolidays?: string[]): 'weekday' | 'weekend' {
  const holidays = normalizePricingHolidays(pricingHolidays);
  return isWeekendRateNight(new Date(), holidays) ? 'weekend' : 'weekday';
}

/** Villa card / listing rate: selected stay dates when present, otherwise today's rate. */
export function resolveVillaCardRateMode(
  checkIn: string,
  checkOut: string,
  pricingHolidays?: string[],
): StayRateDisplayMode {
  if (checkIn && checkOut && checkOut > checkIn) {
    return analyzeStayRateNights(checkIn, checkOut, pricingHolidays).mode;
  }
  return getBrowseRateMode(pricingHolidays);
}

export type VillaCardPriceDisplay =
  | { kind: 'single'; amount: number }
  | { kind: 'dual'; weekdayAmount: number; weekendAmount: number };

export function getVillaCardPriceDisplay(
  pricePerNight: number,
  weekendPricePerNight: number | undefined,
  stayMode: StayRateDisplayMode,
): VillaCardPriceDisplay {
  const weekdayAmount = pricePerNight;
  const hasWeekendRate = Boolean(weekendPricePerNight && weekendPricePerNight > 0);
  const weekendAmount = hasWeekendRate ? weekendPricePerNight! : weekdayAmount;

  if (stayMode === 'weekend') {
    return { kind: 'single', amount: weekendAmount };
  }
  if (stayMode === 'weekday' || stayMode === 'none') {
    return { kind: 'single', amount: weekdayAmount };
  }
  if (weekendAmount !== weekdayAmount) {
    return { kind: 'dual', weekdayAmount, weekendAmount };
  }
  return { kind: 'single', amount: weekdayAmount };
}

export function computeStayPricing(input: StayPricingInput): StayPricingResult {
  const nights = Math.max(1, input.nights);
  const extraPersonCharge = input.extraPersonCharge;
  const roomId = input.roomId ?? '';

  const nightSplit =
    input.checkInDate
      ? splitStayNightsByRateWithCustom(
          input.checkInDate,
          nights,
          roomId,
          input.pricePerNight,
          input.weekendPricePerNight,
          normalizePricingHolidays(input.pricingHolidays),
          input.customDatePrices,
        )
      : {
          weekdayNights: nights,
          weekendNights: 0,
          specialRateNights: 0,
          specialRateSubtotal: 0,
          basePrice: input.pricePerNight * nights,
        };

  const { weekdayNights, weekendNights, specialRateNights, specialRateSubtotal, basePrice } =
    nightSplit;
  const extraGuests = calcExtraGuests(input.guestCount, input.guestsIncluded);
  const extraGuestsCharge = extraGuests * extraPersonCharge * nights;
  const total = basePrice + extraGuestsCharge;
  const amountDueNow = calcAmountDueNow(total);
  const balanceDue = total - amountDueNow;

  return {
    nights,
    weekdayNights,
    weekendNights,
    specialRateNights,
    specialRateSubtotal,
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

import { differenceInCalendarDays, parseISO } from 'date-fns';
import { formatPrice } from '../data/resort';
import type { BookingConfirmationData } from './bookingConfirmation';

export type BookingPriceBreakdownInput = {
  nights: number;
  basePrice: number;
  extraAdults?: number;
  children?: number;
  extraAdultsCharge?: number;
  childrenCharge?: number;
  extraPersonCharge?: number;
  childChargePerNight?: number;
  subtotal: number;
  gst: number;
  gstPercent: number;
  total: number;
};

export type PriceBreakdownLine = {
  key: string;
  label: string;
  detail?: string;
  amount: number;
  variant?: 'default' | 'subtotal' | 'total';
};

function unitRate(total: number, count: number, nights: number, fallback?: number) {
  if (fallback != null && fallback > 0) return fallback;
  if (count <= 0 || nights <= 0) return 0;
  return Math.round(total / (count * nights));
}

export function buildBookingPriceBreakdown(input: BookingPriceBreakdownInput): PriceBreakdownLine[] {
  const extraAdultsCharge = input.extraAdultsCharge ?? 0;
  const childrenCharge = input.childrenCharge ?? 0;
  const extraAdults = input.extraAdults ?? 0;
  const children = input.children ?? 0;
  const nights = Math.max(1, input.nights);

  const adultRate = unitRate(extraAdultsCharge, extraAdults, nights, input.extraPersonCharge);
  const childRate = unitRate(childrenCharge, children, nights, input.childChargePerNight);

  const lines: PriceBreakdownLine[] = [
    { key: 'base', label: 'Base price', amount: input.basePrice },
  ];

  if (extraAdultsCharge > 0) {
    lines.push({
      key: 'extra-adults',
      label: 'Extra adults',
      detail: `${extraAdults} × ${formatPrice(adultRate)}`,
      amount: extraAdultsCharge,
    });
  }

  if (childrenCharge > 0) {
    lines.push({
      key: 'children',
      label: 'Children above 5',
      detail: `${children} × ${formatPrice(childRate)}`,
      amount: childrenCharge,
    });
  }

  lines.push(
    { key: 'subtotal', label: 'Subtotal', amount: input.subtotal, variant: 'subtotal' },
    { key: 'gst', label: `GST (${input.gstPercent}%)`, amount: input.gst },
    { key: 'total', label: 'Total amount', amount: input.total, variant: 'total' },
  );

  return lines;
}

export function breakdownFromStoredBooking(
  booking: {
    total: number;
    checkIn: string;
    checkOut: string;
    basePrice?: number;
    extraAdults?: number;
    children?: number;
    extraAdultsCharge?: number;
    childrenCharge?: number;
    pricingSubtotal?: number;
    gst?: number;
    gstPercent?: number;
    nights?: number;
  },
  settings: { gstPercent?: number; extraPersonCharge?: number },
): BookingPriceBreakdownInput {
  const gstPercent = booking.gstPercent ?? settings.gstPercent ?? 18;
  const subtotal = booking.pricingSubtotal ?? Math.round(booking.total / (1 + gstPercent / 100));
  const gst = booking.gst ?? booking.total - subtotal;
  const extraAdultsCharge = booking.extraAdultsCharge ?? 0;
  const childrenCharge = booking.childrenCharge ?? 0;
  const basePrice =
    booking.basePrice ?? Math.max(0, subtotal - extraAdultsCharge - childrenCharge);
  const extraPersonCharge = settings.extraPersonCharge ?? 1500;

  let nights = booking.nights ?? 0;
  if (!nights) {
    try {
      nights = differenceInCalendarDays(parseISO(booking.checkOut), parseISO(booking.checkIn));
    } catch {
      nights = 1;
    }
  }

  return {
    nights: Math.max(1, nights),
    basePrice,
    extraAdults: booking.extraAdults,
    children: booking.children,
    extraAdultsCharge,
    childrenCharge,
    extraPersonCharge,
    childChargePerNight: Math.round(extraPersonCharge / 2),
    subtotal,
    gst,
    gstPercent,
    total: booking.total,
  };
}

export function breakdownFromConfirmation(
  data: BookingConfirmationData,
  settings?: { extraPersonCharge?: number },
): BookingPriceBreakdownInput {
  const extraPersonCharge = settings?.extraPersonCharge ?? 1500;
  return {
    nights: data.nights,
    basePrice: data.basePrice,
    extraAdults: data.extraAdults,
    children: data.children,
    extraAdultsCharge: data.extraAdultsCharge,
    childrenCharge: data.childrenCharge,
    extraPersonCharge,
    childChargePerNight: Math.round(extraPersonCharge / 2),
    subtotal: data.subtotal,
    gst: data.gst,
    gstPercent: data.gstPercent,
    total: data.total,
  };
}

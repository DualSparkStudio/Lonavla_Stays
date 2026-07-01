import { addDays, format, parseISO, startOfToday } from 'date-fns';
import type { AdminBooking, BlockedDate } from '../types/site';

export type AvailabilityResult = {
  available: boolean;
  reason?: string;
  conflicts?: string[];
};

export type DateInputValidation =
  | { valid: true }
  | { valid: false; reason: string };

const ACTIVE_BOOKING_STATUSES: AdminBooking['status'][] = ['confirmed', 'pending'];

export function getTodayIso(): string {
  return format(startOfToday(), 'yyyy-MM-dd');
}

/** FullCalendar all-day end is exclusive — add one day after checkout. */
export function bookingEventEnd(checkOut: string): string {
  return format(addDays(parseISO(checkOut), 1), 'yyyy-MM-dd');
}

/** Admin blocks store an inclusive last day; stays use an exclusive check-out. */
export function blockedRangeExclusiveEnd(endDate: string): string {
  return format(addDays(parseISO(endDate), 1), 'yyyy-MM-dd');
}

export function rangesOverlap(
  rangeStart: string,
  rangeEnd: string,
  blockStart: string,
  blockEnd: string
): boolean {
  return (
    (blockStart <= rangeStart && blockEnd > rangeStart) ||
    (blockStart < rangeEnd && blockEnd >= rangeEnd) ||
    (blockStart >= rangeStart && blockEnd <= rangeEnd) ||
    (rangeStart >= blockStart && rangeEnd <= blockEnd)
  );
}

/** Nights actually slept: [checkIn, checkOut) — check-out day is not an occupied night. */
export function stayOccupiesUnavailableNight(
  checkIn: string,
  checkOut: string,
  bookings: AdminBooking[],
  blockedDates: BlockedDate[],
  roomId: string,
): boolean {
  if (!checkIn || !checkOut || checkOut <= checkIn) return true;

  let day = parseISO(checkIn);
  const lastSleptNight = addDays(parseISO(checkOut), -1);

  while (day <= lastSleptNight) {
    const dateStr = format(day, 'yyyy-MM-dd');
    if (isDateInBlockedOrBookedRange(dateStr, bookings, blockedDates, roomId)) {
      return true;
    }
    day = addDays(day, 1);
  }

  return false;
}

/** True when a date cannot be used as check-in (includes blocked/booked days). */
export function isUnavailableForCheckIn(
  dateStr: string,
  bookings: AdminBooking[],
  blockedDates: BlockedDate[],
  roomId: string,
): boolean {
  return isDateInBlockedOrBookedRange(dateStr, bookings, blockedDates, roomId);
}

export function isDateInBlockedOrBookedRange(
  dateStr: string,
  bookings: AdminBooking[],
  blockedDates: BlockedDate[],
  roomId: string
): boolean {
  const day = parseISO(dateStr);
  for (const b of bookings) {
    if (b.roomId !== roomId || !ACTIVE_BOOKING_STATUSES.includes(b.status)) continue;
    const start = parseISO(b.checkIn);
    const end = parseISO(b.checkOut);
    if (day >= start && day < end) return true;
  }
  for (const block of blockedDates) {
    if (block.roomId !== roomId || block.source !== 'manual') continue;
    const start = parseISO(block.startDate);
    const end = parseISO(block.endDate);
    if (day >= start && day <= end) return true;
  }
  return false;
}

export function checkRoomAvailability(
  roomId: string,
  checkIn: string,
  checkOut: string,
  bookings: AdminBooking[],
  blockedDates: BlockedDate[]
): AvailabilityResult {
  if (checkIn === checkOut) {
    return { available: false, reason: 'Check-out must be after check-in.' };
  }

  if (stayOccupiesUnavailableNight(checkIn, checkOut, bookings, blockedDates, roomId)) {
    return {
      available: false,
      reason: 'Selected dates overlap with existing bookings or blocked dates.',
    };
  }

  return { available: true };
}

export function validateCheckInInput(
  roomId: string,
  checkIn: string,
  checkOut: string,
  bookings: AdminBooking[],
  blockedDates: BlockedDate[],
): DateInputValidation {
  if (!checkIn) return { valid: true };

  if (checkIn < getTodayIso()) {
    return { valid: false, reason: 'Cannot select past dates.' };
  }

  if (isUnavailableForCheckIn(checkIn, bookings, blockedDates, roomId)) {
    return { valid: false, reason: 'This check-in date is not available.' };
  }

  if (checkOut && checkOut > checkIn) {
    const range = checkRoomAvailability(roomId, checkIn, checkOut, bookings, blockedDates);
    if (!range.available) {
      return {
        valid: false,
        reason: range.reason ?? 'These dates overlap with a booking or blocked period.',
      };
    }
  }

  return { valid: true };
}

export function validateCheckOutInput(
  roomId: string,
  checkIn: string,
  checkOut: string,
  bookings: AdminBooking[],
  blockedDates: BlockedDate[],
): DateInputValidation {
  if (!checkOut) return { valid: true };

  if (!checkIn) {
    return { valid: false, reason: 'Select check-in before check-out.' };
  }

  if (checkOut <= checkIn) {
    return { valid: false, reason: 'Check-out must be after check-in.' };
  }

  const range = checkRoomAvailability(roomId, checkIn, checkOut, bookings, blockedDates);
  if (!range.available) {
    return {
      valid: false,
      reason: range.reason ?? 'These dates overlap with a booking or blocked period.',
    };
  }

  return { valid: true };
}

export function isStayRangeAvailable(
  roomId: string,
  checkIn: string,
  checkOut: string,
  bookings: AdminBooking[],
  blockedDates: BlockedDate[],
): boolean {
  if (!checkIn || !checkOut || checkOut <= checkIn) return false;
  return checkRoomAvailability(roomId, checkIn, checkOut, bookings, blockedDates).available;
}

export function findMatchingManualBlock(
  roomId: string,
  startDate: string,
  endDate: string,
  blockedDates: BlockedDate[]
): BlockedDate | undefined {
  return blockedDates.find(
    (b) =>
      b.roomId === roomId &&
      b.source === 'manual' &&
      b.startDate === startDate &&
      b.endDate === endDate
  );
}

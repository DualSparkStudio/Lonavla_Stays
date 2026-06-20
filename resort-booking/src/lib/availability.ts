import { addDays, format, parseISO } from 'date-fns';
import type { AdminBooking, BlockedDate } from '../types/site';

export type AvailabilityResult = {
  available: boolean;
  reason?: string;
  conflicts?: string[];
};

const ACTIVE_BOOKING_STATUSES: AdminBooking['status'][] = ['confirmed', 'pending'];

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

  const conflicts: string[] = [];

  for (const b of bookings) {
    if (b.roomId !== roomId || !ACTIVE_BOOKING_STATUSES.includes(b.status)) continue;
    if (rangesOverlap(checkIn, checkOut, b.checkIn, b.checkOut)) {
      conflicts.push(`Booking ${b.bookingRef} (${b.checkIn} – ${b.checkOut})`);
    }
  }

  for (const block of blockedDates) {
    if (block.roomId !== roomId || block.source !== 'manual') continue;
    const blockEndExclusive = blockedRangeExclusiveEnd(block.endDate);
    if (rangesOverlap(checkIn, checkOut, block.startDate, blockEndExclusive)) {
      conflicts.push(`Blocked: ${block.reason} (${block.startDate} – ${block.endDate})`);
    }
  }

  if (conflicts.length > 0) {
    return {
      available: false,
      reason: 'Selected dates overlap with existing bookings or blocked dates.',
      conflicts,
    };
  }

  return { available: true };
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

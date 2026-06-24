import {
  checkInLabelFromTime,
  checkOutLabelFromTime,
  DEFAULT_CHECK_IN_TIME,
  DEFAULT_CHECK_OUT_TIME,
} from '../data/resort';
import type { InfoSection } from '../types/site';

const STANDARD_CHECK_IN_OUT_LINE =
  /standard check-in is from .+ and check-out is by .+\.?/i;

/** Sync house-rules / policy copy with admin booking-default times. */
export function applyBookingTimesToPolicyItem(
  item: string,
  checkInTime: string,
  checkOutTime: string,
): string {
  const checkIn = checkInLabelFromTime(checkInTime || DEFAULT_CHECK_IN_TIME);
  const checkOut = checkOutLabelFromTime(checkOutTime || DEFAULT_CHECK_OUT_TIME);

  let text = item
    .replace(/\{\{checkIn\}\}/gi, checkIn)
    .replace(/\{\{checkOut\}\}/gi, checkOut);

  if (STANDARD_CHECK_IN_OUT_LINE.test(text.trim())) {
    return `Standard check-in is from ${checkIn} and check-out is by ${checkOut}.`;
  }

  return text;
}

export function resolvePolicySections(
  sections: InfoSection[],
  checkInTime: string,
  checkOutTime: string,
): InfoSection[] {
  return sections.map((section) => ({
    ...section,
    items: section.items.map((item) => applyBookingTimesToPolicyItem(item, checkInTime, checkOutTime)),
  }));
}

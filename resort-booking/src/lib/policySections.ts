import {
  checkInLabelFromTime,
  checkOutLabelFromTime,
  DEFAULT_CHECK_IN_TIME,
  DEFAULT_CHECK_OUT_TIME,
} from '../data/resort';
import type { InfoSection, SiteSettings } from '../types/site';

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

/** Terms & conditions from admin (falls back to legacy importantInfoSections). */
export function getTermsSections(
  settings: Pick<SiteSettings, 'termsAndConditionsSections' | 'importantInfoSections'>,
): InfoSection[] {
  if (settings.termsAndConditionsSections?.length) return settings.termsAndConditionsSections;
  return settings.importantInfoSections ?? [];
}

const CANCELLATION_SECTION_TITLE = /cancel/i;

/** Cancellation / rescheduling block from admin terms. */
export function findCancellationSection(sections: InfoSection[]): InfoSection | undefined {
  return sections.find((section) => CANCELLATION_SECTION_TITLE.test(section.title));
}

export function getCancellationSection(
  settings: Pick<SiteSettings, 'termsAndConditionsSections' | 'importantInfoSections'>,
): InfoSection | undefined {
  return findCancellationSection(getTermsSections(settings));
}

export function getCancellationPolicyItems(
  settings: Pick<
    SiteSettings,
    'termsAndConditionsSections' | 'importantInfoSections' | 'checkInTime' | 'checkOutTime'
  >,
): string[] {
  const section = getCancellationSection(settings);
  if (!section) return [];

  return section.items
    .filter(Boolean)
    .map((item) =>
      applyBookingTimesToPolicyItem(item, settings.checkInTime ?? '', settings.checkOutTime ?? ''),
    );
}

/** Short label for trust badges (first cancellation line or section title). */
export function getCancellationSummaryLabel(
  settings: Pick<SiteSettings, 'termsAndConditionsSections' | 'importantInfoSections'>,
): string | null {
  const section = getCancellationSection(settings);
  const firstItem = section?.items.find(Boolean);
  if (firstItem) {
    return firstItem.length > 72 ? `${firstItem.slice(0, 69).trimEnd()}…` : firstItem;
  }
  return section?.title ?? null;
}

/** Flat list of all admin terms items for booking flows. */
export function getBookingTermsItems(
  settings: Pick<
    SiteSettings,
    'termsAndConditionsSections' | 'importantInfoSections' | 'checkInTime' | 'checkOutTime'
  >,
): string[] {
  return getTermsSections(settings).flatMap((section) =>
    section.items
      .filter(Boolean)
      .map((item) =>
        applyBookingTimesToPolicyItem(item, settings.checkInTime ?? '', settings.checkOutTime ?? ''),
      ),
  );
}

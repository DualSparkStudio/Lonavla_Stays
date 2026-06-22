import {
  DEFAULT_CHECK_IN_TIME,
  DEFAULT_CHECK_OUT_TIME,
  demoRooms,
  resortFacilities,
  RESORT_NAME,
  BRAND_TAGLINE,
  RESORT_LOCATION,
  RESORT_ADDRESS,
  RESORT_PHONE,
  RESORT_EMAIL,
  DEFAULT_GST_PERCENT,
  DEFAULT_EXTRA_PERSON_CHARGE,
} from '../data/resort';
import { propertiesForSale as defaultPropertiesForSale } from '../data/propertiesForSale';
import type { SiteData, SiteSettings, Room, PropertyForSale, Facility, AdminBooking, AdminUser, ContactMessage, BlockedDate } from '../types/site';

const STORAGE_KEY = 'lonavala-stays-site-data-v1';
const LEGACY_SESSION_CACHE_KEY = 'lonavala-stays-session-site-data';
const SESSION_CACHE_KEY = 'lonavala-stays-session-site-data-v2';
/** Session cache is for in-tab navigation only — never bootstrap from stale mobile sessions. */
const SESSION_CACHE_TTL_MS = 2 * 60 * 1000;

type SessionSiteDataEnvelope = { cachedAt: number; data: Partial<SiteData> };

export const defaultSiteSettings = (): SiteSettings => ({
  resortName: RESORT_NAME,
  brandTagline: BRAND_TAGLINE,
  resortLocation: RESORT_LOCATION,
  resortAddress: RESORT_ADDRESS,
  resortPhone: RESORT_PHONE,
  resortEmail: RESORT_EMAIL,
  checkInTime: DEFAULT_CHECK_IN_TIME,
  checkOutTime: DEFAULT_CHECK_OUT_TIME,
  gstPercent: DEFAULT_GST_PERCENT,
  extraPersonCharge: DEFAULT_EXTRA_PERSON_CHARGE,
  heroTitle: 'Escape Into The Hills',
  heroSubtitle:
    'Book luxury villa stays or explore plots & villas for sale across Lonavala—each with its own home and hillside setting.',
  aboutImage: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&h=600&fit=crop',
  aboutParagraphs: [
    `${RESORT_NAME} ${BRAND_TAGLINE.toLowerCase()}. We are not a single hotel—we curate, operate, and book multiple private villas across ${RESORT_LOCATION}, each managed as its own property.`,
    'Whether you need one villa for a weekend or want to understand how we manage an entire portfolio, our team handles reservations, housekeeping, and guest care villa by villa.',
  ],
  aboutHighlights: [
    {
      title: 'Multiple villas, one brand',
      text: 'We manage a portfolio of standalone villas—each with its own address, style, and amenities—under trusted Lonavala hospitality.',
    },
    {
      title: 'Locally rooted',
      text: 'Our on-ground team lives in Lonavala. We match you to the right villa and share the best trails, views, and seasonal tips.',
    },
    {
      title: 'End-to-end management',
      text: 'From booking and housekeeping to maintenance and guest support, we run every villa so owners and guests enjoy a seamless stay.',
    },
  ],
  exploreTiles: [
    { name: 'All villas', path: '/villas', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop' },
    { name: 'For sale', path: '/for-sale', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop' },
    { name: 'Facilities', path: '/facilities', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop' },
    { name: 'Contact', path: '/contact', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop' },
  ],
  villasPageTitle: 'Our villas',
  villasPageSubtitle: `${BRAND_TAGLINE}. Each listing is a separate private villa—compare locations, capacity, and amenities to find your fit.`,
  facilitiesPageTitle: 'Our facilities',
  facilitiesPageSubtitle:
    'Experiences and amenities across our villa collection. What is included depends on the villa you book—see each listing for details.',
  forSalePageTitle: 'Plots & villas for sale',
  forSalePageSubtitle:
    'Own a piece of Lonavala. Browse our curated plots and ready villas—view full galleries and descriptions, then contact us to schedule a visit or request documents.',
  contactPageSubtitle:
    'Questions about a villa stay, a plot or villa for sale, availability, or directions? Our team manages every property in our collection.',
  houseRulesSections: [
    {
      title: 'Check-in & check-out',
      items: [
        'Standard check-in is from {{checkIn}} and check-out is by {{checkOut}}.',
        'Early check-in or late check-out may be available on request, subject to availability.',
        'A valid government-issued photo ID is required for all guests at check-in.',
      ],
    },
    {
      title: 'Guests & occupancy',
      items: [
        'Only registered guests may stay overnight. Day visitors must be approved in advance.',
        'Maximum occupancy must not exceed the limit shown on your villa listing.',
        'Additional guests or events require prior written approval from our team.',
      ],
    },
    {
      title: 'Conduct & noise',
      items: [
        'Parties, loud music, and commercial photography are not permitted unless pre-approved.',
        'Quiet hours are from 10:00 PM to 8:00 AM. Please respect neighbours and villa staff.',
        'Smoking is not allowed inside villas. Use designated outdoor areas only where provided.',
      ],
    },
    {
      title: 'Property care',
      items: [
        'Treat the villa, furniture, and amenities with care. Guests are responsible for damage caused during the stay.',
        'Do not move heavy furniture or reconfigure safety equipment without staff assistance.',
        'Report maintenance issues promptly so our on-ground team can assist.',
      ],
    },
  ],
  termsAndConditionsSections: [
    {
      title: 'Payments & deposits',
      items: [
        '40% of the total booking amount is collected online at checkout; the balance is due at check-in.',
        'Any deductions for damages or policy violations will be communicated with supporting details.',
      ],
    },
    {
      title: 'Cancellation & changes',
      items: [
        'Cancellation and rescheduling terms depend on your booking date and villa. Refer to your confirmation email for the applicable policy.',
        'For date changes, contact us as early as possible—peak weekends and holidays may have stricter terms.',
      ],
    },
    {
      title: 'Safety & emergencies',
      items: [
        'Lonavala weather can change quickly—carry warm layers in monsoon and winter months.',
        'In case of emergency, contact our team immediately using the phone number on your booking confirmation.',
        'Swimming pools, bonfires, and hillside paths involve inherent risks—follow on-site instructions and supervise children.',
      ],
    },
    {
      title: 'Local guidelines',
      items: [
        'Alcohol consumption must comply with local laws. Guests are responsible for their own conduct.',
        'Pets are welcome only at villas explicitly marked as pet-friendly—confirm before you book.',
        'Parking is limited at some properties; inform us in advance if you are bringing multiple vehicles.',
      ],
    },
  ],
  importantInfoSections: [
    {
      title: 'Payments & deposits',
      items: [
        '40% of the total booking amount is collected online at checkout; the balance is due at check-in.',
        'Any deductions for damages or policy violations will be communicated with supporting details.',
      ],
    },
    {
      title: 'Cancellation & changes',
      items: [
        'Cancellation and rescheduling terms depend on your booking date and villa. Refer to your confirmation email for the applicable policy.',
        'For date changes, contact us as early as possible—peak weekends and holidays may have stricter terms.',
      ],
    },
    {
      title: 'Safety & emergencies',
      items: [
        'Lonavala weather can change quickly—carry warm layers in monsoon and winter months.',
        'In case of emergency, contact our team immediately using the phone number on your booking confirmation.',
        'Swimming pools, bonfires, and hillside paths involve inherent risks—follow on-site instructions and supervise children.',
      ],
    },
    {
      title: 'Local guidelines',
      items: [
        'Alcohol consumption must comply with local laws. Guests are responsible for their own conduct.',
        'Pets are welcome only at villas explicitly marked as pet-friendly—confirm before you book.',
        'Parking is limited at some properties; inform us in advance if you are bringing multiple vehicles.',
      ],
    },
  ],
});

const defaultBookings = (): AdminBooking[] => [
  {
    id: '1',
    roomId: '1',
    roomName: demoRooms[0]?.name ?? 'Valley View Villa',
    guestName: 'John Smith',
    guestEmail: 'john.smith@email.com',
    checkIn: '2026-06-12',
    checkOut: '2026-06-15',
    guests: 2,
    total: 19500,
    status: 'confirmed',
    bookingRef: 'RB123456',
    bookedAt: '2026-05-01',
  },
  {
    id: '2',
    roomId: '2',
    roomName: demoRooms[1]?.name ?? 'Garden Wing Villa',
    guestName: 'Sarah Johnson',
    guestEmail: 'sarah.j@email.com',
    checkIn: '2026-06-20',
    checkOut: '2026-06-22',
    guests: 4,
    total: 18400,
    status: 'pending',
    bookingRef: 'RB789012',
    bookedAt: '2026-05-10',
  },
];

const defaultUsers = (): AdminUser[] => [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+91 98765 43210',
    joinDate: '2025-01-15',
    totalBookings: 3,
    totalSpent: 45000,
    status: 'active',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+91 87654 32109',
    joinDate: '2025-03-20',
    totalBookings: 2,
    totalSpent: 32000,
    status: 'vip',
  },
];

export function createDefaultSiteData(): SiteData {
  return {
    settings: defaultSiteSettings(),
    rooms: structuredClone(demoRooms),
    propertiesForSale: structuredClone(defaultPropertiesForSale),
    facilities: structuredClone(resortFacilities),
    bookings: defaultBookings(),
    blockedDates: [],
    users: defaultUsers(),
    contactMessages: [],
  };
}

/** Empty in-memory state while Supabase loads — no demo villas or listings. */
export function createEmptyCatalogSiteData(): SiteData {
  return {
    settings: defaultSiteSettings(),
    rooms: [],
    propertiesForSale: [],
    facilities: [],
    bookings: [],
    blockedDates: [],
    users: [],
    contactMessages: [],
  };
}

/** Clears legacy browser caches so only Supabase is used for catalog data. */
export function purgeLocalSiteData(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_CACHE_KEY);
    sessionStorage.removeItem(LEGACY_SESSION_CACHE_KEY);
  } catch {
    /* ignore */
  }
}

/** Removes duplicate rows from double payment submit (same stay or same booking ref). */
export function dedupeBookings(bookings: AdminBooking[]): AdminBooking[] {
  const seenRef = new Set<string>();
  const seenStay = new Set<string>();
  const result: AdminBooking[] = [];
  for (const b of bookings) {
    const refKey = b.bookingRef?.trim();
    const stayKey = `${b.guestEmail}|${b.roomId}|${b.checkIn}|${b.checkOut}`;
    if (refKey && seenRef.has(refKey)) continue;
    if (seenStay.has(stayKey)) continue;
    if (refKey) seenRef.add(refKey);
    seenStay.add(stayKey);
    result.push(b);
  }
  return result;
}

export function purgeLegacySessionSiteData(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(LEGACY_SESSION_CACHE_KEY);
  } catch {
    /* ignore */
  }
}

export function readSessionSiteData(): SiteData | null {
  if (typeof window === 'undefined') return null;
  try {
    purgeLegacySessionSiteData();
    const raw = sessionStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionSiteDataEnvelope | Partial<SiteData>;
    if (!('cachedAt' in parsed) || typeof parsed.cachedAt !== 'number') {
      sessionStorage.removeItem(SESSION_CACHE_KEY);
      return null;
    }
    if (Date.now() - parsed.cachedAt > SESSION_CACHE_TTL_MS) {
      sessionStorage.removeItem(SESSION_CACHE_KEY);
      return null;
    }
    return mergeWithDefaults(parsed.data);
  } catch {
    return null;
  }
}

export function writeSessionSiteData(data: SiteData): void {
  if (typeof window === 'undefined') return;
  try {
    const envelope: SessionSiteDataEnvelope = { cachedAt: Date.now(), data };
    sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(envelope));
  } catch {
    /* session quota */
  }
}

function pickArray<T>(parsed: T[] | undefined, defaults: T[]): T[] {
  return Array.isArray(parsed) ? parsed : defaults;
}

function mergeWithDefaults(parsed: Partial<SiteData>): SiteData {
  const defaults = createDefaultSiteData();
  const rawBookings = parsed.bookings ?? defaults.bookings;
  return {
    settings: {
      ...defaults.settings,
      ...parsed.settings,
      checkInTime: parsed.settings?.checkInTime ?? defaults.settings.checkInTime,
      checkOutTime: parsed.settings?.checkOutTime ?? defaults.settings.checkOutTime,
      gstPercent: parsed.settings?.gstPercent ?? defaults.settings.gstPercent,
      extraPersonCharge: parsed.settings?.extraPersonCharge ?? defaults.settings.extraPersonCharge,
      houseRulesSections: parsed.settings?.houseRulesSections?.length
        ? parsed.settings.houseRulesSections
        : defaults.settings.houseRulesSections,
      termsAndConditionsSections:
        parsed.settings?.termsAndConditionsSections?.length
          ? parsed.settings.termsAndConditionsSections
          : parsed.settings?.importantInfoSections?.length
            ? parsed.settings.importantInfoSections
            : defaults.settings.termsAndConditionsSections,
      importantInfoSections:
        parsed.settings?.termsAndConditionsSections?.length
          ? parsed.settings.termsAndConditionsSections
          : parsed.settings?.importantInfoSections?.length
            ? parsed.settings.importantInfoSections
            : defaults.settings.importantInfoSections,
    },
    rooms: pickArray(parsed.rooms, defaults.rooms),
    propertiesForSale: pickArray(parsed.propertiesForSale, defaults.propertiesForSale),
    facilities: pickArray(parsed.facilities, defaults.facilities),
    bookings: dedupeBookings(rawBookings),
    blockedDates: parsed.blockedDates ?? defaults.blockedDates,
    users: pickArray(parsed.users, defaults.users),
    contactMessages: parsed.contactMessages ?? defaults.contactMessages,
  };
}

export function loadSiteData(): SiteData {
  if (typeof window === 'undefined') return createDefaultSiteData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultSiteData();
    const parsed = JSON.parse(raw) as Partial<SiteData>;
    const data = mergeWithDefaults(parsed);
    const before = parsed.bookings?.length ?? 0;
    if (before > data.bookings.length) {
      saveSiteData(data);
    }
    return data;
  } catch {
    return createDefaultSiteData();
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let pendingSave: SiteData | null = null;

function flushSiteDataSave(silent = false): void {
  if (!pendingSave || typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingSave));
  pendingSave = null;
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  if (!silent) {
    window.dispatchEvent(new CustomEvent('site-data-updated'));
  }
}

export function saveSiteData(
  data: SiteData,
  options?: { immediate?: boolean; silent?: boolean },
): void {
  if (typeof window === 'undefined') return;
  pendingSave = data;
  if (options?.immediate) {
    flushSiteDataSave(options.silent);
    return;
  }
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => flushSiteDataSave(), 300);
}

export function resetSiteData(): SiteData {
  const data = createDefaultSiteData();
  saveSiteData(data);
  return data;
}

export type { Room, PropertyForSale, Facility, AdminBooking, AdminUser, ContactMessage, SiteSettings, BlockedDate, SiteData };

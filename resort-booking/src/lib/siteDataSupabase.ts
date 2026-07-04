import { addYears, format, subDays } from 'date-fns';
import { DEFAULT_CHECK_IN_TIME, DEFAULT_CHECK_OUT_TIME, resortFacilities } from '../data/resort';
import type {
    AdminBooking,
    BlockedDate,
    ContactMessage,
    Facility,
    PropertyForSale,
    Room,
    SiteData,
    SiteSettings,
} from '../types/site';
import { repairMojibake, repairMojibakeDeep } from './repairMojibake';
import { defaultSiteSettings } from './siteStorage';
import { normalizeExploreTiles } from './exploreTileImages';
import { normalizeCustomDatePrices } from './bookingPricing';
import { supabase } from './supabase';
import {
    buildVillaUuidCache,
    getVillaUuidFromCache,
    isUuid,
    setVillaUuidCache,
} from './villaUuidCache';

type VillaRow = {
  id: string;
  legacy_id: string | null;
  name: string;
  room_type: string;
  description: string;
  price_per_night: number;
  weekend_price_per_night: number | null;
  location: string;
  address: string;
  max_guests: number;
  room_number: string;
  rating: number;
  review_count: number;
  status: string;
  amenities: string[];
  images: string[];
  map_embed_url: string | null;
  maps_link: string | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
  caretaker_phone?: string | null;
  final_capacity?: number | null;
};

type BookingRow = {
  id: string;
  villa_id: string;
  booking_ref: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  total_amount: number;
  status: string;
  payment_status: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  created_at: string;
  villas?: { name: string; legacy_id: string | null } | null;
};

type BlockedRow = {
  id: string;
  villa_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  notes: string | null;
  source: string;
  created_at: string;
};

type FacilityRow = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  hours: string | null;
};

type PropertyRow = {
  id: string;
  legacy_id: string | null;
  title: string;
  category: 'villa' | 'plot';
  description: string;
  long_description: string;
  price_amount: number;
  price_on_request: boolean;
  location: string;
  address: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_label: string | null;
  status: 'available' | 'reserved' | 'sold';
  images: string[];
  highlights: string[];
  map_embed_url: string | null;
  maps_link: string | null;
};

type ContactRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  created_at: string;
};

export { isUuid } from './villaUuidCache';

export function villaPublicId(row: { id: string; legacy_id?: string | null }): string {
  return row.legacy_id?.trim() || row.id;
}

function mapVillaToRoom(row: VillaRow): Room {
  return {
    id: villaPublicId(row),
    name: repairMojibake(row.name),
    room_type: repairMojibake(row.room_type),
    description: repairMojibake(row.description),
    price_per_night: Number(row.price_per_night),
    weekend_price_per_night:
      row.weekend_price_per_night != null ? Number(row.weekend_price_per_night) : undefined,
    location: repairMojibake(row.location),
    address: repairMojibake(row.address),
    max_guests: row.max_guests,
    room_number: row.room_number,
    rating: Number(row.rating),
    review_count: row.review_count,
    status: row.status as Room['status'],
    amenities: (row.amenities ?? []).map(repairMojibake),
    images: row.images ?? [],
    mapEmbedUrl: row.map_embed_url ?? undefined,
    mapsLink: row.maps_link ?? undefined,
    caretaker_phone: row.caretaker_phone?.trim() ? repairMojibake(row.caretaker_phone.trim()) : undefined,
    final_capacity: row.final_capacity != null && row.final_capacity > 0 ? Number(row.final_capacity) : undefined,
  };
}

function mapBookingRow(row: BookingRow): AdminBooking {
  const villa = row.villas;
  const roomId = villa ? villaPublicId({ id: row.villa_id, legacy_id: villa.legacy_id }) : row.villa_id;
  let status: AdminBooking['status'] = 'pending';
  if (row.status === 'confirmed' || row.status === 'checked_in') status = 'confirmed';
  else if (row.status === 'cancelled') status = 'cancelled';
  else if (row.status === 'completed' || row.status === 'checked_out') status = 'completed';
  else if (row.status === 'pending') status = 'pending';

  return {
    id: row.id,
    roomId,
    roomName: villa?.name ?? 'Villa',
    guestName: row.guest_name,
    guestEmail: row.guest_email,
    checkIn: row.check_in,
    checkOut: row.check_out,
    guests: row.adults + (row.children ?? 0),
    total: Number(row.total_amount),
    status,
    bookingRef: row.booking_ref,
    bookedAt: row.created_at,
  };
}

function mapBlockedRow(row: BlockedRow, villaLegacyByUuid: Map<string, string>): BlockedDate {
  return {
    id: row.id,
    roomId: villaLegacyByUuid.get(row.villa_id) ?? row.villa_id,
    startDate: row.start_date,
    endDate: row.end_date,
    reason: repairMojibake(row.reason),
    notes: row.notes != null ? repairMojibake(row.notes) : undefined,
    source: 'manual',
    createdAt: row.created_at,
  };
}

function mapFacilityRow(row: FacilityRow): Facility {
  return {
    id: row.id,
    name: repairMojibake(row.name),
    description: repairMojibake(row.description),
    image: row.image ?? '',
    hours: row.hours ?? '',
  };
}

function mapPropertyRow(row: PropertyRow): PropertyForSale {
  return {
    id: row.legacy_id?.trim() || row.id,
    title: repairMojibake(row.title),
    category: row.category,
    description: repairMojibake(row.description),
    longDescription: repairMojibake(row.long_description),
    price: Number(row.price_amount),
    priceOnRequest: row.price_on_request,
    location: repairMojibake(row.location),
    address: repairMojibake(row.address ?? ''),
    areaLabel: repairMojibake(row.area_label ?? ''),
    bedrooms: row.bedrooms ?? undefined,
    bathrooms: row.bathrooms ?? undefined,
    status: row.status,
    highlights: (row.highlights ?? []).map(repairMojibake),
    images: row.images ?? [],
    mapEmbedUrl: row.map_embed_url ?? undefined,
    mapsLink: row.maps_link ?? undefined,
  };
}

function mapContactRow(row: ContactRow): ContactMessage {
  return {
    id: row.id,
    name: repairMojibake(row.name),
    email: row.email,
    phone: repairMojibake(row.phone ?? ''),
    subject: repairMojibake(row.subject),
    message: repairMojibake(row.message),
    createdAt: row.created_at,
  };
}

function parseSiteSettings(data: Record<string, unknown> | null): SiteSettings {
  const defaults = defaultSiteSettings();
  if (!data) return defaults;
  const repaired = repairMojibakeDeep(data) as Partial<SiteSettings>;
  return {
    ...defaults,
    ...repaired,
    aboutParagraphs: (repaired.aboutParagraphs as string[]) ?? defaults.aboutParagraphs,
    aboutHighlights: (repaired.aboutHighlights as SiteSettings['aboutHighlights']) ?? defaults.aboutHighlights,
    exploreTiles: normalizeExploreTiles(
      (repaired.exploreTiles as SiteSettings['exploreTiles']) ?? defaults.exploreTiles,
    ),
    pricingHolidays: (repaired.pricingHolidays as string[]) ?? defaults.pricingHolidays,
    customDatePrices: (() => {
      const raw =
        repaired.customDatePrices ??
        (repaired as { custom_date_prices?: unknown }).custom_date_prices;
      return raw != null ? normalizeCustomDatePrices(raw) : defaults.customDatePrices;
    })(),
    houseRulesSections:
      (repaired.houseRulesSections as SiteSettings['houseRulesSections'])?.length
        ? (repaired.houseRulesSections as SiteSettings['houseRulesSections'])
        : defaults.houseRulesSections,
    termsAndConditionsSections:
      (repaired.termsAndConditionsSections as SiteSettings['termsAndConditionsSections'])?.length
        ? (repaired.termsAndConditionsSections as SiteSettings['termsAndConditionsSections'])
        : (repaired.importantInfoSections as SiteSettings['importantInfoSections'])?.length
          ? (repaired.importantInfoSections as SiteSettings['importantInfoSections'])
          : defaults.termsAndConditionsSections,
    importantInfoSections:
      (repaired.termsAndConditionsSections as SiteSettings['termsAndConditionsSections'])?.length
        ? (repaired.termsAndConditionsSections as SiteSettings['termsAndConditionsSections'])
        : (repaired.importantInfoSections as SiteSettings['importantInfoSections'])?.length
          ? (repaired.importantInfoSections as SiteSettings['importantInfoSections'])
          : defaults.importantInfoSections,
  };
}

const VILLA_COLUMNS =
  'id, legacy_id, name, room_type, description, price_per_night, weekend_price_per_night, location, address, max_guests, room_number, rating, review_count, status, amenities, images, map_embed_url, maps_link, caretaker_phone, final_capacity';
const BOOKING_COLUMNS =
  'id, villa_id, booking_ref, check_in, check_out, adults, children, total_amount, status, guest_name, guest_email, created_at, villas(name, legacy_id)';
const BLOCKED_COLUMNS = 'id, villa_id, start_date, end_date, reason, notes, source, created_at';

function bookingDateFilters() {
  const since = format(subDays(new Date(), 30), 'yyyy-MM-dd');
  const until = format(addYears(new Date(), 2), 'yyyy-MM-dd');
  return { since, until };
}

function mapFetchedSiteData(
  villas: VillaRow[],
  bookings: BookingRow[],
  blocked: BlockedRow[],
  settingsData: Record<string, unknown> | null,
  properties: PropertyRow[],
  messages: ContactRow[],
): SiteData {
  const legacyByUuid = new Map(villas.map((v) => [v.id, villaPublicId(v)]));
  setVillaUuidCache(buildVillaUuidCache(villas, villaPublicId));

  return {
    settings: parseSiteSettings(settingsData),
    rooms: villas.map(mapVillaToRoom),
    bookings: bookings.map(mapBookingRow),
    blockedDates: blocked.map((r) => mapBlockedRow(r, legacyByUuid)),
    facilities: resortFacilities,
    propertiesForSale: properties.map(mapPropertyRow),
    contactMessages: messages.map(mapContactRow),
    users: [],
  };
}

/** Public pages: CMS + availability data only (no contact messages). */
export async function fetchPublicSiteDataFromSupabase(): Promise<SiteData> {
  const { since, until } = bookingDateFilters();
  const [
    villasRes,
    bookingsRes,
    blockedRes,
    settingsRes,
    propertiesRes,
  ] = await Promise.all([
    supabase.from('villas').select(VILLA_COLUMNS).eq('is_active', true).order('room_number'),
    supabase
      .from('bookings')
      .select(BOOKING_COLUMNS)
      .neq('status', 'cancelled')
      .gte('check_out', since)
      .lte('check_in', until)
      .order('created_at', { ascending: false }),
    supabase.from('blocked_dates').select(BLOCKED_COLUMNS).order('start_date'),
    supabase.from('site_settings').select('data').eq('id', 'main').maybeSingle(),
    supabase
      .from('properties_for_sale')
      .select(
        'id, legacy_id, title, category, description, long_description, price_amount, price_on_request, location, address, bedrooms, bathrooms, area_label, status, images, highlights, map_embed_url, maps_link',
      )
      .eq('is_active', true)
      .order('sort_order'),
  ]);

  const errors = [
    villasRes.error,
    bookingsRes.error,
    blockedRes.error,
    settingsRes.error,
    propertiesRes.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(errors.map((e) => e!.message).join('; '));
  }

  return mapFetchedSiteData(
    (villasRes.data ?? []) as VillaRow[],
    (bookingsRes.data ?? []) as BookingRow[],
    (blockedRes.data ?? []) as BlockedRow[],
    (settingsRes.data?.data as Record<string, unknown>) ?? null,
    (propertiesRes.data ?? []) as PropertyRow[],
    [],
  );
}

/** Admin-only supplement: full booking history. */
export async function fetchAdminSiteDataFromSupabase(): Promise<{
  contactMessages: ContactMessage[];
  bookings: AdminBooking[];
}> {
  const bookingsRes = await supabase
    .from('bookings')
    .select(BOOKING_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(500);

  if (bookingsRes.error) throw bookingsRes.error;

  return {
    contactMessages: [],
    bookings: ((bookingsRes.data ?? []) as BookingRow[]).map(mapBookingRow),
  };
}

/** Full dataset — used for explicit refresh. */
export async function fetchSiteDataFromSupabase(): Promise<SiteData> {
  const publicData = await fetchPublicSiteDataFromSupabase();
  const adminData = await fetchAdminSiteDataFromSupabase();
  return {
    ...publicData,
    contactMessages: adminData.contactMessages,
    bookings: adminData.bookings,
  };
}

/** App villa ids are legacy_id (1–4); DB primary key is UUID — never compare UUID to "4". */
async function resolveVillaUuid(roomId: string): Promise<string | null> {
  const cached = getVillaUuidFromCache(roomId);
  if (cached) return cached;

  if (isUuid(roomId)) {
    const { data, error } = await supabase.from('villas').select('id').eq('id', roomId).maybeSingle();
    if (error) throw error;
    return data?.id ?? null;
  }

  const { data, error } = await supabase
    .from('villas')
    .select('id')
    .eq('legacy_id', roomId)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

export async function upsertSiteSettingsToSupabase(settings: SiteSettings): Promise<void> {
  const { error } = await supabase.from('site_settings').upsert({
    id: 'main',
    data: settings,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

function villaLegacyId(room: Room): string | null {
  if (/^[0-9]+$/.test(room.id) || room.id.startsWith('sale-')) return room.id;
  if (room.id.length === 36 && room.id.includes('-')) return null;
  return room.id;
}

export async function upsertVillaToSupabase(room: Room): Promise<void> {
  const payload = {
    legacy_id: villaLegacyId(room),
    name: room.name,
    room_type: room.room_type,
    description: room.description,
    price_per_night: room.price_per_night,
    weekend_price_per_night: room.weekend_price_per_night ?? null,
    location: room.location,
    address: room.address,
    max_guests: room.max_guests,
    room_number: room.room_number,
    rating: room.rating,
    review_count: room.review_count,
    status: room.status,
    amenities: room.amenities,
    images: room.images,
    check_in_time: room.check_in_time?.trim() || DEFAULT_CHECK_IN_TIME,
    check_out_time: room.check_out_time?.trim() || DEFAULT_CHECK_OUT_TIME,
    map_embed_url: room.mapEmbedUrl ?? null,
    maps_link: room.mapsLink ?? null,
    caretaker_phone: room.caretaker_phone?.trim() || null,
    final_capacity: room.final_capacity != null && room.final_capacity > 0 ? room.final_capacity : null,
    is_active: true,
  };

  const existingUuid = await resolveVillaUuid(room.id);
  if (existingUuid) {
    const { error } = await supabase.from('villas').update(payload).eq('id', existingUuid);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from('villas').insert({
    ...payload,
    legacy_id: payload.legacy_id ?? villaLegacyId(room) ?? room.id,
  });
  if (error) throw error;
}

export async function deleteVillaFromSupabase(roomId: string): Promise<void> {
  const uuid = await resolveVillaUuid(roomId);
  if (!uuid) return;
  const { error } = await supabase.from('villas').update({ is_active: false }).eq('id', uuid);
  if (error) throw error;
}

export async function insertBookingToSupabase(
  booking: AdminBooking,
  payment?: { orderId?: string; paymentId?: string },
): Promise<string | null> {
  const villaId = await resolveVillaUuid(booking.roomId);
  if (!villaId) throw new Error('Villa not found in database');

  const dbStatus =
    booking.status === 'completed'
      ? 'completed'
      : booking.status === 'cancelled'
        ? 'cancelled'
        : booking.status === 'confirmed'
          ? 'confirmed'
          : 'pending';

  const row = {
    villa_id: villaId,
    booking_ref: booking.bookingRef,
    check_in: booking.checkIn,
    check_out: booking.checkOut,
    adults: booking.guests,
    children: 0,
    total_amount: booking.total,
    base_amount: booking.total * 0.82,
    taxes: booking.total * 0.18,
    status: dbStatus,
    payment_status: booking.status === 'confirmed' ? 'paid' : 'pending',
    payment_gateway: payment?.paymentId ? 'razorpay' : null,
    razorpay_order_id: payment?.orderId ?? null,
    razorpay_payment_id: payment?.paymentId ?? null,
    guest_name: booking.guestName,
    guest_email: booking.guestEmail,
    guest_phone: null,
  };

  const { data, error } = await supabase.from('bookings').insert(row).select('id').single();

  if (error?.code === '23505') {
    const { data: existing, error: fetchError } = await supabase
      .from('bookings')
      .select('id')
      .eq('booking_ref', booking.bookingRef)
      .maybeSingle();
    if (fetchError) throw fetchError;
    return existing?.id ?? null;
  }

  if (error) throw error;
  return data?.id ?? null;
}

export async function updateBookingInSupabase(id: string, patch: Partial<AdminBooking>): Promise<void> {
  const row: Record<string, unknown> = {};
  if (patch.status) {
    row.status =
      patch.status === 'completed'
        ? 'completed'
        : patch.status === 'cancelled'
          ? 'cancelled'
          : patch.status === 'confirmed'
            ? 'confirmed'
            : 'pending';
  }
  if (patch.total !== undefined) row.total_amount = patch.total;
  if (patch.checkIn) row.check_in = patch.checkIn;
  if (patch.checkOut) row.check_out = patch.checkOut;
  if (patch.guests !== undefined) row.adults = patch.guests;
  if (patch.guestName) row.guest_name = patch.guestName;
  if (patch.guestEmail) row.guest_email = patch.guestEmail;
  if (Object.keys(row).length === 0) return;

  const { error } = await supabase.from('bookings').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteBookingFromSupabase(id: string): Promise<void> {
  const { error } = await supabase.from('bookings').delete().eq('id', id);
  if (error) throw error;
}

export async function insertBlockedDateToSupabase(block: BlockedDate): Promise<BlockedDate> {
  const villaId = await resolveVillaUuid(block.roomId);
  if (!villaId) throw new Error('Villa not found');

  const { data, error } = await supabase
    .from('blocked_dates')
    .insert({
      villa_id: villaId,
      start_date: block.startDate,
      end_date: block.endDate,
      reason: block.reason,
      notes: block.notes ?? null,
      source: 'manual',
    })
    .select(BLOCKED_COLUMNS)
    .single();

  if (error) throw error;

  const legacyByUuid = new Map([[villaId, block.roomId]]);
  return mapBlockedRow(data as BlockedRow, legacyByUuid);
}

export async function deleteBlockedDateFromSupabase(id: string): Promise<void> {
  const { error } = await supabase.from('blocked_dates').delete().eq('id', id);
  if (error) throw error;
}

export async function upsertFacilityToSupabase(facility: Facility): Promise<void> {
  const payload = {
    name: facility.name,
    description: facility.description,
    image: facility.image,
    hours: facility.hours,
    is_active: true,
  };
  const isUuid = facility.id.includes('-') && facility.id.length > 20;
  if (isUuid) {
    const { error } = await supabase.from('facilities').update(payload).eq('id', facility.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('facilities').insert(payload);
    if (error) throw error;
  }
}

export async function deleteFacilityFromSupabase(id: string): Promise<void> {
  const { error } = await supabase.from('facilities').delete().eq('id', id);
  if (error) throw error;
}

export async function upsertPropertyToSupabase(property: PropertyForSale): Promise<void> {
  const payload = {
    legacy_id: property.id.startsWith('sale-') ? property.id : property.id,
    title: property.title,
    category: property.category,
    description: property.description,
    long_description: property.longDescription,
    price_amount: property.price,
    price_on_request: property.priceOnRequest ?? false,
    location: property.location,
    address: property.address,
    bedrooms: property.bedrooms ?? null,
    bathrooms: property.bathrooms ?? null,
    area_label: property.areaLabel,
    status: property.status,
    images: property.images,
    highlights: property.highlights,
    map_embed_url: property.mapEmbedUrl ?? null,
    maps_link: property.mapsLink ?? null,
    is_active: true,
  };

  let existingQuery = supabase.from('properties_for_sale').select('id');
  existingQuery = isUuid(property.id)
    ? existingQuery.eq('id', property.id)
    : existingQuery.eq('legacy_id', property.id);
  const { data: existing } = await existingQuery.maybeSingle();

  if (existing?.id) {
    const { error } = await supabase.from('properties_for_sale').update(payload).eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('properties_for_sale').insert(payload);
    if (error) throw error;
  }
}

export async function deletePropertyFromSupabase(id: string): Promise<void> {
  let query = supabase.from('properties_for_sale').select('id');
  query = isUuid(id) ? query.eq('id', id) : query.eq('legacy_id', id);
  const { data } = await query.maybeSingle();
  if (!data?.id) return;
  const { error } = await supabase.from('properties_for_sale').update({ is_active: false }).eq('id', data.id);
  if (error) throw error;
}

import { createClient } from '@supabase/supabase-js';
import { addYears, format, subDays } from 'date-fns';
import { checkRoomAvailability } from '../src/lib/availability';
import type { AdminBooking, BlockedDate } from '../src/types/site';

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase is not configured for availability checks.');
  }
  return createClient(url, key);
}

type BookingRow = {
  id: string;
  villa_id: string;
  booking_ref: string;
  check_in: string;
  check_out: string;
  status: string;
  guest_name: string;
  guest_email: string;
  total_amount: number;
  villas?: { name: string; legacy_id: string | null } | null;
};

type BlockedRow = {
  id: string;
  villa_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  source: string;
};

function villaPublicId(row: { id: string; legacy_id?: string | null }): string {
  return row.legacy_id?.trim() || row.id;
}

function mapBooking(row: BookingRow): AdminBooking {
  const villa = row.villas;
  const roomId = villa ? villaPublicId({ id: row.villa_id, legacy_id: villa.legacy_id }) : row.villa_id;
  let status: AdminBooking['status'] = 'pending';
  if (row.status === 'confirmed' || row.status === 'checked_in') status = 'confirmed';
  else if (row.status === 'cancelled') status = 'cancelled';
  else if (row.status === 'completed' || row.status === 'checked_out') status = 'completed';

  return {
    id: row.id,
    roomId,
    roomName: villa?.name ?? 'Villa',
    guestName: row.guest_name,
    guestEmail: row.guest_email,
    checkIn: row.check_in,
    checkOut: row.check_out,
    guests: 1,
    total: Number(row.total_amount),
    status,
    bookingRef: row.booking_ref,
    bookedAt: row.check_in,
  };
}

export async function checkRoomAvailabilityRemote(
  roomId: string,
  checkIn: string,
  checkOut: string,
) {
  const supabase = getSupabase();

  const villaQuery = supabase.from('villas').select('id, legacy_id').eq('is_active', true);
  const { data: villas, error: villaError } = await villaQuery;
  if (villaError) throw villaError;

  const villa = (villas ?? []).find(
    (v) => v.id === roomId || v.legacy_id === roomId || villaPublicId(v) === roomId,
  );
  if (!villa) {
    return { available: false, reason: 'Villa not found.' };
  }

  const since = format(subDays(new Date(), 30), 'yyyy-MM-dd');
  const until = format(addYears(new Date(), 2), 'yyyy-MM-dd');

  const [bookingsRes, blockedRes] = await Promise.all([
    supabase
      .from('bookings')
      .select('*, villas(name, legacy_id)')
      .eq('villa_id', villa.id)
      .neq('status', 'cancelled')
      .gte('check_out', since)
      .lte('check_in', until),
    supabase.from('blocked_dates').select('*').eq('villa_id', villa.id),
  ]);

  if (bookingsRes.error) throw bookingsRes.error;
  if (blockedRes.error) throw blockedRes.error;

  const legacyByUuid = new Map((villas ?? []).map((v) => [v.id, villaPublicId(v)]));
  const bookings = ((bookingsRes.data ?? []) as BookingRow[]).map(mapBooking);
  const blockedDates: BlockedDate[] = ((blockedRes.data ?? []) as BlockedRow[]).map((row) => ({
    id: row.id,
    roomId: legacyByUuid.get(row.villa_id) ?? row.villa_id,
    startDate: row.start_date,
    endDate: row.end_date,
    reason: row.reason,
    source: 'manual' as const,
    createdAt: new Date().toISOString(),
  }));

  return checkRoomAvailability(roomId, checkIn, checkOut, bookings, blockedDates);
}

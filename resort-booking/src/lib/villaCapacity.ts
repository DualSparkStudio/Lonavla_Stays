import type { Room } from '../data/resort';

/** Hard cap on selectable guests for a villa (admin: final capacity). */
export function getVillaFinalCapacity(room: Pick<Room, 'final_capacity' | 'max_guests' | 'extra_guest_limit'>): number {
  if (room.final_capacity != null && room.final_capacity > 0) {
    return Math.floor(room.final_capacity);
  }
  const legacyMax = room.max_guests + (room.extra_guest_limit ?? 10);
  return Math.max(legacyMax, room.max_guests, 1);
}

export function clampGuestCount(
  room: Pick<Room, 'final_capacity' | 'max_guests' | 'extra_guest_limit'>,
  count: number,
): number {
  const max = getVillaFinalCapacity(room);
  const parsed = Number.isFinite(count) ? Math.floor(count) : 1;
  return Math.min(max, Math.max(1, parsed));
}

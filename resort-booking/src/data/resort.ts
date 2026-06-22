export const RESORT_NAME = 'The Lonavala Stays';
export const BRAND_TAGLINE = 'Curated luxury villas across Lonavala';
export const RESORT_LOCATION = 'Lonavala, Maharashtra';
/** Reservations & management office (not a single guest property). */
export const RESORT_ADDRESS = 'Office 2, Hill Plaza, Old Mumbai-Pune Highway, Lonavala 410401';
export const RESORT_PHONE = '+91 98765 43210';
export const RESORT_EMAIL = 'stay@lonavalastays.com';

export type Room = {
  id: string;
  name: string;
  room_type: string;
  description: string;
  price_per_night: number;
  /** Area or neighbourhood shown on cards, e.g. Tiger Valley */
  location: string;
  /** Full street address for this villa property */
  address: string;
  /** Guests included in the base nightly rate (DB column: max_guests) */
  max_guests: number;
  /** Internal reference code */
  room_number: string;
  rating: number;
  review_count: number;
  status: 'available' | 'maintenance' | 'occupied';
  amenities: string[];
  images: string[];
  /** Optional standard check-in time text, e.g. 2:00 PM */
  check_in_time?: string;
  /** Optional standard check-out time text, e.g. 11:00 AM */
  check_out_time?: string;
  /** Refundable security deposit amount in INR */
  refundable_security_deposit?: number;
  /** Number of additional guests allowed beyond max_guests */
  extra_guest_limit?: number;
  /** Extra guest cost in INR per guest per night */
  extra_guest_cost?: number;
  /** Google Maps embed iframe src, embed URL, or share link */
  mapEmbedUrl?: string;
};

export const DEFAULT_CHECK_IN_TIME = '13:00';
export const DEFAULT_CHECK_OUT_TIME = '11:00';

/** @deprecated Use checkInLabelFromTime(settings.checkInTime) so admin booking defaults stay in sync. */
export const VILLA_CHECK_IN_LABEL = '1:00 PM onwards';
/** @deprecated Use checkOutLabelFromTime(settings.checkOutTime) so admin booking defaults stay in sync. */
export const VILLA_CHECK_OUT_LABEL = '11:00 AM sharp';
/** @deprecated Use checkInOutSummaryFromTimes(settings.checkInTime, settings.checkOutTime). */
export const VILLA_CHECK_IN_OUT_SUMMARY = 'Check-in: 1:00 PM onwards | Check-out: 11:00 AM sharp';

export function checkInLabelFromTime(checkInTime: string): string {
  return `${formatTimeLabel(checkInTime || DEFAULT_CHECK_IN_TIME)} onwards`;
}

export function checkOutLabelFromTime(checkOutTime: string): string {
  return `${formatTimeLabel(checkOutTime || DEFAULT_CHECK_OUT_TIME)} sharp`;
}

export function checkInOutSummaryFromTimes(checkInTime: string, checkOutTime: string): string {
  return `Check-in: ${checkInLabelFromTime(checkInTime)} | Check-out: ${checkOutLabelFromTime(checkOutTime)}`;
}
export const DEFAULT_GST_PERCENT = 18;
export const DEFAULT_EXTRA_PERSON_CHARGE = 1500;

export type Time12Parts = {
  hour: number;
  minute: number;
  period: 'AM' | 'PM';
};

export function parseTime24(value: string, fallback: Time12Parts): Time12Parts {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return fallback;
  const hour24 = Number(match[1]);
  const minute = Number(match[2]);
  if (Number.isNaN(hour24) || Number.isNaN(minute) || minute > 59 || hour24 > 23) return fallback;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour = hour24 % 12 || 12;
  return { hour, minute, period };
}

export function formatTime24(parts: Time12Parts): string {
  const hour = Math.min(12, Math.max(1, Math.round(parts.hour) || 1));
  const minute = Math.min(59, Math.max(0, Math.round(parts.minute) || 0));
  let hour24: number;
  if (parts.period === 'AM') {
    hour24 = hour === 12 ? 0 : hour;
  } else {
    hour24 = hour === 12 ? 12 : hour + 12;
  }
  return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function formatTimeLabel(value: string): string {
  if (!value) return '';
  const { hour, minute, period } = parseTime24(value, { hour: 12, minute: 0, period: 'AM' });
  return `${hour}:${String(minute).padStart(2, '0')} ${period}`;
}

export const demoRooms: Room[] = [
  {
    id: '1',
    name: 'Valley View Villa',
    room_type: 'Deluxe Villa',
    description:
      'A standalone hill villa with misty Sahyadri views from a private deck. Ideal for couples and small families seeking a quiet Lonavala escape.',
    price_per_night: 6500,
    location: 'Tiger Valley, Lonavala',
    address: 'Survey No. 12, Tiger Valley Road, Lonavala, Maharashtra 410401',
    max_guests: 3,
    room_number: 'VV-01',
    rating: 4.9,
    review_count: 128,
    status: 'available',
    amenities: ['Valley View', 'Private Deck', 'Wi-Fi', 'Air Conditioning', 'Kitchenette', 'Breakfast Included'],
    images: [
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1566665797739-1674de666a01?w=800&h=600&fit=crop',
    ],
  },
  {
    id: '2',
    name: 'Garden Wing Villa',
    room_type: 'Family Villa',
    description:
      'Spacious private villa with landscaped gardens and a separate living wing—perfect for families who want their own property in the hills.',
    price_per_night: 9200,
    location: 'Tungarli, Lonavala',
    address: 'Lane 4, Near Tungarli Lake, Lonavala, Maharashtra 410403',
    max_guests: 5,
    room_number: 'GW-02',
    rating: 4.8,
    review_count: 89,
    status: 'available',
    amenities: ['Private Garden', 'Living Area', 'Wi-Fi', 'Air Conditioning', 'Parking', 'BBQ Patio'],
    images: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
    ],
  },
  {
    id: '3',
    name: 'Hillside Premium Villa',
    room_type: 'Premium Villa',
    description:
      'Flagship villa with panoramic hill views, premium interiors, and a large sit-out—our most requested property for special occasions.',
    price_per_night: 11500,
    location: 'Khandala Hills, Lonavala',
    address: 'Plot 8, Khandala View Road, Lonavala, Maharashtra 410401',
    max_guests: 4,
    room_number: 'HP-03',
    rating: 5.0,
    review_count: 64,
    status: 'available',
    amenities: ['Panoramic View', 'King Bed', 'Private Pool', 'Wi-Fi', 'Chef on Request', 'Tea/Coffee Bar'],
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
    ],
  },
  {
    id: '4',
    name: 'Garden Cottage Villa',
    room_type: 'Cottage Villa',
    description:
      'Intimate standalone cottage tucked into greenery—romantic, private, and fully self-contained with its own entrance and patio.',
    price_per_night: 7800,
    location: 'Kurvande, Lonavala',
    address: 'Cottage 12, Green Meadows Estate, Kurvande, Lonavala 410401',
    max_guests: 2,
    room_number: 'GC-04',
    rating: 4.7,
    review_count: 52,
    status: 'available',
    amenities: ['Private Entry', 'Garden Patio', 'Wi-Fi', 'Air Conditioning', 'Complimentary Breakfast', 'Parking'],
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&h=600&fit=crop',
    ],
  },
];

export const resortFacilities = [
  {
    id: 'pool',
    name: 'Private & shared pools',
    description: 'Select villas include plunge or infinity pools; others are a short drive from scenic lake spots.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=500&fit=crop',
    hours: 'Varies by villa',
  },
  {
    id: 'spa',
    name: 'In-villa wellness',
    description: 'Spa and massage partners can be arranged at your villa—no need to leave the property.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=500&fit=crop',
    hours: 'By appointment',
  },
  {
    id: 'dining',
    name: 'Chef & dining',
    description: 'In-villa meals, barbecue nights, and local Maharashtrian menus on request across the collection.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop',
    hours: 'On request',
  },
  {
    id: 'bonfire',
    name: 'Outdoor experiences',
    description: 'Bonfires, stargazing decks, and terrace evenings—set up at villas with outdoor space.',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587209?w=800&h=500&fit=crop',
    hours: 'Seasonal',
  },
  {
    id: 'trek',
    name: 'Nature trails & treks',
    description: 'Our team coordinates guided walks and viewpoints near each villa’s neighbourhood.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop',
    hours: 'By appointment',
  },
  {
    id: 'games',
    name: 'Family recreation',
    description: 'Board games, indoor lounges, and kid-friendly setups—amenities vary; check each villa listing.',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587209?w=800&h=500&fit=crop',
    hours: 'Varies by villa',
  },
];

export function getRoomById(id: string): Room | undefined {
  return demoRooms.find((room) => room.id === id);
}

export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export type BookingConfirmationData = {
  bookingRef: string;
  paymentId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: string;
  roomName: string;
  roomImage?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestsIncluded?: number;
  extraGuests?: number;
  nights: number;
  basePrice: number;
  extraGuestsCharge?: number;
  /** @deprecated use extraGuestsCharge */
  adultsCharge?: number;
  total: number;
  amountPaid?: number;
  balanceDue?: number;
  paymentCompleted: boolean;
};

const STORAGE_KEY = 'lonavala-booking-confirmation';

export function saveBookingConfirmation(data: BookingConfirmationData): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadBookingConfirmation(bookingRef?: string): BookingConfirmationData | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as BookingConfirmationData;
    if (bookingRef && data.bookingRef !== bookingRef) return null;
    return data;
  } catch {
    return null;
  }
}

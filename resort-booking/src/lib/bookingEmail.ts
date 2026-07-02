import { loadSmtpNotificationSettings } from './smtpSettings';

export type BookingEmailRequest = {
  bookingRef: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  roomId: string;
  roomName: string;
  roomImage?: string;
  roomAddress?: string;
  roomLocation?: string;
  mapEmbedUrl?: string;
  mapsLink?: string;
  caretakerPhone?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestsIncluded?: number;
  extraGuests?: number;
  nights: number;
  basePrice: number;
  extraGuestsCharge?: number;
  total: number;
  amountPaid?: number;
  balanceDue?: number;
  paymentId?: string;
  paymentCompleted?: boolean;
  resortName?: string;
  resortPhone?: string;
  resortEmail?: string;
  resortAddress?: string;
  resortLocation?: string;
  checkInTime?: string;
  checkOutTime?: string;
  siteUrl?: string;
  houseRuleHighlights?: string[];
  adminEmail?: string;
};

export type BookingEmailResponse = {
  sent: boolean;
  guestSent: boolean;
  adminSent: boolean;
  skipped?: boolean;
  message?: string;
  error?: string;
};

export type SmtpStatusResponse = {
  configured: boolean;
  verified?: boolean;
  host?: string;
  port?: number;
  fromEmail?: string;
  adminEmail?: string;
  error?: string;
};

async function parseApiJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    if (text.trimStart().startsWith('<!')) {
      throw new Error(
        'API returned HTML instead of JSON. Restart npm run dev from resort-booking/ and ensure /api routes are available.',
      );
    }
    throw new Error('Invalid API response');
  }
}

export async function fetchSmtpStatus(verify = false): Promise<SmtpStatusResponse> {
  const res = await fetch(`/api/smtp-status${verify ? '?verify=true' : ''}`);
  const data = await parseApiJson<SmtpStatusResponse>(res);
  if (!res.ok) throw new Error(data.error || 'Failed to check SMTP status');
  return data;
}

export type ContactMessageEmailRequest = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  adminEmail?: string;
  resortName?: string;
};

export async function sendContactMessageEmail(payload: ContactMessageEmailRequest): Promise<void> {
  const res = await fetch('/api/send-contact-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await parseApiJson<{ error?: string }>(res);
  if (!res.ok) throw new Error(data.error || 'Failed to send your message');
}

export async function sendTestEmail(to: string, resortName?: string): Promise<void> {
  const res = await fetch('/api/send-test-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, resortName }),
  });
  const data = await parseApiJson<{ error?: string }>(res);
  if (!res.ok) throw new Error(data.error || 'Failed to send test email');
}

export async function sendBookingConfirmationEmails(
  payload: BookingEmailRequest,
): Promise<BookingEmailResponse> {
  const prefs = loadSmtpNotificationSettings();

  if (!prefs.sendGuestConfirmation && !prefs.sendAdminNotification) {
    return {
      sent: false,
      guestSent: false,
      adminSent: false,
      skipped: true,
      message: 'Email notifications disabled in admin settings',
    };
  }

  const adminEmail =
    payload.adminEmail?.trim() ||
    prefs.adminNotificationEmail.trim() ||
    undefined;

  const res = await fetch('/api/send-booking-emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      adminEmail,
      sendGuest: prefs.sendGuestConfirmation,
      sendAdmin: prefs.sendAdminNotification,
    }),
  });

  const data = (await res.json()) as BookingEmailResponse;
  if (!res.ok) throw new Error(data.error || 'Failed to send booking emails');
  return data;
}

/** Fire-and-forget helper used after a successful booking. */
export function notifyBookingByEmail(payload: BookingEmailRequest): void {
  sendBookingConfirmationEmails(payload).catch((error) => {
    console.warn('Booking confirmation email failed:', error);
  });
}

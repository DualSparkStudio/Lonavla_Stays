import { createTransporter, formatSmtpAuthError, getSmtpConfig } from './smtp';

import {
  BOOKING_ADVANCE_PAYMENT_PERCENT,
  calcAmountDueNow,
  calcBalanceDue,
} from '../src/lib/bookingPricing';

export type BookingEmailPayload = {
  bookingRef: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  basePrice: number;
  guestsIncluded?: number;
  extraGuests?: number;
  extraGuestsCharge?: number;
  /** @deprecated use extraGuestsCharge */
  adultsCharge?: number;
  /** @deprecated */
  extraAdultsCharge?: number;
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
  adminEmail?: string;
  sendGuest?: boolean;
  sendAdmin?: boolean;
};

const formatInr = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

const formatLongDate = (value: string) => {
  try {
    return new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return value;
  }
};

const formatTimeLabel = (value: string) => {
  if (!value) return '';
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return value;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return value;
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
};

const bookingIdLabel = (ref: string) => {
  const digits = ref.replace(/\D/g, '');
  return digits ? `#${digits}` : `#${ref}`;
};

function statusPill(label: string, bg: string, color: string) {
  return `<span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${bg};color:${color};font-size:13px;font-weight:500;">${label}</span>`;
}

function sectionTitle(icon: string, title: string) {
  return `<h2 style="margin:0 0 14px;font-size:17px;color:#111827;font-weight:600;">${icon} ${title}</h2>`;
}

function detailLine(label: string, value: string, valueStyle = '') {
  return `<p style="margin:0 0 10px;font-size:15px;line-height:1.5;color:#374151;font-weight:400;">
    <span style="color:#6b7280;">${label}:</span>
    <span style="color:#111827;${valueStyle}"> ${value}</span>
  </p>`;
}

function unitRate(total: number, count: number, nights: number) {
  if (count <= 0 || nights <= 0) return 0;
  return Math.round(total / (count * nights));
}

function priceRowWithDetail(label: string, amount: number, detail?: string, emphasizeTotal = false) {
  const weight = emphasizeTotal ? 500 : 400;
  const size = emphasizeTotal ? '16px' : '15px';
  const detailCell = detail
    ? `<span style="flex:1;text-align:center;color:#6b7280;font-size:14px;font-weight:400;">${detail}</span>`
    : `<span style="flex:1;"></span>`;
  return `<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin:0 0 8px;font-size:${size};color:#374151;font-weight:400;">
    <span style="flex-shrink:0;font-weight:400;">${label}</span>
    ${detailCell}
    <span style="font-weight:${weight};color:#111827;white-space:nowrap;flex-shrink:0;">${formatInr(amount)}</span>
  </div>`;
}

function buildPriceBreakdownHtml(payload: BookingEmailPayload) {
  const extraGuestsCharge =
    payload.extraGuestsCharge ?? payload.adultsCharge ?? payload.extraAdultsCharge ?? 0;
  const basePrice = payload.basePrice ?? Math.max(0, payload.total - extraGuestsCharge);
  const nights = Math.max(1, payload.nights);
  const extraGuests = payload.extraGuests ?? 0;
  const amountPaid = payload.amountPaid ?? calcAmountDueNow(payload.total);
  const balanceDue = payload.balanceDue ?? calcBalanceDue(payload.total, amountPaid);

  let rows = priceRowWithDetail('Villa price', basePrice);
  if (extraGuestsCharge > 0) {
    const detail =
      extraGuests > 0 ? `${extraGuests} extra guest${extraGuests !== 1 ? 's' : ''}` : undefined;
    rows += priceRowWithDetail('Extra guests', extraGuestsCharge, detail);
  }
  rows += `<div style="border-top:1px solid #d1d5db;margin:10px 0 8px;"></div>`;
  rows += priceRowWithDetail('Total amount', payload.total, undefined, true);
  rows += priceRowWithDetail(
    `Paid (${BOOKING_ADVANCE_PAYMENT_PERCENT}%)`,
    amountPaid,
    undefined,
    false,
  );
  rows += priceRowWithDetail('Balance due at check-in', balanceDue);

  return `<div style="margin:20px 0 24px;padding:18px 20px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;">
    ${sectionTitle('💳', 'Price breakdown')}
    ${rows}
  </div>`;
}

function emailShell(headerTitle: string, headerSubtitle: string, body: string, resortName: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:28px 12px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr>
          <td style="background:#2563eb;padding:28px 32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:600;">${headerTitle}</h1>
            <p style="margin:10px 0 0;color:rgba(255,255,255,0.95);font-size:15px;">${headerSubtitle}</p>
          </td>
        </tr>
        <tr><td style="padding:32px;">${body}</td></tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #f3f4f6;background:#fafafa;color:#6b7280;font-size:12px;text-align:center;line-height:1.6;">
            This is an automated notification from ${resortName}. If you have any questions, please contact us directly.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildGuestEmail(payload: BookingEmailPayload, resortName: string) {
  const phone = payload.resortPhone?.trim() || '';
  const email = payload.resortEmail?.trim() || '';
  const address = [payload.resortAddress, payload.resortLocation].filter(Boolean).join(', ');
  const checkInTime = formatTimeLabel(payload.checkInTime || '14:00');
  const checkOutTime = formatTimeLabel(payload.checkOutTime || '11:00');
  const paymentLabel = payload.paymentCompleted === false ? 'Pending' : 'Paid';
  const paymentColors =
    payload.paymentCompleted === false
      ? { bg: '#fef3c7', color: '#92400e' }
      : { bg: '#dbeafe', color: '#1e40af' };

  const body = `
    <p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:#111827;font-weight:400;">Dear ${payload.guestName},</p>
    <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#374151;font-weight:400;">
      Your booking has been successfully confirmed! We&apos;re excited to welcome you to ${resortName}.
    </p>

    ${sectionTitle('📋', 'Booking Details')}
    ${detailLine('Booking ID', bookingIdLabel(payload.bookingRef))}
    ${detailLine('Status', statusPill('Confirmed', '#dcfce7', '#166534'))}
    ${detailLine('Villa', payload.roomName)}
    ${detailLine('Check-in Date', formatLongDate(payload.checkIn))}
    ${detailLine('Check-out Date', formatLongDate(payload.checkOut))}
    ${detailLine('Number of Nights', `${payload.nights} ${payload.nights === 1 ? 'night' : 'nights'}`)}
    ${detailLine('Number of Guests', `${payload.guests} ${payload.guests === 1 ? 'guest' : 'guests'}`)}
    ${detailLine('Payment Status', statusPill(paymentLabel, paymentColors.bg, paymentColors.color))}

    ${buildPriceBreakdownHtml(payload)}

    <div style="margin:28px 0 24px;padding:18px 20px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;">
      ${sectionTitle('📞', 'Important Information')}
      ${detailLine('Check-in Time', `${checkInTime} onwards (flexible depending on other bookings)`)}
      ${detailLine('Check-out Time', `${checkOutTime} (flexible depending on other bookings)`)}
      ${address ? detailLine('Address', address) : ''}
      <p style="margin:12px 0 0;font-size:13px;line-height:1.6;color:#78716c;font-style:italic;">
        Note: Check-in and check-out times are flexible. Please contact us if you need an early check-in or late check-out.
      </p>
    </div>

    <div style="margin-bottom:8px;">
      ${sectionTitle('📞', 'Contact Information')}
      ${phone ? detailLine('Phone', phone) : ''}
      ${email ? detailLine('Email', `<a href="mailto:${email}" style="color:#2563eb;text-decoration:none;">${email}</a>`) : ''}
      ${phone ? detailLine('WhatsApp', phone) : ''}
    </div>`;

  return emailShell('🎉 Booking Confirmed!', `Thank you for choosing ${resortName}`, body, resortName);
}

function buildAdminEmail(payload: BookingEmailPayload, resortName: string) {
  const body = `
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#374151;">
      A new booking has been confirmed on the website.
    </p>
    ${sectionTitle('📋', 'Booking Details')}
    ${detailLine('Booking ID', bookingIdLabel(payload.bookingRef))}
    ${detailLine('Guest', payload.guestName)}
    ${detailLine('Guest email', `<a href="mailto:${payload.guestEmail}" style="color:#2563eb;">${payload.guestEmail}</a>`)}
    ${payload.guestPhone ? detailLine('Guest phone', payload.guestPhone) : ''}
    ${detailLine('Villa', payload.roomName)}
    ${detailLine('Check-in', formatLongDate(payload.checkIn))}
    ${detailLine('Check-out', formatLongDate(payload.checkOut))}
    ${detailLine('Guests', String(payload.guests))}
    ${detailLine('Nights', String(payload.nights))}
    ${payload.paymentId ? detailLine('Payment ref', payload.paymentId) : ''}

    ${buildPriceBreakdownHtml(payload)}
    <p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#374151;font-weight:400;">
      Review this booking in the admin panel under Bookings or Calendar.
    </p>`;

  return emailShell('📬 New Booking Received', resortName, body, resortName);
}

export type SendBookingEmailsResult = {
  sent: boolean;
  guestSent: boolean;
  adminSent: boolean;
  skipped?: boolean;
  message?: string;
};

export async function sendBookingConfirmationEmails(
  payload: BookingEmailPayload,
): Promise<SendBookingEmailsResult> {
  const config = getSmtpConfig();
  if (!config) {
    return {
      sent: false,
      guestSent: false,
      adminSent: false,
      skipped: true,
      message: 'SMTP not configured',
    };
  }

  const resortName = payload.resortName || config.fromName;
  const adminTo = payload.adminEmail?.trim() || config.adminEmail;
  const transporter = createTransporter();
  const from = `"${config.fromName}" <${config.fromEmail}>`;
  const guestSubject = `Booking Confirmation ${bookingIdLabel(payload.bookingRef)} - ${resortName}`;

  const sendGuest = payload.sendGuest !== false;
  const sendAdmin = payload.sendAdmin !== false;

  const tasks: Promise<unknown>[] = [];
  if (sendGuest) {
    tasks.push(
      transporter.sendMail({
        from,
        to: payload.guestEmail,
        subject: guestSubject,
        html: buildGuestEmail(payload, resortName),
      }),
    );
  }
  if (sendAdmin && adminTo) {
    tasks.push(
      transporter.sendMail({
        from,
        to: adminTo,
        subject: `New booking ${bookingIdLabel(payload.bookingRef)} · ${payload.guestName} · ${payload.roomName}`,
        html: buildAdminEmail(payload, resortName),
      }),
    );
  }

  const results = await Promise.allSettled(tasks);
  let guestSent = !sendGuest;
  let adminSent = !sendAdmin;

  if (sendGuest) {
    guestSent = results[0]?.status === 'fulfilled';
  }
  if (sendAdmin) {
    const adminIndex = sendGuest ? 1 : 0;
    adminSent = results[adminIndex]?.status === 'fulfilled';
  }

  if (sendGuest && !guestSent) {
    console.error('Guest booking email failed:', results[0]?.status === 'rejected' ? results[0].reason : '');
  }
  if (sendAdmin && !adminSent) {
    const adminIndex = sendGuest ? 1 : 0;
    console.error('Admin booking email failed:', results[adminIndex]?.status === 'rejected' ? results[adminIndex].reason : '');
  }

  return {
    sent: guestSent && adminSent,
    guestSent,
    adminSent,
    message: guestSent && adminSent ? 'Emails sent' : 'One or more emails failed to send',
  };
}

export async function sendTestEmail(to: string, resortName?: string): Promise<void> {
  const config = getSmtpConfig();
  if (!config) throw new Error('SMTP is not configured');

  const name = resortName || config.fromName;
  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to,
      subject: `SMTP test · ${name}`,
      html: emailShell(
        'SMTP test successful',
        name,
        `<p style="margin:0;font-size:15px;line-height:1.6;color:#374151;">
        Your SMTP settings are working. Booking confirmation emails will be sent from this mailbox.
      </p>`,
        name,
      ),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send test email';
    throw new Error(formatSmtpAuthError(message));
  }
}

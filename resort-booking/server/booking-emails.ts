import { createTransporter, formatSmtpAuthError, getSmtpConfig } from './smtp';

import {
  buildBookingPriceBreakdown,
  calcAmountDueNow,
  calcBalanceDue,
  type PriceBreakdownLine,
} from '../src/lib/bookingPricing';
import { checkInOutSummaryFromTimes } from '../src/data/resort';
import { applyBookingTimesToPolicyItem } from '../src/lib/policySections';
import { defaultSiteSettings } from '../src/lib/siteStorage';
import { resolveGoogleMapsOpenUrl, resolveMapsDisplay } from '../src/lib/googleMaps';
import { normalizeImageUrl } from '../src/lib/imageUrl';

export type BookingEmailPayload = {
  bookingRef: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  roomName: string;
  roomImage?: string;
  roomAddress?: string;
  roomLocation?: string;
  mapEmbedUrl?: string;
  mapsLink?: string;
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
  siteUrl?: string;
  houseRuleHighlights?: string[];
  caretakerPhone?: string;
  adminEmail?: string;
  sendGuest?: boolean;
  sendAdmin?: boolean;
};

const formatInr = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** For href attributes — do not encode & or email clients may open a broken URL. */
function escapeHref(value: string): string {
  return value.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const formatShortDate = (value: string) => {
  try {
    return new Date(`${value}T12:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return value;
  }
};

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

const bookingIdLabel = (ref: string) => {
  const digits = ref.replace(/\D/g, '');
  return digits ? `#${digits}` : `#${ref}`;
};

const displayBookingRef = (ref: string) => ref.replace(/^LON/i, '') || ref.replace(/\D/g, '') || ref;

function resolveSiteUrl(payload: BookingEmailPayload): string {
  const fromPayload = payload.siteUrl?.trim();
  if (fromPayload) return fromPayload.replace(/\/$/, '');
  const fromEnv = (process.env.VITE_APP_URL || process.env.APP_URL || '').trim();
  return fromEnv.replace(/\/$/, '');
}

function resolveHouseRuleHighlights(payload: BookingEmailPayload): string[] {
  if (payload.houseRuleHighlights?.length) return payload.houseRuleHighlights;
  const checkInTime = payload.checkInTime || '13:00';
  const checkOutTime = payload.checkOutTime || '11:00';
  return defaultSiteSettings()
    .houseRulesSections.flatMap((section) => section.items)
    .slice(0, 3)
    .map((item) => applyBookingTimesToPolicyItem(item, checkInTime, checkOutTime));
}

function priceLinesFromPayload(payload: BookingEmailPayload): PriceBreakdownLine[] {
  const extraGuestsCharge =
    payload.extraGuestsCharge ?? payload.adultsCharge ?? payload.extraAdultsCharge ?? 0;
  const amountPaid = payload.amountPaid ?? calcAmountDueNow(payload.total);

  return buildBookingPriceBreakdown({
    nights: payload.nights,
    basePrice: payload.basePrice ?? Math.max(0, payload.total - extraGuestsCharge),
    guestCount: payload.guests,
    guestsIncluded: payload.guestsIncluded,
    extraGuests: payload.extraGuests,
    extraGuestsCharge,
    total: payload.total,
    amountDueNow: amountPaid,
    balanceDue: payload.balanceDue ?? calcBalanceDue(payload.total, amountPaid),
    showPaymentSplit: true,
    paymentCompleted: payload.paymentCompleted !== false,
  });
}

function renderPriceLine(line: PriceBreakdownLine): string {
  const amount = formatInr(line.amount);

  if (line.variant === 'total') {
    return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:8px;">
      <tr>
        <td style="padding-top:8px;border-top:1px solid #6ee7b7;font-size:20px;font-weight:700;color:#065f46;">${line.label}</td>
        <td align="right" style="padding-top:8px;border-top:1px solid #6ee7b7;font-size:20px;font-weight:700;color:#065f46;white-space:nowrap;">${amount}</td>
      </tr>
    </table>`;
  }

  if (line.variant === 'highlight') {
    return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:4px 0;background:#e0f2fe;border:1px solid #bae6fd;border-radius:8px;">
      <tr>
        <td style="padding:10px 12px;font-size:15px;font-weight:700;color:#0c4a6e;">${line.label}</td>
        <td align="right" style="padding:10px 12px;font-size:15px;font-weight:700;color:#0c4a6e;white-space:nowrap;">${amount}</td>
      </tr>
    </table>`;
  }

  const detailCell = line.detail
    ? `<td align="center" style="padding:4px 8px;font-size:13px;color:#6b7280;">${escapeHtml(line.detail)}</td>`
    : `<td style="padding:4px 8px;"></td>`;

  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:2px 0;">
    <tr>
      <td style="padding:4px 0;font-size:16px;color:#111827;white-space:nowrap;">${line.label}</td>
      ${detailCell}
      <td align="right" style="padding:4px 0;font-size:16px;font-weight:600;color:#111827;white-space:nowrap;">${amount}</td>
    </tr>
  </table>`;
}

function cardTable(
  borderColor: string,
  background: string,
  title: string,
  content: string,
  padding = '20px',
): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:20px;border:1px solid ${borderColor};border-radius:12px;background:${background};">
    <tr>
      <td style="padding:${padding};">
        <h2 style="margin:0 0 16px;font-size:16px;font-weight:700;color:#111827;">${title}</h2>
        ${content}
      </td>
    </tr>
  </table>`;
}

function infoField(label: string, value: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:12px;">
    <tr>
      <td style="padding:0;">
        <p style="margin:0 0 4px;font-size:16px;font-weight:500;color:#111827;">${label}</p>
        <p style="margin:0;font-size:16px;font-weight:600;color:#111827;">${value}</p>
      </td>
    </tr>
  </table>`;
}

function buildConfirmationHeader(payload: BookingEmailPayload): string {
  const displayId = displayBookingRef(payload.bookingRef);
  return `<tr>
    <td style="background:#059669;background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:40px 24px;text-align:center;">
      <table cellpadding="0" cellspacing="0" role="presentation" align="center" style="margin:0 auto 16px;">
        <tr>
          <td style="width:64px;height:64px;border-radius:999px;background:rgba(255,255,255,0.2);border:4px solid rgba(255,255,255,0.3);text-align:center;vertical-align:middle;font-size:36px;line-height:64px;color:#ffffff;">✓</td>
        </tr>
      </table>
      <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:32px;font-weight:700;color:#ffffff;letter-spacing:0.02em;">Booking Confirmed!</h1>
      <p style="margin:0;font-size:18px;line-height:1.5;color:#ecfdf5;">Your reservation has been successfully created.</p>
      <p style="margin:16px 0 0;">
        <span style="display:inline-block;padding:8px 20px;border-radius:999px;background:rgba(255,255,255,0.2);font-size:16px;font-weight:700;color:#ffffff;letter-spacing:0.03em;">Booking ID: #${escapeHtml(displayId)}</span>
      </p>
    </td>
  </tr>`;
}

function buildGuestBookingColumns(payload: BookingEmailPayload): string {
  const confirmedBadge = `<span style="display:inline-block;padding:2px 10px;border-radius:999px;background:#d1fae5;color:#065f46;font-size:12px;font-weight:700;">✓ Confirmed</span>`;
  const nightsLabel = `${payload.nights} Night${payload.nights !== 1 ? 's' : ''}`;

  const guestCard = cardTable(
    '#e0f2fe',
    'rgba(240,249,255,0.8)',
    '👤 Guest Information',
    `${infoField('Name', escapeHtml(payload.guestName))}
     ${infoField('Email', escapeHtml(payload.guestEmail))}
     ${payload.guestPhone?.trim() ? infoField('Phone', escapeHtml(payload.guestPhone.trim())) : ''}`,
  );

  const bookingCard = cardTable(
    '#ede9fe',
    'rgba(245,243,255,0.8)',
    '📅 Booking Details',
    `${infoField('Status', confirmedBadge)}
     ${infoField('Check-in', escapeHtml(formatShortDate(payload.checkIn)))}
     ${infoField('Check-out', escapeHtml(formatShortDate(payload.checkOut)))}
     ${infoField('Nights', escapeHtml(nightsLabel))}
     ${infoField('Total guests', escapeHtml(String(payload.guests)))}`,
  );

  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:20px;">
    <tr>
      <td class="stack-column" width="50%" valign="top" style="padding-right:10px;">${guestCard}</td>
      <td class="stack-column" width="50%" valign="top" style="padding-left:10px;">${bookingCard}</td>
    </tr>
  </table>`;
}

function buildVillaCard(payload: BookingEmailPayload, resortName: string, resortLocation?: string): string {
  const imageUrl = normalizeImageUrl(payload.roomImage);
  const locationSuffix = payload.roomLocation?.trim() || resortLocation?.trim();
  const subtitle = locationSuffix
    ? `${resortName} — private villa stay in ${locationSuffix}`
    : `${resortName} — private villa stay`;

  const imageCell = imageUrl
    ? `<td width="112" valign="middle" style="padding-right:16px;">
        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(payload.roomName)}" width="112" height="80" style="display:block;width:112px;height:80px;object-fit:cover;border-radius:8px;border:1px solid #fde68a;" />
      </td>`
    : '';

  const content = `<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      ${imageCell}
      <td valign="middle">
        <p style="margin:0 0 4px;font-size:20px;font-weight:700;color:#111827;">${escapeHtml(payload.roomName)}</p>
        <p style="margin:0;font-size:16px;line-height:1.5;color:#111827;">${escapeHtml(subtitle)}</p>
        ${payload.caretakerPhone?.trim()
          ? `<p style="margin:12px 0 0;font-size:15px;line-height:1.5;color:#111827;"><strong>Caretaker:</strong> ${escapeHtml(payload.caretakerPhone.trim())}</p>`
          : ''}
      </td>
    </tr>
  </table>`;

  return cardTable('#fef3c7', 'rgba(255,251,235,0.8)', '🏠 Villa Details', content);
}

function buildLocationCard(payload: BookingEmailPayload): string {
  const address = payload.roomAddress?.trim() || '';
  const location = payload.roomLocation?.trim() || '';
  const mapsUrl = resolveGoogleMapsOpenUrl(
    payload.mapEmbedUrl,
    address,
    location,
    payload.mapsLink,
  );
  const { hasMap } = resolveMapsDisplay(payload.mapEmbedUrl, address, location, payload.mapsLink);
  if (!hasMap || !mapsUrl) return '';

  const displayAddress = address || location;
  const safeMapsUrl = escapeHref(mapsUrl);

  const mapBlock = `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:16px;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;background:#f3f4f6;">
    <tr>
      <td style="padding:24px 20px;text-align:center;vertical-align:middle;background:linear-gradient(180deg,#e5e7eb 0%,#d1d5db 100%);">
        <p style="margin:0 0 8px;font-size:36px;line-height:1;">📍</p>
        <p style="margin:0 0 12px;padding:0 16px;font-size:14px;font-weight:600;color:#111827;">${escapeHtml(displayAddress)}</p>
        <a href="${safeMapsUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;font-size:14px;font-weight:700;color:#0284c7;text-decoration:underline;">Open in Google Maps →</a>
      </td>
    </tr>
  </table>`;

  return cardTable(
    '#e5e7eb',
    '#ffffff',
    'Location &amp; directions',
    mapBlock,
    '20px 24px',
  );
}

function buildPaymentCard(payload: BookingEmailPayload): string {
  const lines = priceLinesFromPayload(payload).map(renderPriceLine).join('');
  const paymentBadge =
    payload.paymentCompleted !== false
      ? `<p style="margin:16px 0 0;">
          <span style="display:inline-block;padding:6px 12px;border-radius:999px;background:#059669;font-size:12px;font-weight:700;color:#ffffff;">✓ Payment completed</span>
        </p>`
      : '';
  const paymentRef = payload.paymentId
    ? `<p style="margin:12px 0 0;font-size:12px;color:#6b7280;font-family:Consolas,Monaco,monospace;">Payment ref: ${escapeHtml(payload.paymentId)}</p>`
    : '';

  return cardTable(
    '#d1fae5',
    'rgba(236,253,245,0.8)',
    '💳 Payment Summary',
    `<div style="max-width:420px;">${lines}</div>${paymentBadge}${paymentRef}`,
  );
}

function buildImportantInfoCard(payload: BookingEmailPayload, resortName: string): string {
  const phone = payload.resortPhone?.trim() || '';
  const email = payload.resortEmail?.trim() || '';
  const siteUrl = resolveSiteUrl(payload);
  const termsUrl = siteUrl ? `${siteUrl}/terms` : '';
  const checkInOutSummary = checkInOutSummaryFromTimes(
    payload.checkInTime || '13:00',
    payload.checkOutTime || '11:00',
  );
  const highlights = resolveHouseRuleHighlights(payload);

  const bullets = [
    escapeHtml(checkInOutSummary),
    ...highlights.map((item) => escapeHtml(item)),
    payload.caretakerPhone?.trim()
      ? `On-site caretaker: <strong style="color:#ffffff;">${escapeHtml(payload.caretakerPhone.trim())}</strong>`
      : '',
    phone
      ? `For changes or cancellations, contact us at least 24 hours before check-in: <strong style="color:#ffffff;">${escapeHtml(phone)}</strong>`
      : 'For changes or cancellations, contact us at least 24 hours before check-in.',
    email
      ? `Email: <strong style="color:#ffffff;">${escapeHtml(email)}</strong>`
      : '',
    termsUrl
      ? `<a href="${escapeHref(termsUrl)}" style="color:#ffffff;font-weight:600;text-decoration:underline;">Read full terms &amp; conditions</a>`
      : 'Read full terms &amp; conditions on our website.',
  ]
    .filter(Boolean)
    .map(
      (item) =>
        `<li style="margin:0 0 8px;font-size:16px;line-height:1.6;color:#f0f9ff;">${item}</li>`,
    )
    .join('');

  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:20px;border-radius:12px;background:#0284c7;overflow:hidden;">
    <tr>
      <td style="padding:20px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td width="28" valign="top" style="padding-right:12px;font-size:22px;line-height:1.2;color:#ffffff;">ℹ️</td>
            <td valign="top">
              <h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#ffffff;">Important information</h2>
              <ul style="margin:0;padding:0 0 0 20px;">${bullets}</ul>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
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

function buildPriceBreakdownHtml(payload: BookingEmailPayload) {
  const lines = priceLinesFromPayload(payload).map(renderPriceLine).join('');
  return `<div style="margin:20px 0 24px;padding:18px 20px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;">
    ${sectionTitle('💳', 'Payment Summary')}
    ${lines}
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
  const siteUrl = resolveSiteUrl(payload);
  const homeButton = siteUrl
    ? `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:8px 0 0;">
        <tr>
          <td align="center">
            <a href="${escapeHref(siteUrl)}" style="display:inline-block;min-width:200px;padding:14px 28px;border-radius:8px;background:#0284c7;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;text-align:center;">Back to home</a>
          </td>
        </tr>
      </table>`
    : '';

  const body = `${buildGuestBookingColumns(payload)}
    ${buildVillaCard(payload, resortName, payload.resortLocation)}
    ${buildLocationCard(payload)}
    ${buildPaymentCard(payload)}
    ${homeButton}
    ${buildImportantInfoCard(payload, resortName)}`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    @media only screen and (max-width: 620px) {
      .stack-column { display: block !important; width: 100% !important; max-width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f5f5f4;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:768px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);">
          ${buildConfirmationHeader(payload)}
          <tr>
            <td style="padding:24px 32px 32px;">${body}</td>
          </tr>
        </table>
        <p style="margin:20px 0 0;font-size:12px;line-height:1.6;color:#6b7280;text-align:center;">
          This is an automated confirmation from ${escapeHtml(resortName)}.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
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

export type ContactMessageEmailPayload = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  adminEmail?: string;
  resortName?: string;
};

export async function sendContactMessageEmail(payload: ContactMessageEmailPayload): Promise<void> {
  const config = getSmtpConfig();
  if (!config) throw new Error('SMTP is not configured');

  const to = payload.adminEmail?.trim() || config.adminEmail;
  if (!to) throw new Error('Admin email is not configured');

  const resortName = payload.resortName?.trim() || config.fromName;
  const transporter = createTransporter();

  const body = `
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#374151;">
      A visitor submitted the contact form on your website.
    </p>
    ${detailLine('Name', escapeHtml(payload.name))}
    ${detailLine('Email', escapeHtml(payload.email))}
    ${payload.phone?.trim() ? detailLine('Phone', escapeHtml(payload.phone.trim())) : ''}
    ${detailLine('Subject', escapeHtml(payload.subject))}
    <div style="margin-top:16px;padding:16px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
      <p style="margin:0 0 8px;font-size:14px;color:#6b7280;font-weight:600;">Message</p>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#111827;white-space:pre-wrap;">${escapeHtml(payload.message)}</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to,
      replyTo: `"${payload.name}" <${payload.email}>`,
      subject: `Contact form · ${payload.subject}`,
      html: emailShell('New contact message', resortName, body, resortName),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send contact email';
    throw new Error(formatSmtpAuthError(message));
  }
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

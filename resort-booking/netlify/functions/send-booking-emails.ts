import type { Handler } from '@netlify/functions';
import { sendBookingConfirmationEmails, type BookingEmailPayload } from '../../server/booking-emails';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}') as BookingEmailPayload;

    if (!body.bookingRef || !body.guestEmail || !body.guestName || !body.roomName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required booking email fields' }),
      };
    }

    const result = await sendBookingConfirmationEmails(body);
    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send booking emails';
    return { statusCode: 500, headers, body: JSON.stringify({ error: message }) };
  }
};

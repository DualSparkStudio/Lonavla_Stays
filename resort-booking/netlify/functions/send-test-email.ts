import type { Handler } from '@netlify/functions';
import { sendTestEmail } from '../../server/booking-emails';

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
    const body = JSON.parse(event.body || '{}') as { to?: string; resortName?: string };

    if (!body.to?.trim()) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Recipient email is required' }) };
    }

    await sendTestEmail(body.to.trim(), body.resortName?.trim());
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send test email';
    return { statusCode: 500, headers, body: JSON.stringify({ error: message }) };
  }
};

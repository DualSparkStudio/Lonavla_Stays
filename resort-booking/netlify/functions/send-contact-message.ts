import type { Handler } from '@netlify/functions';
import { sendContactMessageEmail } from '../../server/booking-emails';

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
    const body = JSON.parse(event.body || '{}') as {
      name?: string;
      email?: string;
      phone?: string;
      subject?: string;
      message?: string;
      adminEmail?: string;
      resortName?: string;
    };

    if (!body.name?.trim() || !body.email?.trim() || !body.subject?.trim() || !body.message?.trim()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Name, email, subject, and message are required' }),
      };
    }

    await sendContactMessageEmail({
      name: body.name.trim(),
      email: body.email.trim(),
      phone: body.phone?.trim(),
      subject: body.subject.trim(),
      message: body.message.trim(),
      adminEmail: body.adminEmail?.trim(),
      resortName: body.resortName?.trim(),
    });

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send contact message';
    return { statusCode: 500, headers, body: JSON.stringify({ error: message }) };
  }
};

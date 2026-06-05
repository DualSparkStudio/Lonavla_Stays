import type { Handler } from '@netlify/functions';
import { checkRoomAvailabilityRemote } from '../../server/availability-handlers';

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
      roomId?: string;
      checkIn?: string;
      checkOut?: string;
    };

    if (!body.roomId || !body.checkIn || !body.checkOut) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'roomId, checkIn, and checkOut are required' }),
      };
    }

    const result = await checkRoomAvailabilityRemote(body.roomId, body.checkIn, body.checkOut);
    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Availability check failed';
    return { statusCode: 500, headers, body: JSON.stringify({ error: message, available: false }) };
  }
};

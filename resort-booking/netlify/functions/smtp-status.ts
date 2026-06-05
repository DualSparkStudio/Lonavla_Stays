import type { Handler } from '@netlify/functions';
import { checkSmtpConnection, getSmtpStatus } from '../../server/email-handlers';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const verify = event.queryStringParameters?.verify === 'true';
    const status = verify ? await checkSmtpConnection() : getSmtpStatus();
    return { statusCode: 200, headers, body: JSON.stringify({ ...status, verified: verify }) };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'SMTP check failed';
    return { statusCode: 500, headers, body: JSON.stringify({ error: message, configured: false }) };
  }
};

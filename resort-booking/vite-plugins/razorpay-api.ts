import fs from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import type { Connect } from 'vite';
import type { Plugin } from 'vite';
import {
  checkSmtpConnection,
  getSmtpStatus,
  sendBookingConfirmationEmails,
  sendTestEmail,
  type BookingEmailPayload,
} from '../server/email-handlers';
import { checkRoomAvailabilityRemote } from '../server/availability-handlers';
import { createRazorpayOrder, verifyRazorpaySignature } from '../server/razorpay-handlers';

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => {
      const data = Buffer.concat(chunks).toString('utf8');
      if (!data.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  if (res.writableEnded) return;
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function parseEnvLines(content: string): Record<string, string> {
  const env: Record<string, string> = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

/** Read .env files from disk on every API call (Vite's loadEnv can cache stale values in dev). */
function loadEnvFromDisk(root: string, mode: string): Record<string, string> {
  const merged: Record<string, string> = {};
  for (const file of ['.env', '.env.local', `.env.${mode}`, `.env.${mode}.local`]) {
    const filePath = path.join(root, file);
    try {
      if (!fs.existsSync(filePath)) continue;
      Object.assign(merged, parseEnvLines(fs.readFileSync(filePath, 'utf8')));
    } catch {
      // ignore unreadable env files
    }
  }
  return merged;
}

function reloadEnv(root: string, mode: string) {
  const loaded = loadEnvFromDisk(root, mode);
  for (const [key, value] of Object.entries(loaded)) {
    process.env[key] = value;
  }
  if (process.env.VITE_PAYMENT_DEMO_MODE && !process.env.PAYMENT_DEMO_MODE) {
    process.env.PAYMENT_DEMO_MODE = process.env.VITE_PAYMENT_DEMO_MODE;
  }
  // Vite dev: bypass Razorpay unless explicitly disabled
  if (mode === 'development' && process.env.VITE_PAYMENT_DEMO_MODE !== 'false') {
    process.env.PAYMENT_DEMO_MODE = 'true';
    process.env.VITE_PAYMENT_DEMO_MODE = 'true';
  }
}

function createApiMiddleware(root: string, mode: string): Connect.NextHandleFunction {
  return async (req, res, next) => {
    const pathname = req.url?.split('?')[0] ?? '';

    if (
      (pathname === '/api/create-razorpay-order' ||
        pathname === '/api/verify-razorpay-payment' ||
        pathname === '/api/send-booking-emails' ||
        pathname === '/api/send-test-email' ||
        pathname === '/api/smtp-status') &&
      (req.method === 'POST' || req.method === 'GET')
    ) {
      reloadEnv(root, mode);
    }

    if (pathname === '/api/create-razorpay-order' && req.method === 'POST') {
      try {
        const body = (await readJsonBody(req)) as {
          amountInr?: number;
          receipt?: string;
          notes?: Record<string, string>;
        };
        if (!body.amountInr || body.amountInr <= 0) {
          sendJson(res, 400, { error: 'Invalid amount' });
          return;
        }
        const order = await createRazorpayOrder({
          amountInr: body.amountInr,
          receipt: body.receipt || `booking_${Date.now()}`,
          notes: body.notes,
        });
        sendJson(res, 200, order);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create order';
        sendJson(res, 500, { error: message });
      }
      return;
    }

    if (pathname === '/api/verify-razorpay-payment' && req.method === 'POST') {
      try {
        const body = (await readJsonBody(req)) as {
          orderId?: string;
          paymentId?: string;
          signature?: string;
        };
        if (!body.orderId || !body.paymentId || !body.signature) {
          sendJson(res, 400, { error: 'Missing payment verification fields' });
          return;
        }
        const valid = verifyRazorpaySignature(body.orderId, body.paymentId, body.signature);
        if (!valid) {
          sendJson(res, 400, { error: 'Payment verification failed' });
          return;
        }
        sendJson(res, 200, { success: true, paymentId: body.paymentId });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Verification failed';
        sendJson(res, 500, { error: message });
      }
      return;
    }

    if (pathname === '/api/smtp-status' && req.method === 'GET') {
      try {
        const verify = new URL(req.url ?? '', 'http://localhost').searchParams.get('verify') === 'true';
        const status = verify ? await checkSmtpConnection() : getSmtpStatus();
        sendJson(res, 200, { ...status, verified: verify });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'SMTP check failed';
        sendJson(res, 500, { error: message, configured: false });
      }
      return;
    }

    if (pathname === '/api/send-booking-emails' && req.method === 'POST') {
      try {
        const body = (await readJsonBody(req)) as BookingEmailPayload;
        if (!body.bookingRef || !body.guestEmail || !body.guestName || !body.roomName) {
          sendJson(res, 400, { error: 'Missing required booking email fields' });
          return;
        }
        const result = await sendBookingConfirmationEmails(body);
        sendJson(res, 200, result);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to send booking emails';
        sendJson(res, 500, { error: message });
      }
      return;
    }

    if (pathname === '/api/check-availability' && req.method === 'POST') {
      try {
        const body = (await readJsonBody(req)) as {
          roomId?: string;
          checkIn?: string;
          checkOut?: string;
        };
        if (!body.roomId || !body.checkIn || !body.checkOut) {
          sendJson(res, 400, { error: 'roomId, checkIn, and checkOut are required' });
          return;
        }
        const result = await checkRoomAvailabilityRemote(body.roomId, body.checkIn, body.checkOut);
        sendJson(res, 200, result);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Availability check failed';
        sendJson(res, 500, { error: message, available: false });
      }
      return;
    }

    if (pathname === '/api/send-test-email' && req.method === 'POST') {
      try {
        const body = (await readJsonBody(req)) as { to?: string; resortName?: string };
        if (!body.to?.trim()) {
          sendJson(res, 400, { error: 'Recipient email is required' });
          return;
        }
        await sendTestEmail(body.to.trim(), body.resortName?.trim());
        sendJson(res, 200, { success: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to send test email';
        sendJson(res, 500, { error: message });
      }
      return;
    }

    next();
  };
}

/** Dev-only API routes mirroring Netlify functions for `npm run dev`. */
export function razorpayApiPlugin(): Plugin {
  return {
    name: 'razorpay-api-dev',
    enforce: 'pre',
    configureServer(server) {
      const { root, mode } = server.config;
      reloadEnv(root, mode);
      const api = createApiMiddleware(root, mode);

      // Must run before Vite's HTML fallback, which otherwise serves index.html for /api/* GETs.
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/api/')) {
          api(req, res, next);
          return;
        }
        next();
      });
    },
  };
}

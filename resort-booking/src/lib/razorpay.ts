import { formatPrice, RESORT_NAME } from '../data/resort';

export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;

/** true = bypass, false = force real Razorpay, unset = bypass on localhost */
function paymentBypassFromEnv(): boolean | undefined {
  const flag = import.meta.env.VITE_PAYMENT_DEMO_MODE;
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  return undefined;
}

function isLocalhostRuntime(): boolean {
  if (typeof window === 'undefined') return import.meta.env.DEV;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
}

/** Skip Razorpay on localhost unless VITE_PAYMENT_DEMO_MODE=false */
export function isPaymentDemoMode(): boolean {
  const fromEnv = paymentBypassFromEnv();
  if (fromEnv !== undefined) return fromEnv;
  return isLocalhostRuntime() || import.meta.env.DEV;
}

/** True when using Razorpay dashboard test keys (rzp_test_…) */
export function isRazorpayTestKey(keyId?: string): boolean {
  const key = keyId || RAZORPAY_KEY_ID;
  return Boolean(key?.startsWith('rzp_test_'));
}

export function getPaymentModeLabel(): string {
  if (isPaymentDemoMode() && isLocalhostRuntime()) return 'Local mode — Razorpay bypassed';
  if (isPaymentDemoMode()) return 'Demo test mode — no real payment';
  if (isRazorpayTestKey()) return 'Razorpay test mode — use test cards/UPI only';
  return 'Live payment';
}

const CHECKOUT_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

export interface CreateOrderPayload {
  amountInr: number;
  receipt: string;
  notes?: Record<string, string>;
}

export interface CreateOrderResponse {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
}

export interface RazorpayCheckoutParams {
  order: CreateOrderResponse;
  description: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes?: Record<string, string>;
}

let scriptPromise: Promise<void> | null = null;

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay can only run in the browser'));
  }
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = CHECKOUT_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout'));
    document.body.appendChild(script);
  });

  return scriptPromise;
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text.trim()) {
    if (response.status === 404) {
      throw new Error(
        'Payment API not found. Stop the dev server, run `npm run dev` from the resort-booking folder, then try again.',
      );
    }
    throw new Error(`Payment server returned an empty response (${response.status}).`);
  }

  let data: { error?: string } & T;
  try {
    data = JSON.parse(text) as { error?: string } & T;
  } catch {
    throw new Error('Payment server returned an invalid response. Please try again.');
  }

  if (!response.ok) {
    const msg = typeof data.error === 'string' ? data.error : `Payment request failed (${response.status})`;
    throw new Error(msg);
  }

  return data;
}

function createDemoOrder(payload: CreateOrderPayload): CreateOrderResponse {
  return {
    keyId: 'rzp_test_demo',
    orderId: `order_demo_${Date.now()}`,
    amount: Math.round(payload.amountInr * 100),
    currency: 'INR',
  };
}

export async function createRazorpayOrder(
  payload: CreateOrderPayload,
): Promise<CreateOrderResponse> {
  if (isPaymentDemoMode()) {
    return createDemoOrder(payload);
  }

  const response = await fetch('/api/create-razorpay-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return parseApiResponse<CreateOrderResponse>(response);
}

export async function verifyRazorpayPayment(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): Promise<void> {
  if (
    isPaymentDemoMode() &&
    params.paymentId.startsWith('pay_demo_') &&
    params.signature === 'demo_signature'
  ) {
    return;
  }

  const response = await fetch('/api/verify-razorpay-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  await parseApiResponse<{ success: boolean }>(response);
}

async function openDemoCheckout(params: RazorpayCheckoutParams): Promise<RazorpaySuccessResponse> {
  const amountInr = params.order.amount / 100;

  if (!import.meta.env.DEV) {
    const confirmed = window.confirm(
      `Demo test payment\n\n${params.description}\nAmount: ${formatPrice(amountInr)}\n\nNo real money will be charged. Continue?`,
    );
    if (!confirmed) throw new Error('Payment cancelled');
  }

  await new Promise((resolve) => setTimeout(resolve, import.meta.env.DEV ? 200 : 600));

  return {
    razorpay_order_id: params.order.orderId,
    razorpay_payment_id: `pay_demo_${Date.now()}`,
    razorpay_signature: 'demo_signature',
  };
}

export async function openRazorpayCheckout(
  params: RazorpayCheckoutParams,
): Promise<RazorpaySuccessResponse> {
  if (isPaymentDemoMode() || params.order.keyId === 'rzp_test_demo') {
    return openDemoCheckout(params);
  }

  if (!RAZORPAY_KEY_ID && !params.order.keyId) {
    throw new Error(
      'Razorpay is not configured. Add test keys to .env.local or enable VITE_PAYMENT_DEMO_MODE=true.',
    );
  }

  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: params.order.keyId || RAZORPAY_KEY_ID!,
      amount: params.order.amount,
      currency: params.order.currency,
      name: RESORT_NAME,
      description: params.description,
      order_id: params.order.orderId,
      prefill: params.prefill,
      notes: params.notes,
      theme: { color: '#FF385C' },
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
    });

    rzp.on('payment.failed', (response) => {
      reject(new Error(response.error?.description || 'Payment failed'));
    });

    rzp.open();
  });
}

export function handleRazorpayError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Something went wrong with payment. Please try again.';
}

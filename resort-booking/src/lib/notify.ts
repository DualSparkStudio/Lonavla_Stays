type ToastVariant = 'error' | 'success' | 'info';

type ToastPayload = { message: string; variant: ToastVariant };

type Listener = (payload: ToastPayload) => void;

const listeners = new Set<Listener>();

export function subscribeNotify(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(message: string, variant: ToastVariant) {
  const payload = { message, variant };
  listeners.forEach((l) => l(payload));
}

export const notify = {
  error: (message: string) => emit(message, 'error'),
  success: (message: string) => emit(message, 'success'),
  info: (message: string) => emit(message, 'info'),
};

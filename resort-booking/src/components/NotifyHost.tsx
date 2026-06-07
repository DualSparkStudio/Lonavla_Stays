import React, { useEffect, useState } from 'react';
import { subscribeNotify } from '../lib/notify';

const variantStyles: Record<string, string> = {
  error: 'bg-red-600 text-white',
  success: 'bg-green-600 text-white',
  info: 'bg-gray-800 text-white',
};

const NotifyHost: React.FC = () => {
  const [toast, setToast] = useState<{ message: string; variant: string } | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsub = subscribeNotify((payload) => {
      setToast(payload);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setToast(null), 4000);
    });
    return () => {
      unsub();
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!toast) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 z-[100] -translate-x-1/2 max-w-md rounded-lg px-4 py-3 text-base font-medium shadow-lg ${variantStyles[toast.variant] ?? variantStyles.info}`}
      role="status"
    >
      {toast.message}
    </div>
  );
};

export default NotifyHost;

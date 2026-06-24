/**
 * For Sale section (public pages + admin). Hidden by default during Razorpay onboarding
 * (real-estate policy). Set VITE_SHOW_FOR_SALE=true to restore after approval.
 */
export const isForSaleEnabled = import.meta.env.VITE_SHOW_FOR_SALE === 'true';

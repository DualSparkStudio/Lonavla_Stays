import {
  DEFAULT_CHECK_IN_TIME,
  DEFAULT_CHECK_OUT_TIME,
  DEFAULT_EXTRA_PERSON_CHARGE,
  DEFAULT_GST_PERCENT,
} from '../data/resort';

const PROFILE_KEY = 'lonavala-stays-admin-profile';
const PASSWORD_KEY = 'lonavala-stays-admin-password';

export type AdminProfile = {
  displayName: string;
  email: string;
  phone: string;
  bio: string;
  checkInTime: string;
  checkOutTime: string;
  gstPercent: number;
  extraPersonCharge: number;
  notifyNewBookings: boolean;
  notifyNewMessages: boolean;
};

export const defaultAdminProfile = (): AdminProfile => ({
  displayName: 'Resort Admin',
  email: 'admin@lonavalastays.com',
  phone: '+91 98765 43210',
  bio: 'Managing villas, bookings, and guest enquiries for Lonavala Stays.',
  checkInTime: DEFAULT_CHECK_IN_TIME,
  checkOutTime: DEFAULT_CHECK_OUT_TIME,
  gstPercent: DEFAULT_GST_PERCENT,
  extraPersonCharge: DEFAULT_EXTRA_PERSON_CHARGE,
  notifyNewBookings: true,
  notifyNewMessages: true,
});

export function loadAdminProfile(): AdminProfile {
  if (typeof localStorage === 'undefined') return defaultAdminProfile();
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return defaultAdminProfile();
    return { ...defaultAdminProfile(), ...JSON.parse(raw) };
  } catch {
    return defaultAdminProfile();
  }
}

export function saveAdminProfile(profile: AdminProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getCustomAdminPassword(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(PASSWORD_KEY);
}

export function setCustomAdminPassword(password: string): void {
  localStorage.setItem(PASSWORD_KEY, password);
}

export function getAdminInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'A';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

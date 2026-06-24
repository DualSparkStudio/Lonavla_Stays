import {
  DEFAULT_CHECK_IN_TIME,
  DEFAULT_CHECK_OUT_TIME,
  DEFAULT_EXTRA_PERSON_CHARGE,
  DEFAULT_GST_PERCENT,
  CONTACT_BIO,
  CONTACT_NAME,
  RESORT_ADDRESS,
  RESORT_EMAIL,
  RESORT_PHONE,
} from '../data/resort';
import type { SiteSettings } from '../types/site';

const PROFILE_KEY = 'lonavala-stays-admin-profile';
const PASSWORD_KEY = 'lonavala-stays-admin-password';

export type AdminProfile = {
  displayName: string;
  email: string;
  phone: string;
  /** Reservations / management office address (shown in site footer & emails) */
  officeAddress: string;
  bio: string;
  checkInTime: string;
  checkOutTime: string;
  gstPercent: number;
  extraPersonCharge: number;
  notifyNewBookings: boolean;
  notifyNewMessages: boolean;
};

export const defaultAdminProfile = (): AdminProfile => ({
  displayName: CONTACT_NAME,
  email: RESORT_EMAIL,
  phone: RESORT_PHONE,
  officeAddress: RESORT_ADDRESS,
  bio: CONTACT_BIO,
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

export function mergeAdminProfileFromSettings(
  settings: Pick<SiteSettings, 'contactName' | 'contactBio' | 'resortEmail' | 'resortPhone' | 'resortAddress'>,
  local: AdminProfile = loadAdminProfile(),
): AdminProfile {
  return {
    ...local,
    displayName: settings.contactName?.trim() || local.displayName,
    email: settings.resortEmail?.trim() || local.email,
    phone: settings.resortPhone?.trim() || local.phone,
    officeAddress: settings.resortAddress?.trim() || local.officeAddress,
    bio: settings.contactBio?.trim() || local.bio,
  };
}

export function siteSettingsFromAdminProfile(
  profile: AdminProfile,
): Pick<SiteSettings, 'contactName' | 'contactBio' | 'resortEmail' | 'resortPhone' | 'resortAddress'> {
  return {
    contactName: profile.displayName.trim(),
    contactBio: profile.bio.trim(),
    resortEmail: profile.email.trim(),
    resortPhone: profile.phone.trim(),
    resortAddress: profile.officeAddress.trim(),
  };
}

export function getAdminInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'A';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

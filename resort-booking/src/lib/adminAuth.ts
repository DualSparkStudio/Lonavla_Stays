import { getCustomAdminPassword } from './adminProfile';

const SESSION_KEY = 'lonavala-stays-admin-session';

export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
} as const;

export function isAdminAuthenticated(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

export function adminLogin(): void {
  sessionStorage.setItem(SESSION_KEY, 'true');
}

export function adminLogout(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function validateAdminCredentials(username: string, password: string): boolean {
  if (username !== ADMIN_CREDENTIALS.username) return false;
  const customPassword = getCustomAdminPassword();
  const expected = customPassword ?? ADMIN_CREDENTIALS.password;
  return password === expected;
}

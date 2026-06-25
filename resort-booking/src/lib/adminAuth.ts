import { clearCustomAdminPassword, getCustomAdminPassword, setCustomAdminPassword } from './adminProfile';
import { isSupabaseConfigured, supabase } from './supabase';

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

function verifyAdminCredentialsLocal(password: string): boolean {
  const customPassword = getCustomAdminPassword();
  const expected = customPassword ?? ADMIN_CREDENTIALS.password;
  return password === expected;
}

async function migrateLocalPasswordToDb(password: string): Promise<boolean> {
  const custom = getCustomAdminPassword();
  if (!custom || custom !== password) return false;

  const { data, error } = await supabase.rpc('update_admin_password', {
    p_username: ADMIN_CREDENTIALS.username,
    p_current_password: ADMIN_CREDENTIALS.password,
    p_new_password: custom,
  });

  if (error) {
    console.warn('Could not migrate local admin password to database:', error.message);
    return false;
  }

  if (data === true) {
    clearCustomAdminPassword();
    return true;
  }

  return false;
}

export type AdminLoginResult = {
  ok: boolean;
  error?: string;
};

/** Verify admin login against Supabase (all devices). Falls back to localStorage only in demo mode. */
export async function verifyAdminLogin(username: string, password: string): Promise<AdminLoginResult> {
  const user = username.trim().toLowerCase();
  if (user !== ADMIN_CREDENTIALS.username) {
    return { ok: false, error: 'Invalid username or password.' };
  }

  if (!isSupabaseConfigured) {
    return verifyAdminCredentialsLocal(password)
      ? { ok: true }
      : { ok: false, error: 'Invalid username or password.' };
  }

  const { data, error } = await supabase.rpc('verify_admin_login', {
    p_username: ADMIN_CREDENTIALS.username,
    p_password: password,
  });

  if (error) {
    console.error('Admin login verify error:', error.message);
    if (error.message.includes('crypt') || error.code === '42883') {
      return {
        ok: false,
        error:
          'Admin login is not configured correctly in Supabase. Re-run supabase/migrations/20260622_admin_credentials.sql.',
      };
    }
    return { ok: false, error: 'Could not verify login. Please try again.' };
  }

  if (data === true) {
    clearCustomAdminPassword();
    return { ok: true };
  }

  if (verifyAdminCredentialsLocal(password)) {
    const migrated = await migrateLocalPasswordToDb(password);
    return migrated ? { ok: true } : { ok: false, error: 'Invalid username or password.' };
  }

  return { ok: false, error: 'Invalid username or password.' };
}

/** @deprecated Use verifyAdminLogin — sync local check only */
export function validateAdminCredentials(username: string, password: string): boolean {
  if (username.trim().toLowerCase() !== ADMIN_CREDENTIALS.username) return false;
  return verifyAdminCredentialsLocal(password);
}

export async function updateAdminPassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  if (newPassword.length < 6) {
    return { ok: false, error: 'New password must be at least 6 characters.' };
  }

  if (!isSupabaseConfigured) {
    if (!verifyAdminCredentialsLocal(currentPassword)) {
      return { ok: false, error: 'Current password is incorrect.' };
    }
    setCustomAdminPassword(newPassword);
    return { ok: true };
  }

  const { data, error } = await supabase.rpc('update_admin_password', {
    p_username: ADMIN_CREDENTIALS.username,
    p_current_password: currentPassword,
    p_new_password: newPassword,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  if (data !== true) {
    return { ok: false, error: 'Current password is incorrect.' };
  }

  clearCustomAdminPassword();
  return { ok: true };
}

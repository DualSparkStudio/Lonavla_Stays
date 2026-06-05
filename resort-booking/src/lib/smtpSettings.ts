const SETTINGS_KEY = 'lonavala-stays-smtp-settings';

export type SmtpNotificationSettings = {
  adminNotificationEmail: string;
  sendGuestConfirmation: boolean;
  sendAdminNotification: boolean;
};

export const defaultSmtpNotificationSettings = (): SmtpNotificationSettings => ({
  adminNotificationEmail: '',
  sendGuestConfirmation: true,
  sendAdminNotification: true,
});

export function loadSmtpNotificationSettings(): SmtpNotificationSettings {
  if (typeof localStorage === 'undefined') return defaultSmtpNotificationSettings();
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSmtpNotificationSettings();
    return { ...defaultSmtpNotificationSettings(), ...JSON.parse(raw) };
  } catch {
    return defaultSmtpNotificationSettings();
  }
}

export function saveSmtpNotificationSettings(settings: SmtpNotificationSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

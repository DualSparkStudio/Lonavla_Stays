import { sendBookingConfirmationEmails, sendTestEmail, type BookingEmailPayload } from './booking-emails';
import { getSmtpConfig, isSmtpConfigured, verifySmtpConnection } from './smtp';

export type SmtpStatus = {
  configured: boolean;
  host?: string;
  port?: number;
  fromEmail?: string;
  adminEmail?: string;
};

export function getSmtpStatus(): SmtpStatus {
  const config = getSmtpConfig();
  if (!config) {
    return { configured: false };
  }

  return {
    configured: true,
    host: config.host,
    port: config.port,
    fromEmail: config.fromEmail,
    adminEmail: config.adminEmail,
  };
}

export async function checkSmtpConnection(): Promise<SmtpStatus> {
  const status = getSmtpStatus();
  if (!status.configured) return status;
  await verifySmtpConnection();
  return { ...status, configured: true };
}

export { sendBookingConfirmationEmails, sendTestEmail, type BookingEmailPayload };

export function isEmailServiceReady(): boolean {
  return isSmtpConfigured();
}

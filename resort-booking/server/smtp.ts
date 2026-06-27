import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
  adminEmail: string;
};

function envFlag(value: string | undefined): boolean {
  return value === 'true' || value === '1';
}

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  return value.includes('your_') || value.includes('xxxxxxxx');
}

function firstEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

export function getSmtpConfig(): SmtpConfig | null {
  const host = firstEnv('MAIL_SERVER', 'SMTP_HOST');
  const user = firstEnv('MAIL_USERNAME', 'SMTP_USER');
  const pass = firstEnv('MAIL_PASSWORD', 'SMTP_PASS');
  const fromEmail = firstEnv('MAIL_DEFAULT_SENDER', 'FROM_EMAIL', 'MAIL_USERNAME', 'SMTP_USER');

  if (!host || !user || !pass || !fromEmail) return null;
  if (isPlaceholder(host) || isPlaceholder(user) || isPlaceholder(pass) || isPlaceholder(fromEmail)) {
    return null;
  }

  const port = Number(firstEnv('MAIL_PORT', 'SMTP_PORT') || '587');
  const secure =
    envFlag(process.env.MAIL_SECURE) || envFlag(process.env.SMTP_SECURE) || port === 465;

  return {
    host,
    port,
    secure,
    user,
    pass,
    fromEmail,
    fromName: process.env.FROM_NAME?.trim() || process.env.VITE_APP_NAME?.trim() || 'Lonavala Stays',
    adminEmail: process.env.ADMIN_EMAIL?.trim() || fromEmail,
  };
}

export function isSmtpConfigured(): boolean {
  return getSmtpConfig() !== null;
}

export function createTransporter(): Transporter {
  const config = getSmtpConfig();
  if (!config) {
    throw new Error(
      'SMTP is not configured. Add MAIL_SERVER, MAIL_USERNAME, MAIL_PASSWORD, and MAIL_DEFAULT_SENDER to your environment.',
    );
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: !config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
}

export function formatSmtpAuthError(message: string): string {
  if (message.includes('535') || message.includes('BadCredentials')) {
    return (
      'Gmail rejected the username or app password. Enable 2-Step Verification on the Google account, ' +
      'create a new App Password at https://myaccount.google.com/apppasswords (no spaces), ' +
      'then update MAIL_PASSWORD in resort-booking/.env.local (not env.example) and restart npm run dev.'
    );
  }
  return message;
}

export async function verifySmtpConnection(): Promise<void> {
  const transporter = createTransporter();
  try {
    await transporter.verify();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'SMTP verification failed';
    throw new Error(formatSmtpAuthError(message));
  }
}

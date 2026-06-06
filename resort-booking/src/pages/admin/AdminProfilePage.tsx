import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminFormField, { adminInputClass } from '../../components/admin/AdminFormField';
import AdminTime12Input from '../../components/admin/AdminTime12Input';
import { ADMIN_CREDENTIALS, validateAdminCredentials } from '../../lib/adminAuth';
import { fetchSmtpStatus, sendTestEmail } from '../../lib/bookingEmail';
import {
  defaultAdminProfile,
  getAdminInitials,
  loadAdminProfile,
  saveAdminProfile,
  setCustomAdminPassword,
  type AdminProfile,
} from '../../lib/adminProfile';
import {
  defaultSmtpNotificationSettings,
  loadSmtpNotificationSettings,
  saveSmtpNotificationSettings,
  type SmtpNotificationSettings,
} from '../../lib/smtpSettings';
import { useSiteData } from '../../context/SiteDataContext';
import { formatPrice, formatTimeLabel } from '../../data/resort';

type ProfileTab = 'profile' | 'booking' | 'smtp';

function parseProfileTab(value: string | null): ProfileTab {
  if (value === 'smtp') return 'smtp';
  if (value === 'booking') return 'booking';
  return 'profile';
}

const AdminProfilePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = parseProfileTab(searchParams.get('tab'));

  const { bookings, contactMessages, settings, updateSettings } = useSiteData();
  const [profile, setProfile] = useState<AdminProfile>(defaultAdminProfile);
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);

  const [smtpStatus, setSmtpStatus] = useState<{
    configured: boolean;
    host?: string;
    port?: number;
    fromEmail?: string;
    adminEmail?: string;
  }>({ configured: false });
  const [smtpDraft, setSmtpDraft] = useState<SmtpNotificationSettings>(defaultSmtpNotificationSettings());
  const [testEmail, setTestEmail] = useState('');
  const [smtpMessage, setSmtpMessage] = useState('');
  const [smtpError, setSmtpError] = useState('');
  const [smtpLoading, setSmtpLoading] = useState(false);

  const [bookingDraft, setBookingDraft] = useState({
    checkInTime: settings.checkInTime,
    checkOutTime: settings.checkOutTime,
    gstPercent: settings.gstPercent,
    extraPersonCharge: settings.extraPersonCharge,
  });
  const [bookingSaved, setBookingSaved] = useState(false);

  useEffect(() => {
    const loaded = loadAdminProfile();
    setProfile({
      ...loaded,
      phone: loaded.phone.trim() || settings.resortPhone,
      email: loaded.email.trim() || settings.resortEmail,
      officeAddress: loaded.officeAddress?.trim() || settings.resortAddress,
    });
  }, [settings.resortAddress, settings.resortEmail, settings.resortPhone]);

  useEffect(() => {
    setBookingDraft({
      checkInTime: settings.checkInTime,
      checkOutTime: settings.checkOutTime,
      gstPercent: settings.gstPercent,
      extraPersonCharge: settings.extraPersonCharge,
    });
  }, [settings.checkInTime, settings.checkOutTime, settings.gstPercent, settings.extraPersonCharge]);

  useEffect(() => {
    const prefs = loadSmtpNotificationSettings();
    setSmtpDraft(prefs);
    setTestEmail(prefs.adminNotificationEmail || settings.resortEmail);
    fetchSmtpStatus()
      .then(setSmtpStatus)
      .catch(() => setSmtpStatus({ configured: false }));
  }, [settings.resortEmail]);

  const setTab = (tab: ProfileTab) => {
    if (tab === 'profile') {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  const handleProfileChange = (key: keyof AdminProfile, value: string | boolean | number) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveAdminProfile(profile);
    updateSettings({
      ...(profile.phone.trim() ? { resortPhone: profile.phone.trim() } : {}),
      ...(profile.email.trim() ? { resortEmail: profile.email.trim() } : {}),
      ...(profile.officeAddress.trim() ? { resortAddress: profile.officeAddress.trim() } : {}),
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleBookingSave = (e: React.FormEvent) => {
    e.preventDefault();
    const gstPercent = Math.min(100, Math.max(0, Number(bookingDraft.gstPercent) || 0));
    const extraPersonCharge = Math.max(0, Number(bookingDraft.extraPersonCharge) || 0);
    const next = {
      checkInTime: bookingDraft.checkInTime,
      checkOutTime: bookingDraft.checkOutTime,
      gstPercent,
      extraPersonCharge,
    };
    updateSettings(next);
    saveAdminProfile({ ...loadAdminProfile(), ...next });
    setBookingSaved(true);
    setTimeout(() => setBookingSaved(false), 3000);
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSaved(false);

    if (!validateAdminCredentials(ADMIN_CREDENTIALS.username, passwordForm.current)) {
      setPasswordError('Current password is incorrect.');
      return;
    }
    if (passwordForm.next.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setCustomAdminPassword(passwordForm.next);
    setPasswordForm({ current: '', next: '', confirm: '' });
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  const handleSmtpSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSmtpNotificationSettings(smtpDraft);
    setSmtpMessage('Notification preferences saved.');
    setSmtpError('');
    setTimeout(() => setSmtpMessage(''), 3000);
  };

  const handleVerify = async () => {
    setSmtpLoading(true);
    setSmtpMessage('');
    setSmtpError('');
    try {
      const status = await fetchSmtpStatus(true);
      setSmtpStatus(status);
      setSmtpMessage('SMTP connection verified successfully.');
    } catch (err) {
      setSmtpError(err instanceof Error ? err.message : 'SMTP verification failed');
    } finally {
      setSmtpLoading(false);
    }
  };

  const handleTestSend = async () => {
    if (!testEmail.trim()) {
      setSmtpError('Enter an email address for the test message.');
      return;
    }
    setSmtpLoading(true);
    setSmtpMessage('');
    setSmtpError('');
    try {
      await sendTestEmail(testEmail.trim(), settings.resortName);
      setSmtpMessage(`Test email sent to ${testEmail.trim()}.`);
    } catch (err) {
      setSmtpError(err instanceof Error ? err.message : 'Test email failed');
    } finally {
      setSmtpLoading(false);
    }
  };

  const initials = getAdminInitials(profile.displayName);
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;

  const tabClass = (tab: ProfileTab) =>
    `px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
      activeTab === tab ? 'bg-red-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
    }`;

  return (
    <AdminLayout currentPage="profile">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account, booking defaults, and SMTP email settings.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button type="button" onClick={() => setTab('profile')} className={tabClass('profile')}>
          Profile
        </button>
        <button type="button" onClick={() => setTab('booking')} className={tabClass('booking')}>
          Booking
        </button>
        <button type="button" onClick={() => setTab('smtp')} className={tabClass('smtp')}>
          SMTP
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <aside className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center">
              <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold mb-4">
                {initials}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{profile.displayName}</h2>
              <p className="text-sm text-gray-500 mt-1">@{ADMIN_CREDENTIALS.username}</p>
              <span className="inline-block mt-3 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold">
                Administrator
              </span>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Overview</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Total bookings</dt>
                  <dd className="font-semibold text-gray-900">{bookings.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Pending bookings</dt>
                  <dd className="font-semibold text-gray-900">{pendingBookings}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Messages</dt>
                  <dd className="font-semibold text-gray-900">{contactMessages.length}</dd>
                </div>
              </dl>
            </div>
          </aside>

          <div className="lg:col-span-2 space-y-8">
            {profileSaved && (
              <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                Profile updated successfully.
              </div>
            )}

            <form onSubmit={handleProfileSave} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Personal information</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminFormField label="Display name" className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    value={profile.displayName}
                    onChange={(e) => handleProfileChange('displayName', e.target.value)}
                    className={adminInputClass}
                  />
                </AdminFormField>

                <AdminFormField label="Email" hint="Shown in the website footer and booking emails">
                  <input
                    type="email"
                    required
                    value={profile.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className={adminInputClass}
                  />
                </AdminFormField>

                <AdminFormField
                  label="WhatsApp / Phone"
                  hint="Shown in the website footer, contact page, and booking emails"
                >
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className={adminInputClass}
                  />
                </AdminFormField>

                <AdminFormField
                  label="Office address"
                  hint="Reservations office address — shown in the website footer and confirmation emails"
                  className="sm:col-span-2"
                >
                  <textarea
                    rows={2}
                    value={profile.officeAddress}
                    onChange={(e) => handleProfileChange('officeAddress', e.target.value)}
                    placeholder="Office 2, Hill Plaza, Old Mumbai-Pune Highway, Lonavala 410401"
                    className={adminInputClass}
                  />
                </AdminFormField>

                <AdminFormField label="Bio" className="sm:col-span-2">
                  <textarea
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                    className={adminInputClass}
                  />
                </AdminFormField>
              </div>

              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-pink-600">Notifications</legend>
                <label className="flex items-center gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={profile.notifyNewBookings}
                    onChange={(e) => handleProfileChange('notifyNewBookings', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                  />
                  Email me when a new booking is received
                </label>
                <label className="flex items-center gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={profile.notifyNewMessages}
                    onChange={(e) => handleProfileChange('notifyNewMessages', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                  />
                  Email me when a new contact message arrives
                </label>
              </fieldset>

              <button
                type="submit"
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Save profile
              </button>
            </form>

            <form onSubmit={handlePasswordSave} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Change password</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Username stays <code className="bg-gray-100 px-1 rounded">admin</code>.
                </p>
              </div>

              {passwordError && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">{passwordError}</div>
              )}
              {passwordSaved && (
                <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                  Password updated successfully.
                </div>
              )}

              <AdminFormField label="Current password">
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, current: e.target.value }))}
                  className={adminInputClass}
                />
              </AdminFormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AdminFormField label="New password" hint="At least 6 characters">
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={passwordForm.next}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, next: e.target.value }))}
                    className={adminInputClass}
                  />
                </AdminFormField>

                <AdminFormField label="Confirm new password">
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirm: e.target.value }))}
                    className={adminInputClass}
                  />
                </AdminFormField>
              </div>

              <button
                type="submit"
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Update password
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'booking' && (
        <div className="space-y-6 max-w-2xl">
          {bookingSaved && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              Booking settings saved successfully.
            </div>
          )}

          <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Current defaults</h2>
            <p className="text-sm text-gray-600 mb-4">
              These apply site-wide to all villas, the booking checkout, confirmation emails, and admin booking views.
            </p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
                <dt className="text-gray-500 mb-1">Check-in</dt>
                <dd className="font-semibold text-gray-900">{formatTimeLabel(settings.checkInTime)}</dd>
              </div>
              <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
                <dt className="text-gray-500 mb-1">Check-out</dt>
                <dd className="font-semibold text-gray-900">{formatTimeLabel(settings.checkOutTime)}</dd>
              </div>
              <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
                <dt className="text-gray-500 mb-1">GST</dt>
                <dd className="font-semibold text-gray-900">{settings.gstPercent}%</dd>
              </div>
              <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
                <dt className="text-gray-500 mb-1">Extra person</dt>
                <dd className="font-semibold text-gray-900">{formatPrice(settings.extraPersonCharge)} / night</dd>
              </div>
            </dl>
          </section>

          <form onSubmit={handleBookingSave} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Booking settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminFormField label="Check-in time" hint="Shown on villa pages and confirmation emails">
                <AdminTime12Input
                  value={bookingDraft.checkInTime}
                  fallback={{ hour: 2, minute: 0, period: 'PM' }}
                  onChange={(checkInTime) => setBookingDraft((prev) => ({ ...prev, checkInTime }))}
                />
              </AdminFormField>
              <AdminFormField label="Check-out time" hint="Shown on villa pages and confirmation emails">
                <AdminTime12Input
                  value={bookingDraft.checkOutTime}
                  fallback={{ hour: 11, minute: 0, period: 'AM' }}
                  onChange={(checkOutTime) => setBookingDraft((prev) => ({ ...prev, checkOutTime }))}
                />
              </AdminFormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
              <AdminFormField label="GST (%)" hint="Applied to booking subtotal at checkout">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  required
                  value={bookingDraft.gstPercent}
                  onChange={(e) => setBookingDraft((prev) => ({ ...prev, gstPercent: Number(e.target.value) }))}
                  className={adminInputClass}
                />
              </AdminFormField>
              <AdminFormField
                label="Extra person charge (₹)"
                hint="Per extra adult per night; children above 5 are charged at 50%"
              >
                <input
                  type="number"
                  min={0}
                  step={100}
                  required
                  value={bookingDraft.extraPersonCharge}
                  onChange={(e) =>
                    setBookingDraft((prev) => ({ ...prev, extraPersonCharge: Number(e.target.value) }))
                  }
                  className={adminInputClass}
                />
              </AdminFormField>
            </div>

            <button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Save booking settings
            </button>
          </form>
        </div>
      )}

      {activeTab === 'smtp' && (
        <div className="space-y-6">
          {smtpMessage && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">{smtpMessage}</div>
          )}
          {smtpError && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">{smtpError}</div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">SMTP status</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Configured</dt>
                  <dd className={`font-semibold ${smtpStatus.configured ? 'text-green-700' : 'text-red-600'}`}>
                    {smtpStatus.configured ? 'Yes' : 'No'}
                  </dd>
                </div>
                {smtpStatus.host && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Host</dt>
                    <dd className="font-medium text-gray-900">
                      {smtpStatus.host}:{smtpStatus.port}
                    </dd>
                  </div>
                )}
                {smtpStatus.fromEmail && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">From email</dt>
                    <dd className="font-medium text-gray-900 break-all">{smtpStatus.fromEmail}</dd>
                  </div>
                )}
                {smtpStatus.adminEmail && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Default admin email</dt>
                    <dd className="font-medium text-gray-900 break-all">{smtpStatus.adminEmail}</dd>
                  </div>
                )}
              </dl>
              <button
                type="button"
                onClick={handleVerify}
                disabled={smtpLoading}
                className="mt-5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium"
              >
                {smtpLoading ? 'Checking…' : 'Verify SMTP connection'}
              </button>
            </section>

            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Environment variables</h2>
              <p className="text-sm text-gray-600 mb-4">
                Add these to <code className="bg-gray-100 px-1 rounded">resort-booking/.env.local</code> (local) or your
                Netlify site environment (production). Do <strong>not</strong> put secrets in{' '}
                <code className="bg-gray-100 px-1 rounded">env.example</code> — that file is only a template. For Gmail,
                use an{' '}
                <strong>App Password</strong> (not your normal login password): enable 2-Step Verification, then create
                one at{' '}
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noreferrer"
                  className="text-red-600 hover:underline"
                >
                  Google App Passwords
                </a>
                . Paste the 16-character password with no spaces into <code className="bg-gray-100 px-1 rounded">MAIL_PASSWORD</code>.
              </p>
              <pre className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto text-gray-800">
                {`MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
MAIL_DEFAULT_SENDER=your-email@gmail.com
ADMIN_EMAIL=your-email@gmail.com`}
              </pre>
            </section>
          </div>

          <form onSubmit={handleSmtpSave} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6 max-w-2xl">
            <h2 className="text-lg font-bold text-gray-900">Booking email notifications</h2>

            <AdminFormField label="Admin notification email" hint="Overrides ADMIN_EMAIL env when set">
              <input
                type="email"
                value={smtpDraft.adminNotificationEmail}
                onChange={(e) => setSmtpDraft({ ...smtpDraft, adminNotificationEmail: e.target.value })}
                placeholder={settings.resortEmail}
                className={adminInputClass}
              />
            </AdminFormField>

            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={smtpDraft.sendGuestConfirmation}
                  onChange={(e) => setSmtpDraft({ ...smtpDraft, sendGuestConfirmation: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                />
                Send confirmation email to guest after booking
              </label>
              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={smtpDraft.sendAdminNotification}
                  onChange={(e) => setSmtpDraft({ ...smtpDraft, sendAdminNotification: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                />
                Send new booking alert to admin
              </label>
            </div>

            <button type="submit" className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium">
              Save notification preferences
            </button>
          </form>

          <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm max-w-2xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Send test email</h2>
            <AdminFormField label="Recipient">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className={adminInputClass}
              />
            </AdminFormField>
            <button
              type="button"
              onClick={handleTestSend}
              disabled={smtpLoading}
              className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-medium"
            >
              {smtpLoading ? 'Sending…' : 'Send test email'}
            </button>
          </section>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProfilePage;

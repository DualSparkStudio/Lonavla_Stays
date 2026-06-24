import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminFormField, { adminInputClass } from '../../components/admin/AdminFormField';
import AdminTime12Input from '../../components/admin/AdminTime12Input';
import InfoSectionsEditor from '../../components/admin/InfoSectionsEditor';
import { useSiteData } from '../../context/SiteDataContext';
import { formatPrice, formatTimeLabel } from '../../data/resort';
import { loadAdminProfile, saveAdminProfile } from '../../lib/adminProfile';
import type { InfoSection } from '../../types/site';

const AdminOtherPage: React.FC = () => {
  const { settings, updateSettings } = useSiteData();
  const [saved, setSaved] = useState(false);

  const [houseRulesSections, setHouseRulesSections] = useState<InfoSection[]>(
    settings.houseRulesSections,
  );
  const [termsAndConditionsSections, setTermsAndConditionsSections] = useState<InfoSection[]>(
    settings.termsAndConditionsSections?.length
      ? settings.termsAndConditionsSections
      : settings.importantInfoSections,
  );
  const [bookingDraft, setBookingDraft] = useState({
    checkInTime: settings.checkInTime,
    checkOutTime: settings.checkOutTime,
    extraPersonCharge: settings.extraPersonCharge,
  });

  useEffect(() => {
    setHouseRulesSections(settings.houseRulesSections);
    setTermsAndConditionsSections(
      settings.termsAndConditionsSections?.length
        ? settings.termsAndConditionsSections
        : settings.importantInfoSections,
    );
    setBookingDraft({
      checkInTime: settings.checkInTime,
      checkOutTime: settings.checkOutTime,
      extraPersonCharge: settings.extraPersonCharge,
    });
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const extraPersonCharge = Math.max(0, Number(bookingDraft.extraPersonCharge) || 0);
    const bookingPatch = {
      checkInTime: bookingDraft.checkInTime,
      checkOutTime: bookingDraft.checkOutTime,
      extraPersonCharge,
    };

    updateSettings({
      houseRulesSections,
      termsAndConditionsSections,
      importantInfoSections: termsAndConditionsSections,
      ...bookingPatch,
    });
    saveAdminProfile({ ...loadAdminProfile(), ...bookingPatch });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminLayout currentPage="other">
      <div className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Other</h1>
        <p className="text-gray-900">
          Manage house rules, terms &amp; conditions, and site-wide booking defaults shown on villa
          pages, the booking flow, and confirmation emails.
        </p>
      </div>

      {saved && (
        <div className="mb-6 max-w-3xl p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          Settings saved successfully.
        </div>
      )}

      <form onSubmit={handleSave} className="max-w-3xl space-y-10">
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Booking defaults</h2>
            <p className="text-sm text-gray-600 mt-1">
              Check-in/out times and extra guest pricing used across all villas.
            </p>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
              <dt className="text-gray-500">Check-in</dt>
              <dd className="font-semibold">{formatTimeLabel(settings.checkInTime)}</dd>
            </div>
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
              <dt className="text-gray-500">Check-out</dt>
              <dd className="font-semibold">{formatTimeLabel(settings.checkOutTime)}</dd>
            </div>
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
              <dt className="text-gray-500">Extra guest</dt>
              <dd className="font-semibold">{formatPrice(settings.extraPersonCharge)} / night</dd>
            </div>
          </dl>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <AdminFormField label="Check-in time">
              <AdminTime12Input
                value={bookingDraft.checkInTime}
                fallback={{ hour: 1, minute: 0, period: 'PM' }}
                onChange={(checkInTime) => setBookingDraft((prev) => ({ ...prev, checkInTime }))}
              />
            </AdminFormField>
            <AdminFormField label="Check-out time">
              <AdminTime12Input
                value={bookingDraft.checkOutTime}
                fallback={{ hour: 11, minute: 0, period: 'AM' }}
                onChange={(checkOutTime) => setBookingDraft((prev) => ({ ...prev, checkOutTime }))}
              />
            </AdminFormField>
          </div>

          <AdminFormField
            label="Extra person charge (₹)"
            hint="Per extra guest per night when guest count exceeds the villa's included guests"
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
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">House rules</h2>
            <p className="text-sm text-gray-600 mt-1">
              Shown on each villa page and the public house rules page. Check-in/out times in the
              first rule line follow booking defaults above automatically.
            </p>
          </div>
          <InfoSectionsEditor
            sections={houseRulesSections}
            onChange={setHouseRulesSections}
            addLabel="Add house rules section"
          />
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Terms &amp; conditions</h2>
            <p className="text-sm text-gray-600 mt-1">
              Shown on the public terms page and linked from the site footer.
            </p>
          </div>
          <InfoSectionsEditor
            sections={termsAndConditionsSections}
            onChange={setTermsAndConditionsSections}
            addLabel="Add terms section"
          />
        </section>

        <button
          type="submit"
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg text-base font-medium"
        >
          Save all
        </button>
      </form>
    </AdminLayout>
  );
};

export default AdminOtherPage;

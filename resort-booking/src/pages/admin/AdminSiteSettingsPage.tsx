import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useSiteData } from '../../context/SiteDataContext';
import { isForSaleEnabled } from '../../lib/featureFlags';
import type { SiteSettings } from '../../types/site';

const field = (
  label: string,
  key: keyof SiteSettings,
  value: string,
  onChange: (key: keyof SiteSettings, value: string) => void,
  multiline = false
) => (
  <div key={key}>
    <label className="block text-base font-semibold text-pink-600 mb-1">{label}</label>
    {multiline ? (
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(key, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(key, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
      />
    )}
  </div>
);

export default function AdminSiteSettingsPage() {
  const { settings, updateSettings, resetAllData } = useSiteData();
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const handleChange = (key: keyof SiteSettings, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminLayout currentPage="settings">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Site content</h1>
          <p className="text-gray-900">Brand, contact, homepage hero, and page headings shown on the public site.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Reload all site content from Supabase? Unsaved local edits will be discarded.')) {
              resetAllData();
            }
          }}
          className="text-sm text-red-600 font-medium hover:underline"
        >
          Reload from database
        </button>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          Settings saved. Refresh the public site to see changes (same browser).
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Brand &amp; contact</h2>
          <p className="text-sm text-gray-600">
            Contact person name and bio can also be edited under Admin → Profile.
          </p>
          {field('Resort name', 'resortName', draft.resortName, handleChange)}
          {field('Tagline', 'brandTagline', draft.brandTagline, handleChange)}
          {field('Location', 'resortLocation', draft.resortLocation, handleChange)}
          {field('Contact name', 'contactName', draft.contactName, handleChange)}
          {field('Contact bio', 'contactBio', draft.contactBio, handleChange, true)}
          {field('Office address', 'resortAddress', draft.resortAddress, handleChange)}
          {field('Phone', 'resortPhone', draft.resortPhone, handleChange)}
          {field('Email', 'resortEmail', draft.resortEmail, handleChange)}
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Homepage hero</h2>
          {field('Hero title', 'heroTitle', draft.heroTitle, handleChange)}
          {field('Hero subtitle', 'heroSubtitle', draft.heroSubtitle, handleChange, true)}
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Page headings</h2>
          {field('Villas page title', 'villasPageTitle', draft.villasPageTitle, handleChange)}
          {field('Villas page subtitle', 'villasPageSubtitle', draft.villasPageSubtitle, handleChange, true)}
          {isForSaleEnabled && (
            <>
              {field('For sale page title', 'forSalePageTitle', draft.forSalePageTitle, handleChange)}
              {field('For sale page subtitle', 'forSalePageSubtitle', draft.forSalePageSubtitle, handleChange, true)}
            </>
          )}
          {field('Facilities page title', 'facilitiesPageTitle', draft.facilitiesPageTitle, handleChange)}
          {field('Facilities page subtitle', 'facilitiesPageSubtitle', draft.facilitiesPageSubtitle, handleChange, true)}
          {field('Contact page subtitle', 'contactPageSubtitle', draft.contactPageSubtitle, handleChange, true)}
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">About page</h2>
          {field('About image URL', 'aboutImage', draft.aboutImage, handleChange)}
          <div>
            <label className="block text-base font-semibold text-pink-600 mb-1">About paragraphs (one per line)</label>
            <textarea
              rows={4}
              value={draft.aboutParagraphs.join('\n\n')}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  aboutParagraphs: e.target.value.split('\n\n').filter(Boolean),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-base font-semibold text-pink-600 mb-2">Highlights</label>
            {draft.aboutHighlights.map((h, i) => (
              <div key={i} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-2">
                <input
                  value={h.title}
                  onChange={(e) => {
                    const next = [...draft.aboutHighlights];
                    next[i] = { ...next[i], title: e.target.value };
                    setDraft((prev) => ({ ...prev, aboutHighlights: next }));
                  }}
                  placeholder="Title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <textarea
                  value={h.text}
                  onChange={(e) => {
                    const next = [...draft.aboutHighlights];
                    next[i] = { ...next[i], text: e.target.value };
                    setDraft((prev) => ({ ...prev, aboutHighlights: next }));
                  }}
                  placeholder="Description"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Homepage explore tiles</h2>
          {draft.exploreTiles
            .map((tile, i) => ({ tile, i }))
            .filter(({ tile }) => isForSaleEnabled || !tile.path.startsWith('/for-sale'))
            .map(({ tile, i }) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                value={tile.name}
                onChange={(e) => {
                  const next = [...draft.exploreTiles];
                  next[i] = { ...next[i], name: e.target.value };
                  setDraft((prev) => ({ ...prev, exploreTiles: next }));
                }}
                placeholder="Label"
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                value={tile.path}
                onChange={(e) => {
                  const next = [...draft.exploreTiles];
                  next[i] = { ...next[i], path: e.target.value };
                  setDraft((prev) => ({ ...prev, exploreTiles: next }));
                }}
                placeholder="/path"
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                value={tile.image}
                onChange={(e) => {
                  const next = [...draft.exploreTiles];
                  next[i] = { ...next[i], image: e.target.value };
                  setDraft((prev) => ({ ...prev, exploreTiles: next }));
                }}
                placeholder="Image URL (Drive share link or direct URL)"
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          ))}
        </section>

        <button
          type="submit"
          className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-bold"
        >
          Save site content
        </button>
      </form>
    </AdminLayout>
  );
}

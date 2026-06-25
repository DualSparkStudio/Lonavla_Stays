import React, { useEffect, useRef, useState } from 'react';
import AdminCardActions from '../../components/admin/AdminCardActions';
import { StatusPill } from '../../components/admin/AdminDetailModal';
import AdminFormField, { adminInputClass } from '../../components/admin/AdminFormField';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPropertyDetailsModal from '../../components/admin/AdminPropertyDetailsModal';
import NormalizedImage from '../../components/ui/NormalizedImage';
import { useSiteData } from '../../context/SiteDataContext';
import { getCategoryLabel } from '../../data/propertiesForSale';
import type { PropertyForSale } from '../../types/site';

const emptyProperty = (): Omit<PropertyForSale, 'id'> => ({
  title: '',
  category: 'villa',
  description: '',
  longDescription: '',
  price: 0,
  priceOnRequest: false,
  location: '',
  address: '',
  areaLabel: '',
  status: 'available',
  highlights: [],
  images: [''],
  mapEmbedUrl: '',
  mapsLink: '',
});

const AdminForSalePage: React.FC = () => {
  const { propertiesForSale, addPropertyForSale, updatePropertyForSale, deletePropertyForSale } =
    useSiteData();
  const [editing, setEditing] = useState<PropertyForSale | null>(null);
  const [draft, setDraft] = useState<Omit<PropertyForSale, 'id'>>(emptyProperty());
  const [isNew, setIsNew] = useState(false);
  const [viewing, setViewing] = useState<PropertyForSale | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isNew && !editing) return;
    const timer = window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
    return () => window.clearTimeout(timer);
  }, [isNew, editing]);

  const openNew = () => {
    setDraft(emptyProperty());
    setIsNew(true);
    setEditing(null);
  };

  const openEdit = (p: PropertyForSale) => {
    const { id: _id, ...rest } = p;
    setDraft(rest);
    setEditing(p);
    setIsNew(false);
  };

  const closeForm = () => {
    setIsNew(false);
    setEditing(null);
    setDraft(emptyProperty());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...draft,
      highlights: draft.highlights.filter(Boolean),
      images: draft.images.filter((img) => img.trim()),
      mapEmbedUrl: draft.mapEmbedUrl?.trim() || undefined,
      mapsLink: draft.mapsLink?.trim() || undefined,
    };
    if (isNew) {
      addPropertyForSale(payload);
    } else if (editing) {
      updatePropertyForSale(editing.id, payload);
    }
    setIsNew(false);
    setEditing(null);
    setDraft(emptyProperty());
  };

  return (
    <AdminLayout currentPage="for-sale">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties for sale</h1>
          <p className="text-gray-900">Manage plots and villas shown on the public For Sale section.</p>
        </div>
        <button type="button" onClick={openNew} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg">
          Add listing
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {propertiesForSale.map((p) => (
          <div key={p.id} className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100">
            <NormalizedImage
              urls={p.images}
              fallback="https://via.placeholder.com/800x600?text=Property"
              alt={p.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-start gap-2 mb-1">
                <h3 className="font-bold text-gray-900">{p.title}</h3>
                <StatusPill status={p.status} />
              </div>
              <p className="text-base text-gray-900 mb-3">{getCategoryLabel(p.category)}</p>
              <AdminCardActions
                onView={() => setViewing(p)}
                onEdit={() => openEdit(p)}
                onDelete={() => window.confirm('Delete this listing?') && deletePropertyForSale(p.id)}
              />
            </div>
          </div>
        ))}
      </div>

      {(isNew || editing) && (
        <form
          ref={formRef}
          onSubmit={handleSave}
          className="scroll-mt-24 bg-white rounded-xl border border-gray-200 p-6 mt-10 space-y-4"
        >
          <h2 className="text-xl font-bold">{isNew ? 'New listing' : `Edit: ${editing?.title}`}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField label="Property title">
              <input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Category">
              <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as 'villa' | 'plot' })} className={adminInputClass}>
                <option value="villa">Villa</option>
                <option value="plot">Plot</option>
              </select>
            </AdminFormField>
            <AdminFormField label="Location" className="md:col-span-2">
              <input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Full address" className="md:col-span-2">
              <input value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Area label" hint="e.g. 2,500 sq ft or 1 acre">
              <input value={draft.areaLabel} onChange={(e) => setDraft({ ...draft, areaLabel: e.target.value })} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Price (INR)" hint="Leave 0 if price is on request">
              <input type="number" min={0} value={draft.price || ''} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Price on request">
              <label className="flex items-center gap-2 text-base text-gray-700 mt-2">
                <input type="checkbox" checked={draft.priceOnRequest ?? false} onChange={(e) => setDraft({ ...draft, priceOnRequest: e.target.checked })} />
                Show &quot;Price on request&quot; instead of amount
              </label>
            </AdminFormField>
            <AdminFormField label="Listing status">
              <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as PropertyForSale['status'] })} className={adminInputClass}>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
              </select>
            </AdminFormField>
          </div>
          <AdminFormField label="Short description" hint="Shown on listing cards">
            <textarea required value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={2} className={adminInputClass} />
          </AdminFormField>
          <AdminFormField label="Full description" hint="Shown on the property detail page">
            <textarea required value={draft.longDescription} onChange={(e) => setDraft({ ...draft, longDescription: e.target.value })} rows={4} className={adminInputClass} />
          </AdminFormField>
          <AdminFormField label="Highlights" hint="One highlight per line">
            <textarea value={draft.highlights.join('\n')} onChange={(e) => setDraft({ ...draft, highlights: e.target.value.split('\n') })} rows={3} className={adminInputClass} />
          </AdminFormField>
          <AdminFormField label="Image URLs" hint="One image URL per line — first image is the cover photo">
            <textarea value={draft.images.join('\n')} onChange={(e) => setDraft({ ...draft, images: e.target.value.split('\n') })} rows={3} className={adminInputClass} />
          </AdminFormField>
          <AdminFormField
            label="Google Maps embed"
            hint="In Google Maps: Share → Embed a map → copy the iframe code or embed URL. Shown as the map preview on the property page."
          >
            <textarea
              value={draft.mapEmbedUrl ?? ''}
              onChange={(e) => setDraft({ ...draft, mapEmbedUrl: e.target.value })}
              rows={3}
              placeholder='Paste embed code, e.g. <iframe src="https://www.google.com/maps/embed?pb=...">'
              className={adminInputClass}
            />
          </AdminFormField>
          <AdminFormField
            label="Google Maps link (for guests)"
            hint="In Google Maps: Share → Copy link. Used for Open in Google Maps. Do not paste embed code here."
          >
            <input
              type="url"
              value={draft.mapsLink ?? ''}
              onChange={(e) => setDraft({ ...draft, mapsLink: e.target.value })}
              placeholder="https://maps.app.goo.gl/... or https://www.google.com/maps/place/..."
              className={adminInputClass}
            />
          </AdminFormField>
          <div className="flex gap-3">
            <button type="submit" className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold">
              Save
            </button>
            <button type="button" onClick={closeForm} className="px-6 py-2 border rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      )}

      <AdminPropertyDetailsModal property={viewing} onClose={() => setViewing(null)} />
    </AdminLayout>
  );
};

export default AdminForSalePage;

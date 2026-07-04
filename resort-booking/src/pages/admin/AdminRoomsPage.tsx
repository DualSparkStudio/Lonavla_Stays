import React, { useEffect, useRef, useState } from 'react';
import AdminCardActions from '../../components/admin/AdminCardActions';
import { StatusPill } from '../../components/admin/AdminDetailModal';
import AdminCustomDatePricing, {
  customPricesForVilla,
  mergeVillaCustomPrices,
} from '../../components/admin/AdminCustomDatePricing';
import AdminFormField, { adminInputClass } from '../../components/admin/AdminFormField';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminVillaDetailsModal from '../../components/admin/AdminVillaDetailsModal';
import NormalizedImage from '../../components/ui/NormalizedImage';
import { useSiteData } from '../../context/SiteDataContext';
import type { CustomDatePrice, Room } from '../../types/site';

const emptyRoom = (): Omit<Room, 'id'> => ({
  name: '',
  room_type: 'Deluxe Villa',
  description: '',
  price_per_night: 0,
  weekend_price_per_night: 0,
  location: '',
  address: '',
  max_guests: 2,
  final_capacity: 10,
  caretaker_phone: '',
  room_number: '',
  rating: 4.5,
  review_count: 0,
  status: 'available',
  amenities: [],
  images: [''],
  mapEmbedUrl: '',
  mapsLink: '',
});

const AdminRoomsPage: React.FC = () => {
  const { rooms, settings, addRoom, updateRoom, deleteRoom, updateSettings } = useSiteData();
  const [editing, setEditing] = useState<Room | null>(null);
  const [draft, setDraft] = useState<Omit<Room, 'id'>>(emptyRoom());
  const [customPriceDraft, setCustomPriceDraft] = useState<CustomDatePrice[]>([]);
  const [editingVillaId, setEditingVillaId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saved, setSaved] = useState(false);
  const [viewing, setViewing] = useState<Room | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isNew && !editing) return;
    const timer = window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
    return () => window.clearTimeout(timer);
  }, [isNew, editing]);

  const openNew = () => {
    setDraft(emptyRoom());
    setCustomPriceDraft([]);
    setEditingVillaId(`${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
    setIsNew(true);
    setEditing(null);
  };

  const openEdit = (room: Room) => {
    const { id: _id, ...rest } = room;
    setDraft(rest);
    setCustomPriceDraft(customPricesForVilla(settings.customDatePrices, room.id));
    setEditingVillaId(room.id);
    setEditing(room);
    setIsNew(false);
  };

  const closeForm = () => {
    setIsNew(false);
    setEditing(null);
    setEditingVillaId(null);
    setCustomPriceDraft([]);
    setDraft(emptyRoom());
  };

  const saveCustomPrices = (villaId: string) => {
    const validRules = customPriceDraft.filter(
      (rule) =>
        rule.startDate &&
        rule.endDate &&
        rule.endDate >= rule.startDate &&
        rule.pricePerNight > 0,
    );
    updateSettings({
      customDatePrices: mergeVillaCustomPrices(settings.customDatePrices, villaId, validRules),
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...draft,
      amenities: draft.amenities.filter(Boolean),
      images: draft.images.filter((img) => img.trim()),
      mapEmbedUrl: draft.mapEmbedUrl?.trim() || undefined,
      mapsLink: draft.mapsLink?.trim() || undefined,
      caretaker_phone: draft.caretaker_phone?.trim() || undefined,
      final_capacity: Math.max(
        draft.max_guests,
        Math.floor(Number(draft.final_capacity) || draft.max_guests),
      ),
    };
    if (isNew) {
      const id = editingVillaId ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      addRoom({ ...payload, id });
      saveCustomPrices(id);
    } else if (editing) {
      updateRoom(editing.id, payload);
      saveCustomPrices(editing.id);
    }
    setIsNew(false);
    setEditing(null);
    setDraft(emptyRoom());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminLayout currentPage="rooms">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Villa management</h1>
          <p className="text-gray-900">Changes appear immediately on the public villas pages.</p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
        >
          Add villa
        </button>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          Villa saved. Changes are live on the public site.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white rounded-xl overflow-hidden shadow-md">
            <NormalizedImage
              urls={room.images}
              fallback="https://via.placeholder.com/400x300?text=Villa"
              alt={room.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="font-bold text-gray-900">{room.name}</h3>
                <StatusPill status={room.status} />
              </div>
              <p className="text-base text-gray-900 mb-1">₹{room.price_per_night.toLocaleString('en-IN')} / night</p>
              {room.weekend_price_per_night != null && room.weekend_price_per_night > 0 && (
                <p className="text-sm text-gray-700 mb-1">
                  Weekend: ₹{room.weekend_price_per_night.toLocaleString('en-IN')} / night
                </p>
              )}
              <p className="text-sm text-gray-600 mb-3">
                {room.max_guests} guests in base price
                {room.final_capacity ? ` · max ${room.final_capacity} guests` : ''}
              </p>
              <AdminCardActions
                onView={() => setViewing(room)}
                onEdit={() => openEdit(room)}
                onDelete={() => {
                  if (!window.confirm('Delete villa?')) return;
                  updateSettings({
                    customDatePrices: settings.customDatePrices.filter((r) => r.roomId !== room.id),
                  });
                  deleteRoom(room.id);
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {(isNew || editing) && (
        <form
          ref={formRef}
          onSubmit={handleSave}
          className="scroll-mt-24 bg-white rounded-xl border p-6 mt-10 space-y-4"
        >
          <h2 className="text-xl font-bold">{isNew ? 'New villa' : `Edit: ${editing?.name}`}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField label="Villa name">
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Villa type" hint="e.g. Deluxe Villa, Family Villa">
              <input value={draft.room_type} onChange={(e) => setDraft({ ...draft, room_type: e.target.value })} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Location" className="md:col-span-2" hint="Area shown on listing cards">
              <input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Full address" className="md:col-span-2">
              <input value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Price per night (INR)">
              <input type="number" min={0} value={draft.price_per_night || ''} onChange={(e) => setDraft({ ...draft, price_per_night: Number(e.target.value) })} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Weekend price per night (INR)" hint="Applied on Saturdays and site-wide pricing holidays (Sun–Fri are weekdays)">
              <input
                type="number"
                min={0}
                value={draft.weekend_price_per_night || ''}
                onChange={(e) => setDraft({ ...draft, weekend_price_per_night: Number(e.target.value) })}
                className={adminInputClass}
              />
            </AdminFormField>
          </div>

          {editingVillaId && (
            <AdminFormField
              label="Custom date prices"
              hint="Special nightly rates for holidays or peak dates on this villa"
              className="border-t border-gray-100 pt-4"
            >
              <AdminCustomDatePricing
                roomId={editingVillaId}
                rules={customPriceDraft}
                onChange={setCustomPriceDraft}
              />
            </AdminFormField>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminFormField label="Guests included in base price" hint="Extra guests above this count are charged at the site-wide extra person rate">
              <input type="number" min={1} value={draft.max_guests || ''} onChange={(e) => setDraft({ ...draft, max_guests: Number(e.target.value) })} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField
              label="Villa final capacity"
              hint="Maximum total guests allowed for bookings on the website (hard cap)"
            >
              <input
                type="number"
                min={1}
                value={draft.final_capacity || ''}
                onChange={(e) => setDraft({ ...draft, final_capacity: Number(e.target.value) })}
                className={adminInputClass}
              />
            </AdminFormField>
            <AdminFormField
              label="Caretaker phone"
              hint="Shown on booking confirmation and the guest confirmation email"
            >
              <input
                type="tel"
                value={draft.caretaker_phone ?? ''}
                onChange={(e) => setDraft({ ...draft, caretaker_phone: e.target.value })}
                placeholder="+91 98765 43210"
                className={`${adminInputClass} phone-number`}
              />
            </AdminFormField>
            <AdminFormField label="Villa code" hint="Internal reference, e.g. GW-02">
              <input value={draft.room_number} onChange={(e) => setDraft({ ...draft, room_number: e.target.value })} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Availability status">
              <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Room['status'] })} className={adminInputClass}>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </AdminFormField>
          </div>
          <AdminFormField label="Description" hint="Short summary shown on villa cards">
            <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={3} className={adminInputClass} />
          </AdminFormField>
          <AdminFormField label="Amenities" hint="One amenity per line">
            <textarea value={draft.amenities.join('\n')} onChange={(e) => setDraft({ ...draft, amenities: e.target.value.split('\n') })} rows={3} className={adminInputClass} />
          </AdminFormField>
          <AdminFormField label="Image URLs" hint="One image URL per line — first image is used as the cover photo">
            <textarea value={draft.images.join('\n')} onChange={(e) => setDraft({ ...draft, images: e.target.value.split('\n') })} rows={3} className={adminInputClass} />
          </AdminFormField>
          <AdminFormField
            label="Google Maps embed"
            hint="In Google Maps: Share → Embed a map → copy the iframe code or embed URL. Shown as the map preview on the villa page."
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
            hint="In Google Maps: Share → Copy link. Used in booking emails and the Open in Google Maps button. Do not paste embed code here."
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
            <button type="submit" className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold">Save</button>
            <button type="button" onClick={closeForm} className="px-6 py-2 border rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      <AdminVillaDetailsModal villa={viewing} onClose={() => setViewing(null)} />
    </AdminLayout>
  );
};

export default AdminRoomsPage;

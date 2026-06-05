import React, { useEffect, useRef, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminFormField, { adminInputClass } from '../../components/admin/AdminFormField';
import { StatusPill } from '../../components/admin/AdminDetailModal';
import AdminVillaDetailsModal from '../../components/admin/AdminVillaDetailsModal';
import { useSiteData } from '../../context/SiteDataContext';
import { getPrimaryImage } from '../../lib/imageUrl';
import type { Room } from '../../types/site';

const emptyRoom = (): Omit<Room, 'id'> => ({
  name: '',
  room_type: 'Deluxe Villa',
  description: '',
  price_per_night: 0,
  location: '',
  address: '',
  max_guests: 2,
  room_number: '',
  rating: 4.5,
  review_count: 0,
  status: 'available',
  amenities: [],
  images: [''],
  check_in_time: '',
  check_out_time: '',
  refundable_security_deposit: 0,
  extra_guest_limit: 0,
  extra_guest_cost: 0,
  mapEmbedUrl: '',
});

const AdminRoomsPage: React.FC = () => {
  const { rooms, addRoom, updateRoom, deleteRoom } = useSiteData();
  const [editing, setEditing] = useState<Room | null>(null);
  const [draft, setDraft] = useState<Omit<Room, 'id'>>(emptyRoom());
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
    setIsNew(true);
    setEditing(null);
  };

  const openEdit = (room: Room) => {
    const { id: _id, ...rest } = room;
    setDraft(rest);
    setEditing(room);
    setIsNew(false);
  };

  const closeForm = () => {
    setIsNew(false);
    setEditing(null);
    setDraft(emptyRoom());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...draft,
      amenities: draft.amenities.filter(Boolean),
      images: draft.images.filter((img) => img.trim()),
      mapEmbedUrl: draft.mapEmbedUrl?.trim() || undefined,
      check_in_time: draft.check_in_time?.trim() || undefined,
      check_out_time: draft.check_out_time?.trim() || undefined,
      refundable_security_deposit: draft.refundable_security_deposit || 0,
      extra_guest_limit: draft.extra_guest_limit || 0,
      extra_guest_cost: draft.extra_guest_cost || 0,
    };
    if (isNew) addRoom(payload);
    else if (editing) updateRoom(editing.id, payload);
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
          <p className="text-gray-600">Changes appear immediately on the public villas pages.</p>
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
            <img src={getPrimaryImage(room.images, 'https://via.placeholder.com/400x300?text=Villa')} alt={room.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="font-bold text-gray-900">{room.name}</h3>
                <StatusPill status={room.status} />
              </div>
              <p className="text-sm text-gray-600 mb-3">₹{room.price_per_night.toLocaleString('en-IN')} / night</p>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setViewing(room)} className="text-sm font-medium text-red-600 hover:text-red-700">
                  View
                </button>
                <button type="button" onClick={() => openEdit(room)} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  Edit
                </button>
                <button type="button" onClick={() => window.confirm('Delete villa?') && deleteRoom(room.id)} className="text-sm text-gray-500 hover:text-red-600">
                  Delete
                </button>
              </div>
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
          <h2 className="text-lg font-bold">{isNew ? 'New villa' : `Edit: ${editing?.name}`}</h2>
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
            <AdminFormField label="Max guests">
              <input type="number" min={1} value={draft.max_guests || ''} onChange={(e) => setDraft({ ...draft, max_guests: Number(e.target.value) })} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Villa code" hint="Internal reference, e.g. GW-02">
              <input value={draft.room_number} onChange={(e) => setDraft({ ...draft, room_number: e.target.value })} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Standard check-in time" hint="e.g. 2:00 PM (optional)">
              <input value={draft.check_in_time || ''} onChange={(e) => setDraft({ ...draft, check_in_time: e.target.value })} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Standard check-out time" hint="e.g. 11:00 AM (optional)">
              <input value={draft.check_out_time || ''} onChange={(e) => setDraft({ ...draft, check_out_time: e.target.value })} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Refundable security deposit (INR)" hint="Optional refundable amount taken at check-in">
              <input type="number" min={0} value={draft.refundable_security_deposit || ''} onChange={(e) => setDraft({ ...draft, refundable_security_deposit: Number(e.target.value) })} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Extra guests allowed" hint="Allowed beyond max guests (optional)">
              <input type="number" min={0} value={draft.extra_guest_limit || ''} onChange={(e) => setDraft({ ...draft, extra_guest_limit: Number(e.target.value) })} className={adminInputClass} />
            </AdminFormField>
            <AdminFormField label="Additional cost per extra guest (INR/night)" hint="Used when extra guests are added">
              <input type="number" min={0} value={draft.extra_guest_cost || ''} onChange={(e) => setDraft({ ...draft, extra_guest_cost: Number(e.target.value) })} className={adminInputClass} />
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
            hint="In Google Maps: Share → Embed a map → copy the iframe code or embed URL. Customers can open directions in Google Maps from the villa page."
          >
            <textarea
              value={draft.mapEmbedUrl ?? ''}
              onChange={(e) => setDraft({ ...draft, mapEmbedUrl: e.target.value })}
              rows={3}
              placeholder='Paste embed code, e.g. <iframe src="https://www.google.com/maps/embed?pb=...">'
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

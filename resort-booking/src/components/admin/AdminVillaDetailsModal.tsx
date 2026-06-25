import {
    HomeModernIcon,
    MapPinIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';
import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../data/resort';
import type { Room } from '../../types/site';
import NormalizedImage from '../ui/NormalizedImage';
import {
    AdminDetailField,
    AdminDetailModalShell,
    AdminDetailSection,
    StatusPill,
} from './AdminDetailModal';

type AdminVillaDetailsModalProps = {
  villa: Room | null;
  onClose: () => void;
};

const AdminVillaDetailsModal: React.FC<AdminVillaDetailsModalProps> = ({ villa, onClose }) => {
  if (!villa) return null;

  return (
    <AdminDetailModalShell
      open
      title={villa.name}
      subtitle={`${villa.status} • ${villa.room_type}`}
      icon={<HomeModernIcon className="h-6 w-6 text-white" />}
      onClose={onClose}
      footer={
        <Link
          to={`/villas/${villa.id}`}
          onClick={onClose}
          className="text-sm font-semibold text-red-600 hover:text-red-700"
        >
          View on public site →
        </Link>
      }
    >
      {villa.images[0] && (
        <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
          <NormalizedImage src={villa.images[0]} alt={villa.name} className="w-full h-48 object-cover" />
          {villa.images.length > 1 && (
            <div className="flex gap-2 p-2 bg-gray-50 overflow-x-auto">
              {villa.images.slice(1, 5).map((img, idx) => (
                <NormalizedImage key={`${img}-${idx}`} src={img} alt="" className="h-14 w-20 rounded-lg object-cover shrink-0 border border-gray-200" />
              ))}
              {villa.images.length > 5 && (
                <span className="text-xs text-gray-500 self-center px-2">+{villa.images.length - 5} more</span>
              )}
            </div>
          )}
        </div>
      )}

      <AdminDetailSection
        title="Property details"
        icon={<HomeModernIcon className="h-5 w-5 text-red-500" />}
        tint="bg-red-50/60"
        border="border-red-100"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AdminDetailField label="Villa type" value={villa.room_type} />
          <AdminDetailField label="Villa code" value={villa.room_number} />
          <AdminDetailField label="Status" value={<StatusPill status={villa.status} />} />
          <AdminDetailField label="Guests in base price" value={villa.max_guests} />
          <AdminDetailField
            label="Price per night"
            value={formatPrice(villa.price_per_night)}
          />
          <AdminDetailField
            label="Weekend price per night"
            value={
              villa.weekend_price_per_night && villa.weekend_price_per_night > 0
                ? formatPrice(villa.weekend_price_per_night)
                : 'Not set'
            }
          />
        </div>
      </AdminDetailSection>

      <AdminDetailSection
        title="Location"
        icon={<MapPinIcon className="h-5 w-5 text-pink-600" />}
        tint="bg-pink-50/60"
        border="border-pink-100"
      >
        <div className="grid grid-cols-1 gap-3">
          <AdminDetailField label="Area" value={villa.location} />
          <AdminDetailField label="Full address" value={villa.address} />
          <AdminDetailField
            label="Map embed"
            value={villa.mapEmbedUrl ? 'Google Maps embed added' : 'No embed added'}
          />
          <AdminDetailField
            label="Maps link"
            value={villa.mapsLink ? 'Guest maps link saved' : 'No maps link'}
          />
        </div>
      </AdminDetailSection>

      <AdminDetailSection
        title="Description & amenities"
        icon={<SparklesIcon className="h-5 w-5 text-amber-600" />}
        tint="bg-amber-50/60"
        border="border-amber-100"
      >
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1">Description</p>
            <p className="bg-white rounded-lg border border-gray-100 px-3 py-2.5 text-base text-gray-700 leading-relaxed shadow-sm">
              {villa.description}
            </p>
          </div>
          {villa.amenities.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-2">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {villa.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-full bg-white border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </AdminDetailSection>
    </AdminDetailModalShell>
  );
};

export default AdminVillaDetailsModal;

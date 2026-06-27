import {
    BuildingOffice2Icon,
    CurrencyRupeeIcon,
    MapPinIcon,
    TagIcon,
} from '@heroicons/react/24/outline';
import React from 'react';
import { Link } from 'react-router-dom';
import { formatSalePrice, getCategoryLabel } from '../../data/propertiesForSale';
import { normalizeImageUrl } from '../../lib/imageUrl';
import type { PropertyForSale } from '../../types/site';
import {
    AdminDetailField,
    AdminDetailModalShell,
    AdminDetailSection,
    StatusPill,
} from './AdminDetailModal';

type AdminPropertyDetailsModalProps = {
  property: PropertyForSale | null;
  onClose: () => void;
};

const AdminPropertyDetailsModal: React.FC<AdminPropertyDetailsModalProps> = ({ property, onClose }) => {
  if (!property) return null;

  return (
    <AdminDetailModalShell
      open
      title={property.title}
      subtitle={`${property.status} • ${getCategoryLabel(property.category)}`}
      icon={<BuildingOffice2Icon className="h-6 w-6 text-white" />}
      onClose={onClose}
      footer={
        <Link
          to={`/for-sale/${property.id}`}
          onClick={onClose}
          className="text-sm font-semibold text-red-600 hover:text-red-700"
        >
          View on public site →
        </Link>
      }
    >
      {property.images[0] && (
        <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
          <img src={normalizeImageUrl(property.images[0])} alt={property.title} className="w-full h-48 object-cover" />
          {property.images.length > 1 && (
            <div className="flex gap-2 p-2 bg-gray-50 overflow-x-auto">
              {property.images.slice(1, 5).map((img) => (
                <img key={img} src={normalizeImageUrl(img)} alt="" className="h-14 w-20 rounded-lg object-cover shrink-0 border border-gray-200" />
              ))}
              {property.images.length > 5 && (
                <span className="text-xs text-gray-500 self-center px-2">+{property.images.length - 5} more</span>
              )}
            </div>
          )}
        </div>
      )}

      <AdminDetailSection
        title="Listing details"
        icon={<TagIcon className="h-5 w-5 text-red-500" />}
        tint="bg-red-50/60"
        border="border-red-100"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AdminDetailField label="Category" value={getCategoryLabel(property.category)} />
          <AdminDetailField label="Status" value={<StatusPill status={property.status} />} />
          <AdminDetailField label="Area" value={property.areaLabel || '—'} />
          {property.bedrooms != null && (
            <AdminDetailField label="Bedrooms" value={property.bedrooms} />
          )}
          {property.bathrooms != null && (
            <AdminDetailField label="Bathrooms" value={property.bathrooms} />
          )}
        </div>
      </AdminDetailSection>

      <AdminDetailSection
        title="Pricing"
        icon={<CurrencyRupeeIcon className="h-5 w-5 text-pink-600" />}
        tint="bg-pink-50/60"
        border="border-pink-100"
      >
        <div className="rounded-xl bg-gradient-to-r from-red-500 to-pink-500 px-4 py-3 flex items-center justify-between text-white">
          <span className="text-base font-bold uppercase tracking-wide">
            {property.priceOnRequest ? 'Price on request' : 'Listing price'}
          </span>
          <span className="text-2xl font-bold">
            {property.priceOnRequest ? 'Contact for quote' : formatSalePrice(property)}
          </span>
        </div>
      </AdminDetailSection>

      <AdminDetailSection
        title="Location"
        icon={<MapPinIcon className="h-5 w-5 text-green-600" />}
        tint="bg-green-50/60"
        border="border-green-100"
      >
        <div className="grid grid-cols-1 gap-3">
          <AdminDetailField label="Area" value={property.location} />
          <AdminDetailField label="Full address" value={property.address || '—'} />
          <AdminDetailField
            label="Map embed"
            value={property.mapEmbedUrl ? 'Google Maps embed added' : 'No embed added'}
          />
          <AdminDetailField
            label="Maps link"
            value={property.mapsLink ? 'Guest maps link saved' : 'No maps link'}
          />
        </div>
      </AdminDetailSection>

      <AdminDetailSection
        title="Description & highlights"
        icon={<BuildingOffice2Icon className="h-5 w-5 text-amber-600" />}
        tint="bg-amber-50/60"
        border="border-amber-100"
      >
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1">Short description</p>
            <p className="bg-white rounded-lg border border-gray-100 px-3 py-2.5 text-base text-gray-700 leading-relaxed shadow-sm">
              {property.description}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1">Full description</p>
            <p className="bg-white rounded-lg border border-gray-100 px-3 py-2.5 text-base text-gray-700 leading-relaxed shadow-sm whitespace-pre-line">
              {property.longDescription}
            </p>
          </div>
          {property.highlights.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-2">Highlights</p>
              <div className="flex flex-wrap gap-2">
                {property.highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="rounded-full bg-white border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm"
                  >
                    {highlight}
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

export default AdminPropertyDetailsModal;
